import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ServicesPricing = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-background-light dark:bg-[#101f22] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display max-w-md mx-auto relative shadow-2xl">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#101f22]/90 backdrop-blur-md border-b border-primary/20 shadow-sm">
                <div className="flex items-center p-4 justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-primary p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-2xl">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold leading-tight tracking-tight">Configuración</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{appConfig.companyName}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-xl">save</span>
                        </button>
                        <button className="p-2 rounded-lg bg-primary hover:bg-primary/90 transition-colors text-[#101f22] flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-xl">add</span>
                        </button>
                    </div>
                </div>
                {/* Tabs */}
                <div className="flex border-b border-primary/10 px-4">
                    <button className="flex-1 flex flex-col items-center justify-center border-b-2 border-primary text-primary pb-3 pt-2 transition-colors">
                        <span className="text-sm font-bold">Servicios</span>
                    </button>
                    <button className="flex-1 flex flex-col items-center justify-center border-b-2 border-transparent hover:border-slate-300 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 pb-3 pt-2 transition-colors">
                        <span className="text-sm font-bold">Paquetes</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-24">
                <div className="px-4 py-4 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                        <input
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-primary/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm"
                            placeholder="Buscar servicio o categoría..."
                            type="text"
                        />
                    </div>

                    {/* Filter Chips */}
                    <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full">
                        <button className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-[#101f22] text-xs font-bold whitespace-nowrap shadow-md shadow-primary/20 active:scale-95 transition-transform">
                            Todos
                        </button>
                        <button className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-primary/20 text-xs font-medium whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                            Motor
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        <button className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-primary/20 text-xs font-medium whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                            Frenos
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        <button className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-primary/20 text-xs font-medium whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                            Suspensión
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        <button className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-primary/20 text-xs font-medium whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                            Transmisión
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                    </div>

                    {/* Services Table Container */}
                    <div className="bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-primary/20 overflow-hidden shadow-md">
                        <div className="overflow-x-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-[#1a2e32] [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full">
                            <table className="w-full text-left border-collapse min-w-[400px]">
                                <thead className="bg-slate-50 dark:bg-primary/10">
                                    <tr>
                                        <th className="p-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-primary/20 whitespace-nowrap">Servicio</th>
                                        <th className="p-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-primary/20 whitespace-nowrap">Cat.</th>
                                        <th className="p-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-primary/20 text-center whitespace-nowrap">T. Est.</th>
                                        <th className="p-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-primary/20 text-right whitespace-nowrap">Precio Sug.</th>
                                        <th className="p-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-primary/20 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-primary/10">
                                    {/* Row 1 */}
                                    <tr className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors group">
                                        <td className="p-3">
                                            <div className="text-sm font-semibold">Cambio Aceite Sint.</div>
                                            <div className="text-[10px] text-slate-500">Incluye filtro OEM</div>
                                        </td>
                                        <td className="p-3">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Motor</span>
                                        </td>
                                        <td className="p-3 text-center text-xs font-medium text-slate-400">0.8h</td>
                                        <td className="p-3 text-right">
                                            <div className="text-sm font-bold text-primary">$120.00</div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <button className="text-slate-300 dark:text-slate-500 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                        </td>
                                    </tr>
                                    {/* Row 2 */}
                                    <tr className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors group">
                                        <td className="p-3">
                                            <div className="text-sm font-semibold">Pastillas Delanteras</div>
                                            <div className="text-[10px] text-slate-500">Cerámicas Premium</div>
                                        </td>
                                        <td className="p-3">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">Frenos</span>
                                        </td>
                                        <td className="p-3 text-center text-xs font-medium text-slate-400">1.5h</td>
                                        <td className="p-3 text-right">
                                            <div className="text-sm font-bold text-primary">$185.00</div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <button className="text-slate-300 dark:text-slate-500 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                        </td>
                                    </tr>
                                    {/* Row 3 */}
                                    <tr className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors group">
                                        <td className="p-3">
                                            <div className="text-sm font-semibold">Alineación 3D</div>
                                            <div className="text-[10px] text-slate-500">4 ejes láser</div>
                                        </td>
                                        <td className="p-3">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">Susp.</span>
                                        </td>
                                        <td className="p-3 text-center text-xs font-medium text-slate-400">1.0h</td>
                                        <td className="p-3 text-right">
                                            <div className="text-sm font-bold text-primary">$75.00</div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <button className="text-slate-300 dark:text-slate-500 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                        </td>
                                    </tr>
                                    {/* Row 4 */}
                                    <tr className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors group">
                                        <td className="p-3">
                                            <div className="text-sm font-semibold">Escaneo Comput.</div>
                                            <div className="text-[10px] text-slate-500">Protocolo OBD2</div>
                                        </td>
                                        <td className="p-3">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">Elect.</span>
                                        </td>
                                        <td className="p-3 text-center text-xs font-medium text-slate-400">0.5h</td>
                                        <td className="p-3 text-right">
                                            <div className="text-sm font-bold text-primary">$45.00</div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <button className="text-slate-300 dark:text-slate-500 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                        </td>
                                    </tr>
                                    {/* Row 5 - Dinamómetro */}
                                    <tr className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors group">
                                        <td className="p-3">
                                            <div className="text-sm font-semibold">Rodillo Potenciación</div>
                                            <div className="text-[10px] text-slate-500">Prueba Analítica + Telemetría</div>
                                        </td>
                                        <td className="p-3">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Perf.</span>
                                        </td>
                                        <td className="p-3 text-center text-xs font-medium text-slate-400">2.0h</td>
                                        <td className="p-3 text-right">
                                            <div className="text-sm font-bold text-primary">$150.00</div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <button className="text-slate-300 dark:text-slate-500 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Featured Packages */}
                    <div>
                        <div className="flex items-center justify-between mb-3 mt-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Paquetes Destacados</h3>
                            <button className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                                Ver todos
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                        <div className="space-y-3">
                            {/* Package 1 */}
                            <div className="bg-gradient-to-r from-primary/20 to-transparent p-4 rounded-xl border border-primary/30 relative overflow-hidden group shadow-md hover:border-primary/50 transition-colors cursor-pointer">
                                <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform duration-500 text-primary">
                                    <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>package_2</span>
                                </div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-base text-slate-900 dark:text-white">Service 10k km</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Incluye 5 servicios clave</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-slate-400 line-through">$310.00</div>
                                            <div className="text-lg font-black text-primary drop-shadow-sm">$249.99</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 flex-wrap">
                                        <span className="px-2 py-0.5 bg-white/80 dark:bg-background-dark/50 rounded text-[10px] font-semibold border border-primary/20 text-slate-700 dark:text-slate-300">Aceite</span>
                                        <span className="px-2 py-0.5 bg-white/80 dark:bg-background-dark/50 rounded text-[10px] font-semibold border border-primary/20 text-slate-700 dark:text-slate-300">Filtros</span>
                                        <span className="px-2 py-0.5 bg-white/80 dark:bg-background-dark/50 rounded text-[10px] font-semibold border border-primary/20 text-slate-700 dark:text-slate-300">Frenos</span>
                                        <span className="px-2 py-0.5 bg-primary/10 rounded text-[10px] font-bold border border-primary/30 text-primary">+2 más</span>
                                    </div>
                                </div>
                            </div>

                            {/* Package 2 */}
                            <div className="bg-white dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-primary/20 relative overflow-hidden shadow-sm hover:border-primary/30 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-base text-slate-900 dark:text-white">Pack Invierno Seguridad</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Revisión completa de fluidos</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-400 line-through">$95.00</div>
                                        <div className="text-lg font-black text-primary">$69.00</div>
                                    </div>
                                </div>
                                <div className="flex gap-1 flex-wrap">
                                    <span className="px-2 py-0.5 bg-slate-50 dark:bg-background-dark/50 rounded text-[10px] font-medium border border-slate-200 dark:border-primary/10 text-slate-600 dark:text-slate-300">Anticongelante</span>
                                    <span className="px-2 py-0.5 bg-slate-50 dark:bg-background-dark/50 rounded text-[10px] font-medium border border-slate-200 dark:border-primary/10 text-slate-600 dark:text-slate-300">Batería</span>
                                    <span className="px-2 py-0.5 bg-slate-50 dark:bg-background-dark/50 rounded text-[10px] font-medium border border-slate-200 dark:border-primary/10 text-slate-600 dark:text-slate-300">Luces</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-white/95 dark:bg-[#111718]/95 backdrop-blur-xl border-t border-slate-200 dark:border-primary/20 px-4 pb-6 pt-2 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
                <div className="flex justify-around items-center">
                    <Link to="/kanban" className="flex flex-col items-center justify-end gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer w-16">
                        <span className="material-symbols-outlined text-2xl">garage</span>
                        <p className="text-[10px] font-medium tracking-wide">Taller</p>
                    </Link>
                    <Link to="/services" className="flex flex-col items-center justify-end gap-1 text-primary cursor-pointer w-16">
                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>settings_suggest</span>
                        <p className="text-[10px] font-bold tracking-wide">Servicios</p>
                    </Link>
                    <Link to="/appointments" className="flex flex-col items-center justify-end gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer w-16">
                        <span className="material-symbols-outlined text-2xl">calendar_month</span>
                        <p className="text-[10px] font-medium tracking-wide">Citas</p>
                    </Link>
                    <Link to="/profile" className="flex flex-col items-center justify-end gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer w-16">
                        <span className="material-symbols-outlined text-2xl">manage_accounts</span>
                        <p className="text-[10px] font-medium tracking-wide">Perfil</p>
                    </Link>
                </div>
            </nav>

            {/* FAB for bulk edit on mobile */}
            <button className="fixed bottom-[88px] right-4 size-14 bg-primary hover:bg-primary/90 text-[#101f22] rounded-full shadow-lg shadow-primary/30 flex items-center justify-center transition-transform active:scale-90 z-40">
                <span className="material-symbols-outlined text-2xl">edit_note</span>
            </button>
        </div>
    );
};

export default ServicesPricing;
