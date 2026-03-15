import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '../components/ui/BottomNav';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useNotifications } from '../lib/NotificationContext';

const Appointments = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { togglePanel } = useNotifications();

    // State
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedDate, setSelectedDate] = useState(9); // Default to the mocked "9" day
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedService, setSelectedService] = useState('Mantenimiento General');
    const [faultDescription, setFaultDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const handleMonthChange = (direction) => {
        alert(direction === 'prev' ? 'Septiembre 2023 no disponible.' : 'Horarios de Noviembre 2023 aún no abiertos.');
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (!currentUser) return;
            try {
                const q = query(collection(db, "Motorcycles"), where("ownerId", "==", currentUser.uid));
                const querySnapshot = await getDocs(q);
                const bikes = [];
                querySnapshot.forEach((doc) => {
                    bikes.push({ id: doc.id, ...doc.data() });
                });
                setVehicles(bikes);
                if (bikes.length > 0) setSelectedVehicle(bikes[0].id);
            } catch (error) {
                console.error("Error fetching vehicles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [currentUser]);

    const handleConfirm = async () => {
        if (!selectedVehicle || !selectedDate || !selectedTime) {
            alert('Por favor selecciona una moto, fecha y hora.');
            return;
        }
        if (selectedService === 'Revisión por Falla' && !faultDescription.trim()) {
            alert('Por favor describe la falla que presenta tu moto.');
            return;
        }

        setSaving(true);
        try {
            const appointmentDate = `2023-10-${selectedDate.toString().padStart(2, '0')}`;

            // Limit to 8 appointments per day
            const q8 = query(collection(db, "Appointments"), where("date", "==", appointmentDate));
            const querySnapshot8 = await getDocs(q8);
            if (querySnapshot8.size >= 8) {
                alert('Lo sentimos, ya no hay citas disponibles para este día. Por favor selecciona otra fecha.');
                setSaving(false);
                return;
            }

            // Limit one appointment per user per day
            const qUser = query(collection(db, "Appointments"), where("date", "==", appointmentDate), where("userId", "==", currentUser.uid));
            const querySnapshotUser = await getDocs(qUser);
            if (!querySnapshotUser.empty) {
                alert('Ya tienes una cita agendada para este día. Solo puedes tener una cita diaria por cuenta.');
                setSaving(false);
                return;
            }

            // Save appointment
            await addDoc(collection(db, "Appointments"), {
                userId: currentUser.uid,
                vehicleId: selectedVehicle,
                date: appointmentDate,
                time: selectedTime,
                serviceType: selectedService,
                faultDescription: selectedService === 'Revisión por Falla' ? faultDescription : null,
                status: "pending",
                createdAt: new Date()
            });

            // Generate .ics file
            const eventTitle = `Cita: ${selectedService}`;
            const eventDetails = selectedService === 'Revisión por Falla' ? `Detalle de la falla: ${faultDescription}\n\nDynotech Power Garage` : `Servicio en Dynotech Power Garage`;
            const eventDateStr = `202310${selectedDate.toString().padStart(2, '0')}`;

            let hour = parseInt(selectedTime.split(':')[0]);
            if (selectedTime.includes('PM') && hour !== 12) hour += 12;
            const startHour = hour.toString().padStart(2, '0');
            const endHour = (hour + 1).toString().padStart(2, '0');

            const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Dynotech Garage//ES
BEGIN:VEVENT
UID:${new Date().getTime()}@dynotechgarage.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${eventDateStr}T${startHour}0000Z
DTEND:${eventDateStr}T${endHour}0000Z
SUMMARY:${eventTitle}
DESCRIPTION:${eventDetails}
END:VEVENT
END:VCALENDAR`;

            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'cita_dynotech.ics');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert('¡Cita agendada con éxito!');
            navigate('/dashboard');
        } catch (error) {
            console.error("Error saving appointment:", error);
            alert('Hubo un error al agendar la cita.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-[#0a0c14] text-slate-100 min-h-screen flex flex-col font-display max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
            {/* Carbon Pattern Background */}
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

            {/* Header & Progress Bar */}
            <header className="sticky top-0 z-50 bg-[#161b2a]/80 backdrop-blur-md border-b border-slate-800 shadow-sm">
                <div className="flex items-center p-4 justify-between">
                    <Link to="/customer-dashboard" className="flex size-10 items-center justify-center rounded-full bg-[#161b2a] border border-slate-700/80 hover:border-primary/50 transition-colors shadow-inner">
                        <span className="material-symbols-outlined text-primary">arrow_back_ios_new</span>
                    </Link>
                    <div className="text-center">
                        <h2 className="text-lg font-black leading-tight tracking-tight text-white drop-shadow-md">Agendar Cita</h2>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-0.5">Dynotech Power Garage</p>
                    </div>
                    <button onClick={togglePanel} className="size-10 flex items-center justify-center rounded-full bg-[#161b2a] border border-slate-700/80 hover:border-primary/50 transition-colors shadow-inner">
                        <span className="material-symbols-outlined text-primary">notifications</span>
                    </button>
                </div>

                <div className="px-4 pb-4">
                    <div className="flex justify-between items-end mb-2">
                        <p className="text-primary text-xs font-semibold uppercase tracking-wider">Paso 2 de 4</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">Fecha y Hora</p>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-1/2 shadow-[0_0_10px_rgba(37,123,244,0.5)]"></div>
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex-1 overflow-y-auto px-4 py-6 space-y-8 pb-32">
                {/* Bike Selector */}
                <section>
                    <h3 className="text-slate-100 text-xs font-black uppercase tracking-widest mb-4 flex items-center drop-shadow-sm">
                        <span className="w-1.5 h-4 bg-primary rounded-full mr-2.5 shadow-[0_0_8px_rgba(13,204,242,0.8)]"></span>
                        Selecciona tu Moto
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {loading ? (
                            <span className="text-xs text-slate-500">Cargando...</span>
                        ) : vehicles.length > 0 ? (
                            vehicles.map((bike) => (
                                <button
                                    key={bike.id}
                                    onClick={() => setSelectedVehicle(bike.id)}
                                    className={`flex flex-col items-center shrink-0 group transition-all ${selectedVehicle === bike.id ? '' : 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100'}`}
                                >
                                    <div className={`size-16 rounded-full p-0.5 border-2 mb-2 ${selectedVehicle === bike.id ? 'border-primary shadow-[0_0_15px_rgba(37,123,244,0.3)]' : 'border-transparent'}`}>
                                        <div
                                            className="size-full rounded-full bg-cover bg-center"
                                            style={{ backgroundImage: `url('${bike.imageUrl || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=200'}')` }}
                                        ></div>
                                    </div>
                                    <span className={`text-xs font-bold ${selectedVehicle === bike.id ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {bike.brand} {bike.model}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <span className="text-xs text-slate-500">No tienes motos registradas</span>
                        )}
                        <button onClick={() => navigate('/add-motorcycle')} className="flex flex-col items-center shrink-0 hover:opacity-80 transition-opacity">
                            <div className="size-16 rounded-full border-2 border-dashed border-slate-400 dark:border-slate-700 flex items-center justify-center mb-2 hover:border-primary hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors">add</span>
                            </div>
                            <span className="text-xs font-medium text-slate-400">Nueva</span>
                        </button>
                    </div>
                </section>

                {/* Calendar Section */}
                <section className="bg-[#161b2a] border border-slate-700/50 rounded-2xl p-4 shadow-lg shadow-black/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-100">Octubre 2023</h3>
                        <div className="flex gap-2">
                            <button onClick={() => handleMonthChange('prev')} className="p-1.5 rounded-lg border border-slate-700/50 hover:bg-slate-800/50 transition-colors shadow-inner"><span className="material-symbols-outlined text-sm text-primary">chevron_left</span></button>
                            <button onClick={() => handleMonthChange('next')} className="p-1.5 rounded-lg border border-slate-700/50 hover:bg-slate-800/50 transition-colors shadow-inner"><span className="material-symbols-outlined text-sm text-primary">chevron_right</span></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center">
                        <span className="text-[9px] font-bold tracking-widest text-slate-500">LUN</span>
                        <span className="text-[9px] font-bold tracking-widest text-slate-500">MAR</span>
                        <span className="text-[9px] font-bold tracking-widest text-slate-500">MIÉ</span>
                        <span className="text-[9px] font-bold tracking-widest text-slate-500">JUE</span>
                        <span className="text-[9px] font-bold tracking-widest text-slate-500">VIE</span>
                        <span className="text-[9px] font-bold tracking-widest text-slate-500">SÁB</span>
                        <span className="text-[9px] font-bold tracking-widest text-slate-500">DOM</span>

                        <button className="aspect-square flex items-center justify-center rounded-xl text-slate-400 opacity-30 text-sm">25</button>
                        <button className="aspect-square flex items-center justify-center rounded-xl text-slate-400 opacity-30 text-sm">26</button>
                        {[1, 2, 3, 4].map(day => (
                            <button key={day} onClick={() => setSelectedDate(day)} className={`aspect-square flex items-center justify-center rounded-xl text-sm transition-colors ${selectedDate === day ? 'bg-primary text-white font-bold shadow-[0_0_20px_rgba(37,123,244,0.4)]' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}`}>{day}</button>
                        ))}
                        <button onClick={() => setSelectedDate(5)} className={`aspect-square flex items-center justify-center rounded-xl text-sm transition-colors ${selectedDate === 5 ? 'bg-primary text-white font-bold shadow-[0_0_20px_rgba(37,123,244,0.4)]' : 'text-slate-500 opacity-50'}`}>5</button>
                        {[6, 7, 8].map(day => (
                            <button key={day} onClick={() => setSelectedDate(day)} className={`aspect-square flex items-center justify-center rounded-xl text-sm transition-colors ${selectedDate === day ? 'bg-primary text-white font-bold shadow-[0_0_20px_rgba(37,123,244,0.4)]' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}`}>{day}</button>
                        ))}
                        <button onClick={() => setSelectedDate(9)} className={`aspect-square flex items-center justify-center rounded-xl text-sm transition-colors ${selectedDate === 9 ? 'bg-primary text-white font-bold shadow-[0_0_20px_rgba(37,123,244,0.4)]' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}`}>9</button>
                        {[10, 11].map(day => (
                            <button key={day} onClick={() => setSelectedDate(day)} className={`aspect-square flex items-center justify-center rounded-xl text-sm transition-colors ${selectedDate === day ? 'bg-primary text-white font-bold shadow-[0_0_20px_rgba(37,123,244,0.4)]' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}`}>{day}</button>
                        ))}
                        <button onClick={() => setSelectedDate(12)} className={`aspect-square flex items-center justify-center rounded-xl text-sm transition-colors ${selectedDate === 12 ? 'bg-primary text-white font-bold shadow-[0_0_20px_rgba(37,123,244,0.4)]' : 'text-slate-500 opacity-50'}`}>12</button>
                    </div>
                </section>

                {/* Service Selection */}
                <section className="space-y-4 pt-2">
                    <h3 className="text-slate-100 text-xs font-black uppercase tracking-widest mb-4 flex items-center drop-shadow-sm">
                        <span className="w-1.5 h-4 bg-primary rounded-full mr-2.5 shadow-[0_0_8px_rgba(13,204,242,0.8)]"></span>
                        Tipo de Servicio
                    </h3>
                    <div className="flex flex-col gap-3">
                        {['Mantenimiento General', 'Servicio Preventivo', 'Revisión por Falla'].map(service => (
                            <button
                                key={service}
                                onClick={() => setSelectedService(service)}
                                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all shadow-sm ${selectedService === service
                                    ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(37,123,244,0.15)]'
                                    : 'border-slate-700/50 bg-[#161b2a] hover:border-slate-500 text-slate-300'
                                    }`}
                            >
                                <div className={`flex items-center justify-center size-5 rounded-full border ${selectedService === service ? 'border-primary' : 'border-slate-600'}`}>
                                    {selectedService === service && <div className="size-2.5 rounded-full bg-primary shadow-[0_0_5px_rgba(37,123,244,0.8)]" />}
                                </div>
                                <span className="text-[13px] font-black tracking-wide">{service}</span>
                            </button>
                        ))}
                    </div>

                    {selectedService === 'Revisión por Falla' && (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest pl-1">
                                Describe la falla de la moto
                            </label>
                            <textarea
                                value={faultDescription}
                                onChange={(e) => setFaultDescription(e.target.value)}
                                placeholder="Ej: La moto se apaga al frenar, ruido extraño en el motor..."
                                className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl p-4 text-sm focus:outline-none focus:border-primary/50 transition-all min-h-[100px] resize-none text-slate-100 placeholder:text-slate-500 shadow-inner"
                            ></textarea>
                        </div>
                    )}
                </section>

                {/* Time Slots */}
                <section className="space-y-6 pt-2">
                    <div className="bg-[#161b2a] border border-slate-700/50 rounded-2xl p-4 shadow-lg shadow-black/50">
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-700/50 pb-3">
                            <span className="material-symbols-outlined text-amber-400 text-xl drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">light_mode</span>
                            <h3 className="text-[11px] uppercase tracking-widest font-black text-slate-200">Mañana</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'].map(time => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`py-3 px-2 rounded-xl border text-[11px] font-black tracking-wider transition-all shadow-sm active:scale-95 ${selectedTime === time
                                        ? 'border-primary/50 bg-primary/20 text-primary shadow-inner'
                                        : 'border-slate-700/50 text-slate-400 bg-[#0a0c14] hover:border-slate-500 hover:text-slate-200'
                                        }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-[#161b2a] border border-slate-700/50 rounded-2xl p-4 shadow-lg shadow-black/50">
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-700/50 pb-3">
                            <span className="material-symbols-outlined text-indigo-400 text-xl drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]">dark_mode</span>
                            <h3 className="text-[11px] uppercase tracking-widest font-black text-slate-200">Tarde</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {['02:00 PM', '03:00 PM', '04:00 PM'].map(time => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`py-3 px-2 rounded-xl border text-[11px] font-black tracking-wider transition-all shadow-sm active:scale-95 ${selectedTime === time
                                        ? 'border-primary/50 bg-primary/20 text-primary shadow-inner'
                                        : 'border-slate-700/50 text-slate-400 bg-[#0a0c14] hover:border-slate-500 hover:text-slate-200'
                                        }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Service Summary Card */}
                <section className="bg-primary/5 border border-primary/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <div>
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Resumen de Servicio</h4>
                            <p className="text-[13px] font-black tracking-wide text-white drop-shadow-md">{selectedService}</p>
                        </div>
                        <div className="bg-[#161b2a] border border-slate-700 p-2.5 rounded-xl shadow-inner">
                            <span className="material-symbols-outlined text-primary text-lg drop-shadow-[0_0_5px_rgba(37,123,244,0.5)]">build</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-5 text-[11px] font-bold tracking-wider text-slate-400 mt-4 border-t border-slate-800/50 pt-3 relative z-10">
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px] text-slate-500">schedule</span>
                            <span>90 MIN</span>
                        </div>
                        <div className="flex items-center gap-1.5 border-l border-slate-700/50 pl-5">
                            <span className="material-symbols-outlined text-[15px] text-slate-500">payments</span>
                            <span className="text-white">$120.000 COP</span>
                        </div>
                    </div>
                </section>
            </main>

            {/* Bottom Action & Navigation */}
            <footer className="relative z-20 mt-auto bg-[#161b2a]/95 backdrop-blur-md border-t border-slate-800">
                <div className="p-4 bg-[#0a0c14]">
                    <button
                        onClick={handleConfirm}
                        disabled={saving}
                        className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-4 bg-primary text-[#0a0c14] text-[13px] font-black tracking-widest hover:bg-primary/90 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(13,204,242,0.3)] uppercase disabled:opacity-50 disabled:shadow-none"
                    >
                        {saving ? (
                            <span className="material-symbols-outlined animate-spin shadow-none">sync</span>
                        ) : (
                            `Confirmar Cita para el ${selectedDate.toString().padStart(2, '0')} Oct`
                        )}
                        {!saving && <span className="material-symbols-outlined ml-2 text-lg">check_circle</span>}
                    </button>
                </div>
            </footer>

            <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto border-t border-slate-800/80 bg-[#0a1315]/95 backdrop-blur-xl px-4 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-[72px] pb-2 text-white">
                <Link to="/customer-dashboard" className="flex flex-1 flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                    <span className="material-symbols-outlined text-[24px]">dashboard</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Panel</span>
                </Link>
                <Link to="/warranties" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-primary transition-colors group">
                    <span className="material-symbols-outlined text-[22px] group-hover:-translate-y-1 transition-transform duration-300 text-slate-500 hover:text-primary">motorcycle</span>
                    <span className="text-[9px] font-black uppercase tracking-widest mt-1">Garaje</span>
                </Link>
                <button onClick={() => window.location.reload()} className="flex flex-col items-center justify-center w-full h-full text-primary transition-colors group">
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Citas</span>
                </button>
                <Link to="/profile" className="flex flex-1 flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                    <span className="material-symbols-outlined text-[24px]">person</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Cuenta</span>
                </Link>
            </nav>
        </div>
    );
};

export default Appointments;
