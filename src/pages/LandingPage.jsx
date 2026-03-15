import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { appConfig } from '../config';

const servicesData = [
    {
        id: 'mantenimiento',
        icon: 'build',
        title: 'Mantenimiento',
        desc: 'Cuidado experto con los más altos estándares de calidad para motores de alta cilindrada.',
        details: [
            'Cambio de aceite sintético y filtros originales.',
            'Tensión, limpieza y lubricación de cadena de transmisión.',
            'Revisión milimétrica de frenos y purgado de líquido.',
            'Chequeo general de 25 puntos de seguridad vitales.'
        ]
    },
    {
        id: 'diagnostico',
        icon: 'troubleshoot',
        title: 'Diagnóstico',
        desc: 'Uso de tecnología de punta para identificar fallos electrónicos y mecánicos complejos.',
        details: [
            'Escaneo por computadora (OBD) con hardware de última generación.',
            'Lectura y borrado de códigos de falla.',
            'Revisión profunda de sistemas ABS y control de tracción (TCS).',
            'Medición en tiempo real de sensores del motor.'
        ]
    },
    {
        id: 'performance',
        icon: 'speed',
        title: 'Performance',
        desc: 'Reprogramación y optimización de componentes para desbloquear la potencia máxima de tu máquina.',
        details: [
            'Reprogramación de ECU (Flasheo) a medida.',
            'Instalación y configuración de Quickshifter / Autoblipper.',
            'Modificaciones de escapes de flujo libre (Full System).',
            'Ajuste personalizado de sistemas de suspensión.'
        ]
    },
    {
        id: 'banco',
        icon: 'speed_camera',
        title: 'Banco de Pruebas',
        desc: 'Medición exacta de potencia a la rueda y optimización en entorno controlado (Dyno).',
        details: [
            'Medición de caballos de fuerza (HP) y torque real a la rueda.',
            'Diagnóstico predictivo de motor bajo carga.',
            'Simulación de velocidades de pista en un entorno seguro.',
            'Ajuste fino de mapas de inyección de combustible (AFR).'
        ]
    }
];

