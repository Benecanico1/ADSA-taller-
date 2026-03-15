import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { addAuditLog } from '../utils/auditLogger';

const AdminAddAppointmentModal = ({ isOpen, onClose, onAppointmentAdded }) => {
    const [loading, setLoading] = useState(false);

    // Form State
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [clientType, setClientType] = useState('registered'); // 'registered' or 'guest'

    // Guest Client Data
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [guestVehicleBrand, setGuestVehicleBrand] = useState('');
    const [guestVehicleModel, setGuestVehicleModel] = useState('');

    // Registered Client Data
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedUserVehicleId, setSelectedUserVehicleId] = useState('');
    const [userVehicles, setUserVehicles] = useState([]);

    // Service Data
    const [services, setServices] = useState([]);
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [faultDescription, setFaultDescription] = useState('');

    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            try {
                // Fetch Users
                const usersSnap = await getDocs(query(collection(db, 'Users'), orderBy('email')));
                const usersList = [];
                usersSnap.forEach(doc => {
                    usersList.push({ id: doc.id, ...doc.data() });
                });
                setUsers(usersList);

                // Fetch Services
                const servicesSnap = await getDocs(collection(db, 'Services'));
                const servicesList = [];
                servicesSnap.forEach(doc => {
                    servicesList.push({ id: doc.id, ...doc.data() });
                });

                // Add fallback for custom checkup
                const fallbackFalla = {
                    id: 'revision-falla-default',
                    name: 'Revisión por Falla',
                    category: 'Diagnóstico',
                    basePrice: 50000,
                    laborCost: 0,
                    estimatedTime: 0.5,
                    requiresQuote: true,
                    description: 'Diagnóstico inicial general'
                };
                if (!servicesList.some(s => s.name === 'Revisión por Falla' || s.requiresQuote)) {
                    servicesList.push(fallbackFalla);
                }

                setServices(servicesList);
            } catch (error) {
                console.error("Error fetching data for modal:", error);
            }
        };

        fetchData();

        // Reset form
        setSelectedDate('');
        setSelectedTime('');
        setClientType('registered');
        setGuestName('');
        setGuestPhone('');
        setGuestVehicleBrand('');
        setGuestVehicleModel('');
        setSelectedUserId('');
        setSelectedUserVehicleId('');
        setUserVehicles([]);
        setSelectedServiceId('');
        setFaultDescription('');
    }, [isOpen]);

    // Fetch vehicles when a user is selected
    useEffect(() => {
        if (clientType !== 'registered' || !selectedUserId) {
            setUserVehicles([]);
            setSelectedUserVehicleId('');
            return;
        }

        const fetchUserVehicles = async () => {
            try {
                const vehiclesSnap = await getDocs(query(collection(db, 'Motorcycles')));
                const vList = [];
                vehiclesSnap.forEach(doc => {
                    const data = doc.data();
                    if (data.ownerId === selectedUserId) {
                        vList.push({ id: doc.id, ...data });
                    }
                });
                setUserVehicles(vList);
                if (vList.length === 1) setSelectedUserVehicleId(vList[0].id);
            } catch (error) {
                console.error("Error fetching user vehicles:", error);
            }
        };

        fetchUserVehicles();
    }, [selectedUserId, clientType]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedDate || !selectedTime || !selectedServiceId) {
            alert("Por favor completa la fecha, hora y servicio.");
            return;
        }

        if (clientType === 'registered' && (!selectedUserId || !selectedUserVehicleId)) {
            alert("Por favor selecciona un cliente y su vehículo.");
            return;
        }

        if (clientType === 'guest' && (!guestName || !guestVehicleBrand || !guestVehicleModel)) {
            alert("Por favor completa los datos mínimos del cliente invitado (Nombre, Marca, Modelo).");
            return;
        }

        const selectedService = services.find(s => s.id === selectedServiceId);
        if ((selectedService?.name === 'Revisión por Falla' || selectedService?.requiresQuote) && !faultDescription) {
            alert("Por favor ingresa una descripción de la falla.");
            return;
        }

        setLoading(true);

        try {
            const getServiceDetails = () => {
                if (!selectedService) return { cost: 0, time: 0 };
                const cost = (Number(selectedService.basePrice) || 0) + (Number(selectedService.laborCost) || 0);
                const time = (Number(selectedService.estimatedTime) || 0) * 60;
                return { cost, time };
            };

            const serviceDetails = getServiceDetails();
            const isGuest = clientType === 'guest';
            const selectedUser = users.find(u => u.id === selectedUserId);
            const selectedVehicle = userVehicles.find(v => v.id === selectedUserVehicleId);

            const appointmentData = {
                userId: isGuest ? 'guest' : selectedUserId,
                clientName: isGuest ? guestName : (selectedUser?.displayName || selectedUser?.fullName || selectedUser?.email || 'Usuario Registrado'),
                clientPhone: isGuest ? guestPhone : (selectedUser?.phone || ''),
                vehicleId: isGuest ? null : selectedUserVehicleId,
                vehicle: isGuest ? { brand: guestVehicleBrand, model: guestVehicleModel } : { brand: selectedVehicle?.brand, model: selectedVehicle?.model, imageUrl: selectedVehicle?.imageUrl || null },
                date: selectedDate, // YYYY-MM-DD
                time: selectedTime,
                serviceType: selectedService?.name || 'Servicio General',
                serviceId: selectedService?.id,
                faultDescription: (selectedService?.name === 'Revisión por Falla' || selectedService?.requiresQuote) ? faultDescription : null,
                totalCost: serviceDetails.cost,
                totalTime: serviceDetails.time,
                status: "scheduled",
                createdAt: new Date(),
                createdByAdmin: true
            };

            await addDoc(collection(db, "Appointments"), appointmentData);

            await addAuditLog(`Administrador agendó turno manual para ${appointmentData.clientName} (${appointmentData.vehicle?.brand || ''} ${appointmentData.vehicle?.model || ''})`, 'system', 'Admin');

            if (onAppointmentAdded) onAppointmentAdded();
            onClose();
        } catch (error) {
            console.error("Error creating manual appointment:", error);
            alert("Hubo un error al crear el turno. Verifica la consola.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const timeSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0a0c14]/90 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-[#161b2a] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col font-display overflow-hidden max-h-[90vh]">

                {/* Header */}
                <header className="p-4 border-b border-slate-700/50 bg-[#161b2a] relative shrink-0">
                    <div
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                            backgroundImage: `linear-gradient(45deg, #111 25%, transparent 25%), linear-gradient(-45deg, #111 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111 75%), linear-gradient(-45deg, transparent 75%, #111 75%)`,
                            backgroundSize: '4px 4px'
                        }}
                    ></div>
                    <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-2xl drop-shadow-[0_0_8px_rgba(255,40,0,0.8)]">add_box</span>
                            <div>
                                <h2 className="text-white text-lg font-black tracking-tight leading-tight">Añadir Turno Manual</h2>
                                <p className="text-primary text-[10px] font-bold uppercase tracking-widest">Sobreescritura de Límite Administrativo</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700 active:scale-95">
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>
                </header>

                <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                    <form id="add-manual-app-form" onSubmit={handleSubmit} className="flex flex-col gap-6">

                        {/* Fecha y Hora */}
                        <div className="bg-[#0a0c14] border border-slate-700/50 rounded-xl p-4 shadow-sm">
                            <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5"><span className="material-symbols-outlined text-primary text-sm">calendar_month</span> 1. Fecha y Hora</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Fecha</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full bg-[#161b2a] border border-slate-700 text-slate-100 rounded-lg p-2.5 text-sm outline-none focus:border-primary transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Hora (Aprox.)</label>
                                    <select
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        className="w-full bg-[#161b2a] border border-slate-700 text-slate-100 rounded-lg p-2.5 text-sm outline-none focus:border-primary transition-colors appearance-none custom-select-arrow"
                                        required
                                    >
                                        <option value="">Selecciona una franja...</option>
                                        {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Selección de Cliente */}
                        <div className="bg-[#0a0c14] border border-slate-700/50 rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-1.5"><span className="material-symbols-outlined text-primary text-sm">person</span> 2. Cliente</h3>
                                <div className="flex bg-[#161b2a] border border-slate-700 rounded-lg p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setClientType('registered')}
                                        className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md transition-colors ${clientType === 'registered' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                    >APP</button>
                                    <button
                                        type="button"
                                        onClick={() => setClientType('guest')}
                                        className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md transition-colors ${clientType === 'guest' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                    >Invitado</button>
                                </div>
                            </div>

                            {clientType === 'registered' ? (
                                <div className="flex flex-col gap-3">
                                    <select
                                        value={selectedUserId}
                                        onChange={(e) => setSelectedUserId(e.target.value)}
                                        className="w-full bg-[#161b2a] border border-slate-700 text-slate-100 rounded-lg p-2.5 text-sm outline-none focus:border-primary transition-colors appearance-none custom-select-arrow"
                                        required
                                    >
                                        <option value="">Buscar usuario registrado...</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.displayName || u.fullName || u.email} {u.phone ? `(${u.phone})` : ''}
                                            </option>
                                        ))}
                                    </select>

                                    {selectedUserId && (
                                        <select
                                            value={selectedUserVehicleId}
                                            onChange={(e) => setSelectedUserVehicleId(e.target.value)}
                                            className="w-full bg-[#161b2a] border border-slate-700 text-slate-100 rounded-lg p-2.5 text-sm outline-none focus:border-primary transition-colors appearance-none custom-select-arrow"
                                            required
                                        >
                                            <option value="">Selecciona la motocicleta de Taller...</option>
                                            {userVehicles.map(v => (
                                                <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.plate || 'Sin Patente'}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                        type="text" placeholder="Nombre completo del cliente"
                                        value={guestName} onChange={e => setGuestName(e.target.value)}
                                        className="w-full bg-[#161b2a] border border-slate-700 text-slate-100 rounded-lg p-2.5 text-sm outline-none focus:border-primary transition-colors" required
                                    />
                                    <input
                                        type="tel" placeholder="Teléfono / WhatsApp (Opcional)"
                                        value={guestPhone} onChange={e => setGuestPhone(e.target.value)}
                                        className="w-full bg-[#161b2a] border border-slate-700 text-slate-100 rounded-lg p-2.5 text-sm outline-none focus:border-primary transition-colors"
                                    />
                                    <input
                                        type="text" placeholder="Marca de Moto (ej: Honda)"
                                        value={guestVehicleBrand} onChange={e => setGuestVehicleBrand(e.target.value)}
                                        className="w-full bg-[#161b2a] border border-slate-700 text-slate-100 rounded-lg p-2.5 text-sm outline-none focus:border-primary transition-colors" required
                                    />
                                    <input
                                        type="text" placeholder="Modelo / CC (ej: CB300F)"
                                        value={guestVehicleModel} onChange={e => setGuestVehicleModel(e.target.value)}
                                        className="w-full bg-[#161b2a] border border-slate-700 text-slate-100 rounded-lg p-2.5 text-sm outline-none focus:border-primary transition-colors" required
                                    />
                                </div>
                            )}
                        </div>

                        {/* Servicio */}
                        <div className="bg-[#0a0c14] border border-slate-700/50 rounded-xl p-4 shadow-sm">
                            <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5"><span className="material-symbols-outlined text-primary text-sm">build</span> 3. Tarea o Servicio</h3>
                            <select
                                value={selectedServiceId}
                                onChange={(e) => setSelectedServiceId(e.target.value)}
                                className="w-full bg-[#161b2a] border border-slate-700 text-slate-100 rounded-lg p-2.5 text-sm outline-none focus:border-primary transition-colors appearance-none custom-select-arrow"
                                required
                            >
                                <option value="">Seleccione el trabajo requerido...</option>
                                {services.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} {s.requiresQuote ? '(Requiere Cotización)' : `($${(Number(s.basePrice || 0) + Number(s.laborCost || 0)).toLocaleString('es-AR')})`}</option>
                                ))}
                            </select>

                            {(services.find(s => s.id === selectedServiceId)?.requiresQuote || services.find(s => s.id === selectedServiceId)?.name === 'Revisión por Falla') && (
                                <textarea
                                    value={faultDescription}
                                    onChange={(e) => setFaultDescription(e.target.value)}
                                    placeholder="Describe brevemente el problema reportado o la tarea a realizar..."
                                    className="w-full mt-3 bg-[#161b2a] border border-slate-700 text-slate-100 rounded-lg p-3 text-sm outline-none focus:border-primary transition-colors resize-none min-h-[80px]"
                                    required
                                />
                            )}
                        </div>
                    </form>
                </div>

                <footer className="p-4 bg-[#0a0c14] border-t border-slate-700/50 flex justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Cancelar</button>
                    <button
                        type="submit"
                        form="add-manual-app-form"
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-[#0a0c14] font-black text-xs uppercase tracking-widest py-2.5 px-6 rounded-lg transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,40,0,0.3)] disabled:opacity-50 disabled:shadow-none"
                    >
                        {loading && <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>}
                        Agendar Turno
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AdminAddAppointmentModal;
