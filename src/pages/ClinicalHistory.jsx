import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const ClinicalHistory = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }
            try {
                const q = query(collection(db, "Motorcycles"), where("ownerId", "==", currentUser.uid));
                const querySnapshot = await getDocs(q);
                const bikes = [];
                querySnapshot.forEach((doc) => {
                    bikes.push({ id: doc.id, ...doc.data() });
                });
                setVehicles(bikes);
            } catch (error) {
                console.error("Error fetching vehicles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [currentUser]);

    if (loading) {
        return (
            <div className="bg-[#f6f6f8] dark:bg-[#101522] min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
            </div>
        );
    }

    const hasMotorcycle = vehicles.length > 0;
    const currentBike = hasMotorcycle ? vehicles[0] : null;

    return (
        <div className="bg-[#f6f6f8] dark:bg-[#101522] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center bg-[#f6f6f8]/80 dark:bg-[#101522]/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors -ml-2"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 px-2 text-center">Historial Clínico</h2>
                <div className="flex w-10 items-center justify-end">
                    <button className="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-xl">share</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 pb-32">
                {!hasMotorcycle ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center">
                        <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-slate-400 text-5xl">two_wheeler</span>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Sin Historial Clínico</h2>
                        <p className="text-slate-500 text-sm mb-8 text-balance">Actualmente no tienes ninguna motocicleta registrada en tu perfil de adsa_taller. Registra tu vehículo para comenzar a rastrear su gemelo digital.</p>
                        <Link to="/kanban" className="bg-primary text-[#101f22] px-6 py-3 rounded-xl font-bold font-technical shadow-[0_0_15px_rgba(37,209,244,0.3)] hover:scale-105 transition-transform flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            Registrar Motocicleta
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Vehicle Profile Card */}
                        <div className="flex p-4">
                            <div className="flex w-full flex-col gap-4">
                                <div className="flex gap-4 items-center bg-white dark:bg-[#161b2a]/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div
                                        className="bg-center bg-no-repeat bg-cover rounded-xl h-24 w-24 border border-slate-200 dark:border-slate-700 shadow-inner shrink-0"
                                        style={{ backgroundImage: `url("${currentBike?.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyJ3Piwwj0kIewDEWmQAVGHPEsIT8F0eTnASWRbRMh0sFTYHdYvQCfByJcjgEtfrrg2ZCYDkB2axH0rDhh3jXBGkBXPcTzGFdAb_akk8MPHgpA3TN-nW2bVgrhFuP4ao0J7z7CsE5IqjcOSrvITYdd0uSOHNhwwBiZUpkJrCmNhZljjWdj8WssvFHzXfLobVeweqmr3o12riHM2PztpHjiqtTvbw3y-XTDvdfM1nT1icicImTx2w73JBOA8nuI2oFF-OES4H8jiE80'}")` }}
                                    ></div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <p className="text-slate-900 dark:text-white text-lg font-black leading-tight tracking-tight truncate">{currentBike?.brand} {currentBike?.model}</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">VIN: {currentBike?.vin || 'N/A'}</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest">Patente: {currentBike?.licensePlate}</p>
                                        <div className="mt-2.5 flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 self-start">
                                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest">Digital Twin Activo</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="flex gap-3 px-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden font-display">
                            <div className="flex min-w-[150px] flex-1 flex-col gap-1.5 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b2a] shadow-sm">
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">speed</span> Kilometraje Total
                                </p>
                                <p className="text-slate-900 dark:text-white text-2xl font-black leading-tight mt-1">{currentBike?.mileage || 0} km</p>
                                <p className="text-emerald-500 text-[11px] font-bold flex items-center gap-1 mt-1">
                                    <span className="material-symbols-outlined text-sm">trending_up</span> +850 km
                                </p>
                            </div>

                            <div className="flex min-w-[150px] flex-1 flex-col gap-1.5 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b2a] shadow-sm">
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">history</span> Último Servicio
                                </p>
                                <p className="text-slate-900 dark:text-white text-xl font-black leading-tight mt-1">15 Oct, 2023</p>
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Revisión de 90 días</p>
                            </div>

                            <div className="flex min-w-[150px] flex-1 flex-col gap-1.5 rounded-2xl p-5 border border-primary/30 bg-primary/10 dark:bg-primary/5 shadow-md shadow-primary/5">
                                <p className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">notifications_active</span> Próxima Alerta
                                </p>
                                <p className="text-slate-900 dark:text-white text-xl font-black leading-tight mt-1 drop-shadow-sm">13 Ene, 2024</p>
                                <p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1">Mantenimiento Progr.</p>
                            </div>
                        </div>

                        {/* Work Orders List */}
                        <div className="flex items-center justify-between px-5 pb-4 pt-6">
                            <h2 className="text-slate-900 dark:text-white text-lg font-black leading-tight tracking-tight uppercase">Órdenes de Trabajo (OTs)</h2>
                            <span className="text-slate-500 text-xs font-bold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">14 registros</span>
                        </div>

                        <div className="flex flex-col gap-4 px-4">
                            {/* OT 1 */}
                            <div className="flex flex-col gap-3 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b2a] shadow-sm hover:border-primary/40 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">01 Dic, 2023 • OT #8842</p>
                                        <h3 className="text-slate-900 dark:text-white text-base font-black mt-1">Mantenimiento Mayor (12k)</h3>
                                    </div>
                                    <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/30">Certificado</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-medium mt-1">
                                    Diagnóstico completo de motor, ajuste de holgura de válvulas, sincronización de sistema Desmo y reemplazo de fluidos.
                                </p>
                                <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 px-4 py-3.5 text-xs font-black tracking-widest uppercase text-[#101522] transition-transform active:scale-[0.98] shadow-lg shadow-primary/20">
                                    <span className="material-symbols-outlined text-lg">verified_user</span>
                                    Descargar Certificado adsa_taller
                                </button>
                            </div>

                            {/* OT 2 */}
                            <div className="flex flex-col gap-3 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b2a] opacity-95 shadow-sm hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">15 Oct, 2023 • OT #7219</p>
                                        <h3 className="text-slate-900 dark:text-white text-base font-black mt-1">Cambio Llantas y Balanceo</h3>
                                    </div>
                                    <span className="bg-slate-500/10 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-500/20">Estándar</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-medium mt-1">
                                    Reemplazo de llantas delantera y trasera Pirelli Diablo Rosso IV. Inflado con nitrógeno y balanceo electrónico de ruedas.
                                </p>
                                <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-3.5 text-xs font-black tracking-widest uppercase text-slate-900 dark:text-white transition-transform active:scale-[0.98]">
                                    <span className="material-symbols-outlined text-lg">description</span>
                                    Ver Reporte de Servicio
                                </button>
                            </div>

                            {/* OT 3 */}
                            <div className="flex flex-col gap-3 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b2a] opacity-90 shadow-sm hover:border-primary/40 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">22 Ago, 2023 • OT #6104</p>
                                        <h3 className="text-slate-900 dark:text-white text-base font-black mt-1">Ajuste de Suspensión</h3>
                                    </div>
                                    <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/30">Certificado</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-medium mt-1">
                                    Configuración personalizada Öhlins para uso en circuito. Ajuste de Sag y calibración de compresión/rebote.
                                </p>
                                <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 px-4 py-3.5 text-xs font-black tracking-widest uppercase text-[#101522] transition-transform active:scale-[0.98] shadow-lg shadow-primary/20">
                                    <span className="material-symbols-outlined text-lg">verified_user</span>
                                    Descargar Certificado adsa_taller
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 z-50 flex w-full max-w-2xl border-t border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#101522]/95 backdrop-blur-xl px-4 py-3 h-[72px] justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.1)] left-1/2 -translate-x-1/2">
                <Link to="/warranties" className="flex flex-1 flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[24px]">garage</span>
                    <p className="text-[9px] font-black uppercase tracking-widest">Garaje</p>
                </Link>
                <Link to="/history" className="flex flex-1 flex-col items-center justify-center gap-1.5 text-primary">
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
                    <p className="text-[9px] font-black uppercase tracking-widest drop-shadow-[0_0_5px_rgba(13,204,242,0.4)]">Historial</p>
                </Link>
                <Link to="/specs" className="flex flex-1 flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[24px]">settings_suggest</span>
                    <p className="text-[9px] font-black uppercase tracking-widest">Especificaciones</p>
                </Link>
                <Link to="/profile" className="flex flex-1 flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[24px]">account_circle</span>
                    <p className="text-[9px] font-black uppercase tracking-widest">Perfil</p>
                </Link>
            </nav>
        </div>
    );
};

export default ClinicalHistory;
