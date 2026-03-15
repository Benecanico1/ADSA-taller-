import React, { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../lib/AuthContext';

const LeaveFeedbackModal = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (rating === 0) {
            setError('Por favor, selecciona una calificación.');
            return;
        }

        if (comment.trim() === '') {
            setError('Por favor, escribe un breve comentario.');
            return;
        }

        setIsSubmitting(true);

        try {
            await addDoc(collection(db, "Feedbacks"), {
                userId: currentUser?.uid || 'anonymous',
                userName: currentUser?.displayName || currentUser?.email || 'Piloto Dynotech Power Garage',
                rating: rating,
                comment: comment.trim(),
                createdAt: new Date(),
                status: 'published' // Assuming auto-published for now
            });

            setSuccessMessage('¡Gracias por tu reseña! La hemos recibido con éxito.');
            setTimeout(() => {
                onClose();
                setRating(0);
                setComment('');
                setSuccessMessage('');
                setIsSubmitting(false);
            }, 2000);

        } catch (err) {
            console.error("Error submitting feedback:", err);
            setError('Hubo un error al enviar tu reseña. Por favor, intenta nuevamente.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0a0c14]/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-[#161b2a] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/30">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">rate_review</span>
                        Dejar Reseña
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-5">
                    {successMessage ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in">
                            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 ring-4 ring-emerald-500/20">
                                <span className="material-symbols-outlined text-4xl">check_circle</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">¡Completado!</h3>
                            <p className="text-slate-400 text-sm">{successMessage}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="text-center space-y-2">
                                <p className="text-sm font-semibold text-slate-300">¿Cómo evaluarías tu experiencia en Dynotech Power Garage?</p>
                                <div className="flex items-center justify-center gap-1 cursor-pointer">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="focus:outline-none transition-transform active:scale-95"
                                        >
                                            <span
                                                className="material-symbols-outlined text-4xl transition-colors drop-shadow-sm"
                                                style={{
                                                    fontVariationSettings: (hoverRating || rating) >= star ? "'FILL' 1" : "'FILL' 0",
                                                    color: (hoverRating || rating) >= star ? "#FFC107" : "#334155" // amber-400 vs slate-700
                                                }}
                                            >
                                                star
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-1">Cuéntanos más (opcional)</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="¿Qué te pareció nuestro servicio?"
                                    className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors min-h-[100px] resize-y"
                                ></textarea>
                            </div>

                            {error && (
                                <p className="text-xs font-bold text-red-500 bg-red-500/10 p-2 rounded-lg text-center border border-red-500/20">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0c14] font-bold py-3.5 rounded-xl transition-colors shadow-[0_0_15px_rgba(13,204,242,0.3)] flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">refresh</span>
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        Publicar Reseña <span className="material-symbols-outlined text-lg">send</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaveFeedbackModal;
