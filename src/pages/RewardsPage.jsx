import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import BottomNav from "../components/ui/BottomNav";
import VIPLevelCards from "../components/ui/VIPLevelCards";
import { appConfig } from "../config";

const RewardsPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    // Simulated check for existing subscription info in Users collection
    useEffect(() => {
        const fetchUserData = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }
            try {
                const userDocRef = doc(db, "Users", currentUser.uid);
                const userSnapshot = await getDoc(userDocRef);

                if (userSnapshot.exists()) {
                    setUserData(userSnapshot.data());
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [currentUser]);

    const handleSubscribe = async () => {
        if (!currentUser) {
            navigate("/auth");
            return;
        }

        try {
            setLoading(true);
            const userDocRef = doc(db, "Users", currentUser.uid);
            await setDoc(userDocRef, {
                rewardsStatus: "active",
                points: 0, // Starts at 0
                pointsHistory: []
            }, { merge: true });

            setUserData(prev => ({
                ...prev,
                rewardsStatus: "active",
                points: 0,
                socialMissions: prev?.socialMissions || {}
            }));
        } catch (error) {
            console.error("Error subscribing:", error);
            alert("No se pudo activar la suscripción en este momento. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-[#0a0c14] text-slate-100 min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
            </div>
        );
    }

    const isSubscribed = userData?.rewardsStatus === "active";
    const points = userData?.points || 0;
    const socialMissions = userData?.socialMissions || {};

    let rankName = "Bronce";
    let dotColor = "bg-[#cd7f32] shadow-[0_0_5px_rgba(205,127,50,0.8)]"; // Bronze color
    if (points >= 10000) {
        rankName = "Platino";
        dotColor = "bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]";
    } else if (points >= 3000) {
        rankName = "Oro";
        dotColor = "bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.8)]";
    } else if (points >= 1000) {
        rankName = "Plata";
        dotColor = "bg-slate-300 shadow-[0_0_5px_rgba(203,213,225,0.8)]";
    }

    const handleSocialMission = async (network, pointsAwarded) => {
        if (socialMissions[network]) {
            // Ya la completó, solo abrir el link
            if (network === "instagram") window.open(appConfig.social?.instagram || "https://instagram.com", "_blank");
            if (network === "tiktok") window.open(appConfig.social?.tiktok || "https://tiktok.com", "_blank");
            return;
        }

        try {
            setLoading(true);
            const userDocRef = doc(db, "Users", currentUser.uid);

            const newHistoryItem = {
                amount: pointsAwarded,
                reason: "Misión: Seguir en " + (network === "instagram" ? "Instagram" : "TikTok"),
                date: new Date().toISOString()
            };

            const updatedMissions = { ...socialMissions, [network]: true };

            await setDoc(userDocRef, {
                points: points + pointsAwarded,
                socialMissions: updatedMissions,
                pointsHistory: [...(userData?.pointsHistory || []), newHistoryItem]
            }, { merge: true });

            setUserData(prev => ({
                ...prev,
                points: prev.points + pointsAwarded,
                socialMissions: updatedMissions,
                pointsHistory: [...(prev.pointsHistory || []), newHistoryItem]
            }));

            // Abrir link
            if (network === "instagram") window.open(appConfig.social?.instagram || "https://instagram.com", "_blank");
            if (network === "tiktok") window.open(appConfig.social?.tiktok || "https://tiktok.com", "_blank");

        } catch (error) {
            console.error("Error updating mission:", error);
            alert("Hubo un error al procesar tu misión. Intenta más tarde.");
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#0a0c10] text-slate-100 h-[100dvh] flex flex-col font-display max-w-[1200px] w-full mx-auto shadow-2xl relative lg:border-x lg:border-slate-800/50">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center bg-[#161b2a]/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-slate-800 shadow-sm">
                <h2 className="text-slate-100 text-lg font-black leading-tight tracking-tight flex-1 text-center">
                    {appConfig.appName} Rewards
                </h2>
                <div className="w-8"></div> {/* Spacer for centering */}
            </header>

            <main className="flex-1 overflow-y-auto pb-32">
                {!isSubscribed ? (
                    /* ----- UNAUTHENTICATED / NOT SUBSCRIBED VIEW ----- */
                    <div className="flex flex-col items-center animate-in fade-in duration-500 lg:p-8">
                        {/* Hero Graphic */}
                        <div className="relative w-full h-64 bg-gradient-to-b from-primary/20 to-[#0a0c14] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>

                            <div className="relative z-10 size-20 bg-[#161b2a] border-2 border-primary/50 shadow-[0_0_30px_rgba(255,40,0,0.4)] rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-4xl text-primary animate-pulse">workspace_premium</span>
                            </div>
                            <h1 className="text-3xl font-black text-white drop-shadow-lg tracking-tight">
                                Dinamita tu <br /><span className="text-primary italic">Lealtad</span>
                            </h1>
                        </div>

                        {/* Sales Pitch */}
                        <div className="px-6 -mt-6 relative z-20 w-full max-w-sm mb-8">
                            <div className="bg-[#121826]/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl text-center">
                                <p className="text-slate-300 text-sm font-medium leading-relaxed">
                                    Únete a nuestro club exclusivo. Gana puntos por cada servicio, mantenimiento preventivo e interacción en la app, y canjéalos por recompensas increíbles.
                                </p>
                            </div>
                        </div>

                        {/* Benefits List Area */}
                        <div className="w-full px-6 lg:max-w-4xl lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start text-left mb-2">
                            <div className="space-y-4">
                                <h3 className="text-white font-black uppercase tracking-widest text-sm mb-4 border-b border-slate-800 pb-2">¿Cómo ganar puntos?</h3>

                            <div className="flex gap-4 items-center p-4 bg-[#161b2a] border border-slate-800 rounded-2xl">
                                <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 shrink-0">
                                    <span className="material-symbols-outlined text-emerald-500 text-lg">oil_barrel</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-sm">Servicios de Taller (+100 Pts)</h4>
                                    <p className="text-slate-400 text-xs mt-0.5">Suma automáticamente 100 puntos cada vez que retires tu moto lista del taller.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-center p-4 bg-[#161b2a] border border-slate-800 rounded-2xl">
                                <div className="size-10 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/30 shrink-0">
                                    <span className="material-symbols-outlined text-pink-400 text-lg">photo_camera</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-sm">Redes Sociales (+100 Pts)</h4>
                                    <p className="text-slate-400 text-xs mt-0.5">Gana 50 pts por seguirnos en Instagram y otros 50 pts por seguirnos en TikTok.</p>
                                </div>
                                </div>
                            </div>

                            {/* Tiers List */}
                            <div className="space-y-4 lg:mt-0 mt-8">
                                <h3 className="text-white font-black uppercase tracking-widest text-sm mb-4 border-b border-slate-800 pb-2">Niveles VIP</h3>
                                
                                <VIPLevelCards />
                            </div> {/* End Niveles VIP col */}
                        </div> {/* End Grid */}

                        {/* CTA */}
                        <div className="px-6 w-full mb-8">
                            <button
                                onClick={handleSubscribe}
                                className="w-full bg-primary hover:bg-primary/90 text-[#101522] py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,40,0,0.3)] transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">star</span>
                                Unirme al Club
                            </button>
                            <p className="text-center text-slate-500 text-[10px] mt-4 uppercase tracking-widest font-bold">Sin costo adicional • Exclusivo clientes {appConfig.companyName}</p>
                        </div>
                    </div>
                ) : (
                    /* ----- SUBSCRIBED USER VIEW (CATALOG) ----- */
                    <div className="animate-in slide-in-from-bottom-4 duration-500 lg:grid lg:grid-cols-12 lg:gap-8 lg:p-6 lg:items-start">
                        
                        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-8">
                            {/* Status Header */}
                            <div className="bg-[#161b2a] lg:rounded-3xl border-b lg:border border-slate-800 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-lg lg:py-5 lg:px-4">
                                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                            <p className="text-slate-400 text-[10px] lg:text-[9px] font-black uppercase tracking-widest mb-1 lg:mb-0">Mi Balance Actual</p>
                            <h2 className="text-5xl lg:text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,40,0,0.2)] mb-1">
                                {points.toLocaleString("es-ES")}
                            </h2>
                            <p className="text-primary text-sm lg:text-[11px] font-black uppercase tracking-widest">Puntos Acumulados</p>

                            <div className="mt-4 lg:mt-3 flex items-center gap-2 bg-[#161b2a] border border-slate-700/50 px-4 py-1.5 rounded-full cursor-help">
                                <div className={"size-1.5 rounded-full " + dotColor}></div>
                                <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Nivel Piloto: {rankName}</span>
                            </div>
                            </div>
                            
                            {/* Extra Missions */}
                            <div className="p-6 lg:p-0 lg:bg-transparent">
                                <h3 className="text-white font-black uppercase tracking-widest text-sm mb-4">Misiones Diarias Extra</h3>

                            <div className="flex gap-3 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden snap-x snap-mandatory font-display">
                                {/* Instagram Mission */}
                                <div className="flex-none min-w-[200px] snap-start flex flex-col gap-2 rounded-2xl p-4 lg:p-3 border border-slate-800 bg-[#161b2a] shadow-sm transform transition-transform hover:scale-[1.02]">
                                    <div className="flex justify-between items-center">
                                        <div className="size-8 rounded-lg bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white">
                                            <span className="material-symbols-outlined text-sm">photo_camera</span>
                                        </div>
                                        {socialMissions?.instagram ? (
                                            <span className="bg-emerald-500/20 text-emerald-500 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">check_circle</span> Listo</span>
                                        ) : (
                                            <span className="bg-primary/20 text-primary text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">+50 Pts</span>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black text-xs">Seguir en Instagram</h4>
                                        <p className="text-slate-400 text-[10px] mt-0.5 leading-tight line-clamp-2">Interactúa con nuestro contenido diario.</p>
                                    </div>
                                    <button
                                        onClick={() => handleSocialMission("instagram", 50)}
                                        className={"w-full py-2 rounded-xl font-black uppercase tracking-widest text-[10px] transition-colors mt-1 " + (socialMissions?.instagram ? "bg-slate-800 text-slate-500" : "bg-primary text-[#101522] hover:bg-primary/90")}
                                    >
                                        {socialMissions?.instagram ? "Ir al perfil" : "Completar Misión"}
                                    </button>
                                </div>

                                {/* TikTok Mission */}
                                <div className="flex-none min-w-[200px] snap-end flex flex-col gap-2 rounded-2xl p-4 lg:p-3 border border-slate-800 bg-[#161b2a] shadow-sm transform transition-transform hover:scale-[1.02]">
                                    <div className="flex justify-between items-center">
                                        <div className="size-8 bg-black border border-white/20 rounded-lg flex items-center justify-center text-white">
                                            <span className="material-symbols-outlined text-sm">play_arrow</span>
                                        </div>
                                        {socialMissions?.tiktok ? (
                                            <span className="bg-emerald-500/20 text-emerald-500 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">check_circle</span> Listo</span>
                                        ) : (
                                            <span className="bg-primary/20 text-primary text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">+50 Pts</span>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black text-xs">Seguir en TikTok</h4>
                                        <p className="text-slate-400 text-[10px] mt-0.5 leading-tight line-clamp-2">Videos, reparaciones e historias del taller.</p>
                                    </div>
                                    <button
                                        onClick={() => handleSocialMission("tiktok", 50)}
                                        className={"w-full py-2 rounded-xl font-black uppercase tracking-widest text-[10px] transition-colors mt-1 " + (socialMissions?.tiktok ? "bg-slate-800 text-slate-500" : "bg-primary text-[#101522] hover:bg-primary/90")}
                                    >
                                        {socialMissions?.tiktok ? "Ir al perfil" : "Completar Misión"}
                                    </button>
                                </div>
                            </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 flex flex-col gap-6">
                            {/* Catalog */}
                            <div className="p-6 lg:p-0">
                                <h3 className="text-white font-black uppercase tracking-widest text-sm mb-4">Catálogo de Beneficios</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 lg:gap-3 gap-4">
                                {/* Reward 1 (Affordable) */}
                                <div className={`relative bg-[#161b2a] border ${points >= 1000 ? "border-primary/50" : "border-slate-800/30 opacity-60"} rounded-2xl p-5 lg:p-4 overflow-hidden group transition-all duration-300 ${points < 1000 ? "cursor-not-allowed" : ""}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`size-10 rounded-lg flex items-center justify-center ${points >= 1000 ? "bg-primary/20 text-primary" : "bg-slate-800/50 text-slate-600"}`}>
                                            <span className="material-symbols-outlined text-xl">{points >= 1000 ? "local_car_wash" : "lock"}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-black ${points >= 1000 ? "text-white" : "text-slate-600"}`}>1.000</p>
                                            <p className={`text-[9px] uppercase font-bold ${points >= 1000 ? "text-slate-500" : "text-slate-700"}`}>Puntos</p>
                                        </div>
                                    </div>
                                    <h4 className={`font-black text-sm mb-1 leading-tight ${points >= 1000 ? "text-white" : "text-slate-500"}`}>Spa Completo</h4>
                                    <p className={`text-[10px] mb-4 lg:mb-3 line-clamp-2 ${points >= 1000 ? "text-slate-400" : "text-slate-600"}`}>Lavado premium de cortesía en tu próximo turno agendado en el taller.</p>

                                    <button disabled={points < 1000} className={`w-full py-2.5 lg:py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition-all ${points >= 1000 ? "bg-primary text-[#101522] hover:bg-primary/90 shadow-[0_0_15px_rgba(255,40,0,0.2)] cursor-pointer" : "bg-slate-800/30 text-slate-600 border border-slate-700/30 cursor-not-allowed"}`}>
                                        {points >= 1000 ? "Canjear Cupón" : "Bloqueado - 1.000 Pts Requeridos"}
                                    </button>
                                </div>

                                {/* Reward 2 */}
                                <div className={`relative bg-[#161b2a] border ${points >= 3000 ? "border-primary/50" : "border-slate-800/30 opacity-60"} rounded-2xl p-5 lg:p-4 overflow-hidden group transition-all duration-300 ${points < 3000 ? "cursor-not-allowed" : ""}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`size-10 rounded-lg flex items-center justify-center ${points >= 3000 ? "bg-primary/20 text-primary" : "bg-slate-800/50 text-slate-600"}`}>
                                            <span className="material-symbols-outlined text-xl">{points >= 3000 ? "settings" : "lock"}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-black ${points >= 3000 ? "text-white" : "text-slate-600"}`}>3.000</p>
                                            <p className={`text-[9px] uppercase font-bold ${points >= 3000 ? "text-slate-500" : "text-slate-700"}`}>Puntos</p>
                                        </div>
                                    </div>
                                    <h4 className={`font-black text-sm mb-1 leading-tight ${points >= 3000 ? "text-white" : "text-slate-500"}`}>Ajuste Express</h4>
                                    <p className={`text-[10px] mb-4 lg:mb-3 line-clamp-2 ${points >= 3000 ? "text-slate-400" : "text-slate-600"}`}>Lubricación y tensado de cadena gratuito al instante, sin agendar turno previo.</p>

                                    <button disabled={points < 3000} className={`w-full py-2.5 lg:py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition-all ${points >= 3000 ? "bg-primary text-[#101522] hover:bg-primary/90 shadow-[0_0_15px_rgba(255,40,0,0.2)] cursor-pointer" : "bg-slate-800/30 text-slate-600 border border-slate-700/30 cursor-not-allowed"}`}>
                                        {points >= 3000 ? "Canjear Cupón" : "Bloqueado - 3.000 Pts Requeridos"}
                                    </button>
                                </div>

                                {/* Reward 3 */}
                                <div className={`relative bg-[#161b2a] border ${points >= 10000 ? "border-primary/50" : "border-slate-800/30 opacity-60"} rounded-2xl p-5 lg:p-4 overflow-hidden group md:col-span-2 transition-all duration-300 ${points < 10000 ? "cursor-not-allowed" : ""}`}>
                                    {points >= 10000 && <div className="absolute -right-6 -top-6 size-24 bg-gradient-to-bl from-amber-500/20 to-transparent rounded-full blur-xl"></div>}
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <div className={`size-12 rounded-lg flex items-center justify-center border shadow-lg ${points >= 10000 ? "bg-amber-500/10 border-amber-500/50 text-amber-500" : "bg-slate-800/50 border-slate-700/30 text-slate-600"}`}>
                                            <span className="material-symbols-outlined text-2xl">{points >= 10000 ? "workspace_premium" : "lock"}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xl font-black ${points >= 10000 ? "text-amber-500" : "text-slate-600"}`}>10.000</p>
                                            <p className={`text-[9px] uppercase font-bold ${points >= 10000 ? "text-slate-500" : "text-slate-700"}`}>Puntos VIP</p>
                                        </div>
                                    </div>
                                    <h4 className={`font-black text-base lg:text-sm mb-1 leading-tight relative z-10 ${points >= 10000 ? "text-white" : "text-slate-500"}`}>Mano de Obra 100% Bonificada</h4>
                                    <p className={`text-[11px] lg:text-[10px] mb-4 lg:mb-3 max-w-sm relative z-10 lg:line-clamp-2 ${points >= 10000 ? "text-slate-400" : "text-slate-600"}`}>Tu lealtad es recompensada. El trabajo manual de tu próximo servicio de mantenimiento general va completamente por cuenta de la casa.</p>

                                    <button disabled={points < 10000} className={`w-full py-3 lg:py-2 rounded-lg font-black uppercase tracking-widest text-[10px] lg:text-[9px] transition-all relative z-10 ${points >= 10000 ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-[#101522] hover:opacity-90 shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer" : "bg-slate-800/30 text-slate-600 border border-slate-700/30 cursor-not-allowed"}`}>
                                        {points >= 10000 ? "Hacer Exigible Cupón Oro" : "Bloqueado - 10.000 Pts Requeridos"}
                                    </button>
                                </div>
                            </div>
                            </div>

                            {/* Tiers Information for Subscribed Users */}
                            <div className="p-6 lg:p-0 pt-6">
                                <h3 className="text-white font-black uppercase tracking-widest text-sm mb-4 border-b border-slate-800 pb-2">Niveles Vip: ¿Qué puedes ganar?</h3>
                                <VIPLevelCards />
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <BottomNav active="rewards" />
        </div>
    );
};

export default RewardsPage;
