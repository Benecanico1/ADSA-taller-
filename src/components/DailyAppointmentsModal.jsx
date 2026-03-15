import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';

const DailyAppointmentsModal = ({ isOpen, onClose }) => {
    const [scheduledAppointments, setScheduledAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen) return;

        setLoading(true);
        // We look for all appointments that are in 'scheduled' status and for today
        function getLocalYYYYMMDD() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        const todayStr = getLocalYYYYMMDD();

        const q = query(collection(db, 'Appointments'),
            where('status', '==', 'scheduled'),
            where('date', '==', todayStr)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const apps = [];
            for (const document of snapshot.docs) {
                const data = document.data();

                // Fetch vehicle details
                let vehicleData = { brand: 'Moto', model: 'Desconocida', plate: '---', imageUrl: '' };
                if (data.vehicleId) {
                    try {
                        const vDoc = await getDoc(doc(db, 'Motorcycles', data.vehicleId));
                        if (vDoc.exists()) {
                            vehicleData = vDoc.data();
                        }
                    } catch (e) {
                        console.error('Error fetching vehicle:', e);
                    }
                }

                // Fetch user details to get name if possible
                let clientName = 'Cliente';
                if (data.userId) {
                    try {
                        const uDoc = await getDoc(doc(db, 'Users', data.userId));
                        if (uDoc.exists()) {
                            clientName = uDoc.data().displayName || uDoc.data().email || 'Cliente';
                        }
                    } catch (e) {
                        console.error('Error fetching user:', e);
                    }
                }

                apps.push({ id: document.id, ...data, vehicle: vehicleData, clientName });
            }

            // Sort by time
            apps.sort((a, b) => {
                const timeA = a.time || '00:00';
                const timeB = b.time || '00:00';
                return timeA.localeCompare(timeB);
            });

            setScheduledAppointments(apps);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target.id === 'daily-appointments-backdrop') {
            onClose();
        }
    };

    const validateAppointment = (appId) => {
        onClose(); // Close the modal
        navigate(`/reception/${appId}`); // Route to active reception for this specific appointment
    };

    return (
        <div
            id="daily-appointments-backdrop"
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-display"
        >
            <div className="bg-[#0a0c14] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] relative overflow-hidden">
                {/* Background Pattern */}
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

                {/* Header */}
                <div className="p-5 border-b border-slate-700/50 flex items-center justify-between bg-[#161b2a]/90 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">event_available</span>
                            Ingresos de Hoy
                        </h2>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">
                            Validación de llegada a taller
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4 relative z-10 w-full">
                    {loading ? (
                        <div className="flex-1 p-10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
                        </div>
                    ) : scheduledAppointments.length === 0 ? (
                        <div className="text-center py-12 bg-[#161b2a] border border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center">
                            <span className="material-symbols-outlined text-slate-600 text-5xl mb-4">event_busy</span>
                            <p className="text-slate-300 font-bold">No hay turnos agendados por validar</p>
                            <p className="text-xs text-slate-500 mt-2">Los turnos agendados por los clientes aparecerán aquí cuando la moto llegue al taller.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {scheduledAppointments.map((app) => (
                                <div key={app.id} className="bg-[#161b2a] border border-slate-700/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-black/30 hover:border-primary/50 transition-colors">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="size-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800 border border-slate-700/50">
                                            <img
                                                loading="lazy"
                                                className="w-full h-full object-cover"
                                                alt="Moto del Cliente"
                                                src={app.vehicle?.imageUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=200"}
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                                    {app.time}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-semibold">{app.date}</span>
                                            </div>
                                            <h4 className="font-bold text-sm text-slate-100">{app.vehicle?.brand} {app.vehicle?.model}</h4>
                                            <p className="text-[11px] text-slate-400 mt-0.5"><span className="font-semibold text-slate-300">Cliente:</span> {app.clientName}</p>
                                            <p className="text-[11px] text-slate-400"><span className="font-semibold text-slate-300">Servicio:</span> {app.serviceType}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => validateAppointment(app.id)}
                                        disabled={processingId === app.id}
                                        className="w-full sm:w-auto whitespace-nowrap bg-primary text-[#0a0c14] hover:bg-primary/90 py-2.5 px-6 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {processingId === app.id ? (
                                            <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                                        ) : (
                                            <>
                                                <span>Dar Ingreso</span>
                                                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyAppointmentsModal
