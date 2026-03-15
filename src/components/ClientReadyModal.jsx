import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';

const ClientReadyModal = ({ appointment, onClose }) => {
    const { currentUser } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!appointment) return null;

    const handleConfirmPickup = async () => {
        setIsSubmitting(true);
        try {
            // 1. Update appointment to reflect client confirmed they are on their way
            const appRef = doc(db, 'Appointments', appointment.id);
            await updateDoc(appRef, {
                clientConfirmedPickup: true,
                clientConfirmedPickupAt: new Date().toISOString()
            });

            // 2. Send notification to admins
            await addDoc(collection(db, 'Notifications'), {
                title: "Cliente en Camino",
                message: `El cliente ${appointment.clientName || 'dueño'} de la moto ${appointment.vehicle?.brand} ${appointment.vehicle?.model} ha confirmado que va en camino a retirarla.`,
                targetRole: 'admin', // This makes it visible to all admins
                createdAt: new Date(),
                readBy: [],
                icon: "directions_run",
                color: "text-blue-500",
                bg: "bg-blue-500/10",
                link: '/admin', // Navigate to kanban
                type: 'system'
            });

            onClose(); // Close modal upon success
        } catch (error) {
            console.error("Error confirming pickup:", error);
            alert("No pudimos actualizar el estado. Por favor intenta de nuevo.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#161b2a] border border-blue-500/40 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(59,130,246,0.2)] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
                {/* Header Decoration */}
                <div className="h-32 bg-gradient-to-br from-blue-900/40 to-[#161b2a] relative overflow-hidden flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay"></div>
                    <div className="relative z-10 size-20 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                        <span className="material-symbols-outlined text-4xl text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">sports_motorsports</span>
                    </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col items-center text-center">
                    <h2 className="text-2xl font-bold text-slate-100 mb-2">¡Tu moto está lista!</h2>
                    <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                        Hemos finalizado el servicio de tu <span className="font-bold text-blue-400">{appointment.vehicle?.brand} {appointment.vehicle?.model}</span>. Ya puedes pasar por el taller a retirarla cuando gustes.
                    </p>

                    <div className="w-full bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-8">
                        <div className="flex items-center gap-3 justify-center text-blue-400 mb-2">
                            <span className="material-symbols-outlined text-xl">location_on</span>
                            <span className="font-bold text-sm tracking-widest uppercase">{appConfig.companyName}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Te esperamos en la zona de entregas.</p>
                    </div>

                    <button
                        onClick={handleConfirmPickup}
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="material-symbols-outlined animate-spin hidden">progress_activity</span>
                                Procesando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined group-hover:-rotate-12 transition-transform">directions_run</span>
                                <span className="uppercase tracking-widest">Lo esperamos / Voy en camino</span>
                            </>
                        )}
                    </button>
                    
                    <button 
                        onClick={onClose}
                        className="mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-4"
                    >
                        Avisaré más tarde
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientReadyModal;
