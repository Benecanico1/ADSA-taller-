import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';

const WorkshopKanbanBoard = () => {
    const { currentUser } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser?.sucursalId) return;

        // Fetch all appointments in real-time scoped to this branch
        const q = query(collection(db, 'Appointments'), where('sucursalId', '==', currentUser.sucursalId));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const apps = [];
            for (const document of snapshot.docs) {
                const data = document.data();

                // Fetch vehicle details
                let vehicleData = { brand: 'Moto', model: 'Desconocida', plate: '---' };
                if (data.vehicleId) {
                    try {
                        const vDoc = await getDoc(doc(db, 'Motorcycles', data.vehicleId));
                        if (vDoc.exists()) {
                            vehicleData = vDoc.data();
                        }
                    } catch (e) {
                        console.error('Error fetching vehicle:', e);
                    }
                }

                apps.push({ id: document.id, ...data, vehicle: vehicleData });
            }
            setAppointments(apps);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleTakeJob = async (appId) => {
        if (!currentUser) return;
        try {
            const appRef = doc(db, 'Appointments', appId);
            await updateDoc(appRef, {
                mechanicId: currentUser.uid,
                mechanicName: currentUser.displayName || 'Mecánico',
                status: 'diagnosing' // or keep it pending, but assigning usually moves it forward
            });
        } catch (error) {
            console.error('Error assigning job:', error);
        }
    };

    // Filter appointments based on role
    const visibleAppointments = appointments.filter(app => {
        if (currentUser?.role === 'admin') return true;
        // Mechanics see unassigned jobs or jobs assigned to them
        return !app.mechanicId || app.mechanicId === currentUser?.uid;
    });

    const pendingAppointments = visibleAppointments.filter(a => a.status === 'pending');
    const diagnosingAppointments = visibleAppointments.filter(a => a.status === 'diagnosing');
    const workingAppointments = visibleAppointments.filter(a => a.status === 'working');
    const qualityAppointments = visibleAppointments.filter(a => a.status === 'quality');
    const readyAppointments = visibleAppointments.filter(a => a.status === 'ready');

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col max-w-7xl mx-auto border-x border-slate-200 dark:border-slate-800">
            {/* Header & Brand */}
            <header className="flex items-center bg-[#161b2a] p-4 border-b border-slate-800 sticky top-0 z-50">
                <Link to="/dashboard" className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-lg text-background-dark flex items-center justify-center">
                        <span className="material-symbols-outlined font-bold">handyman</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-100">Dynotech Power Garage</h1>
                        <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-semibold">Operaciones del Taller</p>
                    </div>
                </Link>
                <div className="ml-auto flex items-center gap-3">
                    <button className="text-slate-400 hover:text-primary transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <div className="size-8 rounded-full bg-slate-800 border border-primary/30 flex items-center justify-center overflow-hidden">
                        <img
                            className="w-full h-full object-cover"
                            alt="User profile picture of a mechanic"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_YoIxaaMKmbR9o_56KUydGPjfDFO9B5j1nDlv4mXZ_mkDXFXPSTH_ivndYsZwbdUuicW2gB1We7MHkm-UKaS7FMaDsRnapGRJsr66c72rQP0immBBHdMJygLH1R0pqhTGKP7txOVi5c6FAXK49MGWjyYWc-_IGtFn9Yr7eDdn1z8CAiwZE5m_5leKpNbQ_x6SzdCmhXvt-nq5VSE5qFwf5I5g80rOWBdMERSYPM7YdX8cWdm8Wy4jnFTfiPjWlRV2gMXh-8ZvcTUK"
                        />
                    </div>
                </div>
            </header>

            {/* Real-time Metrics - Admins Only */}
            {(currentUser?.role === 'admin' || !currentUser?.role) && (
                <section className="flex gap-3 p-4 overflow-x-auto no-scrollbar carbon-pattern border-b border-slate-800 text-slate-100">
                    <div className="flex min-w-[140px] flex-1 flex-col gap-1 rounded-xl p-4 bg-[#161b2a] border border-slate-800 shadow-xl">
                        <p className="text-slate-400 text-xs font-medium">Motos en Taller</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold">24</p>
                            <p className="text-primary text-[10px] font-bold">+12%</p>
                        </div>
                    </div>
                    <div className="flex min-w-[140px] flex-1 flex-col gap-1 rounded-xl p-4 bg-[#161b2a] border border-slate-800 shadow-xl">
                        <p className="text-slate-400 text-xs font-medium">Técnicos Activos</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold">8</p>
                            <p className="text-slate-500 text-[10px] font-bold">0%</p>
                        </div>
                    </div>
                    <div className="flex min-w-[140px] flex-1 flex-col gap-1 rounded-xl p-4 bg-[#161b2a] border border-slate-800 shadow-xl">
                        <p className="text-slate-400 text-xs font-medium">Promedio Entrega</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold">4.2h</p>
                            <p className="text-red-500 text-[10px] font-bold">-5%</p>
                        </div>
                    </div>
                </section>
            )}

            {/* Kanban Board */}
            <main className="flex-1 overflow-x-auto flex gap-4 p-4 bg-background-dark/50 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-slate-900 [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full pb-24 text-slate-100">

                {/* Column: Por Iniciar */}
                <div className="flex-shrink-0 w-80 flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold flex items-center gap-2">
                            <span className="size-2 rounded-full bg-slate-500"></span>
                            Por Iniciar <span className="text-slate-500 text-sm font-normal">({pendingAppointments.length + 1})</span>
                        </h3>
                        <button className="text-primary hover:bg-primary/10 p-1 rounded-lg cursor-pointer">
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </div>
                    <div className="flex flex-col gap-3">
                        {/* Dynamic Appointments */}
                        {loading ? (
                            <p className="text-xs text-slate-500 px-2">Cargando...</p>
                        ) : (
                            pendingAppointments.map(app => (
                                <div key={app.id} className="bg-[#161b2a] border border-slate-800 rounded-xl p-3 shadow-lg relative group hover:border-primary/50 transition-colors cursor-grab active:cursor-grabbing">
                                    <div className="absolute top-3 right-3 text-slate-600">
                                        <span className="material-symbols-outlined text-sm">drag_indicator</span>
                                    </div>
                                    <div className="flex gap-3 mb-3">
                                        <div className="size-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                                            <img className="w-full h-full object-cover opacity-80" alt="Motorcycle" src={app.vehicle.imageUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=200"} />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">{app.date} • {app.time}</span>
                                            <h4 className="font-bold text-sm text-slate-100">{app.vehicle.brand} {app.vehicle.model}</h4>
                                            <p className="text-[11px] text-slate-400">Placa: {app.vehicle.plate}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-1">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary text-xs">person</span>
                                            </div>
                                            <p className="text-xs text-slate-300">Cliente ID: {app.userId.slice(0, 5)}...</p>
                                        </div>
                                        {currentUser?.role !== 'admin' && !app.mechanicId ? (
                                            <button
                                                onClick={() => handleTakeJob(app.id)}
                                                className="text-[10px] bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded font-bold transition-colors"
                                            >
                                                Tomar Trabajo
                                            </button>
                                        ) : (
                                            <p className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Sin asignar</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Static Card 1 */}
                        <div className="bg-[#161b2a] border border-slate-800 rounded-xl p-3 shadow-lg relative group hover:border-slate-600 transition-colors cursor-grab active:cursor-grabbing">
                            <div className="absolute top-3 right-3 text-slate-600">
                                <span className="material-symbols-outlined text-sm">drag_indicator</span>
                            </div>
                            <div className="flex gap-3 mb-3">
                                <div className="size-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                                    <img className="w-full h-full object-cover opacity-80" alt="Harley Davidson motorcycle in garage" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDziq9o-DY8RvDUc_uh7vvQRwwWzkocZvBMr-twVtDCnFIK_JCwrieEBpBEXf-2QY0Mt3e-CBQKwCLrQfZ4wWagfOTpPxIDXolI8eK-k0CgZi7wqJUuAoV6hRhemxCMV2SkxReIn5V04K7jDvuWFXZ78I3RBE9zLGHYaW2WG67OBKPD53xWV-_c8Xt2tmWlZn-B_HCe086pAyln6Ld9TYGTApvomSS5aIW0LhrDMbCd5cSafcKuq7Q0yryTdnpBnw2hD2CXmwjWZPF4" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Urgente</span>
                                    <h4 className="font-bold text-sm text-slate-100">Harley Softail Standard</h4>
                                    <p className="text-[11px] text-slate-400">Placa: ABC-1234</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-1">
                                <div className="flex items-center gap-2">
                                    <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-xs">person</span>
                                    </div>
                                    <p className="text-xs text-slate-300">Juan Pérez</p>
                                </div>
                                <p className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Sin asignar</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column: En Diagnóstico */}
                <div className="flex-shrink-0 w-80 flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold flex items-center gap-2">
                            <span className="size-2 rounded-full bg-yellow-500"></span>
                            En Diagnóstico <span className="text-slate-500 text-sm font-normal">({diagnosingAppointments.length})</span>
                        </h3>
                    </div>
                    <div className="flex flex-col gap-3">
                        {diagnosingAppointments.map(app => (
                            <div key={app.id} className="bg-[#161b2a] border border-slate-800 rounded-xl p-3 shadow-lg relative hover:border-slate-600 transition-colors cursor-grab active:cursor-grabbing">
                                <div className="flex gap-3 mb-3">
                                    <div className="size-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                                        <img className="w-full h-full object-cover" alt="Vehicle" src={app.vehicle.imageUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=200"} />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider mb-1">Diagnóstico</span>
                                        <h4 className="font-bold text-sm text-slate-100">{app.vehicle.brand} {app.vehicle.model}</h4>
                                        <p className="text-[11px] text-slate-400">Placa: {app.vehicle.plate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-slate-300">Cliente ID: {app.userId.slice(0, 5)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 relative z-10">
                                        {(currentUser?.role === 'mechanic' || currentUser?.email?.includes('mechanic')) && (
                                            <Link
                                                to="/mechanic-budget"
                                                className="bg-primary/20 hover:bg-primary/30 text-primary p-1.5 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                                title="Cargar Repuestos"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                                            </Link>
                                        )}
                                        <div className="flex items-center gap-1.5 bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                            <span className="material-symbols-outlined text-[12px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>engineering</span>
                                            <p className="text-[10px] text-primary font-bold">{app.mechanicName || 'Mecánico'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column: En Reparación */}
                <div className="flex-shrink-0 w-80 flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold flex items-center gap-2">
                            <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                            En Reparación <span className="text-slate-500 text-sm font-normal">({workingAppointments.length})</span>
                        </h3>
                    </div>
                    <div className="flex flex-col gap-3">
                        {workingAppointments.map(app => (
                            <div key={app.id} className="bg-[#161b2a] border border-primary/30 rounded-xl p-3 shadow-[0_0_15px_rgba(37,209,244,0.1)] relative cursor-grab active:cursor-grabbing hover:border-primary transition-colors">
                                <div className="flex gap-3 mb-3">
                                    <div className="size-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800 ring-2 ring-primary ring-offset-2 ring-offset-[#161b2a]">
                                        <img className="w-full h-full object-cover" alt="Vehicle" src={app.vehicle.imageUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=200"} />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">En Proceso</span>
                                        <h4 className="font-bold text-sm text-primary">{app.vehicle.brand} {app.vehicle.model}</h4>
                                        <p className="text-[11px] text-slate-400">Placa: {app.vehicle.plate}</p>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-800 h-1 rounded-full mb-3 overflow-hidden">
                                    <div className="bg-primary h-full w-2/3"></div>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-800 pt-3 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-slate-300">Cliente ID: {app.userId.slice(0, 5)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {(currentUser?.role === 'mechanic' || currentUser?.email?.includes('mechanic')) && (
                                            <Link
                                                to="/mechanic-budget"
                                                className="bg-primary/20 hover:bg-primary/30 text-primary p-1.5 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                                title="Cargar Repuestos"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                                            </Link>
                                        )}
                                        <div className="flex items-center gap-1.5 bg-primary/10 px-2 py-0.5 rounded border border-primary/40 shadow-[0_0_5px_rgba(37,209,244,0.2)]">
                                            <span className="material-symbols-outlined text-[12px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>engineering</span>
                                            <p className="text-[10px] text-primary font-black italic">{app.mechanicName || 'Mecánico'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column: Control de Calidad */}
                <div className="flex-shrink-0 w-80 flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold flex items-center gap-2">
                            <span className="size-2 rounded-full bg-blue-500"></span>
                            Control de Calidad <span className="text-slate-500 text-sm font-normal">({qualityAppointments.length})</span>
                        </h3>
                    </div>
                    <div className="flex flex-col gap-3">
                        {qualityAppointments.map(app => (
                            <div key={app.id} className="bg-[#161b2a] border border-slate-800 rounded-xl p-3 shadow-lg relative hover:border-slate-600 transition-colors cursor-grab active:cursor-grabbing">
                                <div className="flex gap-3 mb-3">
                                    <div className="size-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                                        <img className="w-full h-full object-cover" alt="Vehicle" src={app.vehicle.imageUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=200"} />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Revisión</span>
                                        <h4 className="font-bold text-sm">{app.vehicle.brand} {app.vehicle.model}</h4>
                                        <p className="text-[11px] text-slate-400">Placa: {app.vehicle.plate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-slate-300">Cliente ID: {app.userId.slice(0, 5)}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                        <span className="material-symbols-outlined text-[12px] text-blue-400">verified</span>
                                        <p className="text-[10px] text-blue-400 font-bold">Hecho por {app.mechanicName || 'Mecánico'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column: Listo para Entrega */}
                <div className="flex-shrink-0 w-80 flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold flex items-center gap-2">
                            <span className="size-2 rounded-full bg-primary"></span>
                            Listo para Entrega <span className="text-slate-500 text-sm font-normal">({readyAppointments.length})</span>
                        </h3>
                    </div>
                    <div className="flex flex-col gap-3">
                        {readyAppointments.map(app => (
                            <div key={app.id} className="bg-primary/5 border border-primary/20 rounded-xl p-3 shadow-lg relative cursor-grab active:cursor-grabbing">
                                <div className="flex gap-3 mb-3">
                                    <div className="size-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                                        <img className="w-full h-full object-cover grayscale opacity-70" alt="Vehicle" src={app.vehicle.imageUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=200"} />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Completado</span>
                                        <h4 className="font-bold text-sm">{app.vehicle.brand} {app.vehicle.model}</h4>
                                        <p className="text-[11px] text-slate-400">Lavar y Facturar</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Bottom Navigation */}
            {(currentUser?.role === 'admin' || !currentUser?.role || !currentUser?.email?.includes('mechanic')) ? (
                <nav className="fixed bottom-0 z-50 flex w-full max-w-7xl mx-auto left-0 right-0 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl px-4 py-3 pb-6 justify-around">
                    <Link to="/kanban" className="flex flex-col items-center gap-1 text-primary cursor-pointer w-[60px]">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                        <span className="text-[10px] font-medium tracking-wide">Tablero</span>
                    </Link>
                    <Link to="/inventory" className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors cursor-pointer w-[60px]">
                        <span className="material-symbols-outlined">inventory_2</span>
                        <span className="text-[10px] font-medium tracking-wide">Inventario</span>
                    </Link>
                    <Link to="/commissions" className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors cursor-pointer w-[60px]">
                        <span className="material-symbols-outlined">payments</span>
                        <span className="text-[10px] font-medium tracking-wide">Mecánicos</span>
                    </Link>
                    <Link to="/settings" className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors cursor-pointer w-[60px]">
                        <span className="material-symbols-outlined">settings</span>
                        <span className="text-[10px] font-medium tracking-wide">Ajustes</span>
                    </Link>
                </nav>
            ) : (
                <nav className="fixed bottom-0 z-50 flex w-full max-w-7xl mx-auto left-0 right-0 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl px-4 py-3 pb-6 justify-center">
                    <Link to="/mechanic-dashboard" className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors cursor-pointer px-10">
                        <span className="material-symbols-outlined">home</span>
                        <p className="text-[10px] font-bold leading-none tracking-widest uppercase mt-0.5">Volver al Inicio</p>
                    </Link>
                </nav>
            )}
        </div>
    );
};

export default WorkshopKanbanBoard;
