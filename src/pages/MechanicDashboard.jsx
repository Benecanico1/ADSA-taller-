import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';

const MechanicDashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        // Fetch all relevant appointments for the mechanic
        // We need: 'completed' jobs assigned to them, AND 'pending' unassigned jobs
        // Since Firestore can't do OR queries efficiently with different fields, we fetch all non-rejected
        // and filter client side.
        const q = query(collection(db, 'Appointments'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const apps = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                // Filter: Only care if it's assigned to ME, OR it's pending and unassigned
                if (data.mechanicId === currentUser.uid || (!data.mechanicId && data.status === 'pending')) {
                    apps.push({ id: doc.id, ...data });
                }
            });
            // Sort by date descending
            apps.sort((a, b) => new Date(b.date) - new Date(a.date));
            setAppointments(apps);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleTakeJob = async (appId) => {
        try {
            const appRef = doc(db, 'Appointments', appId);
            await updateDoc(appRef, {
                mechanicId: currentUser.uid,
                mechanicName: currentUser.displayName || 'Mecánico',
                status: 'diagnosing' // Move to diagnosing upon taking
            });
            // Let the real-time listener update the state
            console.log("Job taken successfully:", appId);
        } catch (error) {
            console.error('Error assigning job:', error);
        }
    };


    // Partition the data
    const completedApps = appointments.filter(a => a.status === 'completed' && a.mechanicId === currentUser?.uid);
    const availableApps = appointments.filter(a => !a.mechanicId && a.status === 'pending');

    // Calculate Productivity for the chart
    const daysOfWeek = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    const serviceCounts = { D: 0, L: 0, M: 0, 'M-2': 0, J: 0, V: 0, S: 0 }; // 'M-2' handles the second 'M' (Miércoles)

    completedApps.forEach(app => {
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
                <div className="flex flex-col">
                    <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">Panel de Control</h2>
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

                {/* Available Jobs Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-slate-900 dark:text-slate-100 text-base font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">assignment_add</span>
                            Nuevos Trabajos Disponibles
                        </h3>
                        {availableApps.length > 0 && (
                            <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{availableApps.length}</span>
                        )}
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
                        {availableApps.length > 0 ? (
                            availableApps.map(app => (
                                <div key={app.id} className="min-w-[280px] bg-white dark:bg-[#161b2a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                                    <div className="flex gap-3 mb-4">
                                        <div className="size-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                            <img className="w-full h-full object-cover" alt="Motorcycle" src={app.vehicle?.imageUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=200"} />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                                                {app.date} • {app.time}
                                            </span>
                                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                                                {app.vehicle?.brand} {app.vehicle?.model}
                                            </h4>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">{app.clientName}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 mb-4">
                                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                                            "{app.issueDescription || "Revisión general y mantenimiento"}"
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleTakeJob(app.id)}
                                        className="w-full bg-primary/10 hover:bg-primary/20 text-primary dark:bg-primary/5 dark:hover:bg-primary/10 border border-primary/20 py-2.5 rounded-xl text-sm font-bold tracking-widest uppercase transition-colors"
                                    >
                                        Tomar Trabajo
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="w-full text-center py-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 mb-2">inbox</span>
                                <p className="text-sm text-slate-500 font-medium">No hay trabajos nuevos pendientes</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Productivity Chart Section */}
                <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white dark:bg-[#161b2a] border border-slate-200 dark:border-slate-800 shadow-sm mt-2">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1">
                            <p className="text-slate-900 dark:text-slate-100 text-base font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                                Productividad Semanal
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Semana Actual</p>
                        </div>
                        <div className="text-right">
                            <p className="text-primary text-3xl font-black leading-none text-right">{completedApps.length}</p>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Servicios</span>
                        </div>
                    </div>

                    <div className="flex items-end justify-between h-32 px-1 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800/80 mt-2">
                        {chartData.map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2.5 w-full max-w-[32px] group cursor-pointer relative">
                                <span className={`absolute -top-7 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity ${item.active ? 'text-primary' : 'text-slate-500'} bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded shadow-sm z-10`}>
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

                {/* Completed Jobs History */}
                <div className="flex flex-col gap-4 mt-2">
                    <h3 className="text-slate-900 dark:text-slate-100 text-base font-bold flex items-center gap-2 px-1">
                        <span className="material-symbols-outlined text-emerald-500">task_alt</span>
                        Trabajos Realizados
                    </h3>

                    <div className="flex flex-col gap-3">
                        {completedApps.length > 0 ? (
                            completedApps.map(app => (
                                <div key={app.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#161b2a] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/30 transition-colors">
                                    <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner shrink-0">
                                        <span className="material-symbols-outlined border border-emerald-500/20 rounded-lg p-1.5">two_wheeler</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-slate-900 dark:text-slate-100 font-bold truncate">Servicio Completado</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">
                                            OT #{app.id.slice(-4).toUpperCase()} • {app.vehicle?.brand} {app.vehicle?.model}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-[9px] px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 uppercase font-bold tracking-widest inline-block">Finalizado</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white dark:bg-[#161b2a] border border-slate-200 dark:border-slate-800 rounded-2xl">
                                <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-700 mb-2">assignment_turned_in</span>
                                <p className="text-sm text-slate-500 font-medium tracking-tight">Aún no tienes trabajos completados.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto flex justify-around border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111718]/95 backdrop-blur-md px-6 pb-6 pt-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
                <Link to="/mechanic-dashboard" className="flex flex-col items-center gap-1 text-primary cursor-pointer w-[60px]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
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

export default MechanicDashboard;
