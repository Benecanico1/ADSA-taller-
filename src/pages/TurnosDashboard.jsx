import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import MechanicBottomNav from '../components/ui/MechanicBottomNav';
import AdminBottomNav from '../components/ui/AdminBottomNav';
import AdminAddAppointmentModal from '../components/AdminAddAppointmentModal';

const TurnosDashboard = () => {
    const { currentUser, userRole, isDemoAdmin } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, byDate: {} });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        if (!currentUser?.sucursalId) return;

        const appsRef = collection(db, 'Appointments');
        const q = query(appsRef, where('sucursalId', '==', currentUser.sucursalId), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const appsData = [];
            const dateGroups = {};

            snapshot.forEach((doc) => {
                const data = doc.data();
                const app = { id: doc.id, ...data };
                appsData.push(app);

                // Group by date
                const dateKey = app.date || 'Sin Fecha';
                if (!dateGroups[dateKey]) {
                    dateGroups[dateKey] = {
                        count: 0,
                        apps: []
                    };
                }
                dateGroups[dateKey].count++;
                dateGroups[dateKey].apps.push(app);
            });

            // Sort dates descending (newest first)
            const sortedGroupKeys = Object.keys(dateGroups).sort((a, b) => {
                if (a === 'Sin Fecha') return 1;
                if (b === 'Sin Fecha') return -1;
                return new Date(b) - new Date(a);
            });

            const sortedByDate = {};
            sortedGroupKeys.forEach(k => {
                sortedByDate[k] = dateGroups[k];
            });

            setAppointments(appsData);
            setStats({
                total: appsData.length,
                byDate: sortedByDate
            });
            setLoading(false);
        }, (error) => {
            console.error("Error fetching appointments:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser?.sucursalId]);

    if (loading) {
        return (
            <div className="bg-[#0a0c14] min-h-screen flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl animate-spin mb-4">sync</span>
                <p className="text-slate-400 text-sm font-bold tracking-widest uppercase animate-pulse">Cargando Turnos...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#0a0c14] text-slate-100 min-h-screen flex flex-col font-display w-full relative overflow-x-hidden">
            {/* Carbon Pattern Background */}
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

            <div className="relative z-10 flex flex-col flex-1 h-screen overflow-y-auto pb-32">

                {/* Header */}
                <header className="flex items-center justify-between bg-[#161b2a]/90 backdrop-blur-md p-4 pb-3 sticky top-0 z-50 border-b border-slate-700/50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="flex items-center justify-center rounded-xl h-10 w-10 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700/50 active:scale-95 shadow-sm">
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </button>
                        <div className="flex flex-col">
                            <h2 className="text-white text-lg font-bold leading-tight tracking-tight">Gestión de Turnos</h2>
                            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Proyección Mensual</p>
                        </div>
                    </div>
                </header>

                <main className="p-4 lg:p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-6 lg:border-x lg:border-slate-800/50 lg:bg-[#0a0c14]/50 shadow-2xl relative">

                    {/* Metrics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#161b2a] border border-slate-700/50 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined text-9xl">format_list_bulleted</span>
                            </div>
                            <div className="relative z-10">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Histórico</p>
                                <div className="flex items-end gap-3">
                                    <h3 className="text-5xl font-black text-white">{stats.total}</h3>
                                    <span className="text-sm font-bold text-primary uppercase tracking-widest mb-1 pb-1 border-b-2 border-primary">Turnos</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#161b2a] border border-slate-700/50 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined text-9xl">calendar_month</span>
                            </div>
                            <div className="relative z-10">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Días Programados</p>
                                <div className="flex items-end gap-3">
                                    <h3 className="text-5xl font-black text-white">{Object.keys(stats.byDate).length}</h3>
                                    <span className="text-sm font-bold text-primary uppercase tracking-widest mb-1 pb-1 border-b-2 border-primary">Fechas Activas</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Check calendar dates */}
                    <div className="flex flex-col gap-6 w-full">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-2xl">event_upcoming</span>
                                <h3 className="text-white text-lg font-bold tracking-tight">Desglose por Fecha</h3>
                            </div>
                            {(userRole === 'admin' || isDemoAdmin) && (
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="bg-primary hover:bg-primary/90 text-[#0a0c14] font-black tracking-widest uppercase text-[10px] px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,40,0,0.3)] hover:scale-105 active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-[14px]">add</span>
                                    Añadir Turno
                                </button>
                            )}
                        </div>

                        {Object.keys(stats.byDate).length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {Object.keys(stats.byDate).map((date) => (
                                    <div key={date} className="bg-[#161b2a] border border-slate-700/50 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                                        <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/20 text-primary rounded-xl w-12 h-12 flex items-center justify-center font-black text-xl border border-primary/30 shadow-[0_0_15px_rgba(255,40,0,0.2)]">
                                                    {stats.byDate[date].count}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold text-lg">{date !== 'Sin Fecha' ? new Date(date + 'T12:00:00Z').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Sin Fecha'}</h4>
                                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Turnos asignados</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                                            {stats.byDate[date].apps.map(app => (
                                                <div key={app.id} className="flex gap-3 items-center bg-[#0a0c14] p-3 rounded-xl border border-slate-800">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-700/50">
                                                        {app.vehicle?.imageUrl ? (
                                                            <img loading="lazy" src={app.vehicle.imageUrl} alt="Vehicle" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                                                <span className="material-symbols-outlined text-slate-500 text-sm">two_wheeler</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-sm font-bold truncate">{app.clientName}</p>
                                                        <p className="text-primary text-[10px] font-bold uppercase tracking-wider truncate">
                                                            {app.time || '--:--'} • {app.vehicle?.brand} {app.vehicle?.model}
                                                        </p>
                                                    </div>
                                                    {app.status === 'completed' ? (
                                                        <span className="material-symbols-outlined text-emerald-500 text-sm" title="Completado">check_circle</span>
                                                    ) : app.status === 'delivering' ? (
                                                        <span className="material-symbols-outlined text-amber-500 text-sm" title="En entrega">local_shipping</span>
                                                    ) : (
                                                        <span className="material-symbols-outlined text-slate-500 text-sm" title="Pendiente/Taller">pending</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-[#161b2a] border border-dashed border-slate-700/80 rounded-2xl shadow-inner">
                                <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">sentiment_dissatisfied</span>
                                <h3 className="text-white text-lg font-bold mb-1">No hay turnos registrados</h3>
                                <p className="text-sm text-slate-500 font-medium tracking-tight max-w-sm mx-auto">Aún no se han recibido solicitudes de turnos en el sistema.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Show appropriate Bottom Nav based on user Role */}
            {(userRole === 'admin' || isDemoAdmin) ? <AdminBottomNav /> : <MechanicBottomNav />}

            {/* Admin Add Appointment Modal */}
            <AdminAddAppointmentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    );
};

export default TurnosDashboard;
