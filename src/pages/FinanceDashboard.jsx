import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AdminBottomNav from '../components/ui/AdminBottomNav';
import { useAuth } from '../lib/AuthContext';
import { appConfig } from '../config';

const FinanceDashboard = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
    const [breakdownType, setBreakdownType] = useState('revenue'); // 'revenue', 'pending', or 'historical'
    const [breakdownTitle, setBreakdownTitle] = useState('');
    const [breakdownData, setBreakdownData] = useState([]);
    const [selectedHistoryMonth, setSelectedHistoryMonth] = useState(''); // Format: 'YYYY-MM'

    useEffect(() => {
        if (!currentUser?.sucursalId) return;

        const q = query(
            collection(db, 'Appointments'),
            where('sucursalId', '==', currentUser.sucursalId),
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                const job = { id: doc.id, ...doc.data() };

                // Only consider jobs that have a budget and are in a completed or paying state
                if (job.status === 'ready' || job.status === 'delivered') {
                    let total = 0;
                    if (job.budgetItems && Array.isArray(job.budgetItems)) {
                        total = job.budgetItems.reduce((acc, item) => acc + (parseFloat(item.price) * parseInt(item.quantity || 1)), 0);
                    }

                    if (total > 0) {
                        data.push({
                            ...job,
                            calculatedTotal: total
                        });
                    }
                }
            });
            setTransactions(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser?.sucursalId]);

    const calculateMetrics = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let monthlyRevenue = 0;
        let pendingReceivables = 0; // ready but not delivered
        let totalJobsBilled = transactions.length;

        transactions.forEach(t => {
            const date = new Date(t.updatedAt || t.date || now.toISOString());
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                if (t.status === 'delivered') {
                    monthlyRevenue += t.calculatedTotal;
                } else if (t.status === 'ready') {
                    pendingReceivables += t.calculatedTotal;
                }
            }
        });

        return { monthlyRevenue, pendingReceivables, totalJobsBilled };
    };

    const generateChartData = () => {
        // Group by month-year
        const groups = {};

        // Initialize last 6 months to ensure they show up even if empty
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            const monthName = d.toLocaleString('es-AR', { month: 'short' });
            groups[key] = {
                name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                ingresos: 0,
                sortKey: d.getTime(),
                transactions: []
            };
        }

        transactions.forEach(t => {
            if (t.status === 'delivered') {
                const date = new Date(t.updatedAt || t.date || new Date().toISOString());
                const key = `${date.getFullYear()}-${date.getMonth()}`;
                if (groups[key]) {
                    groups[key].ingresos += t.calculatedTotal;
                    groups[key].transactions.push(t);
                }
            }
        });

        return Object.values(groups).sort((a, b) => a.sortKey - b.sortKey);
    };

    const metrics = calculateMetrics();
    const chartData = generateChartData();

    const openBreakdown = (type, dataList = [], title = '') => {
        setBreakdownType(type);
        setBreakdownTitle(title);

        let filteredData = [];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        if (type === 'revenue') {
            filteredData = transactions.filter(t => {
                const d = new Date(t.updatedAt || t.date || now.toISOString());
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.status === 'delivered';
            });
            if (!title) setBreakdownTitle('Ingresos del Mes (Facturados)');
        } else if (type === 'pending') {
            filteredData = transactions.filter(t => {
                const d = new Date(t.updatedAt || t.date || now.toISOString());
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.status === 'ready';
            });
            if (!title) setBreakdownTitle('Por Cobrar (Trabajos Listos)');
        } else if (type === 'historical') {
            filteredData = dataList;
        } else if (type === 'billed_history') {
            // Include all delivered transactions regardless of the month for the interactive history view
            filteredData = transactions.filter(t => t.status === 'delivered');
            if (!title) setBreakdownTitle('Historial de Trabajos Facturados');

            // Default select the current month if available, else the most recent
            const currentKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
            setSelectedHistoryMonth(currentKey);
        }

        setBreakdownData(filteredData);
        setIsBreakdownModalOpen(true);
    };

    const exportToCSV = () => {
        if (transactions.length === 0) return;

        // Create CSV headers
        const headers = ['OT', 'Fecha', 'Cliente', 'Vehiculo', 'Dominio', 'Estado', 'Subtotal', 'Servicios Involucrados'];

        // Map transactions to lines
        const lines = transactions.map(t => {
            const dateStr = t.updatedAt
                ? new Date(t.updatedAt).toLocaleDateString('es-AR')
                : new Date(t.date || Date.now()).toLocaleDateString('es-AR');

            const servicesStr = (t.repairSteps || [])
                .filter(s => s.completed)
                .map(s => s.label)
                .join(' | ');

            return [
                t.id.slice(-4),
                dateStr,
                `"${t.clientName || 'Cliente'}"`,
                `"${t.vehicle?.brand || ''} ${t.vehicle?.model || ''}"`,
                t.vehicle?.plate || 'S/P',
                t.status === 'delivered' ? 'Pagado' : 'Por Cobrar',
                t.calculatedTotal.toFixed(2),
                `"${servicesStr}"`
            ].join(',');
        });

        // Combine
        const csvContent = [headers.join(','), ...lines].join('\n');

        // Download logic
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); // \uFEFF for Excel UTF-8 BOM
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${appConfig.appName.replace(/\s+/g, '_')}_Balance_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="bg-[#0a0c14] min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
            </div>
        );
    }

    return (
        <div className="bg-[#0a0c14] text-slate-100 min-h-screen flex flex-col font-display w-full max-w-[1600px] mx-auto relative overflow-x-hidden">
            {/* Background */}
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-40"
                style={{
                    backgroundColor: '#0a0c14',
                    backgroundImage: `
                        linear-gradient(45deg, #111 25%, transparent 25%), 
                        linear-gradient(-45deg, #111 25%, transparent 25%), 
                        linear-gradient(45deg, transparent 75%, #111 75%), 
                        linear-gradient(-45deg, transparent 75%, #111 75%)
                    `,
                    backgroundSize: '4px 4px'
                }}
            ></div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#161b2a]/90 backdrop-blur-md border-b border-slate-700/50 p-4 pb-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center p-2 rounded-full hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-lg font-black leading-none text-white tracking-wide">Finanzas</h1>
                        <p className="text-[10px] text-green-400 uppercase tracking-widest font-bold mt-0.5">Reportes y Flujo de Caja</p>
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex-1 overflow-y-auto p-4 lg:p-6 pb-24 max-w-[1200px] mx-auto w-full flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 lg:items-start">

                {/* Right Column (Metrics) - Appears first on mobile */}
                <div className="lg:col-span-4 flex flex-col gap-6 order-1 lg:order-2">
                    {/* Metrics Cards */}
                    <section className="grid grid-cols-2 gap-4">
                    <div
                        onClick={() => openBreakdown('revenue')}
                        className="bg-[#161b2a] border border-slate-700/50 p-4 rounded-xl shadow-lg shadow-black/50 relative overflow-hidden cursor-pointer hover:border-green-500/50 hover:bg-slate-800/80 transition-all active:scale-95"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-10 text-green-500">
                            <span className="material-symbols-outlined text-6xl">account_balance_wallet</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center justify-between">
                            Ingresos del Mes
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </p>
                        <p className="text-3xl font-black text-white">${metrics.monthlyRevenue.toFixed(2)}</p>
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-green-500 font-bold bg-green-500/10 w-max px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            Actualizado
                        </div>
                    </div>

                    <div
                        onClick={() => openBreakdown('pending')}
                        className="bg-[#161b2a] border border-slate-700/50 p-4 rounded-xl shadow-lg shadow-black/50 relative overflow-hidden cursor-pointer hover:border-amber-500/50 hover:bg-slate-800/80 transition-all active:scale-95"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-10 text-amber-500">
                            <span className="material-symbols-outlined text-6xl">pending_actions</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center justify-between">
                            Por Cobrar
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </p>
                        <p className="text-3xl font-black text-amber-500">${metrics.pendingReceivables.toFixed(2)}</p>
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-amber-500 font-bold bg-amber-500/10 w-max px-2 py-0.5 rounded-full">
                            Pendiente de pago
                        </div>
                    </div>
                </section>

                <div className="bg-[#161b2a] border border-slate-700/50 p-4 rounded-xl shadow-lg shadow-black/50 flex justify-between items-center text-center">
                    <div
                        onClick={() => openBreakdown('billed_history')}
                        className="cursor-pointer hover:bg-slate-800/80 px-4 py-2 rounded-lg transition-colors active:scale-95 group relative"
                    >
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 group-hover:text-green-400 transition-colors flex items-center justify-center gap-1">
                            Trabajos Facturados
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </p>
                        <p className="text-xl font-black text-white">{metrics.totalJobsBilled}</p>
                    </div>
                    <div className="w-px h-10 bg-slate-700"></div>
                    <div className="px-4 py-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Ticket Promedio</p>
                        <p className="text-xl font-black text-red-400">
                            ${metrics.totalJobsBilled > 0 ? (metrics.monthlyRevenue / metrics.totalJobsBilled).toFixed(2) : '0.00'}
                        </p>
                    </div>
                </div>
                </div>

                {/* Left Column (Chart & Transactions) - Appears second on mobile */}
                <div className="lg:col-span-8 flex flex-col gap-6 order-2 lg:order-1">
                    {/* Interactive Cash Flow Chart */}
                    <section className="bg-[#161b2a] border border-slate-700/50 p-5 rounded-xl shadow-lg shadow-black/50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-500 text-lg">bar_chart</span>
                            Flujo de Efectivo
                        </h2>
                        <button
                            onClick={() => openBreakdown('billed_history')}
                            className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-full font-bold transition-colors active:scale-95 group"
                        >
                            <span className="material-symbols-outlined text-[14px] group-hover:text-green-400 transition-colors">history</span>
                            Ver Flujo
                        </button>
                    </div>

                    <div className="h-48 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#475569', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-[#0f172a] border border-slate-700 p-2 rounded shadow-xl text-xs">
                                                    <p className="text-slate-400 mb-1 font-bold">{payload[0].payload.name}</p>
                                                    <p className="text-green-400 font-black">${payload[0].value.toFixed(2)}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar
                                    dataKey="ingresos"
                                    radius={[4, 4, 0, 0]}
                                    onClick={(data) => {
                                        if (data && data.transactions && data.transactions.length > 0) {
                                            openBreakdown('historical', data.transactions, `Ingresos de ${data.name}`);
                                        }
                                    }}
                                    className="cursor-pointer"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === chartData.length - 1 ? '#10b981' : '#334155'}
                                            className="hover:opacity-80 transition-opacity outline-none"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Transaction List */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Historial Operativo</h2>
                        <button
                            onClick={exportToCSV}
                            disabled={transactions.length === 0}
                            className="text-[10px] text-primary font-bold bg-primary/10 hover:bg-primary/20 hover:text-white px-3 py-1 rounded-full border border-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                        >
                            <span className="material-symbols-outlined text-[14px]">download</span>
                            Descargar CSV
                        </button>
                    </div>

                    <div className="bg-[#161b2a] rounded-xl border border-slate-700/50 shadow-lg shadow-black/50 divide-y divide-slate-700/50 overflow-hidden">
                        {transactions.length === 0 ? (
                            <div className="p-6 text-center text-slate-500 text-sm">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">receipt_long</span>
                                <p>No hay transacciones registradas de trabajos entregados.</p>
                            </div>
                        ) : (
                            transactions.map(t => (
                                <div key={t.id} className="p-4 flex gap-3 items-center hover:bg-slate-800/50 transition-colors">
                                    <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${t.status === 'delivered' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        <span className="material-symbols-outlined">
                                            {t.status === 'delivered' ? 'check_circle' : 'hourglass_empty'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate uppercase">OT #{t.id.slice(-4)} - {t.clientName}</p>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{t.vehicle?.plate || 'Sin Patente'} • {t.vehicle?.brand}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-white">${t.calculatedTotal.toFixed(2)}</p>
                                        <p className={`text-[9px] font-bold mt-1 uppercase ${t.status === 'delivered' ? 'text-green-500' : 'text-amber-500'}`}>
                                            {t.status === 'delivered' ? 'Pagado/Entregado' : 'Por Cobrar'}
                                        </p>
                                        {t.status === 'delivered' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`/invoice/${t.id}`, '_blank');
                                                }}
                                                className="mt-2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded border border-slate-700 transition-colors flex items-center justify-end gap-1 ml-auto"
                                                title="Detalle de Factura"
                                            >
                                                <span className="material-symbols-outlined text-[12px]">receipt_long</span>
                                                Factura
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
                </div>

            </main>

            <AdminBottomNav />



            {/* Breakdown Modal */}
            {isBreakdownModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#161b2a] border border-slate-700 w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="px-5 py-4 border-b border-slate-700/50 flex flex-col gap-3 bg-slate-800/20">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-black text-white">{breakdownTitle}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                        {breakdownType === 'billed_history'
                                            ? `${breakdownData.filter(t => {
                                                const d = new Date(t.updatedAt || t.date);
                                                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedHistoryMonth;
                                            }).length} registros filtrados`
                                            : `${breakdownData.length} ${breakdownData.length === 1 ? 'registro' : 'registros'}`
                                        }
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsBreakdownModalOpen(false)}
                                    className="size-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
                                >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            </div>

                            {/* Month Selector for Billed History */}
                            {breakdownType === 'billed_history' && (
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="material-symbols-outlined text-slate-400 text-[16px]">calendar_month</span>
                                    <select
                                        value={selectedHistoryMonth}
                                        onChange={(e) => setSelectedHistoryMonth(e.target.value)}
                                        className="bg-slate-800 border-none text-sm text-white rounded-md px-2 py-1 outline-none ring-1 ring-slate-700 focus:ring-primary font-bold w-max"
                                    >
                                        <option value="">Todos los meses</option>
                                        {/* Generate unique months from data */}
                                        {Array.from(new Set(breakdownData.map(t => {
                                            const d = new Date(t.updatedAt || t.date);
                                            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                                        }))).sort().reverse().map(monthKey => {
                                            const [y, m] = monthKey.split('-');
                                            const dateObj = new Date(parseInt(y), parseInt(m) - 1, 1);
                                            const label = dateObj.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
                                            return (
                                                <option key={monthKey} value={monthKey}>
                                                    {label.charAt(0).toUpperCase() + label.slice(1)} {y}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-2">
                            {(() => {
                                const displayData = breakdownType === 'billed_history' && selectedHistoryMonth
                                    ? breakdownData.filter(t => {
                                        const d = new Date(t.updatedAt || t.date);
                                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedHistoryMonth;
                                    })
                                    : breakdownData;

                                if (displayData.length === 0) {
                                    return (
                                        <div className="p-8 text-center text-slate-500">
                                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
                                            <p className="text-sm">No hay datos para este período.</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-2">
                                        {displayData.map(t => (
                                            <div key={t.id} className="p-3 bg-slate-800/30 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest uppercase">OT #{t.id.slice(-4)}</span>
                                                        <span className="text-[10px] text-slate-400">{new Date(t.updatedAt || t.date).toLocaleDateString('es-AR')}</span>
                                                    </div>
                                                    <p className={`font-black tracking-tight ${t.status === 'delivered' ? 'text-green-500' : 'text-amber-500'}`}>
                                                        ${t.calculatedTotal.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="flex justify-between items-end mt-1">
                                                    <div>
                                                        <p className="text-sm font-bold text-white leading-tight">{t.clientName || 'Cliente'}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">{t.vehicle?.brand || ''} {t.vehicle?.model || ''} • {t.vehicle?.plate || 'S/P'}</p>
                                                    </div>
                                                    {t.status === 'delivered' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(`/invoice/${t.id}`, '_blank');
                                                            }}
                                                            className="text-[10px] bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded border border-slate-600 transition-colors flex items-center gap-1 shrink-0"
                                                        >
                                                            <span className="material-symbols-outlined text-[12px]">print</span>
                                                            Imprimir
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-700/50 bg-slate-800/50 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total del Período</span>
                            <span className="text-xl font-black text-white">
                                ${(() => {
                                    const displayData = breakdownType === 'billed_history' && selectedHistoryMonth
                                        ? breakdownData.filter(t => {
                                            const d = new Date(t.updatedAt || t.date);
                                            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedHistoryMonth;
                                        })
                                        : breakdownData;
                                    return displayData.reduce((acc, curr) => acc + curr.calculatedTotal, 0).toFixed(2);
                                })()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceDashboard;
