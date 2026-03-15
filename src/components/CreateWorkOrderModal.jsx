import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const CreateWorkOrderModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form State
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    
    const [vehicleBrand, setVehicleBrand] = useState('');
    const [vehicleModel, setVehicleModel] = useState('');
    const [vehiclePlate, setVehiclePlate] = useState('');
    const [vehicleYear, setVehicleYear] = useState('');

    const [serviceType, setServiceType] = useState('');
    const [observations, setObservations] = useState('');

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!clientName || !vehicleBrand || !vehicleModel || !vehiclePlate || !serviceType) {
            alert("Por favor completa los campos obligatorios (*).");
            return;
        }

        setLoading(true);

        try {
            // Create a new manual appointment/work order
            const newOrder = {
                userId: 'manual_entry', // Flag to indicate it's not a registered user necessarily
                clientName: clientName.trim(),
                clientPhone: clientPhone.trim(),
                clientEmail: clientEmail.trim(),
                vehicleId: 'manual_entry',
                vehicle: {
                    brand: vehicleBrand.trim(),
                    model: vehicleModel.trim(),
                    plate: vehiclePlate.trim().toUpperCase(),
                    year: vehicleYear.trim(),
                    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop' // Default image
                },
                serviceType: serviceType.trim(),
                observations: observations.trim(),
                status: 'pending', // Will show up in 'Por Iniciar' on Kanban
                date: new Date().toLocaleDateString('es-AR'),
                time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
                createdAt: serverTimestamp(),
                isManual: true
            };

            const docRef = await addDoc(collection(db, 'Appointments'), newOrder);

            await addAuditLog(`Creó Orden de Trabajo manual para ${clientName.trim()}`, 'system', 'Administrador/Mecánico');

            alert('Orden de Trabajo creada exitosamente.');
            onClose();
            // Redirect to reception to complete checklist if desired
            navigate(`/reception/${docRef.id}`);
            
        } catch (error) {
            console.error("Error creating work order:", error);
            alert("Error al crear la orden de trabajo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0c14]/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div className="bg-[#161b2a] border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl shadow-black/50 overflow-hidden transform transition-all animate-in slide-in-from-bottom-8 duration-300">

                <div className="sticky top-0 bg-[#161b2a]/90 backdrop-blur-md p-6 border-b border-slate-700/50 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">post_add</span>
                            Nueva Orden de Trabajo
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">Ingreso manual de motos al taller</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors p-2 bg-slate-800/50 rounded-lg"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Client Info */}
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-slate-700 pb-2">1. Datos del Cliente</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre Completo *</label>
                                    <input 
                                        type="text" 
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Ej: Juan Pérez"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Teléfono (WhatsApp)</label>
                                    <input 
                                        type="tel" 
                                        value={clientPhone}
                                        onChange={(e) => setClientPhone(e.target.value)}
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Ej: +54 9 11 1234-5678"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Correo Electrónico</label>
                                    <input 
                                        type="email" 
                                        value={clientEmail}
                                        onChange={(e) => setClientEmail(e.target.value)}
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Ej: juan@email.com"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Vehicle Info */}
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-slate-700 pb-2">2. Datos del Vehículo</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="col-span-2 md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Marca *</label>
                                    <input 
                                        type="text" 
                                        value={vehicleBrand}
                                        onChange={(e) => setVehicleBrand(e.target.value)}
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Ej: Honda"
                                        required
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Modelo *</label>
                                    <input 
                                        type="text" 
                                        value={vehicleModel}
                                        onChange={(e) => setVehicleModel(e.target.value)}
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Ej: CB 500F"
                                        required
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Placa / Dominio *</label>
                                    <input 
                                        type="text" 
                                        value={vehiclePlate}
                                        onChange={(e) => setVehiclePlate(e.target.value)}
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white uppercase focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Ej: A000BBB"
                                        required
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Año</label>
                                    <input 
                                        type="number" 
                                        value={vehicleYear}
                                        onChange={(e) => setVehicleYear(e.target.value)}
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Ej: 2021"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Service Info */}
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-slate-700 pb-2">3. Detalle del Servicio</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tipo de Servicio *</label>
                                    <input 
                                        type="text" 
                                        value={serviceType}
                                        onChange={(e) => setServiceType(e.target.value)}
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Ej: Service General, Cambio de Aceite, Diagnóstico..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Observaciones / Motivo de Ingreso</label>
                                    <textarea 
                                        value={observations}
                                        onChange={(e) => setObservations(e.target.value)}
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none min-h-[100px]"
                                        placeholder="Detalles sobre fallas, raspones previos, requerimientos del cliente..."
                                    ></textarea>
                                </div>
                            </div>
                        </section>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 bg-transparent border border-slate-600 hover:bg-slate-800 text-slate-300 font-bold rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-background-dark font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(255,40,0,0.3)] flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="material-symbols-outlined animate-spin">refresh</span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">save</span>
                                        Crear e Iniciar OT
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateWorkOrderModal;
