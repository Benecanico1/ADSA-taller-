import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const RouteDetailsModal = ({ isOpen, onClose, routeId }) => {
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !routeId) return;

        const fetchRouteDetails = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, 'Routes', routeId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setRoute({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.log("No such document!");
                    setRoute(null);
                }
            } catch (error) {
                console.error("Error fetching route details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRouteDetails();
    }, [isOpen, routeId]);

    if (!isOpen) return null;

    const getDifficultyColor = (diff) => {
        switch (diff?.toLowerCase()) {
            case 'experto': return 'text-red-500 bg-red-500/10 border-red-500/30';
            case 'intermedio': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
            default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center bg-black/80 backdrop-blur-sm transition-all duration-300">
            <div className="bg-[#161b2a] w-full max-w-md h-[90vh] sm:h-[85vh] sm:rounded-3xl border-t sm:border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative animate-slideUp">

                {/* Header Actions */}
                <div className="absolute top-4 right-4 z-20">
                    <button onClick={onClose} className="size-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-slate-800 transition-colors border border-white/10 shadow-lg">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined animate-spin text-purple-500 text-4xl mb-4">sync</span>
                        <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Cargando detalles...</p>
                    </div>
                ) : !route ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
                        <h3 className="text-white text-lg font-black mb-2">Ruta no encontrada</h3>
                        <p className="text-slate-400 text-sm">Parece que esta ruta fue eliminada o ya no está disponible.</p>
                    </div>
                ) : (
                    <>
                        {/* Dynamic Cover / Flyer Header */}
                        <div className="relative h-64 shrink-0 bg-slate-900 border-b border-slate-800">
                            {route.flyerUrl ? (
                                <img src={route.flyerUrl} alt="Flyer Ruta" className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-[#0a0c14] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-purple-500/50 text-[100px] drop-shadow-2xl">two_wheeler</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#161b2a] via-[#161b2a]/60 to-transparent"></div>

                            {/* Title overlay */}
                            <div className="absolute bottom-6 left-6 right-6">
                                <span className={`text-[9px] font-black border px-2 py-0.5 rounded-lg uppercase tracking-widest mb-3 inline-block shadow-sm ${getDifficultyColor(route.difficulty)}`}>
                                    {route.difficulty || 'General'}
                                </span>
                                <h1 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight drop-shadow-md">
                                    {route.title}
                                </h1>
                            </div>
                        </div>

                        {/* Content Scrollable */}
                        <div className="flex-1 p-6 overflow-y-auto no-scrollbar pb-24 space-y-6 bg-[#0a0c14]">

                            {/* Organizer Profile */}
                            <div className="flex items-center gap-3 bg-[#161b2a] p-3 rounded-2xl border border-slate-800/80 shadow-sm">
                                <div className="size-12 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center border-2 border-[#0a0c14] shadow-md">
                                    <span className="material-symbols-outlined text-white text-[20px]">sports_motorsports</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Organizador Oficial</p>
                                    <p className="text-sm font-black text-slate-100">{route.promoterName}</p>
                                </div>
                                <div className="bg-purple-500/10 p-2 rounded-xl text-purple-400">
                                    <span className="material-symbols-outlined text-xl">verified</span>
                                </div>
                            </div>

                            {/* Key Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#161b2a] p-4 rounded-2xl border border-slate-800/80 flex flex-col gap-1 shadow-sm">
                                    <span className="material-symbols-outlined text-purple-400 text-[20px] mb-1">map</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Destino</span>
                                    <span className="text-sm font-black text-slate-200">{route.destination}</span>
                                </div>
                                <div className="bg-[#161b2a] p-4 rounded-2xl border border-slate-800/80 flex flex-col gap-1 shadow-sm">
                                    <span className="material-symbols-outlined text-emerald-400 text-[20px] mb-1">calendar_month</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fecha y Hora</span>
                                    <span className="text-sm font-black text-slate-200 truncate">
                                        {new Date(route.date).toLocaleDateString()} a las {new Date(route.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="col-span-2 bg-[#161b2a] p-4 rounded-2xl border border-slate-800/80 flex flex-col gap-1 shadow-sm">
                                    <span className="material-symbols-outlined text-blue-400 text-[20px] mb-1">location_on</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Punto de Encuentro</span>
                                    <span className="text-sm font-black text-slate-200">{route.meetingPoint}</span>
                                </div>
                            </div>

                            {/* Description block */}
                            {route.description && (
                                <div className="pt-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                                        <span className="w-1.5 h-3 bg-purple-500 rounded-full"></span>
                                        Información y Reglas
                                    </h4>
                                    <p className="text-sm text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                                        {route.description}
                                    </p>
                                </div>
                            )}

                        </div>

                        {/* Fixed Actions Footer */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0c14] via-[#0a0c14]/90 to-transparent">
                            <button
                                onClick={() => window.open(route.contactLink || '#', '_blank')}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0a0c14] font-black uppercase tracking-widest text-sm py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98]"
                            >
                                <ion-icon name="logo-whatsapp" class="text-xl"></ion-icon>
                                Unirse al Grupo Oficial
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RouteDetailsModal;
