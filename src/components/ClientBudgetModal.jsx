import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';

const ClientBudgetModal = ({ isOpen, onClose, appointment }) => {
    const [saving, setSaving] = useState(false);

    if (!isOpen || !appointment) return null;

    const extraLaborCost = appointment.extraLaborCost || 0;
    const extraLaborName = appointment.extraLaborName || 'Mano de Obra Adicional';
    const requestedParts = appointment.requestedParts || [];

    const calculateSubtotal = () => {
        let sum = extraLaborCost;
        requestedParts.forEach(part => {
            sum += (part.assignedPrice || 0);
        });
        return sum;
    };

    const handleApprove = async () => {
        const confirm = window.confirm("¿Estás seguro de que deseas APROBAR este presupuesto extra? El taller continuará trabajando e instalará los repuestos listados.");
        if (!confirm) return;

        setSaving(true);
        try {
            const appRef = doc(db, 'Appointments', appointment.id);
            await updateDoc(appRef, {
                authorizationStatus: 'approved',
                pendingAuthorization: false,
                status: 'working' // Resume work
            });

            // Notify Admin
            await addDoc(collection(db, 'Notifications'), {
                title: "Presupuesto Aprobado",
                message: `El cliente ${appointment.clientName || 'de la orden'} ha APROBADO el presupuesto extra para la ${appointment.vehicle?.brand || 'moto'}.`,
                targetRole: 'admin',
                createdAt: new Date(),
                readBy: [],
                icon: "verified",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10"
            });

            // Notify Mechanic
            if (appointment.mechanicId) {
                await addDoc(collection(db, 'Notifications'), {
                    title: "Presupuesto Aprobado",
                    message: `El cliente ha aprobado los repuestos para la ${appointment.vehicle?.brand || 'moto'}. Puedes continuar con el trabajo.`,
                    targetUserId: appointment.mechanicId,
                    createdAt: new Date(),
                    readBy: [],
                    icon: "build",
                    color: "text-emerald-500",
                    bg: "bg-emerald-500/10"
                });
            }

            alert("Presupuesto aprobado exitosamente. El taller ha sido notificado.");
            onClose();
        } catch (error) {
            console.error("Error approving budget:", error);
            alert("No se pudo procesar la aprobación.");
        } finally {
            setSaving(false);
        }
    };

    const handleReject = async () => {
        const confirm = window.confirm("¿Seguro que deseas RECHAZAR este presupuesto? El taller no instalará los repuestos extras y continuará solo con el trabajo original si es posible.");
        if (!confirm) return;

        setSaving(true);
        try {
            const appRef = doc(db, 'Appointments', appointment.id);
            await updateDoc(appRef, {
                authorizationStatus: 'rejected',
                pendingAuthorization: false,
                status: 'working' // Resume work without extra parts
            });

            // Notify Admin
            await addDoc(collection(db, 'Notifications'), {
                title: "Presupuesto Rechazado",
                message: `El cliente ${appointment.clientName || 'de la orden'} ha RECHAZADO la cotización extra para su ${appointment.vehicle?.brand || 'moto'}.`,
                targetRole: 'admin',
                createdAt: new Date(),
                readBy: [],
                icon: "cancel",
                color: "text-red-500",
                bg: "bg-red-500/10"
            });

            // Notify Mechanic
            if (appointment.mechanicId) {
                await addDoc(collection(db, 'Notifications'), {
                    title: "Presupuesto Rechazado",
                    message: `El cliente rechazó el presupuesto extra de repuestos para la ${appointment.vehicle?.brand || 'moto'}. Continúa solo con el trabajo base.`,
                    targetUserId: appointment.mechanicId,
                    createdAt: new Date(),
                    readBy: [],
                    icon: "cancel",
                    color: "text-red-500",
                    bg: "bg-red-500/10"
                });
            }

            alert("Presupuesto rechazado. El taller ha sido notificado.");
            onClose();
        } catch (error) {
            console.error("Error rejecting budget:", error);
            alert("No se pudo procesar el rechazo.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-slate-100 font-display">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-[#0a0c14]/90 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-[#161b2a] border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 fade-in duration-300">
                
                {/* Header */}
                <div className="p-5 border-b border-slate-700/50 flex justify-between items-center bg-[#1a2035]">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <span className="material-symbols-outlined text-amber-500">request_quote</span>
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white leading-tight">Autorización Pendiente</h2>
                            <p className="text-[10px] text-amber-500 font-bold tracking-widest uppercase mt-0.5">Se requiere tu acción</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-800 rounded-full p-2 transition-colors flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    
                    {/* Mechanic Notes Context */}
                    {appointment.diagnosisNotesList && appointment.diagnosisNotesList.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">assignment</span>
                                Diagnóstico del Taller
                            </h3>
                            <div className="bg-[#0a0c14] border border-slate-700/50 rounded-xl p-3 flex flex-col gap-2 shadow-inner">
                                {appointment.diagnosisNotesList.map(note => (
                                    <div key={note.id} className="bg-[#161b2a] p-2.5 rounded-lg border border-slate-800">
                                        <p className="text-sm text-slate-300 italic">"{note.text}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cost Breakdown */}
                    <div className="mb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">receipt_long</span>
                            Cotización Adicional
                        </h3>
                        
                        <div className="space-y-3">
                            {/* Parts List */}
                            {requestedParts.map(part => (
                                <div key={part.id} className="flex justify-between items-start bg-[#0a0c14] p-3 rounded-xl border border-slate-700/50">
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-slate-200">{part.name}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Repuesto</p>
                                    </div>
                                    <p className="font-black text-sm text-white">${(part.assignedPrice || 0).toLocaleString('es-AR')}</p>
                                </div>
                            ))}

                            {/* Extra Labor */}
                            {extraLaborCost > 0 && (
                                <div className="flex justify-between items-start bg-[#0a0c14] p-3 rounded-xl border border-slate-700/50">
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-slate-200">{extraLaborName}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Mano de Obra</p>
                                    </div>
                                    <p className="font-black text-sm text-white">${extraLaborCost.toLocaleString('es-AR')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Aumento del Presupuesto</span>
                            <span className="text-amber-500 text-2xl font-black">${calculateSubtotal().toLocaleString('es-AR')}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                            Este monto se sumará al presupuesto original contratado al agendar el servicio.
                        </p>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-[#1a2035] border-t border-slate-700/50 flex flex-col gap-3">
                    <button 
                        disabled={saving}
                        onClick={handleApprove}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0a0c14] font-black uppercase tracking-widest text-[11px] py-4 rounded-xl transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        Aprobar y Continuar Trabajo
                    </button>
                    <button 
                        disabled={saving}
                        onClick={handleReject}
                        className="w-full bg-transparent hover:bg-red-500/10 text-slate-400 hover:text-red-500 border border-slate-700 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all focus:outline-none flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                        Rechazar / Solo Trabajos Base
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientBudgetModal;
