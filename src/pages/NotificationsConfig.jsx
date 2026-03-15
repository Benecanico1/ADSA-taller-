import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotificationsConfig = () => {
    const navigate = useNavigate();

    // State for toggles
    const [toggles, setToggles] = useState({
        preventive: true,
        approval: true,
        delivery: true,
        mileage: false
    });

    const handleToggle = (key) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display max-w-2xl mx-auto shadow-2xl relative">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#161b2a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center p-4 justify-between w-full">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-slate-900 dark:text-slate-100 flex size-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold leading-tight tracking-tight">Notificaciones</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Dynotech Power Garage</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                            <span className="material-symbols-outlined">save</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto w-full pb-32">
                <div className="px-4 pt-6 pb-2">
                    <h2 className="text-xl font-bold tracking-tight">Triggers de Comunicación</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configura disparadores automáticos para tus clientes.</p>
                </div>

                <div className="space-y-4 px-4 mt-4">
                    {/* Trigger 1 */}
                    <div className="bg-white dark:bg-[#161b2a] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex gap-4">
                                <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-12">
                                    <span className="material-symbols-outlined">event_repeat</span>
                                </div>
                                <div>
                                    <p className="text-base font-semibold leading-none mb-1">Mantenimiento Preventivo</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">Aviso automático cada 90 días</p>
                                </div>
                            </div>
                            <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center justify-start rounded-full bg-slate-200 dark:bg-slate-700 p-0.5 transition-all">
                                <div className={`h-full w-[27px] rounded-full shadow-sm transform transition-transform duration-300 ${toggles.preventive ? 'translate-x-[20px] bg-primary' : 'translate-x-0 bg-white dark:bg-slate-300'}`}></div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={toggles.preventive}
                                    onChange={() => handleToggle('preventive')}
                                />
                                {/* Background color handled by wrapper style for simplicity, but let's sync it */}
                                <div className={`absolute inset-0 rounded-full transition-colors duration-300 -z-10 ${toggles.preventive ? 'bg-primary/20 dark:bg-primary/20' : ''}`}></div>
                            </label>
                        </div>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <span className="px-2 py-1 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">WhatsApp</span>
                                <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Email</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-background-dark rounded-lg p-3 border border-slate-100 dark:border-slate-800/50">
                                <p className="text-xs text-slate-400 mb-2 font-mono">Template: WhatsApp Business</p>
                                <p className="text-sm italic">"Hola [Nombre_Cliente], tu [Modelo_Moto] necesita revisión..."</p>
                            </div>
                            <button className="w-full py-2 text-xs font-semibold text-primary flex items-center justify-center gap-1 border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors">
                                <span className="material-symbols-outlined text-sm">edit</span> Editar Plantilla
                            </button>
                        </div>
                    </div>

                    {/* Trigger 2 */}
                    <div className="bg-white dark:bg-[#161b2a] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex gap-4">
                                <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-12">
                                    <span className="material-symbols-outlined">pending_actions</span>
                                </div>
                                <div>
                                    <p className="text-base font-semibold leading-none mb-1">Aprobación Pendiente</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">Recordatorio de presupuestos</p>
                                </div>
                            </div>
                            <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center justify-start rounded-full bg-slate-200 dark:bg-slate-700 p-0.5 transition-all">
                                <div className={`h-full w-[27px] rounded-full shadow-sm transform transition-transform duration-300 ${toggles.approval ? 'translate-x-[20px] bg-primary' : 'translate-x-0 bg-white dark:bg-slate-300'}`}></div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={toggles.approval}
                                    onChange={() => handleToggle('approval')}
                                />
                                <div className={`absolute inset-0 rounded-full transition-colors duration-300 -z-10 ${toggles.approval ? 'bg-primary/20 dark:bg-primary/20' : ''}`}></div>
                            </label>
                        </div>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <span className="px-2 py-1 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">WhatsApp</span>
                                <span className="px-2 py-1 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">Email</span>
                            </div>
                            <button className="w-full py-2 text-xs font-semibold text-primary flex items-center justify-center gap-1 border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors">
                                <span className="material-symbols-outlined text-sm">edit</span> Editar Plantilla
                            </button>
                        </div>
                    </div>

                    {/* Trigger 3 */}
                    <div className="bg-white dark:bg-[#161b2a] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex gap-4">
                                <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-12">
                                    <span className="material-symbols-outlined">sports_motorsports</span>
                                </div>
                                <div>
                                    <p className="text-base font-semibold leading-none mb-1">Moto Lista para Entrega</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">Aviso al finalizar el servicio</p>
                                </div>
                            </div>
                            <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center justify-start rounded-full bg-slate-200 dark:bg-slate-700 p-0.5 transition-all">
                                <div className={`h-full w-[27px] rounded-full shadow-sm transform transition-transform duration-300 ${toggles.delivery ? 'translate-x-[20px] bg-primary' : 'translate-x-0 bg-white dark:bg-slate-300'}`}></div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={toggles.delivery}
                                    onChange={() => handleToggle('delivery')}
                                />
                                <div className={`absolute inset-0 rounded-full transition-colors duration-300 -z-10 ${toggles.delivery ? 'bg-primary/20 dark:bg-primary/20' : ''}`}></div>
                            </label>
                        </div>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <span className="px-2 py-1 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">WhatsApp</span>
                            </div>
                            <button className="w-full py-2 text-xs font-semibold text-primary flex items-center justify-center gap-1 border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors">
                                <span className="material-symbols-outlined text-sm">edit</span> Editar Plantilla
                            </button>
                        </div>
                    </div>

                    {/* Trigger 4 */}
                    <div className={`bg-white dark:bg-[#161b2a] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm transition-opacity ${!toggles.mileage ? 'opacity-75' : ''}`}>
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex gap-4">
                                <div className={`${toggles.mileage ? 'text-primary bg-primary/10' : 'text-slate-400 bg-slate-100 dark:bg-slate-800'} flex items-center justify-center rounded-lg shrink-0 size-12 transition-colors`}>
                                    <span className="material-symbols-outlined">speed</span>
                                </div>
                                <div>
                                    <p className="text-base font-semibold leading-none mb-1">Kilometraje Estimado</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">Basado en promedio de uso</p>
                                </div>
                            </div>
                            <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center justify-start rounded-full bg-slate-200 dark:bg-slate-700 p-0.5 transition-all">
                                <div className={`h-full w-[27px] rounded-full shadow-sm transform transition-transform duration-300 ${toggles.mileage ? 'translate-x-[20px] bg-primary' : 'translate-x-0 bg-white dark:bg-slate-300'}`}></div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={toggles.mileage}
                                    onChange={() => handleToggle('mileage')}
                                />
                                <div className={`absolute inset-0 rounded-full transition-colors duration-300 -z-10 ${toggles.mileage ? 'bg-primary/20 dark:bg-primary/20' : ''}`}></div>
                            </label>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-background-dark/50 rounded-lg border border-slate-100 dark:border-slate-800/50">
                            <span className="material-symbols-outlined text-sm text-slate-500 dark:text-slate-400">info</span>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Este trigger requiere que el cliente tenga histórico de kilometraje.</p>
                        </div>
                    </div>
                </div>

                <div className="px-4 mt-8 mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">Canales de Salida</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
                            <span className="material-symbols-outlined text-primary mb-1">chat</span>
                            <p className="text-[10px] font-bold text-slate-900 dark:text-slate-100">WhatsApp</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined text-slate-400 mb-1">mail</span>
                            <p className="text-[10px] font-bold text-slate-500">Email</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined text-slate-400 mb-1">sms</span>
                            <p className="text-[10px] font-bold text-slate-500">SMS</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#161b2a]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 pb-6 pt-2 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
                <div className="max-w-2xl mx-auto flex gap-2">
                    <Link to="/kanban" className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">home</span>
                        <p className="text-[10px] font-medium leading-none tracking-wide">Inicio</p>
                    </Link>
                    <Link to="/kanban" className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">handyman</span>
                        <p className="text-[10px] font-medium leading-none tracking-wide">Taller</p>
                    </Link>
                    <Link to="/notifications" className="flex flex-1 flex-col items-center justify-center gap-1 text-primary cursor-pointer">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span>
                        <p className="text-[10px] font-bold leading-none tracking-wide">Alertas</p>
                    </Link>
                    <Link to="/profile/settings" className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">settings</span>
                        <p className="text-[10px] font-medium leading-none tracking-wide">Ajustes</p>
                    </Link>
                </div>
            </nav>
        </div>
    );
};

export default NotificationsConfig;