const LandingPage = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
    const [expandedService, setExpandedService] = useState(null);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);

    const toggleService = (id) => {
        setExpandedService(expandedService === id ? null : id);
    };

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Cleanup
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        
        // We've used the prompt, and can't use it again, discard it
        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const q = query(
                    collection(db, 'Feedbacks'),
                    orderBy('createdAt', 'desc'),
                    limit(10)
                );
                const querySnapshot = await getDocs(q);
                const feedbacksData = [];
                querySnapshot.forEach((doc) => {
                    feedbacksData.push({ id: doc.id, ...doc.data() });
                });

                if (feedbacksData.length > 0) {
                    setFeedbacks(feedbacksData);
                } else {
                    // Fallback data
                    setFeedbacks([
                        {
                            id: 'fb1',
                            userName: 'Carlos R.',
                            rating: 5,
                            comment: 'El nivel de detalle en el diagnóstico de mi Ducati fue impresionante. Transparencia total.',
                            bike: 'Ducati Panigale V4',
                        },
                        {
                            id: 'fb2',
                            userName: 'Miguel A.',
                            rating: 5,
                            comment: 'Atención de primera. Dejaron mi moto no solo funcionando al 100%, sino impecable estéticamente.',
                            bike: 'BMW S1000RR'
                        },
                        {
                            id: 'fb3',
                            userName: 'Elena M.',
                            rating: 4,
                            comment: 'Excelente servicio y tecnología. Poder ver el historial clínico me da muchísima confianza.',
                            bike: 'Yamaha MT-09'
                        }
                    ]);
                }
            } catch (error) {
                console.error("Error fetching feedbacks:", error);
                // Fallback on error
                setFeedbacks([
                    {
                        id: 'fb1',
                        userName: 'Carlos R.',
                        rating: 5,
                        comment: 'El nivel de detalle en el diagnóstico de mi Ducati fue impresionante. Transparencia total.',
                        bike: 'Ducati Panigale V4',
                    },
                    {
                        id: 'fb2',
                        userName: 'Miguel A.',
                        rating: 5,
                        comment: 'Atención de primera. Dejaron mi moto no solo funcionando al 100%, sino impecable estéticamente.',
                        bike: 'BMW S1000RR'
                    }
                ]);
            } finally {
                setLoadingFeedbacks(false);
            }
        };

        fetchFeedbacks();
    }, []);

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen relative pb-28">
            {/* Header / Navigation */}
            <header className="sticky top-0 z-50 flex items-center bg-background-dark/80 backdrop-blur-md border-b border-border-dark p-4 justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl">precision_manufacturing</span>
                    <h2 className="text-slate-100 text-lg font-bold leading-tight tracking-tight">{appConfig.companyName}</h2>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                    {isInstallable && (
                        <button 
                            onClick={handleInstallClick}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-[#0a0c10] rounded-lg transition-transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,40,0,0.4)] font-black text-xs sm:text-sm shadow-primary/20 mr-1 sm:mr-2"
                        >
                            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">install_mobile</span>
                            <span className="uppercase tracking-widest hidden sm:inline">Descargar App</span>
                        </button>
                    )}
                    <Link to="/tienda" className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-lg transition-colors font-bold text-sm mr-1 sm:mr-2">
                        <span className="material-symbols-outlined text-[18px]">storefront</span>
                        <span className="uppercase tracking-widest hidden sm:inline">Tienda</span>
                    </Link>
                    <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-colors font-bold text-sm">
                        <span className="material-symbols-outlined text-[18px]">login</span>
                        <span className="uppercase tracking-widest hidden sm:inline">Login</span>
                    </Link>
                    <Link to="/login" className="flex items-center justify-center rounded-lg h-10 w-10 bg-primary/10 text-primary border border-primary/20 hidden">
                        <span className="material-symbols-outlined">menu</span>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative min-h-[85vh] h-auto flex flex-col justify-end">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent z-10"></div>
                    <img
                        className="w-full h-full object-cover grayscale-[0.5] brightness-75"
                        alt="High performance sport motorcycle in dark studio"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_YWG196Csy_q9nM-59UDU4_m9-yxzO0VlIillr2VYzlsigsKV5RV75mLBLOpIAmsHu0NsPMPETYwEIzoyufWnIBh2FQqKXIMLhjIkzClDIDTOMatXCpl52w-5jvyuRBBQdYQy58pxRw3Kn7F-_UZ1p8uWdrjR3KYmBPdoFavOUNCod9Rd0Sm9RUDJd0VhaI8LCxcrJdMofd1CgkkRFIktEYUoN1M-FjzdgBtHtuMVl7uVlXW9grzm6jYPx15pbTXfeBfu_tlKJDJ9"
                    />
                </div>
                <div className="relative z-20 flex flex-col h-full justify-end p-6 pb-12 gap-4">
                    <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 w-fit px-3 py-1 rounded-full">
                        <span className="material-symbols-outlined text-primary text-sm">bolt</span>
                        <span className="text-primary text-xs font-bold uppercase tracking-widest">High Performance</span>
                    </div>
                    <h1 className="text-slate-100 text-4xl font-black leading-tight md:leading-[1.1] tracking-tight mb-2">
                        {appConfig.companyName}: <br /> <span className="text-primary">Arquitectura de Valor</span> para tu Pasión
                    </h1>
                    <p className="text-slate-300 text-base font-normal leading-relaxed max-w-[90%]">
                        Gestionamos el rendimiento de tu moto con tecnología de vanguardia y transparencia total.
                    </p>
                    <div className="flex flex-col gap-3 pt-4">
                        <div className="w-full bg-primary/5 border border-primary/10 rounded-xl p-4 text-center mt-4 backdrop-blur-sm">
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-2">Descubre Dynotech</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-3">
                                <Link to="/tienda" className="inline-flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-slate-200 transition-colors w-full sm:w-auto">
                                    <span className="material-symbols-outlined text-sm">storefront</span>
                                    <span>Catálogo y Tienda</span>
                                </Link>
                                <Link to="/login" className="inline-flex items-center justify-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors bg-primary/10 px-4 py-2 rounded-lg w-full sm:w-auto">
                                    <span>Ingresar al Sistema</span>
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </Link>
                            </div>
                            <div className="flex items-start justify-center gap-2 mt-4 pt-4 border-t border-primary/10">
                                <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">notifications_active</span>
                                <p className="text-[10px] text-slate-400 font-medium max-w-[280px] text-left leading-tight">
                                    <strong>Importante:</strong> Al ingresar, recuerda <span className="text-primary font-bold">Permitir las Notificaciones</span> en tu dispositivo para recibir alertas en tiempo real sobre nuevas rutas y estado de tus servicios.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Minimalist Services Section */}
            <section className="pt-16 pb-24 lg:pt-20 lg:pb-32 px-6 bg-[#0a0c10] relative overflow-hidden">
                <div className="absolute inset-0 carbon-pattern opacity-40 pointer-events-none"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div>
                            <h2 className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-3">Especialidades</h2>
                            <h3 className="text-slate-100 text-3xl font-light tracking-tight">Nuestros Servicios</h3>
                        </div>
                        <Link to="/servicios" className="inline-flex items-center justify-center gap-2 bg-[#161b2a] hover:bg-primary/10 text-primary border border-primary/20 hover:border-primary/40 px-6 py-3 rounded-xl transition-all font-bold tracking-widest uppercase text-xs shadow-lg shadow-black/50">
                            <span className="material-symbols-outlined text-[18px]">precision_manufacturing</span>
                            <span>Catálogo de Servicios</span>
                        </Link>
                    </div>
                    {/* Grid Services Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {servicesData.map((service) => (
                            <div
                                key={service.id}
                                className="bg-[#121826]/80 backdrop-blur-xl border border-slate-800/60 p-6 rounded-2xl shadow-xl flex flex-col h-full hover:border-primary/30 hover:shadow-primary/5 transition-all group"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                        <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'wght' 200" }}>
                                            {service.icon}
                                        </span>
                                    </div>
                                    <h4 className="text-[13px] font-bold tracking-widest uppercase text-white group-hover:text-primary transition-colors line-clamp-2">
                                        {service.title}
                                    </h4>
                                </div>
                                <p className="text-slate-400 text-[11px] font-light leading-relaxed mb-6">
                                    {service.desc}
                                </p>
                                <div className="mt-auto">
                                    <ul className="space-y-3">
                                        {service.details.map((detail, idx) => (
                                            <li key={idx} className="flex gap-2 items-start">
                                                <span className="material-symbols-outlined text-primary text-[12px] leading-none mt-0.5 opacity-70">
                                                    check_circle
                                                </span>
                                                <span className="text-[10px] text-slate-300 font-light leading-relaxed tracking-widest">{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Split Section: Digital Twin & Community Routes */}
            <section className="pt-16 pb-24 lg:pt-20 lg:pb-32 px-6 bg-[#0a0c10] relative overflow-hidden border-t border-border-dark/30">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
                <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 lg:items-center">

                    {/* Left Column: Digital Twin */}
                    <div>
                        <div className="mb-10 text-left">
                            <div className="w-16 h-16 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,40,0,0.1)]">
                                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'wght' 200" }}>smart_toy</span>
                            </div>
                            <h2 className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-3">Telemetría Avanzada</h2>
                            <h3 className="text-slate-100 text-3xl font-light tracking-tight mb-4">El Gemelo Digital</h3>
                            <p className="text-slate-400 text-sm font-light leading-relaxed max-w-md">
                                Historial clínico de tu moto fusionando la precisión mecánica con el análisis predictivo.
                            </p>
                        </div>
                        <div className="space-y-4 text-left">
                            <div className="bg-[#121826]/80 backdrop-blur-xl border border-slate-800/60 p-5 rounded-2xl shadow-xl flex items-center gap-4 hover:border-primary/30 transition-all">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'wght' 200" }}>history</span>
                                </div>
                                <div>
                                    <h4 className="text-[12px] font-bold tracking-widest uppercase text-white">Acceso Total</h4>
                                    <p className="text-slate-400 text-[10px] font-light mt-0.5">Historial desde tu dispositivo móvil.</p>
                                </div>
                            </div>
                            <div className="bg-[#121826]/80 backdrop-blur-xl border border-slate-800/60 p-5 rounded-2xl shadow-xl flex items-center gap-4 hover:border-primary/30 transition-all">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'wght' 200" }}>track_changes</span>
                                </div>
                                <div>
                                    <h4 className="text-[12px] font-bold tracking-widest uppercase text-white">Seguimiento en Vivo</h4>
                                    <p className="text-slate-400 text-[10px] font-light mt-0.5">Monitoreo del progreso de reparación.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Community Routes */}
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl group border border-slate-800/60 h-full flex flex-col justify-end min-h-[450px]">
                        <div className="absolute inset-0 bg-slate-900 z-0">
                            <img
                                loading="lazy"
                                src="https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=2070&auto=format&fit=crop"
                                alt="Rider from behind"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent"></div>
                        </div>
                        <div className="relative z-10 p-8 flex flex-col items-start gap-4 h-full justify-end">
                            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                                <span className="material-symbols-outlined text-purple-400 text-sm">explore</span>
                                <span className="text-purple-400 text-[10px] font-black uppercase tracking-widest">Rutadas Oficiales</span>
                            </div>
                            <h3 className="text-3xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
                                ¿Qué vamos a hacer este fin de semana?
                            </h3>
                            <p className="text-slate-300 text-sm font-medium max-w-[85%] leading-relaxed drop-shadow-md">
                                Únete a la comunidad Dynotech. Descubre salidas en grupo, comparte con otros moteros y lánzate a nuevas aventuras curadas por nuestros Promotores.
                            </p>
                            <Link to="/rutas" className="mt-4 bg-purple-600 hover:bg-purple-500 text-white border-none px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] active:scale-95 flex items-center gap-2 group/btn">
                                Entrar al Chat de la Comunidad
                                <span className="material-symbols-outlined text-base group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* VIP Rewards Promotion */}
            <section className="pt-16 pb-24 lg:pt-20 lg:pb-32 px-6 bg-[#0a0c14] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
                <div className="absolute -left-20 top-0 size-64 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
                <div className="absolute -right-20 bottom-0 size-64 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>

                <div className="relative z-10 text-center max-w-lg mx-auto mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-[#161b2a] border border-primary/30 rounded-2xl shadow-[0_0_20px_rgba(255,40,0,0.2)] mb-6 hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-5xl text-primary drop-shadow-[0_0_10px_rgba(255,40,0,0.8)]">workspace_premium</span>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-tight drop-shadow-lg">
                        Dynotech <span className="text-primary italic">Rewards</span>
                    </h2>
                    <p className="text-slate-300 text-sm leading-relaxed font-medium">
                        Únete sin costo a nuestro club exclusivo. Gana puntos con cada servicio en el taller o compartiendo tu pasión en redes, y canjéalos por increíbles beneficios.
                    </p>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                        <div className="bg-[#121826]/80 backdrop-blur border border-slate-700/50 p-5 rounded-2xl flex flex-col items-center text-center shadow-lg group hover:border-primary/50 transition-colors">
                            <span className="material-symbols-outlined text-emerald-500 mb-2 text-3xl group-hover:scale-110 transition-transform">oil_barrel</span>
                            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-1 mt-1">Suma Puntos</h4>
                            <p className="text-slate-400 text-[10px] leading-tight">Gana puntos automáticos por mantener tu moto impecable.</p>
                        </div>
                        <div className="bg-[#121826]/80 backdrop-blur border border-slate-700/50 p-5 rounded-2xl flex flex-col items-center text-center shadow-lg group hover:border-amber-500/50 transition-colors">
                            <span className="material-symbols-outlined text-amber-500 mb-2 text-3xl group-hover:scale-110 transition-transform">diamond</span>
                            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-1 mt-1">Niveles Vip</h4>
                            <p className="text-slate-400 text-[10px] leading-tight">Avanza a Platino y obtén mano de obra 100% bonificada.</p>
                        </div>
                    </div>

                    <Link to="/login" className="mt-4 bg-primary hover:bg-primary/90 text-[#101522] px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,40,0,0.3)] transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2">
                        <span>Descubrir Beneficios</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </Link>
                </div>
            </section>

            {/* Testimonials */}
            <section className="pt-16 pb-24 lg:pt-20 lg:pb-32 px-6 bg-[#0a0c10] relative overflow-hidden border-t border-border-dark/30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,40,0,0.03)_0,transparent_100%)] pointer-events-none"></div>
                <div className="max-w-7xl mx-auto w-full relative z-10 text-center mb-14">
                    <h2 className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-3">La Voz del Cliente</h2>
                    <h3 className="text-slate-100 text-3xl font-light tracking-tight mb-6">Confianza Premium</h3>
                    <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed max-w-2xl mx-auto">
                        Estos comentarios son el reflejo del nivel de detalle, la transparencia y el compromiso que ponemos en cada máquina. La diferencia que marca nuestro equipo de especialistas.
                    </p>
                </div>

                {loadingFeedbacks ? (
                    <div className="flex justify-center items-center py-10">
                        <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
                    </div>
                ) : (
                    <div className="flex flex-nowrap overflow-x-auto gap-6 pb-8 no-scrollbar snap-x snap-mandatory px-4 sm:px-6 -mx-4 sm:-mx-6 max-w-7xl mx-auto">
                        {feedbacks.map((fb) => (
                            <div key={fb.id} className="min-w-[300px] w-[300px] sm:min-w-[350px] sm:w-[350px] bg-[#121826]/80 backdrop-blur-xl border border-slate-800/60 p-6 rounded-2xl shrink-0 snap-center shadow-xl relative overflow-hidden group hover:border-primary/30 hover:shadow-primary/5 transition-all">
                                {/* Decorative quote mark */}
                                <div className="absolute right-4 top-4 opacity-5 group-hover:opacity-10 group-hover:text-primary transition-all duration-500">
                                    <span className="material-symbols-outlined text-[60px]" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
                                </div>
                                <div className="flex gap-1 mb-6 z-10 relative">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="material-symbols-outlined text-[14px] drop-shadow-[0_0_8px_rgba(255,193,7,0.4)]" style={{ fontVariationSettings: i < fb.rating ? "'FILL' 1" : "'FILL' 0", color: i < fb.rating ? "#FFC107" : "#334155" }}>star</span>
                                    ))}
                                </div>
                                <p className="text-slate-300 italic mb-8 text-[13px] font-light leading-relaxed z-10 relative line-clamp-4">"{fb.comment}"</p>
                                <div className="flex items-center gap-4 z-10 relative mt-auto border-t border-slate-800/60 pt-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner shrink-0 group-hover:bg-primary/20 transition-colors">
                                        <span className="text-primary font-bold text-xs tracking-widest">{(fb.userName || 'U').substring(0, 2).toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <p className="text-white text-[13px] font-bold tracking-tight">{fb.userName}</p>
                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5 group-hover:text-primary/70 transition-colors">{fb.bike || 'Cliente verificado'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer className="bg-surface-dark border-t border-border-dark pt-12 pb-24 px-6">
                <div className="flex items-center gap-2 mb-8">
                    <span className="material-symbols-outlined text-primary text-3xl">precision_manufacturing</span>
                    <h2 className="text-slate-100 text-xl font-bold">{appConfig.companyName}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div>
                        <h4 className="text-primary text-sm font-bold uppercase tracking-widest mb-4">Ubicación</h4>
                        <a
                            href="https://maps.google.com/?q=Rondeau+3538,+Villa+Pueyrredon,+BA,+Argentina"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 group"
                        >
                            <span className="material-symbols-outlined text-primary mt-0.5 group-hover:scale-110 transition-transform">location_on</span>
                            <div className="text-slate-400 group-hover:text-slate-300 transition-colors">
                                <p className="font-medium text-slate-200">Rondeau 3538</p>
                                <p className="text-sm">Villa Pueyrredón, CP 1653</p>
                                <p className="text-sm">Buenos Aires, Argentina</p>
                            </div>
                        </a>
                    </div>
                    <div>
                        <h4 className="text-primary text-sm font-bold uppercase tracking-widest mb-4">Contacto</h4>
                        <div className="space-y-3">
                            <a href="mailto:info@dynotechpowergarage.com" className="flex items-center gap-3 text-slate-400 hover:text-slate-300 transition-colors">
                                <span className="material-symbols-outlined text-slate-500 text-sm">mail</span>
                                <span>info@dynotechpowergarage.com</span>
                            </a>
                            <a href="tel:+5491100000000" className="flex items-center gap-3 text-slate-400 hover:text-slate-300 transition-colors">
                                <span className="material-symbols-outlined text-slate-500 text-sm">call</span>
                                <span>+54 9 11 0000-0000</span>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-primary text-sm font-bold uppercase tracking-widest mb-4">Siguenos</h4>
                        <div className="flex gap-4">
                            <a href="https://instagram.com/dynotechpowergarage" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-border-dark flex items-center justify-center text-slate-300 hover:bg-primary/20 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">photo_camera</span>
                            </a>
                            <a href="https://tiktok.com/@dynotechpowergarage" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-border-dark flex items-center justify-center text-slate-300 hover:bg-primary/20 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">play_arrow</span>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-border-dark pt-8 flex flex-col items-center justify-center gap-2">
                    <p className="text-slate-600 text-[11px] text-center">© {new Date().getFullYear()} {appConfig.companyName}. Arquitectura de alto rendimiento.</p>
                    <p className="text-primary/70 text-[10px] uppercase tracking-widest font-bold">Developer: Ing. Jesus A. Hidalgo</p>
                </div>
            </footer>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0c10]/90 backdrop-blur-lg border-t border-slate-800 px-2 sm:px-6 pb-6 pt-3">
                <div className="flex justify-between items-center max-w-md mx-auto">
                    <Link to="/landing" className="flex flex-col items-center gap-1 text-primary">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                        <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest">Inicio</span>
                    </Link>
                    <Link to="/servicios" className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">precision_manufacturing</span>
                        <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest">Servicios</span>
                    </Link>
                    <Link to="/login" className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">calendar_today</span>
                        <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest">Agenda</span>
                    </Link>
                    <Link to="/login" className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">person</span>
                        <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest">Perfil</span>
                    </Link>
                    <Link to="/rutas" className="flex flex-col items-center gap-1 text-slate-500 hover:text-purple-400 transition-colors cursor-pointer group">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">explore</span>
                        <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest group-hover:text-purple-400">Rutas</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
};

export default LandingPage;
