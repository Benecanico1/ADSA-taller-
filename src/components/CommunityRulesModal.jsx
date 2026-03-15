import React from 'react';
import { appConfig } from '../config';

const CommunityRulesModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-[#0a0c10]/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-[#161b2a] border border-purple-500/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-[#0a0c10]/50 relative shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent pointer-events-none"></div>
                    <div className="flex items-center justify-center gap-3 relative z-10 w-full pt-2">
                        <span className="material-symbols-outlined text-purple-400 text-3xl">policy</span>
                        <h3 className="text-xl font-black text-white uppercase tracking-wider text-center drop-shadow-md">
                            Normas de Convivencia
                        </h3>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto no-scrollbar space-y-6">
                    <p className="text-sm text-slate-300 leading-relaxed text-center font-medium">
                        La comunidad de <span className="text-purple-400 font-bold">{appConfig.appName}</span> es un espacio para compartir nuestra pasión por las motos. Para mantener un ambiente sano, todos los miembros deben respetar las siguientes reglas:
                    </p>

                    <ul className="space-y-4">
                        <li className="flex gap-3 items-start bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                            <span className="material-symbols-outlined text-emerald-400 mt-0.5 shrink-0">handshake</span>
                            <div>
                                <h4 className="text-slate-200 font-bold text-sm tracking-wide">1. Respeto Mutuo</h4>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">No se tolerarán insultos, agresiones, ni lenguaje ofensivo hacia ningún miembro de la comunidad o administradores.</p>
                            </div>
                        </li>

                        <li className="flex gap-3 items-start bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                            <span className="material-symbols-outlined text-blue-400 mt-0.5 shrink-0">block</span>
                            <div>
                                <h4 className="text-slate-200 font-bold text-sm tracking-wide">2. Cero Spam</h4>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Prohibida la publicidad ajena, compra/venta no autorizada, o cadenas de mensajes que no aporten valor al grupo.</p>
                            </div>
                        </li>

                        <li className="flex gap-3 items-start bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                            <span className="material-symbols-outlined text-yellow-400 mt-0.5 shrink-0">verified_user</span>
                            <div>
                                <h4 className="text-slate-200 font-bold text-sm tracking-wide">3. Rutas Oficiales</h4>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Solo los <span className="text-purple-400 font-bold">Promotores Verificados</span> pueden publicar flyers de rutas oficiales que detonan alertas masqueradas.</p>
                            </div>
                        </li>

                        <li className="flex gap-3 items-start bg-slate-800/30 p-3 rounded-xl border border-slate-700/50 bg-red-500/5 border-red-500/20">
                            <span className="material-symbols-outlined text-red-500 mt-0.5 shrink-0">gavel</span>
                            <div>
                                <h4 className="text-red-400 font-bold text-sm tracking-wide">4. Moderación Estricta</h4>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Los administradores se reservan el derecho de eliminar mensajes inapropiados y suspender cuentas que violen estas normas repetidamente.</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="p-4 border-t border-slate-800/50 bg-[#0a0c10] shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-sm py-4 rounded-xl transition-colors shadow-[0_0_15px_rgba(168,85,247,0.4)] active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">thumb_up</span>
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommunityRulesModal;
