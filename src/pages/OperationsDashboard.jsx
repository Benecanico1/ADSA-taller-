import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminProfileModal from '../components/AdminProfileModal';
import { useNotifications } from '../lib/NotificationContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import AdminBottomNav from '../components/ui/AdminBottomNav';
import { useAuth } from '../lib/AuthContext';
import { appConfig } from '../config';

const OperationsDashboard = () => {
    const navigate = useNavigate();
    const { setIsDemoAdmin, currentUser } = useAuth();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const { togglePanel, unreadCount } = useNotifications();
    const [stats, setStats] = useState({ pending: 0, diagnosing: 0, ready: 0 });
    const [pendingBudgets, setPendingBudgets] = useState(0);
    const [activeMechanics, setActiveMechanics] = useState([]);
    const [criticalInventory, setCriticalInventory] = useState([]);

    React.useEffect(() => {
        if (!currentUser?.sucursalId) return;

        // Real-time Kanban stats & Pending Budgets
        const qAppointments = query(collection(db, 'Appointments'), where('sucursalId', '==', currentUser.sucursalId));
        const unsubscribeAppointments = onSnapshot(qAppointments, (snapshot) => {
            let pending = 0, diagnosing = 0, ready = 0, budgets = 0;
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.status === 'pending') pending++;
                if (data.status === 'diagnosing' || data.status === 'repairing') diagnosing++;
                if (data.status === 'ready') ready++;
                if (data.budgetStatus === 'pending_approval') budgets++;
            });
            setStats({ pending, diagnosing, ready });
            setPendingBudgets(budgets);
        });

        // Real-time Active Mechanics
        const qUsers = query(collection(db, 'Users'), where('sucursalId', '==', currentUser.sucursalId));
        const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
            const mechanics = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.role === 'mechanic' || data.role === 'admin') {
                    if (data.isAtWorkshop || data.role === 'mechanic') {
                        mechanics.push({ id: doc.id, ...data });
                    }
                }
            });
            setActiveMechanics(mechanics.slice(0, 3)); // Show top 3
        });

        // Real-time Critical Inventory
        const qInventory = query(collection(db, 'Inventory'), where('sucursalId', '==', currentUser.sucursalId));
        const unsubscribeInventory = onSnapshot(qInventory, (snapshot) => {
            const critical = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // Avoid using `stock`, Inventory collection uses `currentStock` in this app. Let's fix that too.
                const currentStock = data.currentStock !== undefined ? Number(data.currentStock) : Number(data.stock || 0);
                if (currentStock <= Number(data.minStock || 5) && data.category !== 'Mano de Obra') {
                    critical.push({ id: doc.id, ...data, stock: currentStock });
                }
            });
            setCriticalInventory(critical.slice(0, 3));
        });

        return () => {
            unsubscribeAppointments();
            unsubscribeUsers();
            unsubscribeInventory();
        };
    }, [currentUser?.sucursalId]);

    const handleLogout = async () => {
        try {
            if (setIsDemoAdmin) setIsDemoAdmin(false);
            await signOut(auth);
            navigate('/admin-login');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div className="bg-[#0a0c14] text-slate-100 min-h-screen flex flex-col w-full mx-auto relative font-display overflow-hidden">
            {/* Carbon Pattern Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-40"
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
            <header className="sticky top-0 z-50 bg-[#161b2a]/80 backdrop-blur-md border-b border-slate-800 p-4 pb-3 flex items-center justify-center shadow-sm">
                <div className="flex w-full max-w-[1600px] justify-between items-center px-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-red-500 to-red-600 p-1.5 rounded-xl shadow-[0_0_15px_rgba(255,40,0,0.3)] flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-lg drop-shadow-sm">precision_manufacturing</span>
                        </div>
                        <div>
                            <h1 className="text-sm font-black leading-none text-white tracking-wide">{appConfig.companyName} Operaciones</h1>
                            <p className="text-[9px] text-red-400 uppercase tracking-widest font-bold mt-0.5">Gerencia de Taller</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={togglePanel} className="relative flex items-center justify-center rounded-full size-10 bg-[#161b2a] border border-slate-700/80 hover:border-red-500/50 text-slate-400 hover:text-red-400 transition-colors">
                            <span className="material-symbols-outlined text-xl">notifications</span>
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2.5 flex h-2 w-2 rounded-full bg-red-500 border border-[#161b2a] animate-pulse"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setIsProfileModalOpen(true)}
                            className="h-10 w-10 rounded-full bg-red-500/20 hover:bg-red-500/30 active:scale-95 transition-all flex items-center justify-center border border-red-500/40 shadow-[0_0_10px_rgba(255,40,0,0.2)] focus:outline-none"
                        >
                            <span className="text-xs font-bold text-red-400">GE</span>
                        </button>
                        <div className="w-px h-6 bg-slate-700 mx-1"></div>
                        <button
                            onClick={handleLogout}
                            className="relative flex items-center justify-center rounded-full size-10 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500 transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex-1 overflow-y-auto p-4 lg:p-6 pb-24 max-w-[1600px] mx-auto w-full">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Kanban Snapshot */}
                        <section className="bg-gradient-to-br from-[#161b2a] to-[#121623] p-5 rounded-xl border border-slate-700/50 shadow-lg shadow-black/50">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-sm font-bold flex items-center gap-2 text-white">
                                    <span className="material-symbols-outlined text-red-400 text-lg">view_kanban</span>
                                    Estado del Taller en Vivo
                                </h2>
                                <Link to="/kanban" className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-full font-bold transition-colors border border-red-500/30 flex items-center gap-1">
                                    IR AL KANBAN <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                </Link>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-[#0a0c14]/80 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                                    <span className="material-symbols-outlined text-slate-400 mb-2">pending_actions</span>
                                    <span className="text-3xl font-black text-white">{stats.pending}</span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Esperando</span>
                                </div>
                                <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
                                    <span className="material-symbols-outlined text-red-400 mb-2">engineering</span>
                                    <span className="text-3xl font-black text-red-400">{stats.diagnosing}</span>
                                    <span className="text-[10px] text-red-400/80 font-bold uppercase tracking-widest mt-1">En Taller</span>
                                </div>
                                <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/30 flex flex-col items-center justify-center text-center">
                                    <span className="material-symbols-outlined text-green-500 mb-2">check_circle</span>
                                    <span className="text-3xl font-black text-green-500">{stats.ready}</span>
                                    <span className="text-[10px] text-green-500/80 font-bold uppercase tracking-widest mt-1">Listas Hoy</span>
                                </div>
                            </div>
                        </section>

                        {/* Presupuestos & Asignaciones */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Budgets Pending Approval */}
                            <div className="bg-[#161b2a] p-4 rounded-xl border border-slate-700/50 shadow-lg shadow-black/50 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px] text-amber-500">request_quote</span>
                                        Para Aprobar
                                    </h3>
                                    <span className="bg-amber-500 text-[#0a0c14] text-[10px] font-black px-2 py-0.5 rounded-full">{pendingBudgets}</span>
                                </div>
                                <p className="text-sm text-slate-300 font-medium mb-4 flex-1">
                                    Hay <span className="text-amber-500 font-bold">{pendingBudgets} presupuestos</span> cargados por mecánicos que requieren tu revisión antes de enviarse a los clientes.
                                </p>
                                <Link to="/budget" className="w-full bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs font-bold py-3 rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2">
                                    Revisar Presupuestos
                                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </Link>
                            </div>

                            {/* Active Mechanics */}
                            <div className="bg-[#161b2a] p-4 rounded-xl border border-slate-700/50 shadow-lg shadow-black/50 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px] text-primary">engineering</span>
                                        Personal Activo
                                    </h3>
                                </div>
                                <div className="flex-1 space-y-3 mb-4">
                                    {activeMechanics.length === 0 ? (
                                        <p className="text-xs text-slate-500 italic">No hay mecánicos registrados.</p>
                                    ) : activeMechanics.map(mech => (
                                        <div key={mech.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <div className="size-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                                                        <span className="text-xs font-black text-red-400">
                                                            {mech.name ? mech.name.substring(0, 2).toUpperCase() : 'ME'}
                                                        </span>
                                                    </div>
                                                    <div className={`absolute -bottom-0.5 -right-0.5 size-3 border-2 border-[#161b2a] rounded-full ${mech.isAtWorkshop ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-200">{mech.name || mech.email.split('@')[0]}</p>
                                                    <p className="text-[9px] text-slate-500">{mech.isAtWorkshop ? 'En Taller' : 'Fuera / Inactivo'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-4 flex flex-col gap-6">



                        {/* Critical Inventory */}
                        <section className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Inventario Crítico</h2>
                                <button className="text-[10px] text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">Acción Requerida</button>
                            </div>

                            <div className="bg-[#161b2a] rounded-xl border border-slate-700/50 shadow-lg shadow-black/50 overflow-hidden">
                                {criticalInventory.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500">
                                        <span className="material-symbols-outlined text-3xl mb-2 opacity-50">check_circle</span>
                                        <p className="text-xs">Todo el inventario está en niveles óptimos.</p>
                                    </div>
                                ) : (
                                    criticalInventory.map(item => (
                                        <div key={item.id} className="p-3 border-b border-slate-700/50 flex items-center justify-between bg-red-500/5">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-red-500 text-[18px]">warning</span>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-200">{item.name}</p>
                                                    <p className="text-[10px] text-slate-500">Categoría: {item.category}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-red-500">{item.stock} u.</p>
                                                <p className="text-[9px] text-slate-500">Mín: {item.minStock}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div className="p-3 bg-slate-900/50 hover:bg-slate-800/50 transition-colors cursor-pointer text-center">
                                    <Link to="/admin/inventory" className="text-xs text-red-400 font-bold w-full inline-block">Ver Inventario Completo</Link>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </main>

            <AdminBottomNav />



            <AdminProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </div>
    );
};

export default OperationsDashboard;
