import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '../components/ui/BottomNav';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { useNotifications } from '../lib/NotificationContext';
import { addAuditLog } from '../utils/auditLogger';
import { appConfig } from '../config';

const Appointments = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { togglePanel, unreadCount } = useNotifications();

    // State
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedShift, setSelectedShift] = useState('mañana');
    const [selectedService, setSelectedService] = useState(null);
    const [availableServices, setAvailableServices] = useState([]);
    const [faultDescription, setFaultDescription] = useState('');
    const [wantsPickup, setWantsPickup] = useState(false);
    const [wantsPremiumWash, setWantsPremiumWash] = useState(false);
    const [userPoints, setUserPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [monthlyAppointmentsCounts, setMonthlyAppointmentsCounts] = useState({});
    const [bookedTimes, setBookedTimes] = useState([]);

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const handleMonthChange = (direction) => {
        const newMonth = new Date(currentMonth);
        if (direction === 'prev') {
            const today = new Date();
            if (newMonth.getFullYear() === today.getFullYear() && newMonth.getMonth() === today.getMonth()) {
                return; // Prevent navigating to past months
            }
            newMonth.setMonth(newMonth.getMonth() - 1);
        } else {
            newMonth.setMonth(newMonth.getMonth() + 1);
        }
        setCurrentMonth(newMonth);
    };

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => {
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // 0 is Sunday, adjust so Monday is 0
    };

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startingDay = getFirstDayOfMonth(year, month);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const renderCalendarDays = () => {
        const days = [];
        for (let i = 0; i < startingDay; i++) {
            days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const dateObj = new Date(year, month, i);
            const isSelected = selectedDate && dateObj.getTime() === selectedDate.getTime();
            const isPast = dateObj < today;
            const dateString = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
            const appointmentsCount = monthlyAppointmentsCounts[dateString] || 0;
            const availableSlots = Math.max(0, 6 - appointmentsCount);
            const isFull = availableSlots === 0;
            const isClickable = !isPast && !isFull;

            days.push(
                <button
                    key={i}
                    onClick={() => {
                        if (isClickable) {
                            setSelectedDate(dateObj);
                            setIsCalendarModalOpen(false);
                        }
                    }}
                    disabled={!isClickable}
                    className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative overflow-hidden ${isSelected
                        ? 'bg-primary border border-primary/50 shadow-[0_0_15px_rgba(255,40,0,0.4)]'
                        : isPast
                            ? 'bg-slate-800/20 grayscale opacity-40 cursor-not-allowed border border-transparent'
                            : isFull
                                ? 'bg-red-500/10 border border-red-500/20 cursor-not-allowed'
                                : 'bg-slate-800/40 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-500/50 cursor-pointer shadow-sm'
                        }`}
                >
                    <span className={`text-sm font-black ${isSelected ? 'text-[#0a0c14]' : isPast ? 'text-slate-500' : isFull ? 'text-red-400' : 'text-slate-200'}`}>
                        {i}
                    </span>

                    {!isPast && (
                        <div className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 px-1.5 py-0.5 rounded-sm ${isSelected
                            ? 'bg-[#0a0c14]/20 text-[#0a0c14]'
                            : isFull
                                ? 'text-red-400 bg-red-400/10'
                                : 'text-primary bg-primary/10'
                            }`}>
                            {isFull ? 'Lleno' : availableSlots}
                        </div>
                    )}
                </button>
            );
        }
        return days;
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

                // Fetch pending appointments
                const qApps = query(
                    collection(db, "Appointments"),
                    where("userId", "==", currentUser.uid),
                    where("status", "==", "scheduled")
                );
                const appsSnapshot = await getDocs(qApps);
                const pending = [];
                appsSnapshot.forEach((doc) => {
                    pending.push({ id: doc.id, ...doc.data() });
                });

                // Sort by date/time ascending
                pending.sort((a, b) => {
                    const dateA = new Date(`${a.date}T${a.time.replace(/ (AM|PM)/, '')}:00`); // rough sort by native date parsing if possible, or just string compare
                    const dateB = new Date(`${b.date}T${b.time.replace(/ (AM|PM)/, '')}:00`);
                    return dateA - dateB;
                });

                setPendingAppointments(pending);

                // Fetch User points for VIP privileges
                const userDocRef = doc(db, 'Users', currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUserPoints(userDoc.data().points || 0);
                }

                // Fetch Available Services
                const servicesRef = collection(db, "Services");
                const servicesSnapshot = await getDocs(servicesRef);
                const srvs = [];
                servicesSnapshot.forEach((doc) => {
                    srvs.push({ id: doc.id, ...doc.data() });
                });

                // Optional: We can add an 'Otro' or 'Revisión por Falla' default if not present
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

                const hasFalla = srvs.some(s => s.name === 'Revisión por Falla' || s.requiresQuote);
                if (!hasFalla && srvs.length > 0) {
                    srvs.push(fallbackFalla);
                }

                setAvailableServices(srvs.length > 0 ? srvs : [
                    { id: '1', name: 'Mantenimiento General', basePrice: 120000, laborCost: 0, estimatedTime: 1.5 },
                    { id: '2', name: 'Servicio Preventivo', basePrice: 80000, laborCost: 0, estimatedTime: 1.0 },
                    fallbackFalla
                ]);

                if (srvs.length > 0) setSelectedService(srvs[0]);

            } catch (error) {
                console.error("Error fetching vehicles or appointments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [currentUser]);

    // Fetch monthly counts whenever the month changes
    useEffect(() => {
        const fetchMonthlyCounts = async () => {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth() + 1;
            const startStr = `${year}-${month.toString().padStart(2, '0')}-01`;
            const endStr = `${year}-${month.toString().padStart(2, '0')}-31`;

            try {
                const q = query(
                    collection(db, "Appointments"),
                    where("date", ">=", startStr),
                    where("date", "<=", endStr)
                );
                const snapshot = await getDocs(q);

                const counts = {};
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const date = data.date; // YYYY-MM-DD
                    // Only count valid scheduled/confirmed appointments (exclude cancelled if any exist in the db)
                    if (data.status !== 'cancelled') {
                        counts[date] = (counts[date] || 0) + 1;
                    }
                });
                setMonthlyAppointmentsCounts(counts);
            } catch (error) {
                console.error("Error fetching monthly counts:", error);
            }
        };
        fetchMonthlyCounts();
    }, [currentMonth]);

    // Fetch booked times for selected date
    useEffect(() => {
        const fetchBookedTimes = async () => {
            if (!selectedDate) {
                setBookedTimes([]);
                return;
            }
            const dateString = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
            try {
                const q = query(
                    collection(db, "Appointments"),
                    where("date", "==", dateString)
                );
                const snapshot = await getDocs(q);
                const times = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.status !== 'cancelled') {
                        times.push(data.time);
                    }
                });
                setBookedTimes(times);
            } catch (error) {
                console.error("Error fetching booked times:", error);
            }
        };
        fetchBookedTimes();
    }, [selectedDate]);

    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm('¿Estás seguro que deseas cancelar este turno? Esta acción no se puede deshacer.')) return;

        try {
            await deleteDoc(doc(db, "Appointments", appointmentId));
            await addAuditLog(`El Cliente canceló su turno ${appointmentId}`, 'system', currentUser?.email || 'Cliente');
            alert('El turno ha sido cancelado con éxito.');
            setPendingAppointments(prev => prev.filter(app => app.id !== appointmentId));
        } catch (error) {
            console.error("Error cancelling appointment:", error);
            alert('Hubo un error al cancelar el turno. Inténtalo de nuevo.');
        }
    };

    const handleConfirm = async () => {
        if (!selectedVehicle || !selectedDate || !selectedTime) {
            alert('Por favor selecciona una moto, fecha y hora.');
            return;
        }
        if (selectedService?.name === 'Revisión por Falla' && !faultDescription.trim()) {
            alert('Por favor describe la falla que presenta tu moto.');
            return;
        }

        setSaving(true);
        try {
            const appointmentDate = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;

            // Limit to 6 appointments per day
            const q6 = query(collection(db, "Appointments"), where("date", "==", appointmentDate));
            const querySnapshot6 = await getDocs(q6);
            if (querySnapshot6.size >= 6) {
                alert('Lo sentimos, ya no hay citas disponibles para este día. Por favor selecciona otra fecha.');
                setSaving(false);
                return;
            }

            // Check if specific time slot is already taken
            const qTime = query(collection(db, "Appointments"), where("date", "==", appointmentDate), where("time", "==", selectedTime));
            const querySnapshotTime = await getDocs(qTime);
            const isTimeTaken = querySnapshotTime.docs.some(d => d.data().status !== 'cancelled');
            if (isTimeTaken) {
                alert('Este horario acaba de ser reservado. Por favor selecciona otro horario.');
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
                serviceType: selectedService?.name || 'Servicio General',
                serviceId: selectedService?.id || null,
                faultDescription: selectedService?.name === 'Revisión por Falla' || selectedService?.requiresQuote ? faultDescription : null,
                wantsPickup: wantsPickup,
                wantsPremiumWash: wantsPremiumWash,
                totalCost: calculateTotalCost(),
                totalTime: calculateTotalTime(),
                status: "scheduled",
                createdAt: new Date()
            });

            await addAuditLog(`El Cliente agendó un nuevo turno (${selectedService?.name || 'Servicio General'}) el ${appointmentDate} a las ${selectedTime}`, 'system', currentUser?.email || 'Cliente');

            // Generate .ics file
            const eventTitle = `Cita: ${selectedService?.name || 'Servicio'}`;
            const eventDetails = (selectedService?.name === 'Revisión por Falla' || selectedService?.requiresQuote)
                ? `Detalle: ${faultDescription}\n\n${appConfig.companyName}`
                : `Servicio en ${appConfig.companyName}`;
            const eventDateStr = `${selectedDate.getFullYear()}${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}${selectedDate.getDate().toString().padStart(2, '0')}`;

            let hour = parseInt(selectedTime.split(':')[0]);
            if (selectedTime.includes('PM') && hour !== 12) hour += 12;
            const startHour = hour.toString().padStart(2, '0');
            const endHour = (hour + 1).toString().padStart(2, '0');

            const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//${appConfig.companyName}//ES
BEGIN:VEVENT
UID:${new Date().getTime()}@dynotechpowergarage.com
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

    const handleClearSelection = () => {
        setSelectedVehicle(null);
        setSelectedDate(null);
        setSelectedTime('');
        setSelectedShift('mañana');
        setSelectedService(null);
        setFaultDescription('');
        setWantsPickup(false);
        setWantsPremiumWash(false);
    };

    const getBaseServiceDetails = () => {
        if (!selectedService) return { cost: 0, time: 0, requiresQuote: false };
        const cost = (Number(selectedService.basePrice) || 0) + (Number(selectedService.laborCost) || 0);
        const time = (Number(selectedService.estimatedTime) || 0) * 60; // convert hours to minutes
        return { cost, time, requiresQuote: selectedService.requiresQuote };
    };

    const calculateTotalCost = () => {
        const base = getBaseServiceDetails().cost;
        const wash = wantsPremiumWash ? 45000 : 0;
        // Pickup is typically quoted later based on distance, but let's add a base placeholder or just keep it 0 for quote
        let total = base + wash;
        return total;
    };

    const calculateTotalTime = () => {
        const base = getBaseServiceDetails().time;
        const wash = wantsPremiumWash ? +60 : 0;
        let total = base + wash;
        return total;
    };

    // Calculate dynamic progress
    let currentStep = 1;
    let stepTitle = "Selecciona tu Moto";
    let progressPercentage = 25;

    if (selectedVehicle) {
        currentStep = 2;
        stepTitle = "Fecha y Hora";
        progressPercentage = 50;
    }
    if (selectedVehicle && selectedDate && selectedTime) {
        currentStep = 3;
        stepTitle = "Servicio y Extras";
        progressPercentage = 75;
    }
    const isServiceValid = selectedService && (selectedService.name !== 'Revisión por Falla' || faultDescription.trim() !== '');
    if (selectedVehicle && selectedDate && selectedTime && isServiceValid) {
        currentStep = 4;
        stepTitle = "Confirmación";
        progressPercentage = 100;
    }

    return (
        <div className="bg-[#0a0c14] text-slate-100 h-[100dvh] flex flex-col font-display max-w-[1200px] w-full mx-auto shadow-2xl relative lg:border-x lg:border-slate-800/50">
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
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-0.5">{appConfig.companyName}</p>
                    </div>
                    <button onClick={togglePanel} className="relative size-10 flex items-center justify-center rounded-full bg-[#161b2a] border border-slate-700/80 hover:border-primary/50 transition-colors shadow-inner">
                        <span className="material-symbols-outlined text-primary">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 rounded-full bg-red-500 border border-[#161b2a] animate-pulse"></span>
                        )}
                    </button>
                </div>

                <div className="px-4 pb-4">
                    <div className="flex justify-between items-end mb-2">
                        <p className={`text-xs font-semibold uppercase tracking-wider transition-colors ${progressPercentage === 100 ? 'text-emerald-400' : 'text-primary'}`}>Paso {currentStep} de 4</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs transition-all">{stepTitle}</p>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ease-out ${progressPercentage === 100 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-primary shadow-[0_0_10px_rgba(255,40,0,0.5)]'}`}
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex-1 overflow-y-auto px-4 py-6 pb-32 lg:p-8 flex flex-col lg:flex-row gap-8 items-start text-left lg:justify-center">
                {/* Admin-style Card Wrapper for Desktop */}
                <div className="w-full lg:max-w-4xl lg:bg-[#161b2a]/80 lg:backdrop-blur-xl lg:border lg:border-slate-800/60 lg:rounded-3xl lg:p-8 lg:shadow-2xl flex flex-col lg:flex-row gap-8">
                {/* Left Column: Form */}
                <div className={`w-full ${pendingAppointments.length > 0 ? 'lg:w-[60%]' : 'max-w-2xl mx-auto'} space-y-8`}>
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
                                    <div className={`size-16 rounded-full p-0.5 border-2 mb-2 ${selectedVehicle === bike.id ? 'border-primary shadow-[0_0_15px_rgba(255,40,0,0.3)]' : 'border-transparent'}`}>
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

                {/* Calendar Button (triggers Modal) */}
                {selectedVehicle && (
                <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <h3 className="text-slate-100 text-xs font-black uppercase tracking-widest mb-4 flex items-center drop-shadow-sm">
                        <span className="w-1.5 h-4 bg-primary rounded-full mr-2.5 shadow-[0_0_8px_rgba(13,204,242,0.8)]"></span>
                        Fecha del Servicio
                    </h3>

                    <button
                        onClick={() => setIsCalendarModalOpen(true)}
                        className="w-full bg-[#161b2a] border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-lg shadow-black/50 hover:border-primary/50 transition-all group"
                    >
                        <div className="size-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                            <span className="material-symbols-outlined text-primary text-2xl drop-shadow-[0_0_8px_rgba(255,40,0,0.6)]">event_available</span>
                        </div>
                        <div className="text-center">
                            <h4 className="text-sm font-black text-white tracking-wide">
                                {selectedDate
                                    ? `${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
                                    : 'Seleccionar Fecha'
                                }
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1">Haz clic para ver el calendario y turnos libres</p>
                        </div>
                    </button>
                </section>
                )}

                {/* Time Slots */}
                {selectedDate && (
                <section className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h3 className="text-slate-100 text-xs font-black uppercase tracking-widest mb-4 flex items-center drop-shadow-sm">
                        <span className="w-1.5 h-4 bg-primary rounded-full mr-2.5 shadow-[0_0_8px_rgba(13,204,242,0.8)]"></span>
                        Horario del Servicio
                    </h3>

                    <div className="bg-[#161b2a] border border-slate-700/50 rounded-2xl p-4 shadow-lg shadow-black/50">
                        {/* Shift Toggle */}
                        <div className="flex bg-[#0a0c14] rounded-xl p-1 mb-5 border border-slate-800">
                            <button
                                onClick={() => setSelectedShift('mañana')}
                                className={`flex-1 py-2 flex items-center justify-center gap-2 text-[11px] font-black tracking-widest uppercase rounded-lg transition-all ${selectedShift === 'mañana'
                                    ? 'bg-slate-800 text-amber-400 shadow-md border border-slate-700/50'
                                    : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-sm ${selectedShift === 'mañana' ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]' : ''}`}>light_mode</span>
                                Mañana
                            </button>
                            <button
                                onClick={() => setSelectedShift('tarde')}
                                className={`flex-1 py-2 flex items-center justify-center gap-2 text-[11px] font-black tracking-widest uppercase rounded-lg transition-all ${selectedShift === 'tarde'
                                    ? 'bg-slate-800 text-red-400 shadow-md border border-slate-700/50'
                                    : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-sm ${selectedShift === 'tarde' ? 'text-red-400 drop-shadow-[0_0_5px_rgba(255,40,0,0.5)]' : ''}`}>dark_mode</span>
                                Tarde
                            </button>
                        </div>

                        {/* Times grid based on shift */}
                        <div className="grid grid-cols-3 gap-2">
                            {(selectedShift === 'mañana'
                                ? ['09:00 AM', '10:30 AM', '12:00 PM']
                                : ['02:00 PM', '03:30 PM', '05:00 PM']
                            ).map(time => {
                                const isBooked = bookedTimes.includes(time);
                                return (
                                    <button
                                        key={time}
                                        onClick={() => !isBooked && setSelectedTime(time)}
                                        disabled={isBooked}
                                        className={`py-2.5 px-1 rounded-xl border text-[11px] font-black tracking-wider transition-all shadow-sm ${
                                            isBooked 
                                                ? 'opacity-40 cursor-not-allowed border-red-500/20 text-red-500 bg-red-500/5 decoration-red-500/50 line-through'
                                                : selectedTime === time
                                                    ? 'border-primary/50 bg-primary/20 text-primary shadow-inner active:scale-95'
                                                    : 'border-slate-700/50 text-slate-400 bg-[#0a0c14] hover:border-slate-500 hover:text-slate-200 active:scale-95'
                                            }`}
                                    >
                                        {time}
                                        {isBooked && <span className="block text-[8px] uppercase tracking-widest mt-0.5 text-red-500/70">Ocupado</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>
                )}

                {/* Service/Extras combined wrapper */}
                {selectedTime && (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                
                {/* Service Selection Button */}
                <section className="space-y-4 pt-4">
                    <h3 className="text-slate-100 text-xs font-black uppercase tracking-widest mb-4 flex items-center drop-shadow-sm">
                        <span className="w-1.5 h-4 bg-primary rounded-full mr-2.5 shadow-[0_0_8px_rgba(13,204,242,0.8)]"></span>
                        Tipo de Servicio
                    </h3>

                    <button
                        onClick={() => setIsServiceModalOpen(true)}
                        className="w-full bg-[#161b2a] border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-lg shadow-black/50 hover:border-primary/50 transition-all group"
                    >
                        <div className="size-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                            <span className="material-symbols-outlined text-primary text-2xl drop-shadow-[0_0_8px_rgba(255,40,0,0.6)]">build</span>
                        </div>
                        <div className="text-center w-full px-2">
                            <h4 className="text-sm font-black text-white tracking-wide truncate">
                                {selectedService
                                    ? selectedService.name
                                    : 'Seleccionar Servicio'
                                }
                            </h4>
                            {selectedService ? (
                                <p className="text-[10px] text-primary font-bold tracking-widest mt-1 uppercase">Cambiar Selección</p>
                            ) : (
                                <p className="text-[10px] text-slate-400 mt-1">Ver catálogo y detalles</p>
                            )}
                        </div>
                    </button>

                    {selectedService && (selectedService.name === 'Revisión por Falla' || selectedService.requiresQuote) && faultDescription && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-3 animate-in fade-in slide-in-from-top-2">
                            <span className="material-symbols-outlined text-amber-500 text-[16px]">notes</span>
                            <div className="flex-1">
                                <h4 className="text-[10px] font-black text-amber-500 tracking-widest uppercase mb-1">Falla Reportada</h4>
                                <p className="text-xs text-slate-300 italic line-clamp-2">"{faultDescription}"</p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Premium Services */}
                <section className="space-y-4 pt-2">
                    <h3 className="text-slate-100 text-xs font-black uppercase tracking-widest mb-4 flex items-center drop-shadow-sm">
                        <span className="w-1.5 h-4 bg-primary rounded-full mr-2.5 shadow-[0_0_8px_rgba(13,204,242,0.8)]"></span>
                        Servicios Premium Adicionales
                    </h3>

                    <div className="flex flex-col gap-3">
                        {/* Premium Wash Toggle */}
                        <div
                            onClick={() => {
                                if (userPoints >= 1000) setWantsPremiumWash(!wantsPremiumWash);
                            }}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${userPoints < 1000 ? 'border-slate-800/30 bg-[#161b2a] opacity-60 cursor-not-allowed' : wantsPremiumWash ? 'border-primary/60 bg-primary/10 cursor-pointer shadow-sm' : 'border-slate-700/50 bg-[#161b2a] hover:border-slate-500 cursor-pointer shadow-sm'}`}
                        >
                            <div className="mt-0.5">
                                <div className={`flex items-center justify-center size-5 rounded-[6px] border ${userPoints < 1000 ? 'border-slate-800 bg-slate-800/50 text-slate-500' : wantsPremiumWash ? 'border-primary bg-primary text-[#0a0c14]' : 'border-slate-600 bg-[#0a0c14]'}`}>
                                    {userPoints < 1000 ? <span className="material-symbols-outlined text-[12px]">lock</span> : wantsPremiumWash && <span className="material-symbols-outlined text-[14px] font-black">check</span>}
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-[13px] font-black tracking-wide ${userPoints < 1000 ? 'text-slate-500' : 'text-white'}`}>Lavado Premium + Detallado</h4>
                                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-lg">+$45.000 ARS</span>
                                </div>
                                <p className={`text-[10px] leading-relaxed ${userPoints < 1000 ? 'text-slate-600' : 'text-slate-400'}`}>Lavado profundo con vapor, desengrasado de cadena, lubricación, encerado de carenajes y detallado de rines. (+60 mins)</p>
                                {userPoints < 1000 && <p className="text-[10px] text-primary font-bold tracking-widest uppercase mt-2">Bloqueado - 1.000 Pts Requeridos</p>}
                            </div>
                        </div>

                        {/* VIP Pickup Toggle */}
                        <div
                            onClick={() => {
                                if (userPoints >= 3000) setWantsPickup(!wantsPickup);
                            }}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${userPoints < 3000 ? 'border-slate-800/30 bg-[#161b2a] opacity-60 cursor-not-allowed' : wantsPickup ? 'border-primary/60 bg-primary/10 cursor-pointer shadow-sm' : 'border-slate-700/50 bg-[#161b2a] hover:border-slate-500 cursor-pointer shadow-sm'}`}
                        >
                            <div className="mt-0.5">
                                <div className={`flex items-center justify-center size-5 rounded-[6px] border ${userPoints < 3000 ? 'border-slate-800 bg-slate-800/50 text-slate-500' : wantsPickup ? 'border-primary bg-primary text-[#0a0c14]' : 'border-slate-600 bg-[#0a0c14]'}`}>
                                    {userPoints < 3000 ? <span className="material-symbols-outlined text-[12px]">lock</span> : wantsPickup && <span className="material-symbols-outlined text-[14px] font-black">check</span>}
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-[13px] font-black tracking-wide ${userPoints < 3000 ? 'text-slate-500' : 'text-white'}`}>Recogida a Domicilio VIP</h4>
                                    <span className={`text-[11px] font-bold bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20 ${userPoints < 3000 ? 'text-slate-500' : 'text-primary'}`}>Por Cotizar</span>
                                </div>
                                <p className={`text-[10px] leading-relaxed ${userPoints < 3000 ? 'text-slate-600' : 'text-slate-400'}`}>No te preocupes por el tráfico. Recogemos tu motocicleta en un tráiler especializado en la puerta de tu casa u oficina.</p>
                                {userPoints < 3000 && <p className="text-[10px] text-primary font-bold tracking-widest uppercase mt-2">Bloqueado - 3.000 Pts Requeridos</p>}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Service Summary Card */}
                <section className="bg-primary/5 border border-primary/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <div>
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Resumen de Servicio</h4>
                            <p className="text-[13px] font-black tracking-wide text-white drop-shadow-md">{selectedService?.name || 'Servicio'}</p>
                            {wantsPremiumWash && <p className="text-[10px] font-bold tracking-wide text-emerald-400 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">add</span>Lavado Premium (+ $45k)</p>}
                            {wantsPickup && <p className="text-[10px] font-bold tracking-wide text-primary mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">add</span>Recogida VIP (Por cotizar)</p>}
                        </div>
                        <button
                            onClick={() => navigate('/service-breakdown', { state: { serviceName: selectedService?.name || 'Mantenimiento General' } })}
                            className="bg-[#161b2a] border border-slate-700 p-2.5 rounded-xl shadow-inner hover:border-primary/50 transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-primary text-lg drop-shadow-[0_0_5px_rgba(255,40,0,0.5)]">build</span>
                        </button>
                    </div>
                    <div className="p-4 bg-[#161b2a] border border-slate-700/50 rounded-2xl shadow-lg mt-4 mb-2">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Resumen</span>
                            <span className="text-[11px] font-bold text-primary">T. Estimado: {Math.round(calculateTotalTime() / 60 * 10) / 10} h</span>
                        </div>
                        <div className="h-[1px] w-full bg-slate-700/50 mb-3 block"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-white uppercase tracking-wider">Total a Pagar</span>
                            {getBaseServiceDetails().requiresQuote ? (
                                <span className="text-sm font-black text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20">Por Cotizar</span>
                            ) : (
                                <span className="text-lg font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-xl border border-emerald-400/20 shadow-sm">${calculateTotalCost().toLocaleString('es-AR')} ARS</span>
                            )}
                        </div>
                        {getBaseServiceDetails().requiresQuote && (
                            <p className="text-[9px] text-slate-500 mt-2 leading-tight">El precio final de este servicio requiere una evaluación presencial o telefónica. Te contactaremos para brindarte el presupuesto exacto.</p>
                        )}
                    </div>
                    <div className="flex items-center gap-5 text-[11px] font-bold tracking-wider text-slate-400 mt-4 border-t border-slate-800/50 pt-3 relative z-10">
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px] text-slate-500">schedule</span>
                            <span>{calculateTotalTime()} MIN</span>
                        </div>
                        <div className="flex items-center gap-1.5 border-l border-slate-700/50 pl-5">
                            <span className="material-symbols-outlined text-[15px] text-slate-500">payments</span>
                            <span className="text-white">${calculateTotalCost().toLocaleString('es-AR')} ARS</span>
                        </div>
                    </div>
                </section>
                
                </div>
                )}

                </div>

                {/* Right Column: Pending Appointments List */}
                {pendingAppointments.length > 0 && (
                <div className="w-full lg:w-[40%] sticky top-8 space-y-6 mt-8 lg:mt-0">
                    <section className="pt-6 pb-2 border-t border-slate-800/50 lg:border-t-0 lg:pt-0">
                        <h3 className="text-slate-100 text-xs font-black uppercase tracking-widest mb-4 flex items-center drop-shadow-sm">
                            <span className="w-1.5 h-4 bg-amber-500 rounded-full mr-2.5 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                            Tus Turnos Pendientes
                        </h3>
                        <div className="flex flex-col gap-3">
                            {pendingAppointments.map((app) => {
                                const bike = vehicles.find(v => v.id === app.vehicleId);
                                const appDate = new Date(app.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

                                return (
                                    <div key={app.id} className="bg-[#161b2a]/80 backdrop-blur-sm border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/80"></div>
                                        <div className="flex items-center gap-4 pl-2">
                                            <div className="size-10 rounded-full bg-slate-800 border-2 border-slate-700 flex flex-col items-center justify-center shrink-0 shadow-inner overflow-hidden">
                                                {bike?.imageUrl ? (
                                                    <img loading="lazy" src={bike.imageUrl} alt={bike.brand} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-slate-400 text-sm">two_wheeler</span>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-white text-sm font-black tracking-tight">{bike?.brand} {bike?.model}</h4>
                                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                                    <span className="material-symbols-outlined text-[12px] text-amber-500">event</span>
                                                    {appDate} • {app.time}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end justify-between h-full">
                                            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap mb-2">
                                                Agendado
                                            </span>
                                            <button
                                                onClick={() => handleCancelAppointment(app.id)}
                                                className="text-[9px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[12px]">cancel</span>
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
                )}
                
                </div> {/* End Admin-style Card Wrapper */}
            </main>

            {/* Bottom Action & Navigation */}
            {progressPercentage === 100 && (
                <footer className="relative z-20 mt-auto bg-[#161b2a]/95 backdrop-blur-md border-t border-slate-800 pb-[90px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-4">
                        <div className="max-w-2xl mx-auto flex gap-2">
                            {/* Clear Button */}
                            <button
                                onClick={handleClearSelection}
                                disabled={saving}
                                className="flex-shrink-0 flex items-center justify-center rounded-xl size-14 bg-slate-800/80 text-slate-400 hover:text-red-400 border border-slate-700/50 hover:bg-slate-800 transition-colors shadow-inner"
                                title="Empezar de nuevo"
                            >
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                            
                            {/* Confirm Button */}
                            <button
                                onClick={handleConfirm}
                                disabled={saving}
                                className="flex-1 flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-4 bg-primary text-[#0a0c14] text-[13px] font-black tracking-widest hover:bg-primary/90 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(13,204,242,0.3)] uppercase disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <span className="material-symbols-outlined animate-spin shadow-none">sync</span>
                                ) : (
                                    `Confirmar Cita${selectedDate ? ` para el ${selectedDate.getDate().toString().padStart(2, '0')} ${monthNames[selectedDate.getMonth()].substring(0, 3)}` : ''}`
                                )}
                                {!saving && <span className="material-symbols-outlined ml-2 text-lg">check_circle</span>}
                            </button>
                        </div>
                    </div>
                </footer>
            )}

            {/* Calendar Modal */}
            {isCalendarModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
                    <div className="bg-[#0a0c14] w-full max-w-md rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-700/50 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-full duration-300">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#161b2a]">
                            <div>
                                <h3 className="text-white font-black text-lg">Calendario de Turnos</h3>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Selecciona un día con cupo</p>
                            </div>
                            <button
                                onClick={() => setIsCalendarModalOpen(false)}
                                className="size-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white border border-slate-700/50 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto">
                            <div className="flex items-center justify-between mb-6 bg-[#161b2a] p-3 rounded-2xl border border-slate-800">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-100 ml-2">
                                    {monthNames[month]} {year}
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleMonthChange('prev')}
                                        className="p-2 rounded-xl border border-slate-700/50 hover:bg-slate-700/50 transition-colors shadow-inner disabled:opacity-30 disabled:cursor-not-allowed bg-slate-800/80"
                                        disabled={year === today.getFullYear() && month === today.getMonth()}
                                    >
                                        <span className="material-symbols-outlined text-sm text-slate-300">chevron_left</span>
                                    </button>
                                    <button
                                        onClick={() => handleMonthChange('next')}
                                        className="p-2 rounded-xl border border-slate-700/50 hover:bg-slate-700/50 transition-colors shadow-inner bg-slate-800/80"
                                    >
                                        <span className="material-symbols-outlined text-sm text-slate-300">chevron_right</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-2 text-center mb-2">
                                <span className="text-[10px] font-black tracking-widest text-slate-500">LUN</span>
                                <span className="text-[10px] font-black tracking-widest text-slate-500">MAR</span>
                                <span className="text-[10px] font-black tracking-widest text-slate-500">MIÉ</span>
                                <span className="text-[10px] font-black tracking-widest text-slate-500">JUE</span>
                                <span className="text-[10px] font-black tracking-widest text-slate-500">VIE</span>
                                <span className="text-[10px] font-black tracking-widest border-b-2 border-primary/50 text-slate-300">SÁB</span>
                                <span className="text-[10px] font-black tracking-widest border-b-2 border-primary/50 text-slate-300">DOM</span>
                            </div>

                            <div className="grid grid-cols-7 gap-2 text-center">
                                {(() => {
                                    try {
                                        return renderCalendarDays();
                                    } catch (e) {
                                        console.error("Error rendering calendar days:", e);
                                        return <div className="col-span-7 tracking-widest text-red-500 font-bold p-4 break-words">Error: {e.message}</div>;
                                    }
                                })()}
                            </div>

                            <div className="mt-8 bg-primary/5 border border-primary/10 rounded-xl p-4">
                                <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[14px] text-primary">info</span>
                                    Estado de Cupos
                                </h4>
                                <div className="flex items-center gap-4 text-[10px] font-bold tracking-wider text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <div className="size-3 rounded-sm bg-primary border border-primary"></div>
                                        <span>Seleccionado</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="size-3 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-[7px] text-primary">N</div>
                                        <span>Cupos Libres</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="size-3 rounded-sm bg-red-500/20 border border-red-500/50"></div>
                                        <span>Completo</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Service Selection Modal */}
            {isServiceModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
                    <div className="bg-[#0a0c14] w-full max-w-md rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-700/50 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-full duration-300">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#161b2a]">
                            <div>
                                <h3 className="text-white font-black text-lg">Catálogo de Servicios</h3>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Selecciona el tipo de trabajo</p>
                            </div>
                            <button
                                onClick={() => setIsServiceModalOpen(false)}
                                className="size-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white border border-slate-700/50 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1 pb-24">
                            <div className="flex flex-col gap-3">
                                {loading && availableServices.length === 0 ? (
                                    <div className="text-xs text-slate-500 animate-pulse text-center py-8">Cargando catálogo...</div>
                                ) : (
                                    availableServices.map(service => {
                                        const isSelected = selectedService?.id === service.id;
                                        const showFaultInput = isSelected && (service.name === 'Revisión por Falla' || service.requiresQuote);

                                        return (
                                            <div key={service.id} className={`flex flex-col rounded-xl border transition-all duration-300 shadow-sm overflow-hidden ${isSelected ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(255,40,0,0.15)]' : 'border-slate-700/50 bg-[#161b2a] hover:border-slate-500'}`}>
                                                <button
                                                    onClick={() => setSelectedService(service)}
                                                    className="flex items-start gap-4 p-4 text-left w-full"
                                                >
                                                    <div className={`mt-0.5 flex items-center justify-center size-5 rounded-full border shrink-0 transition-colors ${isSelected ? 'border-primary bg-primary/20' : 'border-slate-600 bg-[#0a0c14]'}`}>
                                                        {isSelected && <div className="size-2.5 rounded-full bg-primary shadow-[0_0_5px_rgba(255,40,0,0.8)]" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start gap-2 mb-1.5">
                                                            <h4 className={`text-[13px] font-black tracking-wide leading-tight ${isSelected ? 'text-primary' : 'text-slate-100'}`}>{service.name}</h4>
                                                            {service.requiresQuote ? (
                                                                <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 shrink-0">Cotizar</span>
                                                            ) : (
                                                                <span className="text-[11px] font-bold text-emerald-400 shrink-0">${(Number(service.basePrice || 0) + Number(service.laborCost || 0)).toLocaleString('es-AR')}</span>
                                                            )}
                                                        </div>
                                                        {service.description && (
                                                            <p className="text-[11px] text-slate-400 mb-2 leading-relaxed line-clamp-2">{service.description}</p>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {Number(service.estimatedTime) > 0 && (
                                                                <span className="px-1.5 py-0.5 bg-slate-800/80 rounded text-[9px] font-bold text-slate-300 tracking-wider flex items-center gap-1 border border-slate-700/50">
                                                                    <span className="material-symbols-outlined text-[10px] text-primary">schedule</span>
                                                                    {service.estimatedTime}h
                                                                </span>
                                                            )}
                                                            <span className="text-[9px] px-1.5 py-0.5 bg-slate-800/50 text-slate-400 rounded border border-slate-700/30 truncate uppercase tracking-widest">{service.category || 'Servicio'}</span>
                                                        </div>
                                                    </div>
                                                </button>

                                                {/* Built-in Custom Fault Textarea for this service */}
                                                {showFaultInput && (
                                                    <div className="px-4 pb-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-primary/20 bg-primary/5">
                                                        <label className="block text-[10px] font-bold text-primary mb-2 uppercase tracking-widest mt-3">
                                                            Describe la falla de la moto
                                                        </label>
                                                        <textarea
                                                            value={faultDescription}
                                                            onChange={(e) => setFaultDescription(e.target.value)}
                                                            placeholder="Ej: La moto se apaga al frenar, ruido extraño en el motor..."
                                                            className="w-full bg-[#0a0c14] border border-primary/30 rounded-xl p-3 text-[13px] focus:outline-none focus:border-primary transition-all min-h-[100px] resize-none text-slate-100 placeholder:text-slate-600 shadow-inner"
                                                            autoFocus
                                                        ></textarea>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-4 flex gap-3 mt-6">
                                <span className="material-symbols-outlined text-emerald-400 text-xl shrink-0 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">water_drop</span>
                                <div>
                                    <h4 className="text-[11px] font-black text-slate-200 tracking-widest uppercase">Lavado de Cortesía Incluido</h4>
                                    <p className="text-[10px] text-slate-400 leading-relaxed mt-1">Todos los servicios estándar incluyen un lavado básico de cortesía sin costo.</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer stickied to bottom of modal */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#161b2a]/95 backdrop-blur-md border-t border-slate-800">
                            <button
                                onClick={() => setIsServiceModalOpen(false)}
                                disabled={!selectedService}
                                className="w-full h-12 rounded-xl bg-primary text-[#0a0c14] text-[13px] font-black tracking-widest uppercase hover:bg-primary/90 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(13,204,242,0.3)] disabled:opacity-50 disabled:shadow-none cursor-pointer flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                Confirmar Selección
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav active="appointments" />
        </div>
    );
};

export default Appointments;
