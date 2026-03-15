import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import DevRoleToggle from '../components/DevRoleToggle';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNotifications } from '../lib/NotificationContext';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { togglePanel } = useNotifications();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleNotificationsClick = () => {
        togglePanel();
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (!currentUser) return;

            try {
                // Fetch user's motorcycles
                const q = query(collection(db, "Motorcycles"), where("ownerId", "==", currentUser.uid));
                const querySnapshot = await getDocs(q);
                const bikes = [];
                querySnapshot.forEach((doc) => {
                    bikes.push({ id: doc.id, ...doc.data() });
                });
                setVehicles(bikes);
            } catch (error) {
                console.error("Error fetching vehicles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [currentUser]);

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
                    <div className="bg-gradient-to-br from-primary to-blue-600 p-1.5 rounded-xl shadow-[0_0_15px_rgba(37,123,244,0.3)]">
                        <span className="material-symbols-outlined text-white text-lg drop-shadow-sm">precision_manufacturing</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-black leading-none text-white tracking-wide">Dynotech</h1>
                        <p className="text-[9px] text-primary uppercase tracking-widest font-bold mt-0.5">Power Garage</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <DevRoleToggle />
                    <button onClick={handleNotificationsClick} className="relative flex items-center justify-center rounded-full size-10 bg-[#161b2a] border border-slate-700/80 hover:border-primary/50 text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">notifications</span>
                        {/* Indicador de notificación (Opcional, desactivado por ahora)
                        <span className="absolute top-2 right-2.5 size-2 bg-red-500 rounded-full border border-[#161b2a]"></span>
                        */}
                    </button>
                    <button onClick={handleSignOut} className="relative flex items-center justify-center rounded-full size-10 bg-[#161b2a] border border-slate-700/80 hover:border-red-500/50 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-slate-100 hover:text-red-500 text-xl transition-colors">logout</span>
                    </button>
                </div>
            </header>

            <main className="relative z-10 flex-1 pb-28">
                {/* Featured Active Asset */}
                <div className="p-4 px-4">
                    <div onClick={() => navigate('/warranties')} className="flex flex-col items-stretch justify-start rounded-2xl bg-[#161b2a] overflow-hidden border border-slate-700/50 shadow-lg shadow-black/50 group cursor-pointer active:scale-[0.99] transition-transform">
                        <div
                            className="relative w-full aspect-video bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAbJOP7WzsJYFXcyYNWoIIBlsDt4ZPJ1BHC1ZTelpeJi1sK5u98gxOwMRrgaohwiAstuRF5v7rmbO1S4T7WQaDx49ZUWseeekprSeOLQ9wqaGgtl_v7leOuBPNeFoIibHbdF0x20AeX2Hjt2y0g4Hfhew5QMKzyWvMjUc--hR6wQndpnNbDw-p4wgG2CdGp2GPo0kaATFGL1Pjyjz0dSm902HngONA9iVb3SwurFB-avjaJZ-hHJwQ6hRcjnc1Wa0fUGLnnYZPBMOfD")' }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-[#161b2a] via-[#161b2a]/20 to-transparent"></div>
                            <div className="absolute top-3 left-3 bg-primary/90 text-[#0a0c14] text-[10px] font-black px-2.5 py-1 rounded shadow-md tracking-widest uppercase">
                                Servicio Activo
                            </div>
                        </div>
                        <div className="relative flex w-full flex-col gap-4 p-5 -mt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-white text-xl font-black tracking-tight drop-shadow-md">Ducati Panigale V4</h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">Patente: <span className="text-slate-200">DX-9982</span></p>
                                </div>
                                <div className="bg-primary/20 border border-primary/40 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(13,204,242,0.2)]">
                                    <p className="text-primary text-[10px] font-black uppercase tracking-widest">En Reparación</p>
                                </div>
                            </div>

                            {/* Mini Stats */}
                            <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-700/50">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Salud</span>
                                    <span className="text-xs text-orange-400 font-black mt-0.5">Regular</span>
                                </div>
                                <div className="flex flex-col border-x border-slate-700/50 px-3">
                                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Nº Servicio</span>
                                    <span className="text-xs text-slate-200 font-bold mt-0.5">#DT-4821</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Próximo</span>
                                    <span className="text-xs text-slate-200 font-bold mt-0.5">12,450 km</span>
                                </div>
                            </div>

                            <button className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-11 px-4 bg-primary text-[#0a0c14] text-[11px] font-black tracking-widest hover:bg-primary/90 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(13,204,242,0.3)] uppercase">
                                <span>Ver Telemetría en Vivo</span>
                                <span className="material-symbols-outlined ml-2 text-lg">sensors</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Timeline of Transparency */}
                <div className="px-5 py-2 mt-2">
                    <h3 className="text-slate-100 text-xs font-black uppercase tracking-widest mb-6 flex items-center drop-shadow-sm">
                        <span className="w-1.5 h-4 bg-primary rounded-full mr-2.5 shadow-[0_0_8px_rgba(13,204,242,0.8)]"></span>
                        Línea de Transparencia
                    </h3>

                    <div className="grid grid-cols-[32px_1fr] gap-x-5 px-1 relative">
                        {/* Continuous line background */}
                        <div className="absolute left-[19px] top-4 bottom-10 w-0.5 bg-slate-800"></div>

                        {/* Step 1 */}
                        <div className="flex flex-col items-center relative z-10">
                            <div className="size-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(13,204,242,0.4)] ring-4 ring-[#0a0c14]">
                                <span className="material-symbols-outlined text-[#0a0c14] text-[18px] font-bold">check</span>
                            </div>
                            <div className="w-0.5 bg-primary h-12"></div>
                        </div>
                        <div className="pb-7 pt-1">
                            <p className="text-slate-100 text-sm font-bold">Recepción</p>
                            <p className="text-slate-400 text-[11px] font-medium mt-0.5">Oct 24, 09:30 AM • <span className="text-slate-500">Recibido por Marco</span></p>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center relative z-10">
                            <div className="size-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(13,204,242,0.4)] ring-4 ring-[#0a0c14]">
                                <span className="material-symbols-outlined text-[#0a0c14] text-[18px] font-bold">analytics</span>
                            </div>
                            <div className="w-0.5 bg-primary h-14"></div>
                        </div>
                        <div className="pb-8 pt-1">
                            <p className="text-slate-100 text-sm font-bold">Diagnóstico Completo</p>
                            <p className="text-slate-400 text-[11px] font-medium mt-0.5">Oct 24, 11:45 AM • <span className="text-slate-500">Escaneo Electrónico Listo</span></p>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center relative z-10">
                            <div className="size-8 rounded-full border-2 border-primary bg-[#0a0c14] flex items-center justify-center relative shadow-[0_0_15px_rgba(13,204,242,0.2)] ring-4 ring-[#0a0c14]">
                                <span className="material-symbols-outlined text-primary text-[18px] animate-pulse">engineering</span>
                            </div>
                        </div>
                        <div className="pb-8 pt-1">
                            <p className="text-primary text-sm font-black drop-shadow-[0_0_5px_rgba(13,204,242,0.3)]">En Reparación</p>
                            <p className="text-slate-300 text-xs font-semibold mt-1">Ensamblaje de Embrague y Optimización de Mapa</p>
                            <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-primary h-full w-2/3 shadow-[0_0_10px_rgba(13,204,242,0.8)] relative">
                                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex flex-col items-center pt-2 relative z-10">
                            <div className="size-8 rounded-full border border-slate-700 bg-[#161b2a] flex items-center justify-center ring-4 ring-[#0a0c14]">
                                <span className="material-symbols-outlined text-slate-500 text-[18px]">sports_score</span>
                            </div>
                        </div>
                        <div className="pb-4 pt-3">
                            <p className="text-slate-500 text-sm font-bold">Listo para Entregar</p>
                            <p className="text-slate-600 text-[11px] font-medium mt-0.5 italic">Estimado: Mañana, 16:00</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-3 px-4 py-4 mt-2">
                    <button
                        onClick={() => navigate('/appointments')}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#161b2a] border border-slate-700/50 hover:border-primary/50 transition-colors gap-3 group shadow-sm active:scale-95"
                    >
                        <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shadow-inner">
                            <span className="material-symbols-outlined text-primary text-[22px]">add_circle</span>
                        </div>
                        <span className="text-[9px] font-black text-slate-300 text-center leading-tight uppercase tracking-widest">Agendar Cita</span>
                    </button>
                    <button
                        onClick={() => navigate('/history')}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#161b2a] border border-slate-700/50 hover:border-primary/50 transition-colors gap-3 group shadow-sm active:scale-95"
                    >
                        <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shadow-inner">
                            <span className="material-symbols-outlined text-primary text-[22px]">history_edu</span>
                        </div>
                        <span className="text-[9px] font-black text-slate-300 text-center leading-tight uppercase tracking-widest">Historial</span>
                    </button>
                    <button
                        onClick={() => window.open('https://api.whatsapp.com/send?phone=1234567890&text=Hola%20Dynotech,%20necesito%20asistencia.', '_blank', 'noopener,noreferrer')}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#161b2a] border border-slate-700/50 hover:border-emerald-500/50 transition-colors gap-3 group shadow-sm active:scale-95"
                    >
                        <div className="size-11 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors shadow-inner">
                            <span className="material-symbols-outlined text-emerald-500 text-[22px]">chat</span>
                        </div>
                        <span className="text-[9px] font-black text-slate-300 text-center leading-tight uppercase tracking-widest">Soporte WA</span>
                    </button>
                </div>

                {/* My Assets Section */}
                <div className="px-4 py-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-slate-100 text-xs font-black uppercase tracking-widest flex items-center drop-shadow-sm">
                            <span className="w-1.5 h-4 bg-slate-500 rounded-full mr-2.5"></span>
                            Mis Vehículos
                        </h3>
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/add-motorcycle')} className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">add</span>
                                Nuevo
                            </button>
                            <button onClick={() => navigate('/warranties')} className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline underline-offset-4 decoration-2">Ver Todos</button>
                        </div>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden -mx-4 px-4">
                        {loading ? (
                            <div className="text-slate-400 text-sm py-4">Cargando vehículos...</div>
                        ) : vehicles.length > 0 ? (
                            vehicles.map((bike) => (
                                <div key={bike.id} className="min-w-[220px] rounded-2xl bg-[#161b2a] border border-slate-700/50 overflow-hidden shadow-lg hover:border-slate-500 transition-colors cursor-pointer">
                                    <div
                                        className="h-28 w-full bg-cover bg-center"
                                        style={{ backgroundImage: `url("${bike.imageUrl || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=500'}")` }}
                                    ></div>
                                    <div className="p-4">
                                        <h4 className="text-slate-100 text-[13px] font-black tracking-wide">{bike.brand} {bike.model}</h4>
                                        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-1">Patente: {bike.plate}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="w-full text-center py-6 bg-[#161b2a] rounded-2xl border border-slate-700/50">
                                <span className="material-symbols-outlined text-slate-500 text-3xl mb-2">two_wheeler</span>
                                <p className="text-slate-400 text-xs uppercase tracking-widest">No tienes vehículos registrados</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto border-t border-slate-800/80 bg-[#0a1315]/95 backdrop-blur-xl px-4 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-[72px] pb-2 text-white">
                <Link to="/customer-dashboard" className="flex flex-1 flex-col items-center justify-center gap-1.5 text-primary">
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">Panel</span>
                </Link>
                <button onClick={() => navigate('/warranties')} className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-primary transition-colors group">
                    <span className="material-symbols-outlined text-[22px] group-hover:-translate-y-1 transition-transform duration-300">motorcycle</span>
                    <span className="text-[9px] font-black uppercase tracking-widest mt-1">Garaje</span>
                </button>
                <button onClick={() => navigate('/appointments')} className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-primary transition-colors group">
                    <span className="material-symbols-outlined text-[24px]">calendar_today</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Citas</span>
                </button>
                <Link to="/settings" className="flex flex-1 flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                    <span className="material-symbols-outlined text-[24px]">person</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Cuenta</span>
                </Link>
            </nav>
        </div>
    );
};

export default CustomerDashboard;
