import React from 'react';
import { Link } from 'react-router-dom';

const BackendAdminPanel = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col max-w-md mx-auto relative font-display">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-lg">admin_panel_settings</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold leading-none">{appConfig.companyName}</h1>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Centro de Control Admin</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 relative transition-colors">
                        <span className="material-symbols-outlined text-xl">notifications</span>
                        <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500"></span>
                    </button>
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                        <span className="text-xs font-bold text-primary">AD</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
                {/* Stats Section */}
                <section className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-100 dark:bg-[#161b2a] p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                            <span className="material-symbols-outlined text-sm">dns</span>
                            <span className="text-[11px] font-medium uppercase">Uptime</span>
                        </div>
                        <div className="text-2xl font-bold">99.98%</div>
                        <div className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">trending_up</span> Estable
                        </div>
                    </div>
                    <div className="bg-slate-100 dark:bg-[#161b2a] p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                            <span className="material-symbols-outlined text-sm">cloud_sync</span>
                            <span className="text-[11px] font-medium uppercase">Backups</span>
                        </div>
                        <div className="text-2xl font-bold text-primary">Hace 2h</div>
                        <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                            S3 Bucket: OK
                        </div>
                    </div>
                </section>

                {/* API Latency Chart */}
                <section className="bg-slate-100 dark:bg-[#161b2a] p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">monitoring</span>
                            Latencia Global API
                        </h2>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">EN VIVO</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-end gap-1 h-20 justify-between px-2">
                            <div className="w-2 bg-primary/20 rounded-t-sm h-[40%]"></div>
                            <div className="w-2 bg-primary/20 rounded-t-sm h-[60%]"></div>
                            <div className="w-2 bg-primary/40 rounded-t-sm h-[30%]"></div>
                            <div className="w-2 bg-primary/30 rounded-t-sm h-[50%]"></div>
                            <div className="w-2 bg-primary/60 rounded-t-sm h-[80%]"></div>
                            <div className="w-2 bg-primary rounded-t-sm h-[95%]"></div>
                            <div className="w-2 bg-primary/40 rounded-t-sm h-[45%]"></div>
                            <div className="w-2 bg-primary/20 rounded-t-sm h-[35%]"></div>
                            <div className="w-2 bg-primary/30 rounded-t-sm h-[55%]"></div>
                            <div className="w-2 bg-primary/50 rounded-t-sm h-[70%]"></div>
                            <div className="w-2 bg-primary/20 rounded-t-sm h-[40%]"></div>
                            <div className="w-2 bg-primary/10 rounded-t-sm h-[20%]"></div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                            <div>
                                <p className="text-[10px] text-slate-500">Promedio</p>
                                <p className="text-lg font-bold">24ms</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500">Errores 24h</p>
                                <p className="text-lg font-bold text-red-500">0</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Connected Services */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Servicios Conectados</h2>
                        <button className="text-xs text-primary font-bold">Gestionar</button>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-[#161b2a] rounded-lg border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded bg-green-500/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-green-500">chat</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold">WhatsApp Business API</p>
                                    <p className="text-[10px] text-slate-500">Meta Cloud API v18.0</p>
                                </div>
                            </div>
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-[#161b2a] rounded-lg border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded bg-blue-500/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-blue-500">receipt_long</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Facturación Electrónica</p>
                                    <p className="text-[10px] text-slate-500">Proveedor Tecnológico: Activo</p>
                                </div>
                            </div>
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        </div>
                    </div>
                </section>

                {/* Audit Logs */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Logs de Auditoría</h2>
                        <button className="text-xs text-primary font-bold">Ver Todos</button>
                    </div>
                    <div className="bg-slate-100 dark:bg-[#161b2a] rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden">
                        <div className="p-3 flex gap-3 items-start">
                            <div className="mt-1 flex h-2 w-2 rounded-full bg-blue-500 shrink-0"></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate">Admin_Root actualizó permisos de rol 'Gerente'</p>
                                <p className="text-[10px] text-slate-500 mt-1">Sucursal: Norte • Hace 12 min</p>
                            </div>
                        </div>
                        <div className="p-3 flex gap-3 items-start">
                            <div className="mt-1 flex h-2 w-2 rounded-full bg-amber-500 shrink-0"></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate">Fallo de autenticación: IP 192.168.1.45</p>
                                <p className="text-[10px] text-slate-500 mt-1">Intento fallido • Hace 45 min</p>
                            </div>
                        </div>
                        <div className="p-3 flex gap-3 items-start">
                            <div className="mt-1 flex h-2 w-2 rounded-full bg-green-500 shrink-0"></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate">Backup completo generado exitosamente</p>
                                <p className="text-[10px] text-slate-500 mt-1">Sistema Automático • Hace 2 horas</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 z-50 flex w-full max-w-md mx-auto left-0 right-0 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl px-2 py-3 justify-around">
                <Link to="/admin" className="flex flex-col items-center gap-1 text-primary cursor-pointer">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                    <span className="text-[10px] font-bold tracking-wide">Panel</span>
                </Link>
                <Link to="/users" className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer">
                    <span className="material-symbols-outlined">group</span>
                    <span className="text-[10px] font-medium tracking-wide">Usuarios</span>
                </Link>
                <Link to="/reception" className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer">
                    <span className="material-symbols-outlined">assignment</span>
                    <span className="text-[10px] font-medium tracking-wide">Recepción</span>
                </Link>
                <Link to="/kanban" className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer">
                    <span className="material-symbols-outlined">build</span>
                    <span className="text-[10px] font-medium tracking-wide">Trabajos</span>
                </Link>
                <Link to="/settings" className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer">
                    <span className="material-symbols-outlined">settings</span>
                    <span className="text-[10px] font-medium tracking-wide">Ajustes</span>
                </Link>
            </nav>
        </div>
    );
};

export default BackendAdminPanel;
