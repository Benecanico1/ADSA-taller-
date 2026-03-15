import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { appConfig } from '../config';

const FEATURED_SERVICES = [
    {
        id: 'mantenimiento-full',
        title: 'Mantenimiento Preventivo Premium',
        category: 'Mecánica Integral',
        description: 'Mantén tu motocicleta en óptimas condiciones con nuestro servicio estrella. Nuestro equipo de mecánicos certificados se encarga de revisar, ajustar y poner a punto cada componente crucial de tu vehículo.',
        includes: [
            'Mano de obra altamente calificada',
            'Sustitución de fluidos (Motul 7100) y filtros originales',
            'Ajuste, limpieza y lubricación de transmisión',
            'Revisión exhaustiva de frenos, suspensión y electrónica',
            'Lavado de cortesía y detailing básico'
        ],
        imageUrl: '/services/mantenimiento.png',
        priceLabel: 'Agenda desde $45.000',
        onClickParam: 'Mantenimiento'
    },
    {
        id: 'diagnostico-scanner',
        title: 'Diagnóstico por Falla y Telemetría',
        category: 'Diagnóstico Avanzado',
        description: 'Detección precisa de fallas eléctricas y mecánicas utilizando herramientas de telemetría y escáneres de última generación. Evitamos gastos innecesarios encontrando la raíz del problema.',
        includes: [
            'Escaneo computarizado multimarcas en tiempo real',
            'Revisión de códigos de error persistentes en ECU',
            'Testeo avanzado de batería, estator y regulador',
            'Asesoría técnica y presupuesto transparente'
        ],
        imageUrl: '/services/diagnostico.png',
        priceLabel: 'Sujeto a Cotización',
        onClickParam: 'Diagnóstico'
    },
    {
        id: 'detailing-premium',
        title: 'Restauración y Detailing Acrílico',
        category: 'Estética y Cuidado',
        description: 'Devolvemos el brillo de fábrica a tu motocicleta. Un spa exclusivo para consentir a tu compañera de rutas con los mejores productos de la industria automotriz.',
        includes: [
            'Lavado profundo al detalle con vapor',
            'Descontaminación férrica y de pintura',
            'Pulido y tratamiento acrílico o cerámico',
            'Renovación de plásticos y metales'
        ],
        imageUrl: '/services/detailing.png',
        priceLabel: 'Desde $35.000',
        onClickParam: 'Estética'
    },
    {
        id: 'modificaciones',
        title: 'Performance y Accesorios',
        category: 'Personalización',
        description: 'Lleva tu moto al siguiente nivel. Instalamos accesorios originales y aftermarket, garantizando la integridad de la electrónica y la garantía de tu vehículo.',
        includes: [
            'Instalación de Escapes y Full Systems',
            'Colocación segura de Sliders y Defensas de motor',
            'Sistemas de iluminación LED y faros auxiliares',
            'Instalación de GPS, alarmas y soportes touring'
        ],
        imageUrl: '/services/performance.png',
        priceLabel: 'Mano de Obra Certificada',
        onClickParam: 'Accesorios'
    }
];

const ServicesPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [dbServices, setDbServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const servicesSnap = await getDocs(collection(db, 'Services'));
                const servicesList = [];
                servicesSnap.forEach(doc => {
                    servicesList.push({ id: doc.id, ...doc.data() });
                });

                servicesList.sort((a, b) => a.name.localeCompare(b.name));
                setDbServices(servicesList);
            } catch (error) {
                console.error("Error fetching DB services:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
        window.scrollTo(0, 0);
    }, []);

    const handleServiceClick = (serviceCategory = '') => {
        if (currentUser) {
            navigate('/appointments');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="bg-[#0a0c10] text-slate-100 min-h-screen flex flex-col font-display max-w-[1200px] w-full mx-auto shadow-2xl relative lg:border-x lg:border-slate-800/50">

            {/* Background Atmosphere */}
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none z-0"></div>

            {/* Header */}
            <header className="px-6 py-6 sticky top-0 bg-[#0a0c10]/80 backdrop-blur-2xl z-40 border-b border-slate-800/80">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(currentUser ? '/dashboard' : '/landing')}
                        className="size-10 rounded-full border border-slate-700/50 bg-[#161b2a] flex items-center justify-center text-slate-400 hover:text-white hover:border-primary/50 transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">engineering</span>
                            Nuestros Servicios
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            {currentUser ? 'Agenda tu próximo servicio' : 'Elige un servicio para empezar'}
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 sm:px-6 py-8 overflow-y-auto pb-32 relative z-10 w-full max-w-full overflow-hidden">

                {/* Intro Section */}
                <div className="mb-10 text-center">
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">La mejor atención para tu moto</h2>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                        En <span className="text-primary font-bold">{appConfig.companyName}</span> contamos con herramientas de última generación y mano de obra experta para garantizar el mejor rendimiento.
                    </p>
                </div>

                {/* Featured Services */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12">
                    {FEATURED_SERVICES.map((service) => (
                        <div key={service.id} className="relative group max-w-full overflow-hidden flex flex-col">
                            {/* Decorative glow behind the card */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500 z-0"></div>

                            <div className="relative z-10 bg-[#161b2a] rounded-[2rem] border border-slate-700/50 flex flex-col flex-1 overflow-hidden w-full">
                                {/* Large Featured Image */}
                                <div className="h-48 sm:h-64 w-full relative overflow-hidden">
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#161b2a] to-transparent z-10"></div>
                                    <img
                                        src={service.imageUrl}
                                        alt={service.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                        loading="lazy"
                                    />
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-primary shadow-lg">
                                            {service.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Body */}
                                <div className="p-5 sm:p-8 relative z-20 -mt-8 sm:-mt-10 max-w-full flex flex-col flex-1">
                                    <h3 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight group-hover:text-primary transition-colors leading-tight">{service.title}</h3>
                                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-5 flex-1">
                                        {service.description}
                                    </p>

                                    {/* What it includes */}
                                    <div className="bg-[#0a0c10] rounded-2xl p-4 sm:p-5 border border-slate-800/80 mb-6">
                                        <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">build_circle</span>
                                            ¿Qué incluye este servicio?
                                        </h4>
                                        <ul className="space-y-2.5">
                                            {service.includes.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2 text-xs text-slate-300 font-medium leading-snug">
                                                    <span className="material-symbols-outlined text-emerald-400 text-[14px] mt-[1px] shrink-0">check_circle</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Action Button */}
                                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-between mt-2">
                                        <span className="text-[11px] sm:text-xs font-black text-slate-300 bg-slate-800/50 px-4 py-2.5 rounded-xl border border-slate-700/50 w-full sm:w-auto text-center tracking-wide">
                                            {service.priceLabel}
                                        </span>
                                        <button
                                            onClick={() => handleServiceClick(service.onClickParam)}
                                            className="w-full sm:w-auto bg-primary text-background-dark px-6 py-3.5 rounded-xl font-black uppercase tracking-widest text-[11px] sm:text-xs hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(13,204,242,0.3)] hover:shadow-[0_0_30px_rgba(13,204,242,0.5)] flex items-center justify-center gap-2"
                                        >
                                            Seleccionar Servicio
                                            <span className="material-symbols-outlined text-lg">calendar_month</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional DB Services List */}
                {dbServices.length > 0 && (
                    <div className="mt-16 sm:mt-20">
                        <div className="flex items-center gap-4 mb-6">
                            <hr className="flex-1 border-slate-800" />
                            <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-500">Tarifario Extra</h3>
                            <hr className="flex-1 border-slate-800" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 opacity-90">
                            {dbServices.map(service => (
                                <div key={service.id} className="flex justify-between items-center p-4 bg-[#161b2a]/50 border border-slate-800/50 rounded-xl hover:bg-[#161b2a]/80 transition-colors">
                                    <div className="flex-1 pr-3">
                                        <h4 className="text-xs sm:text-sm font-bold text-slate-200">{service.name}</h4>
                                        <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 tracking-wider uppercase">{service.category || 'Taller'}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        {service.requiresQuote ? (
                                            <span className="text-[9px] sm:text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded">A cotizar</span>
                                        ) : (
                                            <span className="text-sm font-black text-emerald-400">
                                                ${(Number(service.basePrice || 0) + Number(service.laborCost || 0)).toLocaleString('es-AR')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Fallback Item to keep the UI complete if DB lacks some items */}
                            {!dbServices.some(s => s.name === 'Revisión por Falla' || s.requiresQuote) && (
                                <div className="flex justify-between items-center p-4 bg-[#161b2a]/50 border border-slate-800/50 rounded-xl hover:bg-[#161b2a]/80 transition-colors">
                                    <div className="flex-1 pr-3">
                                        <h4 className="text-xs sm:text-sm font-bold text-slate-200">Revisión por Falla</h4>
                                        <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 tracking-wider uppercase">Diagnóstico</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-[9px] sm:text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded">A cotizar</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Public Footer Navigation - only shown if not logged in */}
            {!currentUser && (
                <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0c10]/95 backdrop-blur-xl border-t border-slate-800 px-4 sm:px-6 py-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                    <div className="flex justify-between items-center max-w-md mx-auto">
                        <Link to="/landing" className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors flex-1">
                            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">home</span>
                            <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-center w-full">Inicio</span>
                        </Link>
                        <Link to="/servicios" className="flex flex-col items-center gap-1 text-primary transition-colors cursor-pointer flex-1">
                            <span className="material-symbols-outlined text-[20px] sm:text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>engineering</span>
                            <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-center w-full">Catálogo</span>
                        </Link>
                        <Link to="/login" className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors cursor-pointer flex-1">
                            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">calendar_today</span>
                            <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-center w-full">Agenda</span>
                        </Link>
                        <Link to="/login" className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors cursor-pointer flex-1">
                            <span className="material-symbols-outlined text-[20px] sm:text-[24px]">person</span>
                            <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-center w-full">Perfil</span>
                        </Link>
                    </div>
                </nav>
            )}
        </div>
    );
};

export default ServicesPage;
