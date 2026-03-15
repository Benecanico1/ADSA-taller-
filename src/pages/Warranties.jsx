import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '../components/ui/BottomNav';
import { useNotifications } from '../lib/NotificationContext';

const Warranties = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('Todas');
    const { togglePanel } = useNotifications();

    const handleWhatsAppSupport = () => {
        window.open('https://api.whatsapp.com/send?phone=1234567890&text=Hola,%20necesito%20asistencia%20inmediata%20con%20mi%20moto.', '_blank', 'noopener,noreferrer');
    };

    // Mock data for motorcycles with last oil change dates
    const motorcycles = [
        {
            id: 1,
            name: "Yamaha MT-09 SP",
            orderNumber: "4582",
            image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800",
            lastOilChange: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString() // 2 months ago -> Active
        },
        {
            id: 2,
            name: "Kawasaki Z900",
            orderNumber: "4310",
            image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800",
            lastOilChange: new Date(new Date().setMonth(new Date().getMonth() - 5, new Date().getDate() - 20)).toISOString() // ~5 months and 20 days ago -> Expiring Soon
        },
        {
            id: 3,
            name: "Honda CB650R",
            orderNumber: "3982",
            image: "https://images.unsplash.com/photo-1614165502444-46b0aab3690d?auto=format&fit=crop&q=80&w=800", // Using a placeholder since original was absent
            lastOilChange: new Date(new Date().setMonth(new Date().getMonth() - 7)).toISOString() // 7 months ago -> Expired
        }
    ];

    // Helper to calculate oil change status
    const calculateOilStatus = (lastChangeDateIso) => {
        const lastChange = new Date(lastChangeDateIso);
        const nextChange = new Date(lastChange);
        nextChange.setMonth(nextChange.getMonth() + 6); // Add 6 months

        const today = new Date();
        const diffTime = nextChange - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            return { status: 'Expiradas', daysRemaining: 0, date: nextChange.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) };
        } else if (diffDays <= 30) {
            return { status: 'Por Vencer', daysRemaining: diffDays, date: nextChange.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) };
        } else {
            return { status: 'Activas', daysRemaining: diffDays, date: nextChange.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) };
        }
    };

    // Filter the motorcycles
    const filteredMotorcycles = motorcycles.filter(moto => {
        if (filter === 'Todas') return true;
        const status = calculateOilStatus(moto.lastOilChange).status;
        return status === filter;
    });

    return (
        <div className="bg-[#0a0c14] text-slate-100 min-h-screen flex flex-col font-display max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
            {/* Carbon Pattern Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-40"
                style={{
                    backgroundColor: '#0a0c14',
                    backgroundImage: `
                        linear-gradient(45deg, #111 25%, transparent 25%), 
                        linear-gradient(-45deg, #111 25%, transparent 25%), 
                        linear-gradient(45deg, transparent 75%, #111 75%), 
                        linear-gradient(-45deg, transparent 75%, #111 75%)
                    `,
                    backgroundSize: '4px 4px'
                }}
            ></div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#161b2a]/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">shield_with_heart</span>
                    <h1 className="text-xl font-extrabold tracking-tight">adsa_taller <span className="text-primary">Garage</span></h1>
                </div>
                <div className="flex gap-2">
                    <button onClick={togglePanel} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button onClick={() => navigate('/settings')} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-24">
                <div className="px-4 py-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-1 flex items-baseline gap-2">
                            Mis Motos
                            <span className="text-base font-medium text-slate-400">(Servicios y reparaciones)</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Gestiona la cobertura técnica de tus motocicletas.</p>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] py-1">
                        <button
                            onClick={() => setFilter('Todas')}
                            className={`px-5 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${filter === 'Todas' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >Todas ({motorcycles.length})</button>
                        <button
                            onClick={() => setFilter('Activas')}
                            className={`px-5 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${filter === 'Activas' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >Activas</button>
                        <button
                            onClick={() => setFilter('Por Vencer')}
                            className={`px-5 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${filter === 'Por Vencer' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >Por Vencer</button>
                        <button
                            onClick={() => setFilter('Expiradas')}
                            className={`px-5 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${filter === 'Expiradas' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >Expiradas</button>
                    </div>

                    <div className="space-y-6">
                        {filteredMotorcycles.map(moto => {
                            const oilInfo = calculateOilStatus(moto.lastOilChange);
                            const isActive = oilInfo.status === 'Activas';
                            const isExpiring = oilInfo.status === 'Por Vencer';
                            const isExpired = oilInfo.status === 'Expiradas';

                            if (isExpired) {
                                return (
                                    <div key={moto.id} className="bg-[#161b2a]/50 rounded-2xl overflow-hidden border border-slate-700/50 opacity-60 grayscale">
                                        <div className="p-5 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-slate-400">motorcycle</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-white">{moto.name}</h3>
                                                    <p className="text-[10px] font-bold uppercase tracking-tighter">OT #{moto.orderNumber} • Cambio Vencido</p>
                                                </div>
                                            </div>
                                            <button onClick={() => navigate('/appointments')} className="p-2 hover:bg-slate-700/50 rounded-full transition-colors flex items-center justify-center">
                                                <span className="material-symbols-outlined">chevron_right</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={moto.id} className="bg-[#161b2a] rounded-2xl overflow-hidden border border-slate-700/50 shadow-lg shadow-black/50 hover:border-slate-500 transition-colors">
                                    <div className="relative h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url('${moto.image}')` }}>
                                        <div className={`absolute top-3 left-3 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 ${isActive ? 'bg-emerald-500/90' : 'bg-amber-500/90'}`}>
                                            <span className="material-symbols-outlined text-xs">{isActive ? 'check_circle' : 'warning'}</span>
                                            {isActive ? 'Servicio al día' : 'Próximo a cambio'}
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-white text-lg font-black tracking-tight drop-shadow-md">{moto.name}</h3>
                                                <p className="text-primary text-xs font-bold uppercase tracking-tighter">Orden de Trabajo #{moto.orderNumber}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-2xl font-black leading-none ${isActive ? 'text-primary' : 'text-amber-500'}`}>{oilInfo.daysRemaining}</span>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold leading-none">Días Restantes</p>
                                            </div>
                                        </div>
                                        <div className={`mt-4 space-y-3 ${isExpiring ? 'opacity-80' : ''}`}>
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <span className="material-symbols-outlined text-primary">oil_barrel</span>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium">Servicio</p>
                                                    <p className="text-sm font-bold">Cambio de Aceite</p>
                                                </div>
                                            </div>
                                            {isActive && (
                                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                    <span className="material-symbols-outlined text-primary">calendar_today</span>
                                                    <div>
                                                        <p className="text-xs text-slate-500 font-medium">Próximo Cambio</p>
                                                        <p className="text-sm font-bold">{oilInfo.date}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-6 flex gap-2">
                                            {isActive ? (
                                                <>
                                                    <button onClick={() => navigate('/history')} className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-all">
                                                        <span className="material-symbols-outlined text-sm text-white">description</span>
                                                        Ver Historial
                                                    </button>
                                                    <button onClick={() => navigate('/appointments')} className="flex-1 border border-primary text-primary hover:bg-primary/10 font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-all">
                                                        <span className="material-symbols-outlined text-sm">event</span>
                                                        Agendar
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => navigate('/history')} className="flex-1 bg-primary/20 text-primary font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors hover:bg-primary/30">
                                                        <span className="material-symbols-outlined text-sm">description</span>
                                                        Ver Historial
                                                    </button>
                                                    <button onClick={() => navigate('/appointments')} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                                                        <span className="material-symbols-outlined text-sm text-white">build</span>
                                                        Agendar Cita
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quality Commitment Section */}
                    <div className="mt-8 p-6 bg-primary/10 border border-primary/20 rounded-2xl text-center">
                        <span className="material-symbols-outlined text-primary text-4xl mb-2">verified</span>
                        <h4 className="font-bold text-lg mb-2">Compromiso adsa_taller</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Todas nuestras reparaciones cuentan con certificación digital respaldada por técnicos certificados.</p>
                        <button className="text-primary font-bold text-sm flex items-center justify-center gap-1 mx-auto">
                            Leer Términos y Condiciones <span className="material-symbols-outlined text-xs">open_in_new</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Chat Assistant FAB */}
            <div className="fixed bottom-24 right-6 lg:right-auto lg:left-1/2 lg:ml-[220px] z-40">
                <button onClick={handleWhatsAppSupport} className="bg-emerald-500 text-white p-4 rounded-full shadow-xl shadow-emerald-500/20 flex items-center gap-2 font-bold group hover:scale-[1.02] active:scale-[0.98] transition-transform">
                    <span className="material-symbols-outlined">chat</span>
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">Asistencia Directa</span>
                </button>
            </div>

            <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto border-t border-slate-800/80 bg-[#0a1315]/95 backdrop-blur-xl px-4 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-[72px] pb-2 text-white">
                <Link to="/customer-dashboard" className="flex flex-1 flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                    <span className="material-symbols-outlined text-[24px]">dashboard</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Panel</span>
                </Link>
                <button onClick={() => window.location.reload()} className="flex flex-col items-center justify-center w-full h-full text-primary hover:text-primary transition-colors group">
                    <span className="material-symbols-outlined text-[22px] group-hover:-translate-y-1 transition-transform duration-300 text-primary">motorcycle</span>
                    <span className="text-[9px] font-black uppercase tracking-widest mt-1">Garaje</span>
                </button>
                <Link to="/appointments" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-primary transition-colors group">
                    <span className="material-symbols-outlined text-[24px]">calendar_today</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Citas</span>
                </Link>
                <Link to="/settings" className="flex flex-1 flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                    <span className="material-symbols-outlined text-[24px]">person</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Cuenta</span>
                </Link>
            </nav>
        </div>
    );
};

export default Warranties;
