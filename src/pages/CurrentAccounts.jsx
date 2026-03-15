import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CurrentAccounts = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('clientes');
    const [activeFilter, setActiveFilter] = useState('todos');

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display max-w-2xl mx-auto shadow-2xl relative">
            {/* Header */}
            <header className="flex items-center bg-white/95 dark:bg-[#161b2a]/95 backdrop-blur-md p-4 pb-3 justify-between sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors -ml-2"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">Cuentas Corrientes</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{appConfig.companyName}</p>
                </div>
                <div className="flex w-10 items-center justify-end">
                    <button className="flex size-10 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined">search</span>
                    </button>
                </div>
            </header>

            {/* Main Tabs */}
            <div className="bg-white/95 dark:bg-[#161b2a]/95 backdrop-blur-md sticky top-[69px] z-40 shadow-sm">
                <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 justify-between">
                    <button
                        onClick={() => setActiveTab('clientes')}
                        className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 flex-1 transition-colors ${activeTab === 'clientes' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-primary hover:border-slate-300 dark:hover:border-slate-700'}`}
                    >
                        <p className="text-xs font-bold leading-normal tracking-widest uppercase">Clientes</p>
                    </button>
                    <button
                        onClick={() => setActiveTab('proveedores')}
                        className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 flex-1 transition-colors ${activeTab === 'proveedores' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-primary hover:border-slate-300 dark:hover:border-slate-700'}`}
                    >
                        <p className="text-xs font-bold leading-normal tracking-widest uppercase">Proveedores</p>
                    </button>
                </div>
            </div>

            {/* Filters Scrollable */}
            <div className="flex gap-3 px-4 py-3 overflow-x-auto [&::-webkit-scrollbar]:hidden bg-slate-50 dark:bg-[#111718] border-b border-slate-200 dark:border-slate-800/80 sticky top-[122px] z-30">
                <button
                    onClick={() => setActiveFilter('todos')}
                    className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-all active:scale-95 ${activeFilter === 'todos' ? 'bg-primary text-[#101f22] font-bold shadow-md shadow-primary/20' : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm'}`}
                >
                    <p className="text-sm">Todos</p>
                </button>
                <button
                    onClick={() => setActiveFilter('morosos')}
                    className={`flex h-9 shrink-0 items-center justify-center gap-x-1.5 rounded-full px-5 transition-all active:scale-95 ${activeFilter === 'morosos' ? 'bg-red-500 text-white font-bold shadow-md shadow-red-500/20' : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm'}`}
                >
                    <p className="text-sm">Morosos</p>
                    <span className="material-symbols-outlined text-[16px]">error</span>
                </button>
                <button
                    onClick={() => setActiveFilter('aldia')}
                    className={`flex h-9 shrink-0 items-center justify-center gap-x-1.5 rounded-full px-5 transition-all active:scale-95 ${activeFilter === 'aldia' ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20' : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm'}`}
                >
                    <p className="text-sm">Al día</p>
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                </button>
                <button
                    onClick={() => setActiveFilter('afavor')}
                    className={`flex h-9 shrink-0 items-center justify-center gap-x-1.5 rounded-full px-5 transition-all active:scale-95 ${activeFilter === 'afavor' ? 'bg-primary text-[#101f22] font-bold shadow-md shadow-primary/20' : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm'}`}
                >
                    <p className="text-sm">Saldo a favor</p>
                    <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                </button>
            </div>

            {/* Entity List */}
            <main className="flex-1 overflow-y-auto px-4 py-5 space-y-4 pb-32">
                <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest px-1 mb-2">Listado de Entidades</h3>

                {/* Card 1 (Debt) */}
                <div className="bg-white dark:bg-[#161b2a] rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-sm hover:border-red-500/30 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-center">
                            <div className="size-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-black text-lg">
                                JD
                            </div>
                            <div>
                                <p className="text-slate-900 dark:text-slate-100 font-bold leading-none mb-1 text-base">Juan Delgado</p>
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Último mov: 12 May 2024</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-red-500 dark:text-red-400 font-black text-lg -mr-0.5">-$45,200</p>
                            <span className="text-[9px] px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold uppercase tracking-widest inline-block mt-1">Deuda</span>
                        </div>
                    </div>
                </div>

                {/* Card 2 (Active Selection / Balance Favor) */}
                <div className="bg-primary/5 dark:bg-primary/5 rounded-xl border-2 border-primary p-4 flex flex-col gap-4 shadow-lg shadow-primary/5">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-center">
                            <div className="size-11 rounded-full bg-primary flex items-center justify-center text-[#101f22] font-black text-lg shadow-inner">
                                MA
                            </div>
                            <div>
                                <p className="text-slate-900 dark:text-slate-100 font-bold leading-none mb-1 text-base">Marcos Alvarez</p>
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Último mov: 08 May 2024</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-emerald-500 dark:text-emerald-400 font-black text-lg drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">+$12,500</p>
                            <span className="text-[9px] px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest inline-block mt-1">A Favor</span>
                        </div>
                    </div>
                    {/* Expanded Detail Section */}
                    <div className="mt-1 border-t border-slate-200 dark:border-primary/20 pt-4 space-y-3">
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Historial de Transacciones</p>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-slate-400 text-lg">description</span>
                                <span className="text-slate-700 dark:text-slate-300 font-medium">Factura #A-2034</span>
                            </div>
                            <span className="text-red-500 font-semibold">-$25,000</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-emerald-500 text-lg">payments</span>
                                <span className="text-slate-700 dark:text-slate-300 font-medium">Pago Recibido</span>
                            </div>
                            <span className="text-emerald-500 font-semibold">+$37,500</span>
                        </div>
                        <button className="w-full mt-3 bg-white dark:bg-[#111718] border border-slate-200 dark:border-slate-800 hover:border-primary/50 text-primary font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm">
                            Ver historial completo
                        </button>
                    </div>
                </div>

                {/* Card 3 (Balance Zero) */}
                <div className="bg-white dark:bg-[#161b2a] rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors opacity-80">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-center">
                            <div className="size-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-black text-lg">
                                LC
                            </div>
                            <div>
                                <p className="text-slate-900 dark:text-slate-100 font-bold leading-none mb-1 text-base">Logística Central</p>
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Último mov: 02 May 2024</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-400 dark:text-slate-500 font-black text-lg">$0.00</p>
                            <span className="text-[9px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest inline-block mt-1">Al Día</span>
                        </div>
                    </div>
                </div>

                {/* Card 4 (Debt Heavy) */}
                <div className="bg-white dark:bg-[#161b2a] rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-sm hover:border-red-500/30 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-center">
                            <div className="size-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-black text-lg">
                                RP
                            </div>
                            <div>
                                <p className="text-slate-900 dark:text-slate-100 font-bold leading-none mb-1 text-base">Ricardo Perez</p>
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Último mov: 28 Abr 2024</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-red-500 dark:text-red-400 font-black text-lg -mr-0.5">-$120,000</p>
                            <span className="text-[9px] px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold uppercase tracking-widest inline-block mt-1">Moroso</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-[80px] w-full max-w-2xl px-4 py-3 bg-white/90 dark:bg-[#111718]/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-30">
                <button className="w-full bg-primary hover:bg-primary/90 text-[#101f22] font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-95">
                    <span className="material-symbols-outlined">payments</span>
                    Registrar Pago / Cobro
                </button>
            </div>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto flex justify-between border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111718]/95 backdrop-blur-md px-6 pb-6 pt-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
                <Link to="/kanban" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer w-[60px]">
                    <span className="material-symbols-outlined">home</span>
                    <p className="text-[9px] font-bold leading-none tracking-widest uppercase mt-0.5">Inicio</p>
                </Link>
                <Link to="/accounts" className="flex flex-col items-center gap-1 text-primary cursor-pointer w-[60px]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>credit_card</span>
                    <p className="text-[9px] font-bold leading-none tracking-widest uppercase mt-0.5">Cuentas</p>
                </Link>
                <Link to="/bi" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer w-[60px]">
                    <span className="material-symbols-outlined">bar_chart</span>
                    <p className="text-[9px] font-bold leading-none tracking-widest uppercase mt-0.5">Reportes</p>
                </Link>
                <Link to="/profile/settings" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer w-[60px]">
                    <span className="material-symbols-outlined">settings</span>
                    <p className="text-[9px] font-bold leading-none tracking-widest uppercase mt-0.5">Ajustes</p>
                </Link>
            </nav>
        </div>
    );
};

export default CurrentAccounts;
