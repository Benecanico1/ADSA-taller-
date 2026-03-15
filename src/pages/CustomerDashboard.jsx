import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '../components/ui/BottomNav';
import { useAuth } from '../lib/AuthContext';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import DevRoleToggle from '../components/DevRoleToggle';
import { collection, query, where, getDocs, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { useNotifications } from '../lib/NotificationContext';
import LeaveFeedbackModal from '../components/ui/LeaveFeedbackModal';
import LiveTelemetryCard from '../components/LiveTelemetryCard';
import EditMotorcycleModal from '../components/EditMotorcycleModal';
import DigitalSignatureModal from '../components/DigitalSignatureModal';
import ClientBudgetModal from '../components/ClientBudgetModal';
import ClientReadyModal from '../components/ClientReadyModal';
import VirtualMechanicChat from '../components/VirtualMechanicChat';
import { appConfig } from '../config';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { togglePanel } = useNotifications();
    const [vehicles, setVehicles] = useState([]);
    const [activeAppointment, setActiveAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [selectedMotorcycle, setSelectedMotorcycle] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [storeOrders, setStoreOrders] = useState([]);

    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

    const handleMarkArrivalClick = () => {
        setIsSignatureModalOpen(true);
    };

    const handleConfirmArrival = async (signatureData) => {
        if (!activeAppointment || !currentUser) return;

        try {
            // Update appointment status to pending (workshop reception) and add signature
            const appRef = doc(db, 'Appointments', activeAppointment.id);
            await updateDoc(appRef, {
                status: 'pending',
                digitalSignature: signatureData
            });

            // Notify admins and mechanics
            const notificationData = {
                title: "Vehículo en Taller",
                message: `El cliente ${currentUser.displayName || currentUser.email || 'Web'} ha llegado con su ${activeAppointment.vehicle?.brand || 'Moto'} ${activeAppointment.vehicle?.model || ''}.`,
                createdAt: new Date(),
                readBy: [],
                icon: "directions_car",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10"
            };

            await addDoc(collection(db, 'Notifications'), {
                ...notificationData,
                targetRole: 'admin'
            });

            await addDoc(collection(db, 'Notifications'), {
                ...notificationData,
                targetRole: 'mechanic'
            });

            setIsSignatureModalOpen(false);
        } catch (error) {
            console.error("Error marking arrival:", error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleNotificationsClick = () => {
        togglePanel();
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (!currentUser) return;

            try {
                // Fetch user's motorcycles
                const q = query(collection(db, "Motorcycles"), where("ownerId", "==", currentUser.uid));
                const querySnapshot = await getDocs(q);
                const bikes = [];
                querySnapshot.forEach((doc) => {
                    bikes.push({ id: doc.id, ...doc.data() });
                });
                setVehicles(bikes);

                // Fetch user's marketplace orders
                const ordersQ = query(collection(db, "MarketplaceOrders"), where("userId", "==", currentUser.uid));
                const ordersSnapshot = await getDocs(ordersQ);
                const ordersData = [];
                ordersSnapshot.forEach((doc) => {
                    ordersData.push({ id: doc.id, ...doc.data() });
                });
                
                // Sort descending manually since we didn't add a composite index
                ordersData.sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds);
                
                setStoreOrders(ordersData);
            } catch (error) {
                console.error("Error fetching vehicles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) return;
        const q = query(
            collection(db, "Appointments"),
            where("userId", "==", currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const validStatuses = ["scheduled", "pending", "diagnosing", "working", "quality", "ready", "delivery_pending"];
            
            // Filter locally and sort by date and time
            const validDocs = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(data => validStatuses.includes(data.status))
                .sort((a, b) => {
                    const dateA = new Date(`${a.date}T${a.time?.replace(/ (AM|PM)/, '') || '00:00'}:00`);
                    const dateB = new Date(`${b.date}T${b.time?.replace(/ (AM|PM)/, '') || '00:00'}:00`);
                    return dateA - dateB;
                });

            if (validDocs.length > 0) {
                // Get the most urgently upcoming active appointment
                const appData = validDocs[0];

                let vehicleData = {};
                if (appData.vehicleId) {
                    const vQ = query(collection(db, "Motorcycles"), where("__name__", "==", appData.vehicleId));
                    const vSnap = await getDocs(vQ);
                    if (!vSnap.empty) {
                        vehicleData = vSnap.docs[0].data();
                    }
                }

                setActiveAppointment({ ...appData, vehicle: vehicleData });
            } else {
                setActiveAppointment(null);
            }
        });

        return () => unsubscribe();
    }, [currentUser]);

    return (
        <div className="bg-[#0a0c14] text-slate-100 h-[100dvh] flex flex-col font-display w-full mx-auto relative overflow-hidden">
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

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#161b2a]/80 backdrop-blur-md border-b border-slate-800 p-4 pb-3 flex items-center justify-center shadow-sm">
                <div className="flex w-full max-w-[1600px] justify-between items-center px-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-primary to-red-600 p-1.5 rounded-xl shadow-[0_0_15px_rgba(255,40,0,0.3)]">
                            <span className="material-symbols-outlined text-white text-lg drop-shadow-sm">precision_manufacturing</span>
                        </div>
                        <div>
                            <h1 className="text-sm font-black leading-none text-white tracking-wide">{appConfig.companyName}</h1>
                            <p className="text-[9px] text-primary uppercase tracking-widest font-bold mt-0.5">Portal de Clientes</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <DevRoleToggle />
                        <button title="Notificaciones" onClick={handleNotificationsClick} className="relative flex items-center justify-center rounded-full size-10 bg-[#161b2a] border border-slate-700/80 hover:border-primary/50 text-slate-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-xl">notifications</span>
                            {/* Assuming there's an unread count you could wire up here */}
                        </button>
                        <button title="Cerrar sesión" onClick={handleSignOut} className="relative flex items-center justify-center rounded-full size-10 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-xl">logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex-1 overflow-y-auto p-4 lg:p-6 pb-28 lg:pb-36 max-w-[1600px] mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                    {/* Left Column (Main Focus) */}
                    <div className="lg:col-span-8 flex flex-col gap-3 lg:gap-4">
                        {/* Embedded Live Telemetry */}
                        <div className="bg-[#161b2a]/50 p-3 lg:p-4 rounded-3xl border border-slate-800/80 shadow-inner">
                    {activeAppointment ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-white text-lg font-black tracking-tight drop-shadow-md">
                                    {activeAppointment.vehicle?.brand} {activeAppointment.vehicle?.model}
                                </h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                    Patente: <span className="text-slate-200">{activeAppointment.vehicle?.plate}</span>
                                </p>
                            </div>
                            {activeAppointment.status === 'scheduled' ? (
                                <div className="flex flex-col gap-3">
                                    <div className="bg-[#161b2a] border border-slate-700/50 p-4 rounded-xl flex items-center justify-between shadow-lg shadow-black/30 w-full">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                                                <span className="material-symbols-outlined text-primary">calendar_clock</span>
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-black tracking-widest uppercase text-white drop-shadow-sm">Turno Agendado</h4>
                                                <p className="text-[11px] text-slate-400 font-bold tracking-wider mt-0.5">{activeAppointment.date} | {activeAppointment.time}</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700/50">
                                            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-300">Esperando Ingreso</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleMarkArrivalClick}
                                        className="w-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/30 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-lg">storefront</span>
                                        Realizar Check-in Digital
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {activeAppointment.authorizationStatus === 'pending_client' && (
                                        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col gap-3 shadow-[0_0_15px_rgba(245,158,11,0.15)] relative overflow-hidden mb-4">
                                            <div className="absolute -right-6 -top-6 bg-amber-500/20 size-24 rounded-full blur-2xl pointer-events-none"></div>
                                            <div className="flex items-start gap-3">
                                                <div className="bg-amber-500/20 p-2 rounded-xl">
                                                    <span className="material-symbols-outlined text-amber-500">request_quote</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-amber-500 font-bold text-sm tracking-wide">Presupuesto Extra Requerido</h4>
                                                    <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                                                        El taller ha cotizado repuestos adicionales o mano de obra necesarios para continuar con el trabajo óptimo en tu vehículo.
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setIsBudgetModalOpen(true)}
                                                className="w-full bg-amber-500 hover:bg-amber-400 text-[#0a0c14] py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all mt-1 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse hover:animate-none"
                                            >
                                                <span className="material-symbols-outlined text-base">visibility</span>
                                                Revisar Cotización
                                            </button>
                                        </div>
                                    )}
                                    <LiveTelemetryCard appointment={activeAppointment} />
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="bg-[#161b2a] border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg shadow-black/50">
                            <div className="size-10 bg-slate-800 rounded-full flex items-center justify-center mb-2 border border-slate-700">
                                <span className="material-symbols-outlined text-2xl text-slate-500">garage</span>
                            </div>
                            <h3 className="text-white text-sm font-bold mb-1">Sin Servicios Activos</h3>
                            <p className="text-xs text-slate-400 max-w-[250px] leading-snug">
                                Actualmente no tienes ninguna motocicleta en servicio. Puedes agendar una cita o revisar tu historial.
                            </p>
                            <button
                                onClick={() => navigate('/appointments')}
                                className="mt-3 bg-primary/10 hover:bg-primary text-primary hover:text-[#0a0c14] border border-primary/30 px-5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                                Agendar Cita
                            </button>
                        </div>
                    )}
                        </div>

                        {/* Quick Actions (Now a grid instead of horizontal scroll on large screens) */}
                        <div className="grid grid-cols-5 gap-2 lg:gap-3">

                        <button
                            onClick={() => navigate('/appointments')}
                            className="w-full flex flex-col items-center justify-center p-2 lg:p-2.5 rounded-2xl bg-[#161b2a] border border-slate-700/50 hover:border-primary/50 transition-colors gap-2 lg:gap-2.5 group shadow-sm active:scale-95"
                        >
                            <div className="size-10 lg:size-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shadow-inner">
                                <span className="material-symbols-outlined text-primary text-[20px] lg:text-[22px]">add_circle</span>
                            </div>
                            <span className="text-[9px] font-black text-slate-300 text-center leading-tight uppercase tracking-widest">Agendar</span>
                        </button>
                        <button
                            onClick={() => navigate('/history')}
                            className="w-full flex flex-col items-center justify-center p-2 lg:p-2.5 rounded-2xl bg-[#161b2a] border border-slate-700/50 hover:border-primary/50 transition-colors gap-2 lg:gap-2.5 group shadow-sm active:scale-95"
                        >
                            <div className="size-10 lg:size-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shadow-inner">
                                <span className="material-symbols-outlined text-primary text-[20px] lg:text-[22px]">history_edu</span>
                            </div>
                            <span className="text-[9px] font-black text-slate-300 text-center leading-tight uppercase tracking-widest">Historial</span>
                        </button>
                        <button
                            onClick={() => window.open(`https://api.whatsapp.com/send?phone=${appConfig.social.whatsapp}&text=Hola%20${appConfig.companyName},%20necesito%20asistencia.`, '_blank', 'noopener,noreferrer')}
                            className="w-full flex flex-col items-center justify-center p-2 lg:p-2.5 rounded-2xl bg-[#161b2a] border border-slate-700/50 hover:border-emerald-500/50 transition-colors gap-2 lg:gap-2.5 group shadow-sm active:scale-95"
                        >
                            <div className="size-10 lg:size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors shadow-inner">
                                <span className="material-symbols-outlined text-emerald-500 text-[20px] lg:text-[22px]">chat</span>
                            </div>
                            <span className="text-[9px] font-black text-slate-300 text-center leading-tight uppercase tracking-widest">Soporte</span>
                        </button>
                        <button
                            onClick={() => setIsFeedbackModalOpen(true)}
                            className="w-full flex flex-col items-center justify-center p-2 lg:p-2.5 rounded-2xl bg-[#161b2a] border border-slate-700/50 hover:border-amber-500/50 transition-colors gap-2 lg:gap-2.5 group shadow-sm active:scale-95"
                        >
                            <div className="size-10 lg:size-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors shadow-inner">
                                <span className="material-symbols-outlined text-amber-500 text-[20px] lg:text-[22px]">star</span>
                            </div>
                            <span className="text-[9px] font-black text-slate-300 text-center leading-tight uppercase tracking-widest">Reseña</span>
                        </button>
                        <button
                            onClick={() => navigate('/rutas')}
                            className="w-full flex flex-col items-center justify-center p-2 lg:p-2.5 rounded-2xl bg-[#161b2a] border border-slate-700/50 hover:border-primary/50 transition-colors gap-2 lg:gap-2.5 group shadow-sm active:scale-95"
                        >
                            <div className="size-10 lg:size-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors shadow-inner">
                                <span className="material-symbols-outlined text-purple-500 text-[20px] lg:text-[22px]">explore</span>
                            </div>
                            <span className="text-[9px] font-black text-slate-300 text-center leading-tight uppercase tracking-widest">Rutas</span>
                        </button>
                        </div>
                    </div>

                    {/* Right Column (Secondary Info) */}
                    <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-5">
                        {/* My Assets Section */}
                        <section className="bg-[#161b2a]/50 p-4 lg:p-5 rounded-3xl border border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                            <div className="flex items-center justify-between mb-4 lg:mb-5">
                                <h3 className="text-slate-100 text-[11px] lg:text-xs font-black uppercase tracking-widest flex items-center drop-shadow-sm">
                                    <span className="w-1.5 h-4 bg-slate-500 rounded-full mr-2.5"></span>
                                    Mis Vehículos
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => navigate('/add-motorcycle')} className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 px-2 lg:px-3 py-1.5 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">add</span>
                                        Nuevo
                                    </button>
                                    <button onClick={() => navigate('/warranties')} className="text-primary text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:underline underline-offset-4 decoration-2">Garantías</button>
                                </div>
                            </div>
        
                            <div className="flex flex-col gap-3 lg:gap-4">
                        {loading ? (
                            <div className="text-slate-400 text-xs py-4">Cargando vehículos...</div>
                        ) : vehicles.length > 0 ? (
                            vehicles.map((bike) => (
                                <div
                                    key={bike.id}
                                    onClick={() => { setSelectedMotorcycle(bike); setIsEditModalOpen(true); }}
                                    className="min-w-[220px] rounded-xl lg:rounded-2xl bg-[#161b2a] border border-slate-700/50 overflow-hidden shadow-lg hover:border-primary transition-colors cursor-pointer group"
                                >
                                    <div
                                        className="relative h-24 lg:h-28 w-full bg-cover bg-center"
                                        style={{ backgroundImage: `url("${bike.imageUrl || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=500'}")` }}
                                    >
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span className="material-symbols-outlined text-white text-2xl lg:text-3xl">edit</span>
                                        </div>
                                    </div>
                                    <div className="p-3 lg:p-4">
                                        <h4 className="text-slate-100 text-xs lg:text-[13px] font-black tracking-wide">{bike.brand} {bike.model}</h4>
                                        <p className="text-slate-400 text-[9px] lg:text-[10px] font-semibold uppercase tracking-wider mt-0.5 lg:mt-1">Patente: {bike.plate}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="w-full text-center py-5 lg:py-6 bg-[#161b2a] rounded-xl border border-slate-700/50">
                                <span className="material-symbols-outlined text-slate-500 text-2xl lg:text-3xl mb-1 lg:mb-2">two_wheeler</span>
                                <p className="text-slate-400 text-[10px] lg:text-xs uppercase tracking-widest">No tienes vehículos registrados</p>
                            </div>
                                )}
                             </div>
                         </section>
                         
                         {/* My Orders Section */}
                         <section className="bg-[#161b2a]/50 p-4 lg:p-5 rounded-3xl border border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                             <div className="flex items-center justify-between mb-4 lg:mb-5">
                                 <h3 className="text-slate-100 text-[11px] lg:text-xs font-black uppercase tracking-widest flex items-center drop-shadow-sm">
                                     <span className="w-1.5 h-4 bg-primary rounded-full mr-2.5"></span>
                                     Pedidos Tienda
                                 </h3>
                                 <button onClick={() => navigate('/tienda')} className="text-primary text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:underline underline-offset-4 decoration-2 border border-primary/20 px-2 py-1 rounded-md">
                                     Ir a Tienda
                                 </button>
                             </div>
                             
                             <div className="flex flex-col gap-3">
                                 {loading ? (
                                     <div className="text-slate-400 text-xs py-4 text-center">Cargando pedidos...</div>
                                 ) : storeOrders.length > 0 ? (
                                     storeOrders.slice(0, 3).map(order => {
                                         const isCompleted = order.status === 'completed';
                                         const isCancelled = order.status === 'cancelled';
                                         return (
                                             <div key={order.id} className="bg-[#121826] border border-slate-700/50 p-3 rounded-2xl flex flex-col gap-2 shadow-sm">
                                                 <div className="flex justify-between items-center">
                                                     <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">ID: {order.id.substring(0,8)}</p>
                                                     <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                         isCompleted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 
                                                         isCancelled ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 
                                                         'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                                                     }`}>
                                                         {order.status === 'pending' ? 'Pendiente' : 
                                                          order.status === 'processing' ? 'Procesando' : 
                                                          order.status === 'shipped' ? 'Enviado' : 
                                                          order.status === 'completed' ? 'Completado' : 'Cancelado'}
                                                     </span>
                                                 </div>
                                                 <div className="flex justify-between items-end mt-1">
                                                     <div>
                                                         <p className="text-xs text-slate-300 font-medium">{order.totals?.itemsCount} producto(s)</p>
                                                         <p className="text-[10px] text-slate-500 mt-0.5">
                                                             {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('es-AR') : 'Reciente'}
                                                         </p>
                                                     </div>
                                                     <p className="text-sm font-black text-white">${Number(order.totals?.totalPrice).toLocaleString()}</p>
                                                 </div>
                                             </div>
                                         )
                                     })
                                 ) : (
                                     <div className="w-full text-center py-5 bg-[#161b2a] rounded-xl border border-slate-700/50">
                                         <span className="material-symbols-outlined text-slate-500 text-2xl mb-1">shopping_bag</span>
                                         <p className="text-slate-400 text-[10px] uppercase tracking-widest">Aún no tienes pedidos</p>
                                     </div>
                                 )}
                             </div>
                         </section>
                        
                        {/* Useful Links / Additional Info placeholder for right column */}
                        <section className="bg-gradient-to-br from-primary/10 to-[#161b2a] border border-primary/20 p-5 rounded-3xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700 pointer-events-none"></div>
                           <h3 className="text-white text-sm font-black tracking-wide flex items-center gap-2 mb-2 relative z-10">
                               <span className="material-symbols-outlined text-primary">diamond</span>
                               Experiencia Premium
                           </h3>
                           <p className="text-xs text-slate-400 font-medium leading-relaxed relative z-10">
                               Accede al historial clínico completo de tus vehículos, revisa las facturas y presupuestos detallados en tu panel.
                           </p>
                        </section>

                    </div>
                </div>
            </main>

            <LeaveFeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
            />

            <EditMotorcycleModal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setSelectedMotorcycle(null); }}
                motorcycle={selectedMotorcycle}
            />

            <DigitalSignatureModal
                isOpen={isSignatureModalOpen}
                onClose={() => setIsSignatureModalOpen(false)}
                onConfirm={handleConfirmArrival}
                customerName={currentUser?.displayName || currentUser?.email?.split('@')[0] || "Cliente"}
            />

            <ClientBudgetModal
                isOpen={isBudgetModalOpen}
                onClose={() => setIsBudgetModalOpen(false)}
                appointment={activeAppointment}
            />

            {(activeAppointment?.status === 'delivery_pending' && !activeAppointment.clientConfirmedPickup) && (
                <ClientReadyModal
                    appointment={activeAppointment}
                    onClose={() => {}} 
                />
            )}

            <VirtualMechanicChat />

            <BottomNav active="dashboard" />
        </div>
    );
};

export default CustomerDashboard;
