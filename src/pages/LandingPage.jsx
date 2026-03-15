import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen relative pb-28">
            {/* Header / Navigation */}
            <header className="sticky top-0 z-50 flex items-center bg-background-dark/80 backdrop-blur-md border-b border-border-dark p-4 justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl">precision_manufacturing</span>
                    <h2 className="text-slate-100 text-lg font-bold leading-tight tracking-tight">Dynotech</h2>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="flex items-center justify-center rounded-lg h-10 w-10 bg-primary/10 text-primary border border-primary/20">
                        <span className="material-symbols-outlined">menu</span>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative h-[85vh]">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent z-10"></div>
                    <img
                        className="w-full h-full object-cover grayscale-[0.5] brightness-75"
                        alt="High performance sport motorcycle in dark studio"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_YWG196Csy_q9nM-59UDU4_m9-yxzO0VlIillr2VYzlsigsKV5RV75mLBLOpIAmsHu0NsPMPETYwEIzoyufWnIBh2FQqKXIMLhjIkzClDIDTOMatXCpl52w-5jvyuRBBQdYQy58pxRw3Kn7F-_UZ1p8uWdrjR3KYmBPdoFavOUNCod9Rd0Sm9RUDJd0VhaI8LCxcrJdMofd1CgkkRFIktEYUoN1M-FjzdgBtHtuMVl7uVlXW9grzm6jYPx15pbTXfeBfu_tlKJDJ9"
                    />
                </div>
                <div className="relative z-20 flex flex-col h-full justify-end p-6 pb-20 gap-4">
                    <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 w-fit px-3 py-1 rounded-full">
                        <span className="material-symbols-outlined text-primary text-sm">bolt</span>
                        <span className="text-primary text-xs font-bold uppercase tracking-widest">High Performance</span>
                    </div>
                    <h1 className="text-slate-100 text-4xl font-black leading-[1.1] tracking-tight">
                        Dynotech: <br /> <span className="text-primary">Arquitectura de Valor</span> para tu Pasión
                    </h1>
                    <p className="text-slate-300 text-base font-normal leading-relaxed max-w-[90%]">
                        Gestionamos el rendimiento de tu moto con tecnología de vanguardia y transparencia total.
                    </p>
                    <div className="flex flex-col gap-3 pt-4">
                        <Link to="/login" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-xl flex items-center justify-center gap-2 transition-all">
                            <span className="material-symbols-outlined">calendar_month</span>
                            Agendar Cita Online
                        </Link>
                        <button className="w-full bg-white/5 border border-white/10 text-white font-bold h-14 rounded-xl flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">explore</span>
                            Ver Servicios
                        </button>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-12 px-4 carbon-pattern">
                <h2 className="text-slate-100 text-2xl font-bold mb-8 border-l-4 border-primary pl-4 uppercase tracking-tighter">Nuestros Servicios</h2>
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-surface-dark border border-border-dark p-5 rounded-xl group">
                        <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                            <span className="material-symbols-outlined">build</span>
                        </div>
                        <h3 className="text-slate-100 text-xl font-bold mb-2">Mantenimiento</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Cuidado experto con los más altos estándares de calidad para motores de alta cilindrada.</p>
                    </div>
                    <div className="bg-surface-dark border border-border-dark p-5 rounded-xl group">
                        <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                            <span className="material-symbols-outlined">troubleshoot</span>
                        </div>
                        <h3 className="text-slate-100 text-xl font-bold mb-2">Diagnóstico</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Uso de tecnología de punta para identificar fallos electrónicos y mecánicos complejos.</p>
                    </div>
                    <div className="bg-surface-dark border border-border-dark p-5 rounded-xl group">
                        <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                            <span className="material-symbols-outlined">speed</span>
                        </div>
                        <h3 className="text-slate-100 text-xl font-bold mb-2">Performance</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Reprogramación y optimización de componentes para desbloquear la potencia máxima de tu máquina.</p>
                    </div>
                </div>
            </section>

            {/* Digital Twin Section */}
            <section className="bg-primary py-16 px-6 relative overflow-hidden">
                <div className="absolute right-[-10%] top-0 opacity-10">
                    <span className="material-symbols-outlined text-[300px]">database</span>
                </div>
                <div className="relative z-10">
                    <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-white text-3xl">smart_toy</span>
                    </div>
                    <h2 className="text-white text-3xl font-black mb-4 uppercase leading-none">El Gemelo Digital</h2>
                    <p className="text-white/90 text-lg font-medium mb-6">Llevamos el historial clínico de tu moto a otro nivel.</p>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-white mt-1">check_circle</span>
                            <p className="text-white/80">Historial completo de intervenciones accesible desde tu móvil.</p>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-white mt-1">check_circle</span>
                            <p className="text-white/80">Seguimiento en tiempo real del proceso de reparación en el taller.</p>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-white mt-1">check_circle</span>
                            <p className="text-white/80">Alertas predictivas basadas en el uso real de tu motocicleta.</p>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 px-4">
                <h2 className="text-slate-100 text-2xl font-bold text-center mb-10">Confianza Premium</h2>
                <div className="flex overflow-x-auto gap-4 pb-8 no-scrollbar">
                    <div className="min-w-[280px] bg-surface-dark border border-border-dark p-6 rounded-2xl">
                        <div className="flex gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className="material-symbols-outlined text-primary text-sm">star</span>
                            ))}
                        </div>
                        <p className="text-slate-300 italic mb-6">"El nivel de detalle en el diagnóstico de mi Ducati fue impresionante. Transparencia total."</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-primary/30"></div>
                            <div>
                                <p className="text-white text-sm font-bold">Carlos R.</p>
                                <p className="text-slate-500 text-xs">Ducati Panigale V4</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-surface-dark border-t border-border-dark pt-12 pb-24 px-6">
                <div className="flex items-center gap-2 mb-8">
                    <span className="material-symbols-outlined text-primary text-3xl">precision_manufacturing</span>
                    <h2 className="text-slate-100 text-xl font-bold">Dynotech Power Garage</h2>
                </div>
                <div className="grid grid-cols-1 gap-8 mb-12">
                    <div>
                        <h4 className="text-primary text-sm font-bold uppercase tracking-widest mb-4">Ubicación</h4>
                        <p className="text-slate-400">Av. de la Velocidad 420<br />Zona Industrial, Madrid</p>
                    </div>
                    <div>
                        <h4 className="text-primary text-sm font-bold uppercase tracking-widest mb-4">Contacto</h4>
                        <p className="text-slate-400">info@dynotech.com<br />+34 900 123 456</p>
                    </div>
                    <div>
                        <h4 className="text-primary text-sm font-bold uppercase tracking-widest mb-4">Redes</h4>
                        <div className="flex gap-4 mt-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-border-dark flex items-center justify-center text-white">
                                <span className="material-symbols-outlined">share</span>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-border-dark pt-8 text-center">
                    <p className="text-slate-600 text-xs">© 2024 Dynotech Power Garage. Arquitectura de alto rendimiento.</p>
                </div>
            </footer>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background-dark/90 backdrop-blur-lg border-t border-border-dark px-6 pb-6 pt-3">
                <div className="flex justify-between items-center max-w-md mx-auto">
                    <Link to="/landing" className="flex flex-col items-center gap-1 text-primary">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                        <span className="text-[10px] font-medium">Inicio</span>
                    </Link>
                    <Link to="/login" className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">precision_manufacturing</span>
                        <span className="text-[10px] font-medium">Servicios</span>
                    </Link>
                    <Link to="/login" className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">calendar_today</span>
                        <span className="text-[10px] font-medium">Agenda</span>
                    </Link>
                    <Link to="/login" className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">person</span>
                        <span className="text-[10px] font-medium">Perfil</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
};

export default LandingPage;
