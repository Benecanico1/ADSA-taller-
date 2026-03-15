import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '../components/ui/BottomNav';
import RankDetailsModal from '../components/ui/RankDetailsModal';

const ClientProfile = () => {
    const navigate = useNavigate();
    const [isRankModalOpen, setIsRankModalOpen] = useState(false);

    const handleWhatsAppSupport = () => {
        window.open('https://api.whatsapp.com/send?phone=1234567890&text=Hola%20Dynotech,%20necesito%20asistencia%20VIP.', '_blank', 'noopener,noreferrer');
    };

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

            {/* Header Section */}
            <div className="flex items-center p-4 justify-between bg-[#161b2a]/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800 shadow-sm">
                <Link to="/history" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#161b2a] border border-slate-700/80 hover:border-primary/50 transition-colors shadow-inner">
                    <span className="material-symbols-outlined text-primary">arrow_back_ios_new</span>
                </Link>
                <div className="flex-1 text-center">
                    <h2 className="text-white text-lg font-black tracking-tight drop-shadow-md">Mi Perfil</h2>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-0.5">Dynotech VIP</p>
                </div>
                <div className="flex w-10 items-center justify-end">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/settings'); }} className="relative z-50 pointer-events-auto flex size-10 items-center justify-center rounded-full bg-[#161b2a] border border-slate-700/80 shadow-inner hover:border-primary/50 transition-colors">
                        <span className="material-symbols-outlined text-primary">settings</span>
                    </button>
                </div>
            </div>

            <main className="relative z-10 flex-1 overflow-y-auto pb-24">

                {/* Profile Hero */}
                <div className="flex p-6 flex-col items-center gap-6">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/40 transition-all"></div>
                        <div className="relative bg-center bg-no-repeat aspect-square bg-cover rounded-full border-2 border-primary/50 p-1">
                            <div
                                className="size-32 rounded-full overflow-hidden bg-slate-800 shadow-[0_0_20px_rgba(37,123,244,0.3)]"
                                style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDiVtdcZ9EEjYLFHEUHaagwZbCrKEXxcldZTSUkevl3D4RNGa1ZAXJzy_oeJ_WkGGvBbhM-i1ILy2Ss3kPU6NbOMqktS2DiaXzboKk0zw6utPXXzdlbrWAyq_AVTKfvtLzv66XBkAvKT1SC03ihyVgNeb488IPfLURcFO_kwWA-M_y8Eqd448cy7tVHoG3-WoO1qAarPo4WmTyL4YLG1wafP3VbvwopIiZaHtrWBFWYSgA-pZ3pKnh3nNOGbGnqsHu6TnO6d6IYFLSE")`, backgroundSize: 'cover' }}
                            ></div>
                        </div>
                        <div className="absolute bottom-0 right-0 bg-primary text-[#0a0c14] text-[10px] font-black px-2.5 py-1 rounded shadow-[0_0_10px_rgba(37,123,244,0.5)] tracking-widest border border-primary/50 uppercase">PLATINUM</div>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-white text-3xl font-black tracking-tight drop-shadow-md">Alejandro Rivera</h1>
                        <div
                            onClick={() => setIsRankModalOpen(true)}
                            className="flex flex-col items-center cursor-pointer group active:scale-95 transition-transform"
                        >
                            <p className="text-primary font-black tracking-widest text-[10px] uppercase mt-1 group-hover:underline underline-offset-4">Socio VIP Platinum • Miembro 0482</p>
                            <div className="flex gap-2 mt-4">
                                <div className="px-4 py-1.5 rounded-full bg-[#161b2a] border border-slate-700/80 text-[11px] font-bold text-slate-300 shadow-inner tracking-wide group-hover:border-primary/50 transition-colors">
                                    <span className="text-primary mr-1">✦</span> 15,400 Pts
                                </div>
                                <div className="px-4 py-1.5 rounded-full bg-[#161b2a] border border-slate-700/80 text-[11px] font-bold text-slate-300 shadow-inner tracking-wide flex items-center gap-1 group-hover:border-primary/50 transition-colors">
                                    Nivel 4 Elite
                                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Collection Gallery */}
                <div className="px-4 py-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-100 text-xs font-black uppercase tracking-widest flex items-center drop-shadow-sm">
                            <span className="w-1.5 h-4 bg-primary rounded-full mr-2.5 shadow-[0_0_8px_rgba(13,204,242,0.8)]"></span>
                            Galería de Colección
                        </h3>
                        <Link to="/warranties" className="text-primary text-[10px] font-black uppercase hover:underline underline-offset-4 decoration-2 transition-colors">Ver todas</Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        {/* Bike Card 1 */}
                        <div onClick={() => navigate('/warranties')} className="flex items-center gap-4 p-4 rounded-2xl bg-[#161b2a] border border-slate-700/50 shadow-lg shadow-black/50 hover:border-slate-500 transition-colors cursor-pointer active:scale-[0.99]">
                            <div
                                className="size-20 rounded-xl bg-center bg-cover bg-slate-800 shrink-0 border border-slate-700/50"
                                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDtpeYe00O9LDQFFDPer7tjD_j_e6XviitSg7U_8F5G7Y5VXZFuxTwwIxc_4D681Zo0G-H1qIATKIjcjwSn5Xro9vx9Q790v-FnNfJBMXU_pjYHTQ5K0sW-Y1O3ZhWuUn7A_ARFJqOGI8T4Nc8BAp0ksOppuIBOaIjMKDvjNBbimbYa-rvnW6VCPW0Dz0ZBNPwNs7J9dx9bY1tGxVpaYwXf1yKZ2AiaJBTpf_NGvKXkTVjDw2MxTar5V5-qg-GrLpSeelWQRa0Vv54y')` }}
                            ></div>
                            <div className="flex-1 flex flex-col">
                                <h3 className="text-white font-black tracking-wide text-sm">Ducati Superleggera V4</h3>
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-[14px] text-emerald-400">check_circle</span>
                                    Estado: Óptimo (98%)
                                </div>
                                <div className="mt-3 flex items-center justify-between border-t border-slate-700/50 pt-2">
                                    <span className="text-[9px] text-slate-500 tracking-widest font-black uppercase">Mant. Anual</span>
                                    <span className="text-slate-200 font-bold text-xs">$4,250 USD</span>
                                </div>
                            </div>
                        </div>

                        {/* Bike Card 2 */}
                        <div onClick={() => navigate('/warranties')} className="flex items-center gap-4 p-4 rounded-2xl bg-[#161b2a] border border-slate-700/50 shadow-lg shadow-black/50 hover:border-slate-500 transition-colors cursor-pointer active:scale-[0.99]">
                            <div
                                className="size-20 rounded-xl bg-center bg-cover bg-slate-800 shrink-0 border border-slate-700/50"
                                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBdyMZrxuKjRvwkx6mtjQzfW2bZocfILjVvlVcTPIPeyGUouPi3fydHs_d9aSZmmM55e7upYqGOcJF7V3j6F6ConLQaf-Q1V1gTR5bSQI-qRwGBb8EuxQ0Vg3XBe5qM6Vwb3kVEGodEkUNr-Vk69cOQdkjm8Vte8I00xuCFpG_arQa7HRsHOh4bRVF9PhzJtjCw9onnKuuFThztOAh4jx5h1y4QyR6QokTyB28hGGN-w6u7N-mXtUTlDNc9GjEP4WRCuWwrVhRvvhKB')` }}
                            ></div>
                            <div className="flex-1 flex flex-col">
                                <h3 className="text-white font-black tracking-wide text-sm">BMW M1000RR</h3>
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-[14px] text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]">warning</span>
                                    Revisión: En 15 días
                                </div>
                                <div className="mt-3 flex items-center justify-between border-t border-slate-700/50 pt-2">
                                    <span className="text-[9px] text-slate-500 tracking-widest font-black uppercase">Mant. Anual</span>
                                    <span className="text-slate-200 font-bold text-xs">$3,800 USD</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exclusive Benefits */}
                <div className="px-4 py-8">
                    <h3 className="text-slate-100 text-xs font-black uppercase tracking-widest mb-4 flex items-center drop-shadow-sm">
                        <span className="w-1.5 h-4 bg-slate-500 rounded-full mr-2.5"></span>
                        Beneficios Platinum
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div onClick={(e) => { e.preventDefault(); window.alert('¡Servicio solicitado! Te contactaremos pronto para organizar la Recogida a Domicilio.'); }} className="relative z-20 p-4 rounded-2xl bg-[#161b2a] border border-slate-700/50 flex flex-col items-center text-center gap-3 shadow-lg hover:border-primary/50 transition-colors cursor-pointer active:scale-95">
                            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner pointer-events-none">
                                <span className="material-symbols-outlined text-[22px] text-primary">local_shipping</span>
                            </div>
                            <span className="text-[11px] uppercase tracking-wider font-black text-slate-300 pointer-events-none">Recogida a Domicilio</span>
                        </div>
                        <div onClick={(e) => { e.preventDefault(); window.alert('Lavado Detallado agendado exitosamente a tu cuenta.'); }} className="relative z-20 p-4 rounded-2xl bg-[#161b2a] border border-slate-700/50 flex flex-col items-center text-center gap-3 shadow-lg hover:border-primary/50 transition-colors cursor-pointer active:scale-95">
                            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner pointer-events-none">
                                <span className="material-symbols-outlined text-[22px] text-primary">dry_cleaning</span>
                            </div>
                            <span className="text-[11px] uppercase tracking-wider font-black text-slate-300 pointer-events-none">Lavado Detallado</span>
                        </div>
                        <div onClick={(e) => { e.preventDefault(); window.alert('Visualizando disponibilidad con Prioridad de Reservas (Platinum)...'); }} className="relative z-20 p-4 rounded-2xl bg-[#161b2a] border border-slate-700/50 flex flex-col items-center text-center gap-3 shadow-lg hover:border-primary/50 transition-colors cursor-pointer active:scale-95">
                            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner pointer-events-none">
                                <span className="material-symbols-outlined text-[22px] text-primary">event_available</span>
                            </div>
                            <span className="text-[11px] uppercase tracking-wider font-black text-slate-300 pointer-events-none">Prioridad Reservas</span>
                        </div>
                        <div onClick={(e) => { e.preventDefault(); window.alert('Abriendo estatus de tu Póliza de Seguro Extendido con cobertura global.'); }} className="relative z-20 p-4 rounded-2xl bg-[#161b2a] border border-slate-700/50 flex flex-col items-center text-center gap-3 shadow-lg hover:border-primary/50 transition-colors cursor-pointer active:scale-95">
                            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner pointer-events-none">
                                <span className="material-symbols-outlined text-[22px] text-primary drop-shadow-[0_0_5px_rgba(37,123,244,0.5)]">verified</span>
                            </div>
                            <span className="text-[11px] uppercase tracking-wider font-black text-slate-300 pointer-events-none">Seguro Extendido</span>
                        </div>
                    </div>
                </div>

                {/* Tech Support CTA */}
                <div className="px-4 pb-12">
                    <div onClick={handleWhatsAppSupport} className="relative overflow-hidden p-6 rounded-2xl bg-primary/10 border border-primary/20 text-white flex flex-col gap-4 shadow-[0_0_20px_rgba(37,123,244,0.1)] cursor-pointer active:scale-[0.98] transition-transform">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col gap-1 pointer-events-none">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary drop-shadow-sm">Soporte Dedicado</span>
                            <h3 className="text-xl font-black drop-shadow-md">Asesor Personalizado</h3>
                            <p className="text-xs font-bold text-slate-300 mt-1">Resuelve dudas sobre tu colección o agenda servicios al instante.</p>
                        </div>
                        <button className="relative z-10 w-full bg-primary hover:bg-primary/90 text-[#0a0c14] text-[13px] uppercase tracking-widest py-3 rounded-xl font-black flex items-center justify-center gap-2 mt-2 shadow-[0_0_15px_rgba(37,123,244,0.3)]">
                            <span className="material-symbols-outlined">chat</span>
                            WhatsApp VIP
                        </button>
                    </div>
                </div>
            </main>

            {/* Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto border-t border-slate-800/80 bg-[#0a1315]/95 backdrop-blur-xl px-4 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-[72px] pb-2 text-white">
                <Link to="/customer-dashboard" className="flex flex-1 flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                    <span className="material-symbols-outlined text-[24px]">dashboard</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Panel</span>
                </Link>
                <Link to="/warranties" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-primary transition-colors group">
                    <span className="material-symbols-outlined text-[22px] group-hover:-translate-y-1 transition-transform duration-300 text-slate-500 hover:text-primary">motorcycle</span>
                    <span className="text-[9px] font-black uppercase tracking-widest mt-1">Garaje</span>
                </Link>
                <Link to="/appointments" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-primary transition-colors group">
                    <span className="material-symbols-outlined text-[24px]">calendar_today</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Citas</span>
                </Link>
                <button onClick={() => window.location.reload()} className="flex flex-1 flex-col items-center justify-center gap-1.5 text-primary transition-colors">
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Cuenta</span>
                </button>
            </nav>

            {/* Rank Details Modal */}
            <RankDetailsModal isOpen={isRankModalOpen} onClose={() => setIsRankModalOpen(false)} />
        </div>
    );
};

export default ClientProfile;
