import React from 'react';
import { Link } from 'react-router-dom';

const BusinessIntelligence = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display max-w-2xl mx-auto shadow-2xl relative">
            {/* Top Header */}
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-primary/20 bg-white/95 dark:bg-[#161b2a]/95 backdrop-blur-md px-4 py-4 shrink-0 sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-3xl">insights</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100">Dynotech BI</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Inteligencia de Negocio</p>
                    </div>
                </div>
                <button className="flex size-10 items-center justify-center rounded-full border border-slate-200 dark:border-primary/20 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined">account_circle</span>
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-28 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full">
                {/* Tabs Navigation */}
                <nav className="flex border-b border-slate-200 dark:border-primary/10 px-4 bg-white dark:bg-transparent">
                    <button className="flex flex-col items-center justify-center border-b-2 border-primary px-4 py-3">
                        <span className="text-sm font-bold text-primary">Resumen</span>
                    </button>
                    <button className="flex flex-col items-center justify-center border-b-2 border-transparent hover:border-slate-300 dark:hover:border-slate-700 px-4 py-3 text-slate-500 dark:text-slate-400 transition-colors">
                        <span className="text-sm font-medium">Ventas</span>
                    </button>
                    <button className="flex flex-col items-center justify-center border-b-2 border-transparent hover:border-slate-300 dark:hover:border-slate-700 px-4 py-3 text-slate-500 dark:text-slate-400 transition-colors">
                        <span className="text-sm font-medium">Mecánicos</span>
                    </button>
                </nav>

                {/* KPI Grid */}
                <section className="grid grid-cols-2 gap-3 p-4">
                    <div className="flex flex-col gap-1 rounded-xl bg-white dark:bg-[#161b2a] p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/30 transition-colors">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ingresos Totales</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">$45.2M</p>
                        <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold mt-1">
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            <span>+12%</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 rounded-xl bg-white dark:bg-[#161b2a] p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/30 transition-colors">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ticket Promedio</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">$125k</p>
                        <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold mt-1">
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            <span>+5%</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 rounded-xl bg-white dark:bg-[#161b2a] p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/30 transition-colors">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Eficiencia</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">88%</p>
                        <div className="flex items-center gap-1 text-red-500 text-xs font-bold mt-1">
                            <span className="material-symbols-outlined text-sm">trending_down</span>
                            <span>-2%</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 rounded-xl bg-white dark:bg-[#161b2a] p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/30 transition-colors">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Retención</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">72%</p>
                        <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold mt-1">
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            <span>+8%</span>
                        </div>
                    </div>
                </section>

                {/* Charts Section */}
                <section className="px-4 py-2 space-y-4">
                    {/* Monthly Sales Chart Placeholder */}
                    <div className="rounded-xl bg-white dark:bg-[#161b2a] p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Crecimiento de Ventas</h3>
                            <span className="text-xs text-slate-400 font-medium">Últimos 6 meses</span>
                        </div>
                        <div className="h-32 w-full flex items-end justify-between gap-2 px-2">
                            <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-lg h-[40%] group relative">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-800 text-white px-1.5 py-0.5 rounded">20k</span>
                            </div>
                            <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-lg h-[60%] group relative">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-800 text-white px-1.5 py-0.5 rounded">28k</span>
                            </div>
                            <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-lg h-[55%] group relative">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-800 text-white px-1.5 py-0.5 rounded">25k</span>
                            </div>
                            <div className="flex-1 bg-primary/40 hover:bg-primary/60 transition-colors rounded-t-lg h-[75%] group relative">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-800 text-white px-1.5 py-0.5 rounded">35k</span>
                            </div>
                            <div className="flex-1 bg-primary/40 hover:bg-primary/60 transition-colors rounded-t-lg h-[90%] group relative">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-800 text-white px-1.5 py-0.5 rounded">42k</span>
                            </div>
                            <div className="flex-1 bg-primary hover:bg-primary/90 transition-colors rounded-t-lg h-[100%] shadow-[0_0_15px_rgba(0,0,0,0)] dark:shadow-primary/30 group relative">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-100 whitespace-nowrap bg-slate-800 dark:bg-white text-white dark:text-slate-900 px-1.5 py-0.5 rounded shadow-sm">48k</span>
                            </div>
                        </div>
                        <div className="flex justify-between mt-3 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span className="text-primary">Jun</span>
                        </div>
                    </div>

                    {/* Revenue Breakdown Pie Chart Placeholder */}
                    <div className="rounded-xl bg-white dark:bg-[#161b2a] p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-5">Desglose de Ingresos</h3>
                        <div className="flex items-center gap-8 px-2">
                            <div className="relative size-28 rounded-full border-[14px] border-primary border-l-slate-100 dark:border-l-slate-800/50 flex items-center justify-center shadow-inner">
                                <span className="text-lg font-black text-slate-800 dark:text-white">70%</span>
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="size-3 rounded-full bg-primary shadow-sm shadow-primary/30"></div>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Mano de Obra</span>
                                    </div>
                                    <span className="text-sm font-black">70%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="size-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Repuestos</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-500">30%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Productivity Ranking */}
                <section className="px-4 py-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 ml-1">Top 3 Mecánicos</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-xl bg-white dark:bg-[#161b2a] p-3 border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-primary">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-primary w-5 text-center">01</span>
                                <span className="text-sm font-bold">Carlos Méndez</span>
                            </div>
                            <span className="text-[10px] font-bold bg-primary/20 text-primary px-2.5 py-1 rounded-full uppercase tracking-wider">98% Efic.</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-white dark:bg-[#161b2a] p-3 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-slate-400 w-5 text-center">02</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Andrés Rivas</span>
                            </div>
                            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full uppercase tracking-wider">94% Efic.</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-white dark:bg-[#161b2a] p-3 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-slate-400 w-5 text-center">03</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Diego Torres</span>
                            </div>
                            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full uppercase tracking-wider">91% Efic.</span>
                        </div>
                    </div>
                </section>

                {/* Alerts & Operational Issues */}
                <section className="px-4 py-4 space-y-4 mb-4">
                    <div className="rounded-xl border border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-3">
                            <span className="material-symbols-outlined text-xl">warning</span>
                            <h3 className="text-sm font-bold">Garantías por Vencer</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">Yamaha MT-07 (Placa: ABC-123)</span>
                                <span className="text-red-500 font-bold bg-red-100 dark:bg-red-500/20 px-2 py-0.5 rounded">2 días</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">Kawasaki Z900 (Placa: XYZ-789)</span>
                                <span className="text-red-600 dark:text-red-400 font-bold bg-red-100 dark:bg-red-500/20 px-2 py-0.5 rounded">Hoy</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-3">
                            <span className="material-symbols-outlined text-xl">timer</span>
                            <h3 className="text-sm font-bold">Motos Estancadas (&gt;48h)</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">BMW R1250GS <span className="text-slate-500 font-normal">- Espera repuesto</span></span>
                                <span className="text-orange-600 dark:text-orange-400 font-bold bg-orange-100 dark:bg-orange-500/20 px-2 py-0.5 rounded">72h</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">Ducati Monster <span className="text-slate-500 font-normal">- Espera aprobación</span></span>
                                <span className="text-orange-600 dark:text-orange-400 font-bold bg-orange-100 dark:bg-orange-500/20 px-2 py-0.5 rounded">54h</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="absolute bottom-0 left-0 right-0 flex items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111718]/95 backdrop-blur-md px-4 pb-6 pt-3 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
                <Link to="/bi" className="flex flex-col items-center gap-1 text-primary cursor-pointer w-16">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                    <span className="text-[10px] font-bold tracking-wide uppercase">Resumen</span>
                </Link>
                <Link to="/kanban" className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors cursor-pointer w-16">
                    <span className="material-symbols-outlined">build</span>
                    <span className="text-[10px] font-bold tracking-wide uppercase">Taller</span>
                </Link>
                <Link to="/budget" className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors cursor-pointer w-16">
                    <span className="material-symbols-outlined">payments</span>
                    <span className="text-[10px] font-bold tracking-wide uppercase">Finanzas</span>
                </Link>
                <Link to="/profile/settings" className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors cursor-pointer w-16">
                    <span className="material-symbols-outlined">settings</span>
                    <span className="text-[10px] font-bold tracking-wide uppercase">Ajustes</span>
                </Link>
            </nav>
        </div>
    );
};

export default BusinessIntelligence;
