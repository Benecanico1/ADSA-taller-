import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, getDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import BottomNav from '../components/ui/BottomNav';
import { useNotifications } from '../lib/NotificationContext';
import CreateRouteModal from '../components/CreateRouteModal';
import PromoterApplicationModal from '../components/PromoterApplicationModal';
import RouteDetailsModal from '../components/RouteDetailsModal'; 
import CommunityRulesModal from '../components/CommunityRulesModal';

const MotoRoutes = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { togglePanel, unreadCount } = useNotifications();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPromoter, setIsPromoter] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
    const [selectedRouteId, setSelectedRouteId] = useState(null); // For Details Modal

    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Auto-scroll to bottom of chat
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Check if user is a promoter
        const checkPromoterStatus = async () => {
            if (!currentUser) return;
            try {
                const userDoc = await getDoc(doc(db, 'Users', currentUser.uid));
                if (userDoc.exists() && userDoc.data().isPromoter) {
                    setIsPromoter(true);
                }
            } catch (error) {
                console.error("Error checking promoter status:", error);
            }
        };

        checkPromoterStatus();

        // Listen to chat messages
        const q = query(collection(db, 'RouteChatMessages'), orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = [];
            snapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() });
            });
            setMessages(msgs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Scroll every time messages update
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        setIsSending(true);
        try {
            await addDoc(collection(db, 'RouteChatMessages'), {
                text: newMessage.trim(),
                userId: currentUser.uid,
                userName: currentUser.displayName || currentUser.email.split('@')[0],
                isPromoter: isPromoter,
                createdAt: serverTimestamp()
            });
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            alert("No se pudo enviar el mensaje.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="bg-[#0a0c14] text-slate-100 h-screen flex flex-col font-display max-w-[1200px] w-full mx-auto shadow-2xl relative overflow-hidden pb-[72px] lg:border-x lg:border-slate-800/50">
            {/* Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40" style={{ backgroundColor: '#0a0c14', backgroundImage: `linear-gradient(45deg, #111 25%, transparent 25%), linear-gradient(-45deg, #111 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111 75%), linear-gradient(-45deg, transparent 75%, #111 75%)`, backgroundSize: '4px 4px' }}></div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#161b2a]/90 backdrop-blur-md border-b border-slate-800 shadow-sm relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent pointer-events-none"></div>
                <div className="flex items-center p-4 justify-between relative z-10">
                    <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full bg-[#161b2a] border border-slate-700/80 hover:border-purple-500/50 transition-colors shadow-inner">
                        <span className="material-symbols-outlined text-purple-400">arrow_back_ios_new</span>
                    </button>

                    <div className="text-center flex-1 mx-4">
                        <h2 className="text-lg font-black leading-tight tracking-tight text-white drop-shadow-md">Rutas y Comunidad</h2>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                            <span className="relative flex size-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                            </span>
                            Chat Online
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => setIsRulesModalOpen(true)} className="relative size-10 flex items-center justify-center rounded-full bg-[#161b2a] border border-slate-700/80 hover:border-purple-500/50 transition-colors shadow-inner" title="Normas de Convivencia">
                            <span className="material-symbols-outlined text-slate-400 hover:text-purple-400 transition-colors">policy</span>
                        </button>
                        {!isPromoter && (
                            <button onClick={() => setIsApplyModalOpen(true)} className="relative size-10 flex items-center justify-center rounded-full bg-[#161b2a] border border-slate-700/80 hover:border-purple-500/50 transition-colors shadow-inner" title="Postular a Promotor">
                                <span className="material-symbols-outlined text-purple-400">campaign</span>
                            </button>
                        )}
                        <button onClick={togglePanel} className="relative size-10 flex items-center justify-center rounded-full bg-[#161b2a] border border-slate-700/80 hover:border-purple-500/50 transition-colors shadow-inner relative">
                            <span className="material-symbols-outlined text-purple-400">notifications</span>
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 rounded-full bg-red-500 border border-[#161b2a] animate-pulse"></span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar max-w-4xl mx-auto w-full">

                {/* Welcome / Info message form System */}
                <div className="flex justify-center my-4">
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 max-w-[85%] text-center">
                        <span className="material-symbols-outlined text-purple-400 text-2xl mb-1">local_fire_department</span>
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest leading-relaxed">
                            Bienvenido a la comunidad oficial.<br />
                            Solo los Promotores oficiales <span className="text-purple-400 font-black px-1 rounded bg-purple-500/10 border border-purple-500/20">VERIFICADOS</span> publican los Flyers de rutas oficiales.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <span className="material-symbols-outlined animate-spin text-purple-500 text-3xl mb-4">sync</span>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMine = msg.userId === currentUser?.uid;

                        // If it's a flyer message (official route)
                        if (msg.attachedRouteId) {
                            return (
                                <div key={msg.id} className="flex justify-center my-6">
                                    <div
                                        onClick={() => setSelectedRouteId(msg.attachedRouteId)}
                                        className="bg-[#161b2a] border border-purple-500/30 rounded-2xl overflow-hidden max-w-sm w-full shadow-[0_10px_30px_rgba(168,85,247,0.15)] cursor-pointer hover:border-purple-400 hover:shadow-[0_10px_30px_rgba(168,85,247,0.25)] transition-all group"
                                    >
                                        <div className="relative">
                                            {/* Flyer Image */}
                                            {msg.attachedFlyerUrl ? (
                                                <img loading="lazy" src={msg.attachedFlyerUrl} alt="Flyer" className="w-full h-auto aspect-square object-cover" />
                                            ) : (
                                                <div className="w-full h-48 bg-purple-900/20 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-blend-overlay">
                                                    <span className="material-symbols-outlined text-purple-400 text-6xl drop-shadow-lg">event_available</span>
                                                </div>
                                            )}

                                            {/* Overlay Ribbon */}
                                            <div className="absolute top-4 left-4 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">verified</span>
                                                Ruta Oficial
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gradient-to-t from-[#161b2a] to-transparent">
                                            <p className="text-sm font-black text-white mb-2 leading-tight">
                                                {msg.text || "Nueva Ruta Organizada!"}
                                            </p>
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-6 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                                        <span className="material-symbols-outlined text-purple-400 text-[12px]">sports_motorsports</span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-bold tracking-widest">{msg.userName}</span>
                                                </div>
                                                <span className="text-purple-400 text-[10px] font-black uppercase tracking-widest group-hover:underline">Ver Info</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Regular Text Message
                        return (
                            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex flex-col max-w-[80%] ${isMine ? 'items-end' : 'items-start'}`}>
                                    {/* Author name above message if not mine */}
                                    {!isMine && (
                                        <span className={`text-[10px] font-bold tracking-widest mb-1 pl-1 flex items-center gap-1
                                            ${msg.isPromoter ? 'text-purple-400 uppercase' : 'text-slate-500'}`}
                                        >
                                            {msg.userName}
                                            {msg.isPromoter && <span className="material-symbols-outlined text-[12px] text-purple-400">verified</span>}
                                        </span>
                                    )}

                                    <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm
                                        ${isMine
                                            ? 'bg-primary/20 text-primary-foreground border border-primary/30 rounded-br-sm'
                                            : msg.isPromoter
                                                ? 'bg-[#1a1f2e] border border-purple-500/30 text-slate-200 rounded-bl-sm shadow-[0_4px_15px_rgba(168,85,247,0.1)]'
                                                : 'bg-[#161b2a] border border-slate-700/50 text-slate-300 rounded-bl-sm'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                                    </div>

                                    <span className="text-[9px] text-slate-500 mt-1 font-semibold pr-1">
                                        {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}

                <div ref={messagesEndRef} />
            </main>

            {/* Chat Input Area (Fixed as flex item above BottomNav) */}
            <div className="shrink-0 z-40 bg-[#0a0c14]/90 backdrop-blur-md border-t border-slate-800 p-3 w-full">
                {currentUser ? (
                    <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto w-full">
                        {/* Attach Button for Promoters */}
                        {isPromoter && (
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(true)}
                                className="shrink-0 size-12 rounded-xl bg-[#161b2a] border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors flex items-center justify-center shadow-sm"
                                title="Lanzar Flyer de Ruta"
                            >
                                <span className="material-symbols-outlined">add_photo_alternate</span>
                            </button>
                        )}

                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 bg-[#161b2a] border border-slate-700 rounded-xl px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                            disabled={isSending}
                        />

                        <button
                            type="submit"
                            disabled={!newMessage.trim() || isSending}
                            className="shrink-0 size-12 rounded-xl bg-primary text-[#0a0c14] hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-[0_0_15px_rgba(var(--color-primary),0.3)]"
                        >
                            <span className="material-symbols-outlined text-[20px] ml-1">send</span>
                        </button>
                    </form>
                ) : (
                    <div className="flex justify-center max-w-2xl mx-auto">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-lg">login</span>
                            Regístrate para Participar
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <CommunityRulesModal 
                isOpen={isRulesModalOpen}
                onClose={() => setIsRulesModalOpen(false)}
            />
            {currentUser && (
                <>
                    <CreateRouteModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                    />
                    <PromoterApplicationModal
                        isOpen={isApplyModalOpen}
                        onClose={() => setIsApplyModalOpen(false)}
                    />
                </>
            )}
            <RouteDetailsModal
                isOpen={!!selectedRouteId}
                routeId={selectedRouteId}
                onClose={() => setSelectedRouteId(null)}
            />

            <BottomNav active="dashboard" />
        </div>
    );
};

export default MotoRoutes;
