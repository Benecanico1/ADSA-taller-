import React from 'react';

const VIPLevelCards = () => {
    return (
        <div className="w-full space-y-4">
            {/* Nivel Bronce */}
            <div className="relative overflow-hidden rounded-2xl bg-[#161b2a] border border-[#cd7f32]/30 p-5 shadow-[0_0_15px_rgba(205,127,50,0.1)]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#cd7f32]/10 blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="flex justify-between items-center mb-3 relative z-10">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#cd7f32]">stars</span>
                        <h4 className="text-white font-black text-lg">Bronce</h4>
                    </div>
                    <span className="text-xs font-bold text-slate-400">0 - 999 Pts</span>
                </div>
                <div className="space-y-2 relative z-10">
                    <div className="flex items-start gap-2 text-slate-300 text-xs">
                        <span className="material-symbols-outlined text-[#cd7f32] text-sm mt-0.5">check_circle</span>
                        <p>Acceso al Perfil VIP en la App.</p>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300 text-xs">
                        <span className="material-symbols-outlined text-[#cd7f32] text-sm mt-0.5">check_circle</span>
                        <p>Soporte vía WhatsApp.</p>
                    </div>
                </div>
            </div>

            {/* Nivel Plata */}
            <div className="relative overflow-hidden rounded-2xl bg-[#161b2a] border border-slate-300/30 p-5 shadow-[0_0_15px_rgba(203,213,225,0.1)]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-300/10 blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="flex justify-between items-center mb-3 relative z-10">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-300">stars</span>
                        <h4 className="text-white font-black text-lg">Plata</h4>
                    </div>
                    <span className="text-xs font-bold text-slate-400">1,000+ Pts</span>
                </div>
                <div className="space-y-2 relative z-10">
                    <div className="flex items-start gap-2 text-slate-300 text-xs">
                        <span className="material-symbols-outlined text-slate-300 text-sm mt-0.5">check_circle</span>
                        <p>Todos los beneficios Bronce.</p>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300 text-xs">
                        <span className="material-symbols-outlined text-slate-300 text-sm mt-0.5">check_circle</span>
                        <p><span className="font-bold text-white">Revisión Preventiva Gratis:</span> Una vez al año.</p>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300 text-xs">
                        <span className="material-symbols-outlined text-slate-300 text-sm mt-0.5">check_circle</span>
                        <p><span className="font-bold text-white">Descuento del 5%</span> en mano de obra.</p>
                    </div>
                </div>
            </div>

            {/* Nivel Oro */}
            <div className="relative overflow-hidden rounded-2xl bg-[#161b2a] border border-amber-400/30 p-5 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="flex justify-between items-center mb-3 relative z-10">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-400">workspace_premium</span>
                        <h4 className="text-white font-black text-lg drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]">Oro</h4>
                    </div>
                    <span className="text-xs font-bold text-slate-400">3,000+ Pts</span>
                </div>
                <div className="space-y-2 relative z-10">
                    <div className="flex items-start gap-2 text-slate-300 text-xs">
                        <span className="material-symbols-outlined text-amber-400 text-sm mt-0.5">check_circle</span>
                        <p>Todos los beneficios Plata.</p>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300 text-xs">
                        <span className="material-symbols-outlined text-amber-400 text-sm mt-0.5">check_circle</span>
                        <p><span className="font-bold text-white">Fast-Track:</span> Citas con alta prioridad en el taller.</p>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300 text-xs">
                        <span className="material-symbols-outlined text-amber-400 text-sm mt-0.5">check_circle</span>
                        <p><span className="font-bold text-white">Descuento del 10%</span> en refacciones seleccionadas.</p>
                    </div>
                </div>
            </div>

            {/* Nivel Platino */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#161b2a] to-[#252b3d] border border-white/40 p-5 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="flex justify-between items-center mb-3 relative z-10">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">diamond</span>
                        <h4 className="text-white font-black text-lg drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">Platino</h4>
                    </div>
                    <span className="text-xs font-black text-white bg-white/20 px-2 py-0.5 rounded">10,000+ Pts</span>
                </div>
                <div className="space-y-2 relative z-10">
                    <div className="flex items-start gap-2 text-slate-300 text-xs">
                        <span className="material-symbols-outlined text-white text-sm mt-0.5">check_circle</span>
                        <p>Todos los beneficios Oro.</p>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300 text-xs">
                        <span className="material-symbols-outlined text-white text-sm mt-0.5">check_circle</span>
                        <p><span className="font-bold text-white">Recogida VIP Gratuita:</span> Buscamos tu moto a domicilio.</p>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300 text-xs">
                        <span className="material-symbols-outlined text-white text-sm mt-0.5">check_circle</span>
                        <p><span className="font-bold text-white">Lavado Detallado:</span> Completamente gratis en cada servicio mayor.</p>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300 text-xs">
                        <span className="material-symbols-outlined text-white text-sm mt-0.5">check_circle</span>
                        <p><span className="font-bold text-white">Seguro Extendido:</span> Cobertura de garantía extendida.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VIPLevelCards;
