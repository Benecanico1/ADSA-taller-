import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ReceptionScanner = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col max-w-md mx-auto">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark sticky top-0 z-10 w-full">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold tracking-tight">Recepción de Repuestos</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:opacity-80 transition-opacity">
                        <span className="material-symbols-outlined text-sm">history</span>
                    </button>
                    <button className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-background-dark hover:opacity-80 transition-opacity">
                        <span className="material-symbols-outlined text-sm">bolt</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-col overflow-y-auto pb-24">
                {/* Camera Viewfinder / Scanner Section */}
                <div className="relative aspect-[4/3] w-full bg-black flex items-center justify-center overflow-hidden">
                    {/* Simulated Camera Background */}
                    <div className="absolute inset-0 opacity-60">
                        <img
                            alt="Primer plano de piezas de motor y herramientas mecánicas"
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHr1MIv7eiI48_6Xs9jj_y_6dDdw7ZJFHr7TI58A_YaQ4PcTmupjycuI-RXjMg7S7J3zdxZv2OK9kkUJGqYEYzCyjWA1faBnc3KaC9-YYWf6usyzwkM-VwNn6QbEUpAC7JhpdCd96MUE3Z3h1BLn6gHjXRs_kIl8IF-n_FjeXDVApLAMq4o9tungNsE2Nb84q3bkvUw2KzejIwj3eZTkd5BsKj1wJ_yzxVscOuoTM6OoBtzO467Q_zcBN_-njO8oFRetwi0zxLa3AP"
                        />
                    </div>

                    {/* Scanner Frame */}
                    <div className="relative w-64 h-64 rounded-xl flex flex-col items-center justify-center border-2 border-primary/50 bg-primary/10 backdrop-blur-[2px]">
                        {/* Scan Line animated */}
                        <div className="absolute w-full h-[2px] bg-primary shadow-[0_0_15px_var(--color-primary)] top-1/2 animate-pulse"></div>

                        {/* Corner Borders */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>

                        <span className="material-symbols-outlined text-primary text-5xl opacity-40">qr_code_scanner</span>
                    </div>

                    {/* Floating Tooltips */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 whitespace-nowrap">
                        <span className="material-symbols-outlined text-white text-sm">info</span>
                        <p className="text-white text-xs font-medium">Encuadre el código de barras o QR</p>
                    </div>
                </div>

                {/* Rapid Entry Fields */}
                <div className="p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cantidad</label>
                            <div className="relative flex-1">
                                <input
                                    className="w-full h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 focus:ring-1 focus:ring-primary focus:border-primary text-lg font-bold outline-none"
                                    placeholder="0"
                                    type="number"
                                    defaultValue="1"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
                                    <button className="material-symbols-outlined text-slate-400 hover:text-primary leading-none text-base">expand_less</button>
                                    <button className="material-symbols-outlined text-slate-400 hover:text-primary leading-none text-base">expand_more</button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Proveedor</label>
                            <select className="w-full h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm font-medium outline-none text-slate-700 dark:text-slate-200 min-h-[48px] appearance-none cursor-pointer">
                                <option>ProParts S.A.</option>
                                <option>Motor Import</option>
                                <option>Racing Depot</option>
                            </select>
                        </div>
                    </div>
                    <button className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98]">
                        <span className="material-symbols-outlined">add_task</span>
                        Confirmar Entrada
                    </button>
                </div>

                {/* Last Scanned Items Summary */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex-1 bg-white dark:bg-[#0a1214]">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">list_alt</span>
                            Últimos Escaneados
                        </h3>
                        <button className="text-xs text-primary font-medium hover:underline">Ver todos</button>
                    </div>
                    <div className="space-y-3">
                        {/* Item 1 */}
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#161b2a] rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined text-slate-500">settings_input_component</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold truncate">Bujía NGK Iridium R6</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">SKU: 09283-BNGK • Qty: 12</p>
                            </div>
                            <div className="text-right">
                                <span className="material-symbols-outlined text-green-500">check_circle</span>
                            </div>
                        </div>
                        {/* Item 2 */}
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#161b2a] rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined text-slate-500">oil_barrel</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold truncate">Aceite Motul 7100 4T</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">SKU: MOT710-1L • Qty: 24</p>
                            </div>
                            <div className="text-right">
                                <span className="material-symbols-outlined text-green-500">check_circle</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="fixed w-full max-w-md mx-auto bottom-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a1214] pb-6 pt-2 z-50">
                <div className="flex items-center justify-around">
                    <Link to="/scanner" className="flex flex-col items-center gap-1 text-primary cursor-pointer">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
                        <span className="text-[10px] font-semibold tracking-wide">ESCANEAR</span>
                    </Link>
                    <Link to="/inventory" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">inventory_2</span>
                        <span className="text-[10px] font-semibold tracking-wide">STOCK</span>
                    </Link>
                    <Link to="/scanner/reports" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">assignment_turned_in</span>
                        <span className="text-[10px] font-semibold tracking-wide">REPORTES</span>
                    </Link>
                    <Link to="/profile/settings" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">settings</span>
                        <span className="text-[10px] font-semibold tracking-wide">AJUSTES</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
};

export default ReceptionScanner;
