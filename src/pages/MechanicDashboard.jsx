import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where, doc, updateDoc, addDoc } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import MechanicBottomNav from '../components/ui/MechanicBottomNav';
import { useNotifications } from '../lib/NotificationContext';
import DeliveryReportModal from '../components/DeliveryReportModal';

const MechanicDashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { togglePanel, unreadCount } = useNotifications();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAtWorkshop, setIsAtWorkshop] = useState(false);
    const [checkingLocation, setCheckingLocation] = useState(false);
    const [isDeliveryReportOpen, setIsDeliveryReportOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);

    // {appConfig.companyName} fixed coordinates (approx. Rondeau & Sarmiento, San Martin)
    const WORKSHOP_COORDS = { lat: -34.5772, lng: -58.5390 };
    const MAX_ALLOWED_DISTANCE_METERS = 300;

    // Haversine formula to calculate distance between two coordinates in meters
    const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Radius of the earth in m
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in meters
        return d;
    };

    // Determine initial check-in state from Firestore user document
    useEffect(() => {
        if (!currentUser) return;
        const fetchUserAttendance = async () => {
            try {
                const userSnapshot = await onSnapshot(doc(db, 'Users', currentUser.uid), (docSnap) => {
                    if (docSnap.exists() && docSnap.data().isAtWorkshop) {
                        setIsAtWorkshop(true);
                    } else {
                        setIsAtWorkshop(false);
                    }
                });
                return () => userSnapshot();
            } catch (error) {
                console.error("Error fetching user attendance:", error);
            }
        };
        fetchUserAttendance();
    }, [currentUser]);

    const bypassCheckIn = async () => {
        try {
            await updateDoc(doc(db, 'Users', currentUser.uid), {
                isAtWorkshop: true,
                lastCheckIn: new Date()
            });
            alert("¡Check-in exitoso! (Modo de prueba local)");
        } catch (error) {
            console.error("Error writing check-in to database", error);
            alert("Hubo un error al guardar tu check-in local.");
        }
        setCheckingLocation(false);
    };

    const handleCheckIn = () => {
        if (!navigator.geolocation) {
            if (window.location.hostname === 'localhost') {
                bypassCheckIn();
                return;
            }
            alert("Tu navegador no soporta geolocalización.");
            return;
        }

        setCheckingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const distance = getDistanceFromLatLonInMeters(latitude, longitude, WORKSHOP_COORDS.lat, WORKSHOP_COORDS.lng);

                // Bypass the 300m check for localhost development
                if (distance <= MAX_ALLOWED_DISTANCE_METERS || window.location.hostname === 'localhost') {
                    try {
                        await updateDoc(doc(db, 'Users', currentUser.uid), {
                            isAtWorkshop: true,
                            lastCheckIn: new Date()
                        });
                        alert("¡Check-in exitoso! Has registrado tu ingreso al taller.");
                    } catch (error) {
                        console.error("Error writing check-in to database", error);
                        alert("Hubo un error al guardar tu check-in. Intenta de nuevo.");
                    }
                } else {
                    const dictFormat = Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(distance);
                    alert(`Estás fuera del radio permitido para marcar ingreso. Te encuentras a ${dictFormat} metros del taller.`);
                }
                setCheckingLocation(false);
            },
            (error) => {
                console.error("Error obtaining location", error);
                if (window.location.hostname === 'localhost') {
                    bypassCheckIn();
                    return;
                }
                alert("No pudimos obtener tu ubicación. Por favor acepta los permisos del navegador e intenta de nuevo.");
                setCheckingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleCheckOut = async () => {
        if (window.confirm("¿Seguro que deseas marcar tu salida del taller?")) {
            try {
                await updateDoc(doc(db, 'Users', currentUser.uid), {
                    isAtWorkshop: false,
                    lastCheckOut: new Date()
                });
            } catch (error) {
                console.error("Error writing check-out", error);
                alert("Hubo un error al registrar tu salida.");
            }
        }
    };

    useEffect(() => {
        if (!currentUser) return;

        if (!currentUser?.sucursalId) return;

        // Fetch all relevant appointments for the mechanic
        // We need: 'completed' jobs assigned to them, AND 'pending' unassigned jobs
        // within their assigned sucursal.
        const q = query(collection(db, 'Appointments'), where('sucursalId', '==', currentUser.sucursalId));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const apps = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                // Filter: Only care if it's assigned to ME, OR it's pending and unassigned
                if (data.mechanicId === currentUser.uid || (!data.mechanicId && data.status === 'pending')) {
                    apps.push({ id: doc.id, ...data });
                }
            });
            // Sort by date descending
            apps.sort((a, b) => new Date(b.date) - new Date(a.date));
            setAppointments(apps);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleTakeJob = async (appId) => {
        try {
            const app = appointments.find(a => a.id === appId);
            if (!app) return;

            const appRef = doc(db, 'Appointments', appId);
            await updateDoc(appRef, {
                mechanicId: currentUser.uid,
                mechanicName: currentUser.displayName || 'Mecánico',
                status: 'diagnosing' // Move to diagnosing upon taking
            });

            // Notify the user that their vehicle is being worked on
            if (app.userId) {
                await addDoc(collection(db, 'Notifications'), {
                    title: "Moto en Revisión",
                    message: `Tu vehículo ya está en manos de ${currentUser.displayName || 'un mecánico'} y ha comenzado a ser evaluado.`,
                    targetUserId: app.userId,
                    createdAt: new Date(),
                    readBy: [],
                    icon: "handyman",
                    color: "text-red-500",
                    bg: "bg-red-500/10"
                });
            }

            // Let the real-time listener update the state
            console.log("Job taken successfully:", appId);
        } catch (error) {
            console.error('Error assigning job:', error);
        }
    };


    // Partition the data
    const completedApps = appointments.filter(a => 
        ['ready', 'delivery_pending', 'delivered'].includes(a.status) && 
        a.mechanicId === currentUser?.uid
    );
    const availableApps = appointments.filter(a => !a.mechanicId && a.status === 'pending');

    // Calculate Productivity for the chart
    const daysOfWeek = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    const serviceCounts = { D: 0, L: 0, M: 0, 'M-2': 0, J: 0, V: 0, S: 0 }; // 'M-2' handles the second 'M' (Miércoles)

    // Calculate current week boundaries (Monday to Sunday)
    const nowLocal = new Date();
    nowLocal.setHours(0, 0, 0, 0);
    const dayOfWeek = nowLocal.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const startOfWeek = new Date(nowLocal);
    startOfWeek.setDate(nowLocal.getDate() - diffToMonday);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    completedApps.forEach(app => {
        // Use the most accurate completion date available
        const completionDateStr = app.mechanicCompletedAt || app.updatedAt || app.paidAt;
        
        // If we have an ISO string timestamp from when it was completed/updated
        if (completionDateStr) {
            const dateObj = new Date(completionDateStr);
            if (!isNaN(dateObj.getTime()) && dateObj >= startOfWeek && dateObj <= endOfWeek) {
                 const dayIndex = dateObj.getDay(); 
                 if (dayIndex === 2) serviceCounts['M']++;
                 else if (dayIndex === 3) serviceCounts['M-2']++;
                 else serviceCounts[daysOfWeek[dayIndex]]++;
            }
        } else if (app.date) {
            // Fallback to original appointment date if no timestamps exist yet (legacy data)
            const [year, month, day] = app.date.split('-');
            if (year && month && day) {
                const dateObj = new Date(year, month - 1, day);
                // Only count items scheduled for this current week
                if (dateObj >= startOfWeek && dateObj <= endOfWeek) {
                    const dayIndex = dateObj.getDay(); // 0 = Domingo, 1 = Lunes...
                    if (dayIndex === 2) serviceCounts['M']++;
                    else if (dayIndex === 3) serviceCounts['M-2']++;
                    else serviceCounts[daysOfWeek[dayIndex]]++;
                }
            }
        }
    });

    const maxCount = Math.max(1, ...Object.values(serviceCounts)); // Prevent division by zero

    const chartData = [
        { day: 'L', count: serviceCounts['L'], active: new Date().getDay() === 1 },
        { day: 'M', count: serviceCounts['M'], active: new Date().getDay() === 2 },
        { day: 'M', count: serviceCounts['M-2'], active: new Date().getDay() === 3 },
        { day: 'J', count: serviceCounts['J'], active: new Date().getDay() === 4 },
        { day: 'V', count: serviceCounts['V'], active: new Date().getDay() === 5 },
        { day: 'S', count: serviceCounts['S'], active: new Date().getDay() === 6 },
        { day: 'D', count: serviceCounts['D'], active: new Date().getDay() === 0 },
    ].map(item => ({
        ...item,
        height: `${(item.count / maxCount) * 100}%`
    }));

    if (loading) {
        return (
            <div className="bg-[#0a0c14] min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
            </div>
        );
    }

    return (
        <div className="bg-[#0a0c14] text-slate-100 min-h-screen flex flex-col font-display w-full relative overflow-x-hidden">
            {/* Carbon Pattern Background */}
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-40"
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
            <div className="relative z-10 flex flex-col flex-1 h-screen overflow-y-auto">

                {/* Top Header */}
                <header className="flex items-center justify-center bg-[#161b2a]/90 backdrop-blur-md p-4 pb-3 sticky top-0 z-50 border-b border-slate-700/50 shadow-sm">
                    <div className="flex w-full max-w-[1600px] justify-between items-center px-2">
                        <div className="flex flex-col">
                            <h2 className="text-white text-lg font-bold leading-tight tracking-tight">Panel de Control</h2>
                            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{appConfig.companyName}</p>
                        </div>
                        <div className="flex items-center justify-end gap-3">
                            <Link to="/mechanic-profile" className="relative flex items-center justify-center rounded-full h-10 w-10 bg-slate-800 border-2 border-slate-700/80 hover:border-primary/50 transition-colors shadow-sm overflow-hidden group shrink-0" title="Editar Perfil">
                                {currentUser?.photoURL ? (
                                    <img src={currentUser.photoURL} alt="Perfil" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-white transition-colors text-[20px]">person</span>
                                )}
                            </Link>

                            <button onClick={togglePanel} className="relative flex items-center justify-center rounded-xl h-10 w-10 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700/50 active:scale-95 shadow-sm">
                                <span className="material-symbols-outlined text-[20px]">notifications</span>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3 rounded-full bg-primary border-2 border-[#161b2a] animate-pulse"></span>
                                )}
                            </button>
                            <Link to="/" className="relative flex items-center justify-center rounded-xl h-10 w-10 bg-red-500/10 text-red-500 hover:text-white hover:bg-red-500 transition-colors border border-red-500/20 active:scale-95 shadow-sm" title="Salir a Inicio">
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 lg:p-6 pb-24 max-w-[1600px] mx-auto w-full">

                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Geolocation Control Panel */}
                        <div className="bg-[#161b2a] border border-slate-700/50 rounded-2xl p-4 md:p-5 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`size-12 rounded-full flex items-center justify-center border-2 shrink-0 ${isAtWorkshop ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                                    <span className="material-symbols-outlined text-2xl">{isAtWorkshop ? 'where_to_vote' : 'location_off'}</span>
                                </div>
                                <div>
                                    <h3 className="text-white text-sm font-black uppercase tracking-wide">Control de Asistencia</h3>
                                    {isAtWorkshop ? (
                                        <p className="text-xs text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                            Ubicación Validada en Taller
                                        </p>
                                    ) : (
                                        <p className="text-xs text-slate-400 mt-0.5">Pendiente registrar ingreso</p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={isAtWorkshop ? handleCheckOut : handleCheckIn}
                                disabled={checkingLocation}
                                className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold tracking-wide uppercase text-xs transition-all active:scale-95 flex items-center justify-center gap-2 ${checkingLocation ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : isAtWorkshop ? 'bg-transparent border-2 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-primary text-[#101f22] hover:bg-primary/90 shadow-[0_0_15px_rgba(13,204,242,0.3)]'}`}
                            >
                                {checkingLocation ? (
                                    <><span className="material-symbols-outlined text-[16px] animate-spin">sync</span> Geolocalizando...</>
                                ) : isAtWorkshop ? (
                                    <><span className="material-symbols-outlined text-[16px]">logout</span> Marcar Salida</>
                                ) : (
                                    <><span className="material-symbols-outlined text-[16px]">how_to_reg</span> Marcar Ingreso</>
                                )}
                            </button>
                        </div>

                        {/* Available Jobs Section */}
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-white text-base font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">assignment_add</span>
                                    Nuevos Trabajos Disponibles
                                </h3>
                                {availableApps.length > 0 && (
                                    <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{availableApps.length}</span>
                                )}
                            </div>

                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
                                {availableApps.length > 0 ? (
                                    availableApps.map(app => (
                                        <div key={app.id} className="min-w-[280px] bg-[#161b2a] border border-slate-700/50 rounded-2xl p-4 shadow-lg shadow-black/50 flex flex-col justify-between hover:border-primary/30 transition-colors">
                                            <div className="flex gap-3 mb-4">
                                                <div className="size-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800 border border-slate-700/50">
                                                    <img loading="lazy" className="w-full h-full object-cover" alt="Motorcycle" src={app.vehicle?.imageUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=200"} />
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                                                        {app.date} • {app.time}
                                                    </span>
                                                    <h4 className="font-bold text-sm text-white leading-tight">
                                                        {app.vehicle?.brand} {app.vehicle?.model}
                                                    </h4>
                                                    <p className="text-xs text-slate-400 truncate mt-0.5">{app.clientName}</p>
                                                </div>
                                            </div>

                                            <div className="bg-[#0a0c14] rounded-lg p-2.5 mb-4 border border-slate-700/50">
                                                <p className="text-xs text-slate-300 line-clamp-2">
                                                    "{app.issueDescription || "Revisión general y mantenimiento"}"
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleTakeJob(app.id)}
                                                className="w-full bg-primary text-[#0a0c14] hover:bg-primary/90 py-2.5 rounded-xl text-sm font-bold tracking-widest uppercase transition-colors shadow-lg shadow-primary/20"
                                            >
                                                Tomar Trabajo
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-full text-center py-6 bg-[#161b2a] rounded-2xl border border-dashed border-slate-700/80 shadow-inner">
                                        <span className="material-symbols-outlined text-3xl text-slate-600 mb-2">inbox</span>
                                        <p className="text-sm text-slate-500 font-medium">No hay trabajos nuevos pendientes</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Completed Jobs History */}
                        <div className="flex flex-col gap-4 mt-8">
                            <h3 className="text-white text-base font-bold flex items-center gap-2 px-1">
                                <span className="material-symbols-outlined text-emerald-500">task_alt</span>
                                Trabajos Realizados
                            </h3>

                            <div className="flex flex-col gap-3">
                                {completedApps.length > 0 ? (
                                    completedApps.map(app => (
                                        <div key={app.id} className="flex items-center gap-4 p-4 rounded-2xl bg-[#161b2a] border border-slate-700/50 shadow-lg shadow-black/50 hover:border-emerald-500/30 transition-colors group">
                                            <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                                                <span className="material-symbols-outlined border border-emerald-500/20 rounded-lg p-1.5">two_wheeler</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-bold truncate">Servicio Completado</p>
                                                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">
                                                    OT #{app.id.slice(-4).toUpperCase()} • {app.vehicle?.brand} {app.vehicle?.model}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0 flex flex-col items-end gap-2">
                                                <span className="text-[9px] px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-bold tracking-widest inline-block">Finalizado</span>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedJobId(app.id);
                                                        setIsDeliveryReportOpen(true);
                                                    }}
                                                    className="inline-flex items-center justify-center p-2 bg-slate-800 hover:bg-primary/20 text-slate-300 hover:text-primary rounded-lg transition-colors border border-slate-700 hover:border-primary/50"
                                                    title="Ver Reporte Final de Entrega"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">print</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 bg-[#161b2a] border border-dashed border-slate-700/80 rounded-2xl shadow-inner">
                                        <span className="material-symbols-outlined text-3xl text-slate-600 mb-2">assignment_turned_in</span>
                                        <p className="text-sm text-slate-500 font-medium tracking-tight">Aún no tienes trabajos completados.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Productivity Chart Section */}
                        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#161b2a] border border-slate-700/50 shadow-lg shadow-black/50 mt-2">
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col gap-1">
                                    <p className="text-white text-base font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-emerald-400" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                                        Productividad
                                    </p>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Semana Actual</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-emerald-400 text-3xl font-black leading-none text-right">{completedApps.length}</p>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Servicios</span>
                                </div>
                            </div>

                            <div className="flex items-end justify-between h-32 px-1 pt-6 border-b border-slate-700/50 mt-2 pb-0">
                                {chartData.map((item, idx) => (
                                    <div key={idx} className="flex flex-col items-center justify-end w-full max-w-[32px] group cursor-pointer relative h-full">
                                        <span className={`absolute -top-7 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity ${item.active ? 'text-emerald-400' : 'text-slate-400'} bg-slate-800 px-2 py-1 rounded shadow-lg border border-slate-700/50 z-10`}>
                                            {item.count}
                                        </span>
                                        <div
                                            className={`w-full rounded-t-sm transition-all duration-300 group-hover:bg-emerald-400 ${item.active ? 'bg-emerald-400 shadow-[0_-4px_15px_rgba(52,211,153,0.4)]' : 'bg-emerald-400/20 hover:bg-emerald-400/50'}`}
                                            style={{ height: item.count > 0 ? item.height : '4px' }}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between px-1 mt-2">
                                {chartData.map((item, idx) => (
                                    <div key={idx} className="w-full max-w-[32px] text-center">
                                        <p className={`text-[10px] font-bold ${item.active ? 'text-emerald-400 font-black' : 'text-slate-500'}`}>{item.day}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Tips or Announcements could go here in the future */}
                        <div className="bg-gradient-to-br from-[#161b2a] to-emerald-900/10 border border-emerald-500/20 p-5 rounded-2xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
                           <h3 className="text-white text-sm font-black tracking-wide flex items-center gap-2 mb-2">
                               <span className="material-symbols-outlined text-emerald-500">campaign</span>
                               Avisos del Taller
                           </h3>
                           <p className="text-xs text-slate-400 font-medium leading-relaxed">
                               Recuerda marcar el inicio y fin de tus diagnósticos en la sección del tablero Kanban para mantener informados a los clientes.
                           </p>
                        </div>
                    </div>
                </main>

                {/* Bottom Navigation Bar */}
                <MechanicBottomNav />
            </div>

            <DeliveryReportModal
                isOpen={isDeliveryReportOpen}
                onClose={() => setIsDeliveryReportOpen(false)}
                appointmentId={selectedJobId}
            />
        </div>
    );
};

export default MechanicDashboard;
