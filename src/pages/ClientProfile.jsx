import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '../components/ui/BottomNav';
import RankDetailsModal from '../components/ui/RankDetailsModal';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const ClientProfile = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [isRankModalOpen, setIsRankModalOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!currentUser) return;
            try {
                // Fetch User Profile
                const userDoc = await getDoc(doc(db, 'Users', currentUser.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                } else {
                    // Fallback to basic auth info
                    setUserData({
                        name: currentUser.displayName || 'Usuario Dynotech',
                        email: currentUser.email,
                        photoURL: currentUser.photoURL
                    });
                }

                // Fetch Motorcycles
                const q = query(collection(db, "Motorcycles"), where("ownerId", "==", currentUser.uid));
                const querySnapshot = await getDocs(q);
                const bikes = [];
                querySnapshot.forEach((doc) => {
                    bikes.push({ id: doc.id, ...doc.data() });
                });
                setVehicles(bikes);
            } catch (error) {
                console.error("Error fetching profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [currentUser]);

    const handleWhatsAppSupport = () => {
        window.open('https://api.whatsapp.com/send?phone=1234567890&text=Hola%20Dynotech%20Power%20Garage,%20necesito%20asistencia%20VIP.', '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="bg-[#0a0c14] text-slate-100 h-[100dvh] flex flex-col font-display max-w-[1200px] w-full mx-auto shadow-2xl relative overflow-x-hidden lg:border-x lg:border-slate-800/50">
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

            {/* Rank Calculation */}
            {(() => {
                const points = userData?.points || 0;
                let rankName = 'Bronce';
                let nextRank = 'Plata';
                let nextPoints = 1000;
                let levelName = 'Nivel 1 Bronce';

                if (points >= 10000) {
                    rankName = 'Platino';
                    nextRank = 'Diamante';
                    nextPoints = 20000;
                    levelName = 'Nivel 4 Platino';
                } else if (points >= 3000) {
                    rankName = 'Oro';
                    nextRank = 'Platino';
                    nextPoints = 10000;
                    levelName = 'Nivel 3 Oro';
                } else if (points >= 1000) {
                    rankName = 'Plata';
                    nextRank = 'Oro';
                    nextPoints = 3000;
                    levelName = 'Nivel 2 Plata';
                }

                // Define VIP benefits with required points
                const vipBenefits = [
                    {
                        id: 'preventive',
                        title: 'Revisión Preventiva',
                        subtitle: 'Gratis 1x Año',
                        icon: 'health_and_safety',
                        requiredPoints: 1000,
                        action: () => window.alert('Agendando Revisión Preventiva Anual Gratuita...')
                    },
                    {
                        id: 'fast_track',
                        title: 'Fast-Track',
                        subtitle: 'Citas con Prioridad',
                        icon: 'schedule',
                        requiredPoints: 3000,
                        action: () => window.alert(`Visualizando disponibilidad con Prioridad de Reservas (${rankName})...`)
                    },
                    {
                        id: 'detailed_wash',
                        title: 'Lavado Detallado',
                        subtitle: 'Gratis en Mayor',
                        icon: 'dry_cleaning',
                        requiredPoints: 10000,
                        action: () => window.alert('Lavado Detallado agendado exitosamente a tu cuenta.')
                    },
                    {
                        id: 'home_pickup',
                        title: 'Recogida a Domicilio',
                        subtitle: 'Servicio Platino',
                        icon: 'local_shipping',
                        requiredPoints: 10000,
                        action: () => window.alert('¡Servicio VIP solicitado! Te contactaremos pronto para organizar la Recogida a Domicilio.')
                    }
                ];

                return (
                    <>
                        {/* Header Section */}
                        <div className="flex items-center p-4 justify-between bg-[#161b2a]/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800 shadow-sm">
                            <Link to="/history" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#161b2a] border border-slate-700/80 hover:border-primary/50 transition-colors shadow-inner">
                                <span className="material-symbols-outlined text-primary">arrow_back_ios_new</span>
                            </Link>
                            <div className="flex-1 text-center">
                                <h2 className="text-white text-lg font-black tracking-tight drop-shadow-md">Mi Perfil</h2>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-0.5">Dynotech Power Garage VIP</p>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/settings'); }} className="relative z-50 pointer-events-auto flex size-10 items-center justify-center rounded-full bg-[#161b2a] border border-slate-700/80 shadow-inner hover:border-primary/50 transition-colors">
                                    <span className="material-symbols-outlined text-primary">settings</span>
                                </button>
                                <button onClick={async (e) => { e.preventDefault(); e.stopPropagation(); const { getAuth, signOut } = await import('firebase/auth'); await signOut(getAuth()); navigate('/login'); }} className="relative z-50 pointer-events-auto flex size-10 items-center justify-center rounded-full bg-[#161b2a] border border-slate-700/80 shadow-inner hover:border-red-500/50 hover:text-red-500 transition-colors">
                                    <span className="material-symbols-outlined text-slate-100 hover:text-red-500 transition-colors">logout</span>
                                </button>
                            </div>
                        </div>

                        <main className="relative z-10 flex-1 overflow-y-auto pb-24 lg:grid lg:grid-cols-12 lg:gap-8 lg:p-6 lg:items-start">
                            <div className="lg:col-span-8 flex flex-col gap-6">
                                {/* Profile Hero */}
                                <div className="flex p-6 lg:p-0 flex-col items-center gap-6">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/40 transition-all"></div>
                                    <div className="relative bg-center bg-no-repeat aspect-square bg-cover rounded-full border-2 border-primary/50 p-1">
                                        <div
                                            className="size-32 rounded-full overflow-hidden bg-slate-800 shadow-[0_0_20px_rgba(255,40,0,0.3)] flex items-center justify-center shrink-0"
                                            style={userData?.photoURL ? { backgroundImage: `url("${userData.photoURL}")`, backgroundSize: 'cover' } : {}}
                                        >
                                            {!userData?.photoURL && <span className="material-symbols-outlined text-5xl text-slate-500">person</span>}
                                        </div>
                                    </div>
                                    {userData?.rewardsStatus === 'active' && (
                                        <div className="absolute bottom-0 right-0 bg-primary text-[#0a0c14] text-[10px] font-black px-2.5 py-1 rounded shadow-[0_0_10px_rgba(255,40,0,0.5)] tracking-widest border border-primary/50 uppercase">{rankName}</div>
                                    )}
                                </div>
                                <div className="flex flex-col items-center text-center w-full">
                                    <h1 className="text-white text-3xl font-black tracking-tight drop-shadow-md">{userData?.name || currentUser?.displayName || 'Cliente VIP'}</h1>
                                    <p className="text-slate-400 text-xs mt-1 mb-2">{userData?.email || currentUser?.email}</p>

                                    {userData?.rewardsStatus === 'active' ? (
                                        <div
                                            onClick={() => setIsRankModalOpen(true)}
                                            className="flex flex-col items-center cursor-pointer group active:scale-95 transition-transform"
                                        >
                                            <p className="text-primary font-black tracking-widest text-[10px] uppercase mt-1 group-hover:underline underline-offset-4">Socio VIP {rankName} • Miembro 0482</p>
                                            <div className="flex gap-2 mt-4">
                                                <div className="px-4 py-1.5 rounded-full bg-[#161b2a] border border-slate-700/80 text-[11px] font-bold text-slate-300 shadow-inner tracking-wide group-hover:border-primary/50 transition-colors">
                                                    <span className="text-primary mr-1">✦</span> {points.toLocaleString('es-ES')} Pts
                                                </div>
                                                <div className="px-4 py-1.5 rounded-full bg-[#161b2a] border border-slate-700/80 text-[11px] font-bold text-slate-300 shadow-inner tracking-wide flex items-center gap-1 group-hover:border-primary/50 transition-colors">
                                                    {levelName}
                                                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full max-w-xs mt-4">
                                            <button
                                                onClick={() => navigate('/rewards')}
                                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#1E293B] to-[#334155] text-slate-200 border border-slate-700 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg hover:border-primary hover:text-white transition-all active:scale-[0.98]"
                                            >
                                                <span className="material-symbols-outlined text-[18px] text-primary">workspace_premium</span>
                                                Unirse a Dynotech Rewards
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Collection Gallery */}
                            <div className="px-4 py-2">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-slate-100 text-xs font-black uppercase tracking-widest flex items-center drop-shadow-sm">
                                        <span className="w-1.5 h-4 bg-primary rounded-full mr-2.5 shadow-[0_0_8px_rgba(13,204,242,0.8)]"></span>
                                        Galería de Colección
                                    </h3>
                                    <Link to="/warranties" className="text-primary text-[10px] font-black uppercase hover:underline underline-offset-4 decoration-2 transition-colors">Ver todas</Link>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {loading ? (
                                        <div className="text-center py-4 text-slate-500 text-xs">Cargando colección...</div>
                                    ) : vehicles.length > 0 ? (
                                        vehicles.map((bike) => (
                                            <div key={bike.id} onClick={() => navigate('/warranties')} className="flex items-center gap-4 p-4 rounded-2xl bg-[#161b2a] border border-slate-700/50 shadow-lg shadow-black/50 hover:border-slate-500 transition-colors cursor-pointer active:scale-[0.99]">
                                                <div
                                                    className="size-20 rounded-xl bg-center bg-cover bg-slate-800 shrink-0 border border-slate-700/50 flex items-center justify-center overflow-hidden"
                                                    style={bike.imageUrl ? { backgroundImage: `url('${bike.imageUrl}')` } : {}}
                                                >
                                                    {!bike.imageUrl && <span className="material-symbols-outlined text-slate-500 text-3xl">two_wheeler</span>}
                                                </div>
                                                <div className="flex-1 flex flex-col">
                                                    <h3 className="text-white font-black tracking-wide text-sm">{bike.brand} {bike.model}</h3>
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                                        {bike.status === 'in_shop' ? (
                                                            <><span className="material-symbols-outlined text-[14px] text-amber-400">build</span>En Taller</>
                                                        ) : bike.status === 'ready' ? (
                                                            <><span className="material-symbols-outlined text-[14px] text-emerald-400">check_circle</span>Óptima</>
                                                        ) : (
                                                            <><span className="material-symbols-outlined text-[14px] text-primary">garage</span>En Garaje</>
                                                        )}
                                                    </div>
                                                    <div className="mt-3 flex items-center justify-between border-t border-slate-700/50 pt-2">
                                                        <span className="text-[9px] text-slate-500 tracking-widest font-black uppercase">Año: {bike.year}</span>
                                                        <span className="text-slate-200 font-bold text-[10px]">{bike.plate}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 bg-[#161b2a] border border-slate-700/50 rounded-2xl shadow-inner">
                                            <span className="material-symbols-outlined text-slate-500 text-4xl mb-2">two_wheeler</span>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No tienes motos registradas</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            </div>

                            <div className="lg:col-span-4 flex flex-col gap-6 mt-6 lg:mt-0">
                                {/* Exclusive Benefits */}
                                {userData?.rewardsStatus === 'active' && (
                                    <div className="px-4 lg:px-0 py-8 lg:py-0">
                                    <h3 className="text-slate-100 text-xs font-black uppercase tracking-widest mb-4 flex items-center drop-shadow-sm">
                                        <span className="w-1.5 h-4 bg-primary rounded-full mr-2.5 shadow-[0_0_8px_rgba(13,204,242,0.8)]"></span>
                                        Beneficios {rankName}
                                    </h3>
                                    {/* Action Cards Grid */}
                                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 mb-6 relative">
                                        {/* Interactive Sparkle Effect on Rank Card */}
                                        <div className="absolute top-1/2 left-1/4 size-10 bg-primary/30 rounded-full blur-xl animate-pulse pointer-events-none"></div>

                                        {/* Rank Focus Card */}
                                        <div onClick={() => setIsRankModalOpen(true)} className="p-4 rounded-2xl bg-gradient-to-br from-[#161b2a] to-[#0a0c14] border border-primary/30 flex flex-col items-center text-center gap-3 shadow-[0_0_15px_rgba(255,40,0,0.15)] hover:border-primary/60 transition-colors cursor-pointer relative overflow-hidden group active:scale-95">
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-primary text-2xl drop-shadow-md">star</span>
                                            </div>
                                            <div>
                                                <h4 className="text-white font-black text-sm drop-shadow-sm leading-tight group-hover:text-primary transition-colors">Beneficios {rankName}</h4>
                                                <p className="text-slate-400 text-[10px] mt-0.5 tracking-wide uppercase font-bold">Ver Privilegios</p>
                                            </div>
                                        </div>

                                        {/* Dynamic Benefit Cards */}
                                        {vipBenefits.map((benefit) => {
                                            const isUnlocked = points >= benefit.requiredPoints;

                                            return (
                                                <div
                                                    key={benefit.id}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (isUnlocked) {
                                                            benefit.action();
                                                        } else {
                                                            window.alert(`¡Sigue sumando! Necesitas ${benefit.requiredPoints.toLocaleString('es-ES')} Pts para desbloquear este beneficio exclusivo.`);
                                                        }
                                                    }}
                                                    className={`relative z-20 p-4 rounded-2xl bg-[#161b2a] border flex flex-col items-center text-center gap-3 shadow-lg transition-all
                                                        ${isUnlocked
                                                            ? 'border-slate-700/50 hover:border-primary/50 cursor-pointer active:scale-95'
                                                            : 'border-slate-800/80 grayscale opacity-60 cursor-not-allowed hover:opacity-80'
                                                        }`}
                                                >
                                                    <div className={`size-12 rounded-full bg-slate-800 flex items-center justify-center border shrink-0 
                                                        ${isUnlocked ? 'border-slate-700' : 'border-slate-800'}`}>
                                                        <span className={`material-symbols-outlined text-xl ${isUnlocked ? 'text-slate-300 font-light' : 'text-slate-500 font-normal'}`}>
                                                            {isUnlocked ? benefit.icon : 'lock'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-bold text-sm tracking-wide leading-tight ${isUnlocked ? 'text-slate-200' : 'text-slate-400'}`}>
                                                            {benefit.title}
                                                        </h4>
                                                        <p className="text-slate-500 text-[9px] mt-1 font-bold tracking-wide uppercase">
                                                            {isUnlocked ? benefit.subtitle : `Desbloquea a ${benefit.requiredPoints / 1000}k Pts`}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    </div>
                                )}

                                {/* Tech Support CTA */}
                                <div className="px-4 lg:px-0 pb-12 lg:pb-0">
                                    <div onClick={handleWhatsAppSupport} className="relative overflow-hidden p-6 rounded-2xl bg-primary/10 border border-primary/20 text-white flex flex-col gap-4 shadow-[0_0_20px_rgba(255,40,0,0.1)] cursor-pointer active:scale-[0.98] transition-transform">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                                    <div className="relative z-10 flex flex-col gap-1 pointer-events-none">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary drop-shadow-sm">Soporte Dedicado</span>
                                        <h3 className="text-xl font-black drop-shadow-md">Asesor Personalizado</h3>
                                        <p className="text-xs font-bold text-slate-300 mt-1">Resuelve dudas sobre tu colección o agenda servicios al instante.</p>
                                    </div>
                                    <button className="relative z-10 w-full bg-primary hover:bg-primary/90 text-[#0a0c14] text-[13px] uppercase tracking-widest py-3 rounded-xl font-black flex items-center justify-center gap-2 mt-2 shadow-[0_0_15px_rgba(255,40,0,0.3)]">
                                        <span className="material-symbols-outlined">chat</span>
                                        WhatsApp VIP
                                    </button>
                                    </div>
                                </div>
                            </div>
                        </main>

                        {/* Fixed Bottom Navigation */}
                        <BottomNav active="profile" />

                        {/* Rank Details Modal */}
                        <RankDetailsModal
                            isOpen={isRankModalOpen}
                            onClose={() => setIsRankModalOpen(false)}
                            points={points}
                            rankName={rankName}
                            levelName={levelName}
                            nextRank={nextRank}
                            nextPoints={nextPoints}
                        />
                    </>
                );
            })()}
        </div>
    );
};

export default ClientProfile;
