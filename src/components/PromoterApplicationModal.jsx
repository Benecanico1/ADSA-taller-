import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { appConfig } from '../config';

const PromoterApplicationModal = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        applicationType: 'self', // 'self' or 'other'
        suggestedName: '',
        suggestedContact: '',
        reason: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addDoc(collection(db, 'PromoterApplications'), {
                userId: currentUser.uid,
                userName: currentUser.displayName || currentUser.email.split('@')[0],
                applicationType: formData.applicationType,
                suggestedPromoterName: formData.applicationType === 'other' ? formData.suggestedName : '',
                suggestedPromoterContact: formData.applicationType === 'other' ? formData.suggestedContact : '',
                reason: formData.reason,
                status: 'pending',
                createdAt: serverTimestamp()
            });

            // Also create a notification for admins
            await addDoc(collection(db, 'Notifications'), {
                title: "Nueva Postulación de Promotor",
                message: `${currentUser.displayName || 'Un usuario'} ha enviado una sugerencia de Promotor de Rutas.`,
                createdAt: serverTimestamp(),
                readBy: [],
                icon: "campaign",
                color: "text-purple-500",
                bg: "bg-purple-500/10",
                targetRole: 'admin'
            });

            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting application:", error);
            alert("Hubo un error al enviar la sugerencia. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
                <div className="bg-[#161b2a] w-full max-w-sm rounded-3xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] p-8 text-center flex flex-col items-center">
                    <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/30">
                        <span className="material-symbols-outlined text-4xl text-emerald-500">check_circle</span>
                    </div>
                    <h3 className="text-white text-xl font-black mb-2 tracking-tight">¡Sugerencia Enviada!</h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        El equipo de {appConfig.appName} revisará la solicitud. Te contactaremos si la cuenta es verificada como Promotor Oficial.
                    </p>
                    <button
                        onClick={() => { setSubmitted(false); onClose(); }}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest text-xs py-3 rounded-xl transition-colors border border-slate-700"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
            <div className="bg-[#161b2a] w-full max-w-md rounded-3xl border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col max-h-[90vh]">

                <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#1a1f2e] sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                            <span className="material-symbols-outlined text-purple-400">campaign</span>
                        </div>
                        <div>
                            <h3 className="text-white font-black tracking-tight text-lg leading-tight">Ser Promotor</h3>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Postular organizador</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="size-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>

                <div className="p-5 overflow-y-auto no-scrollbar flex-1 relative">
                    <form id="promoterAppForm" onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <p className="text-slate-300 text-xs mb-4 leading-relaxed font-medium">
                                Los <span className="text-purple-400 font-bold">Promotores</span> tienen el permiso exclusivo para organizar y publicar Rutas Oficiales en el Feed de {appConfig.appName}.
                            </p>

                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">¿A quién deseas postular?</label>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <label className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.applicationType === 'self' ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-[#0a0c14] border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                                    <input type="radio" name="applicationType" value="self" checked={formData.applicationType === 'self'} onChange={handleChange} className="hidden" />
                                    <span className="material-symbols-outlined mb-1">person_raised_hand</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">A mi Mismo</span>
                                </label>
                                <label className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.applicationType === 'other' ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-[#0a0c14] border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                                    <input type="radio" name="applicationType" value="other" checked={formData.applicationType === 'other'} onChange={handleChange} className="hidden" />
                                    <span className="material-symbols-outlined mb-1">group_add</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">A un Amigo</span>
                                </label>
                            </div>
                        </div>

                        {formData.applicationType === 'other' && (
                            <div className="space-y-4 animate-fadeIn">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Nombre del postulado *</label>
                                    <input
                                        type="text"
                                        name="suggestedName"
                                        required
                                        value={formData.suggestedName}
                                        onChange={handleChange}
                                        placeholder="Ej: Carlos 'El Diablo' Ruiz"
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Contacto del postulado (Opcional)</label>
                                    <input
                                        type="text"
                                        name="suggestedContact"
                                        value={formData.suggestedContact}
                                        onChange={handleChange}
                                        placeholder="Instagram o Celular"
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Motivo o Experiencia *</label>
                            <textarea
                                name="reason"
                                required
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder={formData.applicationType === 'self' ? "¿Por qué te gustaría organizar rutas con nosotros?" : "¿Por qué esta persona es un buen candidato para organizar rutas?"}
                                rows="3"
                                className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium resize-none"
                            ></textarea>
                        </div>

                    </form>
                </div>

                <div className="p-5 border-t border-slate-800 bg-[#1a1f2e]">
                    <button
                        type="submit"
                        form="promoterAppForm"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                            ${loading
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] active:scale-[0.98]'
                            }
                        `}
                    >
                        {loading ? (
                            <><span className="material-symbols-outlined animate-spin">refresh</span> Enviando...</>
                        ) : (
                            <><span className="material-symbols-outlined">send</span> Enviar Solicitud</>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PromoterApplicationModal;
