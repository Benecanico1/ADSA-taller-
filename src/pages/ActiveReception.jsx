import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';

const ActiveReception = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // Data State
    const [appointment, setAppointment] = useState(null);
    const [vehicle, setVehicle] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // State for the checklist
    const [checklist, setChecklist] = useState({
        bodywork: true,
        fluids: true,
        tires: false,
        brakes: false,
        chain: false
    });

    const completedTasks = Object.values(checklist).filter(Boolean).length;
    const totalTasks = Object.keys(checklist).length;

    const handleCheck = (key) => {
        setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
    };

    useEffect(() => {
        const fetchPendingAppointment = async () => {
            if (!currentUser?.sucursalId) {
                setLoading(false);
                return;
            }
            try {
                // Fetch the first pending appointment for demo purposes
                const q = query(
                    collection(db, "Appointments"),
                    where("sucursalId", "==", currentUser.sucursalId),
                    where("status", "==", "pending")
                );
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const appDoc = querySnapshot.docs[0];
                    const appData = { id: appDoc.id, ...appDoc.data() };
                    setAppointment(appData);

                    // Fetch vehicle
                    if (appData.vehicleId) {
                        const vDoc = await getDoc(doc(db, "Motorcycles", appData.vehicleId));
                        if (vDoc.exists()) setVehicle(vDoc.data());
                    }

                    // Fetch user
                    if (appData.userId) {
                        const uDoc = await getDoc(doc(db, "Users", appData.userId));
                        if (uDoc.exists()) setUser(uDoc.data());
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPendingAppointment();
    }, []);

    const handleCompleteReception = async () => {
        if (!appointment) return;
        try {
            // Update appointment status to in_diagnosis
            const appRef = doc(db, "Appointments", appointment.id);
            await updateDoc(appRef, {
                status: "in_diagnosis",
                checklist: checklist
            });
            alert('Recepción completada. La moto pasa a diagnóstico.');
            navigate('/kanban');
        } catch (error) {
            console.error("Error updating appointment:", error);
            alert('Error al completar recepción.');
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col max-w-2xl mx-auto shadow-2xl relative">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 flex items-center bg-white/80 dark:bg-[#161b2a]/90 backdrop-blur-md px-4 py-3 border-b border-slate-200 dark:border-slate-800 justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold leading-tight tracking-tight">Recepción Activa</h1>
                        <p className="text-xs text-primary font-semibold uppercase tracking-wider">Módulo Técnico: {appointment ? appointment.id.slice(0, 6) : 'JO-8821'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center justify-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">sync</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-y-auto pb-48">
                {/* Vehicle Header */}
                <section className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a1214]">
                    {loading ? (
                        <p className="text-sm text-slate-500">Cargando datos del vehículo...</p>
                    ) : appointment && vehicle ? (
                        <div className="flex gap-4 items-center">
                            <div
                                className="h-24 w-24 rounded-xl bg-cover bg-center border-2 border-primary/20 shadow-md"
                                title="Motorcycle"
                                style={{ backgroundImage: `url('${vehicle.imageUrl || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=200'}')` }}
                            ></div>
                            <div className="flex-1">
                                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">{vehicle.brand} {vehicle.model}</h2>
                                <div className="space-y-0.5">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                                        <span className="material-symbols-outlined text-[16px]">person</span> {user?.displayName || user?.email || 'Cliente Dynotech'}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                                        <span className="material-symbols-outlined text-[16px]">fingerprint</span> Placa: {vehicle.plate}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">No hay recepciones pendientes.</p>
                    )}
                </section>

                {/* Inspection Checklist */}
                <section className="p-4 flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Inspección Visual</h3>
                        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
                            {completedTasks}/{totalTasks} Completado
                        </span>
                    </div>
                    <div className="space-y-3">
                        <label className="flex items-center justify-between p-4 bg-white dark:bg-[#161b2a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:border-primary/50">
                            <span className="text-sm font-semibold select-none">Daños/Abolladuras en Carrocería</span>
                            <div className="relative flex items-center justify-center">
                                <input
                                    checked={checklist.bodywork}
                                    onChange={() => handleCheck('bodywork')}
                                    className="peer appearance-none h-6 w-6 rounded border-2 border-slate-300 dark:border-slate-600 bg-transparent checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-transparent outline-none transition-all cursor-pointer"
                                    type="checkbox"
                                />
                                <span className="material-symbols-outlined absolute text-background-dark text-sm pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity font-bold">done</span>
                            </div>
                        </label>
                        <label className="flex items-center justify-between p-4 bg-white dark:bg-[#161b2a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:border-primary/50">
                            <span className="text-sm font-semibold select-none">Niveles de Fluidos (Aceite, Refrigerante)</span>
                            <div className="relative flex items-center justify-center">
                                <input
                                    checked={checklist.fluids}
                                    onChange={() => handleCheck('fluids')}
                                    className="peer appearance-none h-6 w-6 rounded border-2 border-slate-300 dark:border-slate-600 bg-transparent checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-transparent outline-none transition-all cursor-pointer"
                                    type="checkbox"
                                />
                                <span className="material-symbols-outlined absolute text-background-dark text-sm pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity font-bold">done</span>
                            </div>
                        </label>
                        <label className="flex items-center justify-between p-4 bg-white dark:bg-[#161b2a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:border-primary/50">
                            <span className="text-sm font-semibold select-none">Presión y Desgaste de Neumáticos</span>
                            <div className="relative flex items-center justify-center">
                                <input
                                    checked={checklist.tires}
                                    onChange={() => handleCheck('tires')}
                                    className="peer appearance-none h-6 w-6 rounded border-2 border-slate-300 dark:border-slate-600 bg-transparent checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-transparent outline-none transition-all cursor-pointer"
                                    type="checkbox"
                                />
                                <span className="material-symbols-outlined absolute text-background-dark text-sm pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity font-bold">done</span>
                            </div>
                        </label>
                        <label className="flex items-center justify-between p-4 bg-white dark:bg-[#161b2a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:border-primary/50">
                            <span className="text-sm font-semibold select-none">Estado de Pastillas de Freno</span>
                            <div className="relative flex items-center justify-center">
                                <input
                                    checked={checklist.brakes}
                                    onChange={() => handleCheck('brakes')}
                                    className="peer appearance-none h-6 w-6 rounded border-2 border-slate-300 dark:border-slate-600 bg-transparent checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-transparent outline-none transition-all cursor-pointer"
                                    type="checkbox"
                                />
                                <span className="material-symbols-outlined absolute text-background-dark text-sm pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity font-bold">done</span>
                            </div>
                        </label>
                        <label className="flex items-center justify-between p-4 bg-white dark:bg-[#161b2a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:border-primary/50">
                            <span className="text-sm font-semibold select-none">Tensión de Cadena/Correa</span>
                            <div className="relative flex items-center justify-center">
                                <input
                                    checked={checklist.chain}
                                    onChange={() => handleCheck('chain')}
                                    className="peer appearance-none h-6 w-6 rounded border-2 border-slate-300 dark:border-slate-600 bg-transparent checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-transparent outline-none transition-all cursor-pointer"
                                    type="checkbox"
                                />
                                <span className="material-symbols-outlined absolute text-background-dark text-sm pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity font-bold">done</span>
                            </div>
                        </label>
                    </div>
                </section>

                {/* Media Section */}
                <section className="px-4 pb-4">
                    <button className="w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/30 hover:bg-primary/5 hover:border-primary transition-all group active:scale-[0.99]">
                        <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                            <span className="material-symbols-outlined text-primary text-2xl">add_a_photo</span>
                        </div>
                        <div className="text-center">
                            <p className="text-base font-bold">Añadir Evidencia Fotográfica</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Capture daños o componentes críticos</p>
                        </div>
                    </button>
                </section>

                {/* Signature Pad */}
                <section className="px-4 pb-4">
                    <div className="bg-white dark:bg-[#161b2a] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h4 className="text-xs font-bold uppercase tracking-wider">Firma del Cliente</h4>
                            <button className="text-primary text-xs font-bold hover:underline">Borrar</button>
                        </div>
                        <div className="h-32 w-full relative bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
                            {/* Signature Line */}
                            <div className="absolute bottom-8 left-10 right-10 border-b-2 border-dashed border-slate-300 dark:border-slate-600"></div>
                            <p className="absolute bottom-2 left-10 text-[10px] text-slate-400 uppercase font-bold tracking-wider">Firme aquí para autorizar el trabajo</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Bottom Actions Wrapper - Fixed Position */}
            <div className="fixed bottom-0 left-0 right-0 w-full max-w-2xl mx-auto bg-white/95 dark:bg-[#0a1214]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pt-3 pb-6 px-4 flex flex-col gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50">
                <button
                    onClick={handleCompleteReception}
                    disabled={!appointment}
                    className="w-full h-14 bg-primary hover:bg-primary/90 disabled:opacity-50 text-background-dark rounded-xl font-bold text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                    <span>Completar Recepción</span>
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </button>

                {/* Bottom Navigation Mini */}
                <nav className="flex justify-around items-center pt-2">
                    <Link to="/reception" className="flex flex-col items-center justify-center gap-1 text-primary w-16">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
                        <span className="text-[10px] font-bold tracking-wide uppercase">Recepción</span>
                    </Link>
                    <Link to="/kanban" className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors w-16">
                        <span className="material-symbols-outlined">build</span>
                        <span className="text-[10px] font-bold tracking-wide uppercase">Trabajos</span>
                    </Link>
                    <Link to="/inventory" className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors w-16">
                        <span className="material-symbols-outlined">inventory_2</span>
                        <span className="text-[10px] font-bold tracking-wide uppercase">Inventario</span>
                    </Link>
                    <Link to="/profile/settings" className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors w-16">
                        <span className="material-symbols-outlined">settings</span>
                        <span className="text-[10px] font-bold tracking-wide uppercase">Ajustes</span>
                    </Link>
                </nav>
            </div>
        </div>
    );
};

export default ActiveReception;
