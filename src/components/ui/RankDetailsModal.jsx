import React from 'react';

const RankDetailsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-auto">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`relative w-full max-w-md bg-[#0a0c14] border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 transition-transform duration-300 transform ${isOpen ? 'translate-y-0' : 'translate-y-full sm:translate-y-12 sm:opacity-0'}`}>

                {/* Drag Handle (Mobile) */}
                <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-6 sm:hidden"></div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-[#161b2a] border border-slate-700/50 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                <div className="flex flex-col items-center text-center mt-2 mb-8">
                    <div className="size-16 rounded-2xl bg-primary/20 border border-primary/50 flex items-center justify-center shadow-[0_0_20px_rgba(37,123,244,0.3)] mb-4">
                        <span className="material-symbols-outlined text-4xl text-primary font-light">workspace_premium</span>
                    </div>
                    <span className="text-primary font-black tracking-widest text-[10px] uppercase mb-1">Nivel 4 Elite</span>
                    <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">Socio VIP Platinum</h2>
                    <p className="text-xs font-bold text-slate-400 mt-2 max-w-xs mx-auto">
                        Estás en el grupo más exclusivo de Dynotech. Disfruta de beneficios premium en todos tus servicios.
                    </p>
                </div>

                {/* Points Progress */}
                <div className="bg-[#161b2a] border border-slate-700/50 rounded-2xl p-5 mb-6 shadow-inner">
                    <div className="flex justify-between items-end mb-3">
                        <div>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 block mb-0.5">Puntos Actuales</span>
                            <span className="text-lg font-black text-white">15,400 <span className="text-xs text-slate-400 font-bold">Pts</span></span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-primary block mb-0.5">Siguiente Nivel</span>
                            <span className="text-lg font-black text-white">20,000 <span className="text-xs text-slate-400 font-bold">Pts</span></span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2.5 w-full bg-[#0a0c14] rounded-full overflow-hidden shadow-inner border border-slate-800">
                        <div
                            className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full relative"
                            style={{ width: '77%' }}
                        >
                            <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 blur-sm"></div>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center mt-3 font-bold tracking-wide">Te faltan 4,600 Pts para el nivel Diamante</p>
                </div>

                {/* Information Callout */}
                <div className="flex gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="material-symbols-outlined text-amber-500 shrink-0">info</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-bold">
                        Ganas puntos con cada servicio completado en nuestro garaje y refiriendo a nuevos pilotos a Dynotech.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default RankDetailsModal;
