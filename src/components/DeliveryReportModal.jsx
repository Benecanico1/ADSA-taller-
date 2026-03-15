import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { appConfig } from '../config';

const DeliveryReportModal = ({ isOpen, onClose, appointmentId }) => {
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);
    const [editableRecs, setEditableRecs] = useState('');
    const [isEditingRecs, setIsEditingRecs] = useState(false);

    useEffect(() => {
        if (!isOpen || !appointmentId) return;

        setLoading(true);
        const docRef = doc(db, 'Appointments', appointmentId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setAppointment({ id: docSnap.id, ...data });
                if (data.finalRecommendations && !isEditingRecs) {
                    setEditableRecs(data.finalRecommendations);
                }
            } else {
                setAppointment(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [isOpen, appointmentId]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target.id === 'delivery-modal-backdrop') {
            onClose();
        }
    };

    const formatDate = (dateInput) => {
        if (!dateInput) return '---';
        const dateObj = new Date(dateInput);
        if (isNaN(dateObj.getTime())) return dateInput;
        return dateObj.toLocaleDateString('es-AR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleGenerateRecommendations = async () => {
        setIsGeneratingRecs(true);
        try {
            const contextStr = appointment?.vehicle 
                ? `${appointment.vehicle.brand} ${appointment.vehicle.model} (${appointment.vehicle.mileage || 'N/A'}km)` 
                : 'Vehículo desconocido';

            const repairStepsStr = appointment?.repairSteps?.map(s => s.label).join(', ') || 'Revisión general';
            const diagnosisStr = appointment?.diagnosisNotes || 'No hay notas de diagnóstico';
            
            const assist = httpsCallable(functions, 'generateDeliveryRecommendations');
            const res = await assist({
                vehicleContext: contextStr,
                repairDetails: `Trabajos: ${repairStepsStr}. \nDiagnóstico previo: ${diagnosisStr}`
            });

            if (res.data && res.data.response) {
                setEditableRecs(res.data.response);
                setIsEditingRecs(true);
                // Auto-save:
                await updateDoc(doc(db, 'Appointments', appointmentId), {
                    finalRecommendations: res.data.response
                });
            }
        } catch (error) {
            console.error("Error generating recommendations:", error);
            alert("Hubo un error al generar las recomendaciones.");
        } finally {
            setIsGeneratingRecs(false);
        }
    };

    const handleSaveRecommendations = async () => {
        try {
            await updateDoc(doc(db, 'Appointments', appointmentId), {
                finalRecommendations: editableRecs
            });
            setIsEditingRecs(false);
        } catch (error) {
            console.error("Error saving recommendations", error);
        }
    };

    return (
        <div
            id="delivery-modal-backdrop"
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-display print:bg-white print:absolute print:inset-0 print:p-0"
        >
            <div className="bg-white text-slate-900 border border-slate-300 w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden flex flex-col h-[95vh] md:h-auto md:max-h-[90vh] print:shadow-none print:border-none print:h-auto print:max-h-none print:bg-white print:w-full print:max-w-none">
                
                {/* Header (No interactivo, de solo lectura / impresión) */}
                <div className="p-5 border-b border-slate-300 flex items-center justify-between bg-white sticky top-0 z-10 print:static">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2 text-slate-900">
                            <span className="material-symbols-outlined text-primary text-2xl print:text-black">history_edu</span>
                            Reporte Final de Entrega
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">Taller Automotriz: {appConfig.companyName}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 border px-3 py-1 bg-slate-100 rounded text-sm font-black text-slate-700">
                            OT #{appointmentId?.slice(-4).toUpperCase() || '---'}
                        </div>
                        <div className="flex items-center gap-2 print:hidden">
                            <button
                                onClick={() => window.print()}
                                className="px-3 py-1.5 rounded bg-primary text-white hover:bg-primary/90 font-bold transition-colors text-xs uppercase tracking-widest flex items-center gap-1 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[16px]">print</span>
                                Imprimir
                            </button>
                            <button
                                onClick={onClose}
                                className="px-3 py-1.5 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold transition-colors text-xs flex items-center gap-1"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 p-10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
                    </div>
                ) : !appointment ? (
                    <div className="flex-1 p-10 flex items-center justify-center text-red-500">
                        Error al cargar datos del reporte.
                    </div>
                ) : (
                    <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 print:overflow-visible print:px-2 print:py-4 bg-white">

                        {/* Bloque 1: Resumen de Cita y Cliente */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col border border-slate-200 p-4 rounded-md">
                                <span className="text-[10px] uppercase font-bold text-slate-400 mb-2">Datos del Cliente</span>
                                <h3 className="text-lg font-black text-slate-800">{appointment.clientName || 'Sin Nombre'}</h3>
                                <p className="text-sm font-medium text-slate-600 mt-1">Tel: {appointment.clientPhone || '---'}</p>
                                <p className="text-xs text-slate-500 italic mt-auto pt-2 border-t border-slate-100">{appointment.userEmail || '---'}</p>
                            </div>

                            <div className="flex flex-col border border-slate-200 p-4 rounded-md">
                                <span className="text-[10px] uppercase font-bold text-slate-400 mb-2">Vehículo Registrado</span>
                                <h3 className="text-lg font-black text-slate-800">{appointment.vehicle?.brand} {appointment.vehicle?.model}</h3>
                                <div className="flex items-center justify-between text-sm font-medium text-slate-600 mt-1">
                                    <span>Año: {appointment.vehicle?.year || '---'}</span>
                                    {appointment.vehicle?.patent && (
                                        <span className="bg-slate-100 px-2 rounded border border-slate-300 tracking-widest font-mono">
                                            {appointment.vehicle.patent}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bloque 2: Fechas y Motivo Original */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-md">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-slate-400">Tipo de Servicio</span>
                                    <span className="text-sm font-bold text-slate-800">{appointment.serviceType || '---'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-slate-400">Fecha Cita Original</span>
                                    <span className="text-sm font-medium text-slate-700">{formatDate(appointment.date)}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-slate-400">Técnico Asignado</span>
                                    <span className="text-sm font-medium text-slate-700">{appointment.mechanicName || 'Sin Asignar'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-slate-400">Estado</span>
                                    <span className="text-sm font-bold text-emerald-600 uppercase">Entregado / Listo</span>
                                </div>
                            </div>
                            
                            <div className="border-t border-slate-200 pt-3">
                                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Notas del Cliente en Recepción:</span>
                                <p className="text-sm text-slate-600 bg-white p-2 rounded border border-slate-100 italic">
                                    "{appointment.notes || 'No se registraron notas en la recepción.'}"
                                </p>
                            </div>
                        </div>

                        {/* Bloque 3: Checklist Diagnóstico Médico */}
                        <div className="border border-slate-200 rounded-md overflow-hidden">
                            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                                    Chequeo Inicial del Vehículo
                                </h4>
                            </div>
                            <div className="p-4 bg-white grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                                <div>
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Líquido Refrigerante</span>
                                    <span className="text-sm font-medium text-slate-800">{appointment.liquidoRefrigerante || '---'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Líquido Gasolina</span>
                                    <span className="text-sm font-medium text-slate-800">{appointment.liquidoGasolina || '---'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Líquido de Frenos</span>
                                    <span className="text-sm font-medium text-slate-800">{appointment.liquidoFrenos || '---'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Presión Llantas</span>
                                    <span className="text-sm font-medium text-slate-800">{appointment.presionLlantas || '---'}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Estado General de Plásticos</span>
                                    <span className="text-sm font-medium text-slate-800">{appointment.estadoPlasticos || '---'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bloque 4: Hallazgos y Diagnósticos */}
                        <div className="border border-slate-200 rounded-md overflow-hidden">
                            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">plumbing</span>
                                    Hallazgos y Observaciones Técnicas
                                </h4>
                            </div>
                            <div className="p-4 bg-white">
                                {(appointment.diagnosisNotesList?.length > 0 || appointment.diagnosisNotes) ? (
                                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                                        {appointment.diagnosisNotes && (
                                            <li><span className="font-medium mr-1">Observación Gral:</span> {appointment.diagnosisNotes}</li>
                                        )}
                                        {appointment.diagnosisNotesList?.map(note => (
                                            <li key={note.id}>
                                                {note.text} 
                                                <span className="text-[10px] text-slate-400 ml-2">({formatDate(note.timestamp)})</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No se registraron observaciones formales en el diagnóstico.</p>
                                )}
                            </div>
                        </div>

                        {/* Bloque 5: Reparaciones Completadas (Tareas) e Insumos */}
                        <div className="border border-slate-200 rounded-md overflow-hidden">
                            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                    Tareas Ejecutadas y Repuestos
                                </h4>
                            </div>
                            <div className="p-0 bg-white">
                                {appointment.repairSteps?.length > 0 ? (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-2 font-bold w-12">Est.</th>
                                                <th className="px-4 py-2 font-bold">Descripción de Tarea</th>
                                                <th className="px-4 py-2 font-bold w-32 hidden sm:table-cell">Registrado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {appointment.repairSteps.map(step => (
                                                <tr key={step.id} className="border-b border-slate-100 last:border-0">
                                                    <td className="px-4 py-2 text-center text-slate-400 font-bold">
                                                        {step.completed ? '[x]' : '[ ]'}
                                                    </td>
                                                    <td className={`px-4 py-2 font-medium ${step.completed ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                                                        {step.label}
                                                    </td>
                                                    <td className="px-4 py-2 text-[10px] text-slate-400 hidden sm:table-cell">
                                                        {formatDate(step.timestamp)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="p-4 text-sm text-slate-500 italic border-b border-slate-100">No hay tareas escalonadas en el historial de reparación.</p>
                                )}

                                {appointment.requestedParts?.length > 0 && (
                                    <div className="p-4 bg-slate-50/50 mt-2">
                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">inventory_2</span>
                                            Insumos Solicitados para OT
                                        </h5>
                                        <div className="flex flex-wrap gap-2">
                                            {appointment.requestedParts.map(part => (
                                                <span key={part.id} className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded text-xs font-medium">
                                                    {part.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bloque 6: Recomendaciones Finales (con IA) */}
                        <div className="border border-slate-200 rounded-md overflow-hidden bg-emerald-50/30">
                            <div className="bg-emerald-100/50 px-4 py-3 border-b border-emerald-200 flex items-center justify-between">
                                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">verified_user</span>
                                    Recomendaciones Post-Servicio
                                </h4>
                                <div className="flex gap-2 print:hidden">
                                    {isEditingRecs ? (
                                        <button onClick={handleSaveRecommendations} className="bg-emerald-600 text-white px-3 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 hover:bg-emerald-700">
                                            <span className="material-symbols-outlined text-[14px]">save</span> Guardar
                                        </button>
                                    ) : (
                                        <button onClick={() => setIsEditingRecs(true)} className="bg-white border border-emerald-300 text-emerald-700 px-3 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 hover:bg-emerald-50">
                                            <span className="material-symbols-outlined text-[14px]">edit</span> Editar
                                        </button>
                                    )}
                                    <button 
                                        onClick={handleGenerateRecommendations}
                                        disabled={isGeneratingRecs}
                                        className="bg-primary text-white px-3 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {isGeneratingRecs ? (
                                            <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                                        )}
                                        {editableRecs ? 'Re-Generar' : 'Generar IA'}
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                {isEditingRecs ? (
                                    <textarea
                                        value={editableRecs}
                                        onChange={(e) => setEditableRecs(e.target.value)}
                                        className="w-full bg-white border border-emerald-200 rounded p-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 min-h-[120px]"
                                        placeholder="Escribe recomendaciones técnicas y de mantenimiento..."
                                    />
                                ) : (
                                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed min-h-[40px]">
                                        {editableRecs ? editableRecs : <span className="italic text-slate-400">Sin recomendaciones registradas. Usa la IA para crear un reporte profesional.</span>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bloque Final: Firmas */}
                        <div className="mt-8 pt-6 border-t border-slate-800 border-dashed grid grid-cols-2 gap-8 print:break-inside-avoid">
                            <div className="flex flex-col items-center">
                                <div className="w-48 border-b-2 border-slate-400 h-16"></div>
                                <span className="text-xs font-bold text-slate-600 uppercase mt-2">Firma del Taller</span>
                                <span className="text-[10px] text-slate-400 mt-1">{appConfig.companyName}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-48 border-b-2 border-slate-400 h-16"></div>
                                <span className="text-xs font-bold text-slate-600 uppercase mt-2">Conformidad del Cliente</span>
                                <span className="text-[10px] text-slate-400 mt-1">{appointment.clientName?.slice(0, 20)}</span>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryReportModal;
