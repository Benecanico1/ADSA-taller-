import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';

const MechanicCommissions = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        // Fetch completed appointments for commissions
        const queryConstraints = [where('status', '==', 'completed')];
        if (currentUser.role !== 'admin') {
            queryConstraints.push(where('mechanicId', '==', currentUser.uid));
        }

        const q = query(collection(db, 'Appointments'), ...queryConstraints);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const apps = [];
            snapshot.forEach((doc) => {
                apps.push({ id: doc.id, ...doc.data() });
            });
            // Sort client-side by descending date roughly
            apps.sort((a, b) => new Date(b.date) - new Date(a.date));
            setAppointments(apps);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Calculate dynamic stats
    const totalEarnings = appointments.reduce((sum, app) => {
        // Mock a cost calculation: Assign a fixed rate or random cost based on data if real price isn't there
        const serviceCost = app.price || 50;
        return sum + serviceCost;
    }, 0);

    const completedCount = appointments.length;

    // Calculate weekly productivity dynamically
    const daysOfWeek = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    const serviceCounts = { D: 0, L: 0, M: 0, 'M-2': 0, J: 0, V: 0, S: 0 }; // 'M-2' handles the second 'M' (Miércoles)

    appointments.forEach(app => {
        if (app.date) {
            const dateObj = new Date(app.date);
            if (!isNaN(dateObj)) {
                const dayIndex = dateObj.getDay(); // 0 = Domingo, 1 = Lunes...
                if (dayIndex === 2) serviceCounts['M']++;
                else if (dayIndex === 3) serviceCounts['M-2']++;
                else serviceCounts[daysOfWeek[dayIndex]]++;
            }
        }
    });

    const maxCount = Math.max(1, ...Object.values(serviceCounts)); // Prevent division by zero

    const chartData = [
        { day: 'L', count: serviceCounts['L'], active: new Date().getDay() === 1 },
        { day: 'M', count: serviceCounts['M'], active: new Date().getDay() === 2 },
        { day: 'M', count: serviceCounts['M-2'], active: new Date().getDay() === 3 },
        { day: 'J', count: serviceCounts['J'], active: new Date().getDay() === 4 },
        { day: 'V', count: serviceCounts['V'], active: new Date().getDay() === 5 },
        { day: 'S', count: serviceCounts['S'], active: new Date().getDay() === 6 },
        { day: 'D', count: serviceCounts['D'], active: new Date().getDay() === 0 },
    ].map(item => ({
        ...item,
        height: `${(item.count / maxCount) * 100}%`
    }));

    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display max-w-2xl mx-auto shadow-2xl relative">
            {/* Top Header */}
            <header className="flex items-center bg-white/95 dark:bg-[#161b2a]/95 backdrop-blur-md p-4 pb-3 justify-between sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors -ml-2"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">Liquidación</h2>
                    <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Dynotech Power Garage</p>
                </div>
                <div className="flex w-10 items-center justify-end">
                    <button className="relative flex items-center justify-center rounded-xl h-10 w-10 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors border border-slate-200 dark:border-slate-700 active:scale-95 shadow-sm">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3 rounded-full bg-primary border-2 border-white dark:border-[#161b2a]"></span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-col gap-6 p-4 pb-32">

                {/* Earnings Overview Cards */}
                <div className="flex flex-wrap gap-4">
                    <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-2xl p-5 bg-primary/10 dark:bg-primary/5 border border-primary/20 dark:border-primary/20 shadow-lg shadow-primary/5 hover:border-primary/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <p className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-widest">Ganancias del Mes</p>
                            <span className="material-symbols-outlined text-primary text-xl">payments</span>
                        </div>
                        <p className="text-slate-900 dark:text-slate-100 tracking-tight text-3xl font-black leading-tight mt-1">${totalEarnings.toFixed(2)}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="material-symbols-outlined text-emerald-500 text-sm">trending_up</span>
                            <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">+15.2% vs ago</p>
                        </div>
                    </div>

                    <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-2xl p-5 bg-white dark:bg-[#11151e] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                        <div className="flex items-center justify-between">
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Órdenes Listas</p>
                            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-xl">build_circle</span>
                        </div>
                        <p className="text-slate-900 dark:text-slate-100 tracking-tight text-3xl font-black leading-tight mt-1">{completedCount}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="material-symbols-outlined text-amber-500 text-sm">schedule</span>
                            <p className="text-slate-500 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">Calculado Real Live</p>
                        </div>
                    </div>
                </div>

                {/* Monthly Goal Section */}
                <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white dark:bg-[#161b2a] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="flex justify-between items-center relative z-0">
                        <div className="flex flex-col">
                            <p className="text-slate-900 dark:text-slate-100 text-base font-bold">Objetivo Mensual</p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Meta: $2,000.00</p>
                        </div>
                        <div className="text-right">
                            <p className="text-primary text-2xl font-black drop-shadow-[0_0_10px_rgba(13,204,242,0.3)]">62%</p>
                        </div>
                    </div>

                    <div className="h-3.5 w-full rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden border border-slate-200 dark:border-slate-700/50 my-1 relative z-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"></div>
                        <div
                            className="h-full rounded-full bg-primary relative shadow-[0_0_15px_rgba(13,204,242,0.6)]"
                            style={{ width: '62%' }}
                        >
                            <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20"></div>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 mt-1 relative z-0">
                        <span className="material-symbols-outlined text-primary text-lg mt-0.5">info</span>
                        <p className="text-slate-600 dark:text-slate-300 text-xs font-medium leading-relaxed">
                            Te faltan <strong className="text-slate-900 dark:text-white">$750.00</strong> para alcanzar el bono de productividad.
                        </p>
                    </div>
                </div>

                {/* Quick Action Button */}
                <button className="w-full bg-primary hover:bg-primary/90 text-[#101f22] font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-transform active:scale-95 text-sm tracking-widest uppercase">
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                    Solicitar Pago Ahora
                </button>

                {/* Weekly Productivity Chart */}
                <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white dark:bg-[#161b2a] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1">
                            <p className="text-slate-900 dark:text-slate-100 text-base font-bold">Productividad Semanal</p>
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Semana del 18 - 24 Sep</p>
                        </div>
                        <div className="text-right">
                            <p className="text-primary text-3xl font-black leading-none text-right">32</p>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Servicios</span>
                        </div>
                    </div>

                    <div className="flex items-end justify-between h-40 px-1 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                        {chartData.map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2.5 w-full max-w-[32px] group cursor-pointer relative">
                                <span className={`absolute -top-7 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity ${item.active ? 'text-primary' : 'text-slate-500'} bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded shadow-sm`}>
                                    {item.count}
                                </span>
                                <div
                                    className={`w-full rounded-t-sm transition-all duration-300 group-hover:bg-primary ${item.active ? 'bg-primary shadow-[0_-4px_15px_rgba(13,204,242,0.4)]' : 'bg-primary/20 dark:bg-primary/10 hover:bg-primary/50'}`}
                                    style={{ height: item.count > 0 ? item.height : '4px' }}
                                ></div>
                                <p className={`text-[10px] font-bold ${item.active ? 'text-primary font-black' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>{item.day}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Commissions List */}
                <div className="flex flex-col gap-4 mt-2">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-slate-900 dark:text-slate-100 text-base font-bold">Servicios Completados</h3>
                        <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Ver Todo</button>
                    </div>

                    <div className="flex flex-col gap-3">
                        {appointments.length > 0 ? (
                            appointments.map(app => (
                                <div key={app.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#161b2a] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/30 transition-colors">
                                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
                                        <span className="material-symbols-outlined border border-primary/20 rounded-lg p-1.5">two_wheeler</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-slate-900 dark:text-slate-100 font-bold truncate">Servicio Terminado</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">OT #{app.id.slice(-4).toUpperCase()} • {app.date}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-primary font-black text-lg">+${(app.price || 50).toFixed(2)}</p>
                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest inline-block mt-1">Liquidado</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-700 mb-2">assignment_turned_in</span>
                                <p className="text-sm text-slate-500 font-bold tracking-tight">Aún no hay trabajos completados.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto flex justify-around border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111718]/95 backdrop-blur-md px-6 pb-6 pt-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
                <Link to="/mechanic-dashboard" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer w-[60px]">
                    <span className="material-symbols-outlined">home</span>
                    <p className="text-[9px] font-bold leading-none tracking-widest uppercase mt-0.5">Inicio</p>
                </Link>
                <Link to="/kanban" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer w-[60px]">
                    <span className="material-symbols-outlined">developer_board</span>
                    <p className="text-[9px] font-bold leading-none tracking-widest uppercase mt-0.5">Tablero</p>
                </Link>
                <Link to="/mechanic-budget" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer w-[60px]">
                    <span className="material-symbols-outlined">inventory_2</span>
                    <p className="text-[9px] font-bold leading-none tracking-widest uppercase mt-0.5">Repuestos</p>
                </Link>
            </nav>
        </div>
    );
};

export default MechanicCommissions;
