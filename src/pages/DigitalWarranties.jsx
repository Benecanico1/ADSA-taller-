import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DigitalWarranties = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display max-w-2xl mx-auto shadow-2xl relative">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#161b2a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-primary"
                    >
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-2xl">shield_with_heart</span>
                        <h1 className="text-lg font-extrabold tracking-tight">Dynotech <span className="text-primary">Garage</span></h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                </div>
            </header>

            {/* Main Content Areas */}
            <main className="flex-1 overflow-y-auto pb-32">
                <div className="px-4 py-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-1">Mis Garantías</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Gestiona la cobertura técnica de tus motocicletas.</p>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden py-1">
                        <button className="px-5 py-2 rounded-full bg-primary text-[#101f22] font-bold text-sm whitespace-nowrap shadow-md shadow-primary/20 active:scale-95 transition-transform">
                            Todas (3)
                        </button>
                        <button className="px-5 py-2 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                            Activas
                        </button>
                        <button className="px-5 py-2 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                            Por Vencer
                        </button>
                        <button className="px-5 py-2 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                            Expiradas
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Warranty Card 1 */}
                        <div className="bg-white dark:bg-[#161b2a] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl shadow-primary/5 hover:border-primary/30 transition-colors">
                            <div
                                className="relative h-48 w-full bg-cover bg-center"
                                title="Yamaha MT-09 sport motorcycle in dark garage"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCgfwyBD_FNWLwJoIx1_FoWZWMY2OeGUamVkBg6Pcg09LkzegXa2H40iH-Vw1nqoJWSKttZzYmbw7hVaaarDkfJLMmqMmWT7JHhQXCowtZDFVgvQ5KFz1M5ckSdx14geLd-tReVelSAAehFRLwR81XmctbRui4oVKjQS8O3snZuUCtwvjRcHhKlxF6Bg8kCZ-QywKybqxxkODnG_gNrb9slmmB9MVLpTXGt7LY4zY-p_F-JuB8HFntYGgeA9fNGLxufCO0xU__JZeIL')" }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-[#161b2a]/60 to-transparent"></div>
                                <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm">
                                    <span className="material-symbols-outlined text-[14px]">check_circle</span> Activa
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-bold leading-tight">Yamaha MT-09 SP</h3>
                                        <p className="text-primary text-xs font-bold uppercase tracking-widest mt-0.5">Orden de Trabajo #4582</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-black text-primary leading-none drop-shadow-sm">182</span>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Días Restantes</p>
                                    </div>
                                </div>
                                <div className="mt-5 space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                        <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">settings_input_component</span>
                                        <div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Cobertura Principal</p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">Motor y Transmisión</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                        <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">calendar_today</span>
                                        <div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Emisión de Garantía</p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">12 Octubre, 2023</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <button className="flex-1 bg-primary hover:bg-primary/90 text-[#101f22] font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20">
                                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                                        Ver PDF
                                    </button>
                                    <button className="flex-1 bg-transparent border-2 border-primary hover:bg-primary/10 text-primary font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95">
                                        <span className="material-symbols-outlined text-lg">support_agent</span>
                                        Reclamar
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Warranty Card 2 */}
                        <div className="bg-white dark:bg-[#161b2a] rounded-xl overflow-hidden border border-slate-200 dark:border-orange-500/30 shadow-xl shadow-orange-500/5 hover:border-orange-500/50 transition-colors">
                            <div
                                className="relative h-48 w-full bg-cover bg-center"
                                title="Green Kawasaki Ninja motorcycle close up"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBrgSG4NFwCVg09xRENHUtjaCoW_o-hLgTf0gEwLqHyYMfVNC3Kb7hcF2sCx9nt2jvIlT99J5DY2wWf1DciPiIaf6dts5r6J8HMFtW9UtvRUb8rUf5ohpBMgBF3k1WvC25Wn05mv7kZQVFAmJ120OdV4ih08QzLF6boNl_32jOFThF636e1IsJQzhqYJoWTv2-qqcTejxPj7YfQtFjDlrTUcouJ-qQx6Y6KvPYD_NBPZFVih6EKPCv80j9RoM055PDhFvT9dNd0dbwO')" }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-[#161b2a]/60 to-transparent"></div>
                                <div className="absolute top-3 left-3 bg-orange-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm">
                                    <span className="material-symbols-outlined text-[14px]">warning</span> Por Vencer
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-bold leading-tight">Kawasaki Z900</h3>
                                        <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mt-0.5">Orden de Trabajo #4310</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-black text-orange-500 leading-none drop-shadow-sm">12</span>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Días Restantes</p>
                                    </div>
                                </div>
                                <div className="mt-5 space-y-3 opacity-90">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800/80">
                                        <span className="material-symbols-outlined text-orange-500 p-2 bg-orange-500/10 rounded-lg">bolt</span>
                                        <div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Cobertura Principal</p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 mt-0.5">Sistema Eléctrico y ECU</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <button className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
                                        <span className="material-symbols-outlined text-lg">description</span>
                                        Ver PDF
                                    </button>
                                    <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-500/20">
                                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>history_edu</span>
                                        Renovar
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Warranty Card 3 - Expired */}
                        <div className="bg-slate-50 dark:bg-[#11151e] rounded-xl border border-slate-200 dark:border-slate-800/50 opacity-75 grayscale hover:grayscale-0 transition-all cursor-pointer">
                            <div className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">motorcycle</span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Honda CB650R</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">OT #3982 • Expirada</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                            </div>
                        </div>
                    </div>

                    {/* Guarantee Text */}
                    <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-2xl text-center shadow-inner">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        </div>
                        <h4 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Compromiso Dynotech</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">Todas nuestras reparaciones cuentan con certificación digital respaldada por técnicos certificados.</p>
                        <button className="text-primary hover:text-primary/80 font-bold text-sm flex items-center justify-center gap-1 mx-auto transition-colors">
                            Leer Términos y Condiciones <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white/95 dark:bg-[#111718]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-50 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
                <Link to="/kanban" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">home</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Inicio</span>
                </Link>
                <Link to="/warranties" className="flex flex-col items-center gap-1 text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Garantías</span>
                </Link>

                {/* Floating Add Action Button Centered */}
                <Link to="/kanban" className="relative flex flex-col items-center justify-center -top-6 transition-transform hover:-translate-y-1 active:scale-95">
                    <div className="bg-primary text-[#101f22] w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 border-4 border-white dark:border-[#111718]">
                        <span className="material-symbols-outlined text-3xl">add</span>
                    </div>
                </Link>

                <Link to="/services" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">motorcycle</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Motos</span>
                </Link>
                <Link to="/profile" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">person</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Perfil</span>
                </Link>
            </nav>

            {/* Floating Chat Button */}
            <div className="fixed bottom-[100px] right-6 z-40">
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3.5 rounded-full shadow-xl shadow-emerald-500/30 flex items-center gap-2 font-bold group transition-all active:scale-95 cursor-pointer">
                    <span className="material-symbols-outlined">chat</span>
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 px-0 group-hover:px-1">Asistencia Directa</span>
                </button>
            </div>
        </div>
    );
};

export default DigitalWarranties;
