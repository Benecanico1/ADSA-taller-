import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import AdminBottomNav from '../components/ui/AdminBottomNav';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useNotifications } from '../lib/NotificationContext';

const AdminRouteManager = () => {
    const navigate = useNavigate();
    const { togglePanel, unreadCount } = useNotifications();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        // Fetch all chat messages descending
        const q = query(collection(db, 'RouteChatMessages'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = [];
            snapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() });
            });
            setMessages(msgs);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching route messages:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDeleteMessage = async (msgId) => {
        if (!window.confirm("¿Seguro que deseas eliminar este mensaje inpropiado de forma permanente?")) return;

        setDeletingId(msgId);
        try {
            await deleteDoc(doc(db, 'RouteChatMessages', msgId));
            alert("Mensaje eliminado exitosamente.");
        } catch (error) {
            console.error("Error deleting message:", error);
            alert("Hubo un error al eliminar el mensaje.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="bg-[#0a0c10] text-slate-100 min-h-screen flex flex-col font-display max-w-2xl mx-auto shadow-2xl relative pb-20 overflow-hidden">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-30" style={{ backgroundColor: '#0a0c10', backgroundImage: `linear-gradient(45deg, #111 25%, transparent 25%), linear-gradient(-45deg, #111 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111 75%), linear-gradient(-45deg, transparent 75%, #111 75%)`, backgroundSize: '4px 4px' }}></div>

            <div className="relative z-10 flex flex-col flex-1 w-full min-h-screen">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-[#161b2a]/95 backdrop-blur-md border-b border-purple-500/30 shadow-sm flex flex-col">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent pointer-events-none"></div>
                    <div className="flex items-center p-4 justify-between relative z-10">
                        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full bg-[#161b2a] border border-slate-700/80 hover:border-purple-500/50 transition-colors shadow-inner">
                            <span className="material-symbols-outlined text-purple-400">arrow_back_ios_new</span>
                        </button>

                        <div className="text-center flex-1 mx-4">
                            <h2 className="text-lg font-black leading-tight tracking-tight text-white drop-shadow-md">Moderación Com.</h2>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-red-400 mt-0.5 flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">security</span>
                                Admin Rutas
                            </p>
                        </div>

                        <button onClick={togglePanel} className="relative size-10 flex items-center justify-center rounded-full bg-[#161b2a] border border-slate-700/80 hover:border-purple-500/50 transition-colors shadow-inner relative">
                            <span className="material-symbols-outlined text-purple-400">notifications</span>
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 rounded-full bg-red-500 border border-[#161b2a] animate-pulse"></span>
                            )}
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-center mb-6 shadow-inner">
                        <span className="material-symbols-outlined text-red-500 text-3xl mb-1 mt-1">gavel</span>
                        <p className="text-xs text-red-400 font-bold uppercase tracking-widest leading-relaxed">
                            Panel de Moderación
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Elimina mensajes groseros, spam o que incumplan las normas. Esta acción es irreversible y borra el mensaje para toda la comunidad al instante.</p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-50">
                            <span className="material-symbols-outlined animate-spin text-purple-500 text-4xl mb-4">sync</span>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-50 text-center">
                            <span className="material-symbols-outlined text-slate-600 text-5xl mb-3">forum</span>
                            <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">No hay mensajes</p>
                        </div>
                    ) : (
                        <div className="space-y-4 pb-6">
                            {messages.map((msg) => (
                                <div key={msg.id} className="bg-[#161b2a] border border-slate-700/50 rounded-xl p-4 shadow-lg flex flex-col gap-3 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                                    
                                    {/* Indicador de Flyer (si aplica) */}
                                    {msg.attachedRouteId && (
                                        <div className="absolute top-0 right-0 bg-purple-600 text-[9px] font-black uppercase text-white px-3 py-1 rounded-bl-xl shadow-md">
                                            Ruta Oficial
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                <h4 className={`text-xs font-bold truncate ${msg.isPromoter ? 'text-purple-400 uppercase tracking-wider' : 'text-slate-200'}`}>
                                                    {msg.userName}
                                                </h4>
                                                {msg.isPromoter && <span className="material-symbols-outlined text-[14px] text-purple-500" title="Promotor">verified</span>}
                                                <span className="text-[9px] text-slate-500 font-medium shrink-0 ml-auto">
                                                    {msg.createdAt?.toDate().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) || ''}
                                                </span>
                                            </div>

                                            <div className="bg-[#0a0c10] border border-slate-800 rounded-lg p-3">
                                                <p className="text-sm font-medium text-slate-300 break-words line-clamp-4">
                                                    {msg.text || <i>(Solo imagen / Flyer)</i>}
                                                </p>
                                                {msg.attachedFlyerUrl && (
                                                    <div className="mt-3 flex items-center gap-2 text-[10px] text-purple-400 font-bold bg-purple-500/10 w-fit px-2 py-1 rounded-md border border-purple-500/20">
                                                        <span className="material-symbols-outlined text-[14px]">image</span> Imagen Adjunta
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="pt-6 sm:pt-0 pl-2">
                                            <button
                                                onClick={() => handleDeleteMessage(msg.id)}
                                                disabled={deletingId === msg.id}
                                                className="size-10 rounded-full flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 active:scale-95 transition-all disabled:opacity-50"
                                                title="Eliminar Mensaje"
                                            >
                                                {deletingId === msg.id ? (
                                                    <span className="material-symbols-outlined text-xl animate-spin">refresh</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-xl">delete_forever</span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                <AdminBottomNav />
            </div>

        </div>
    );
};

export default AdminRouteManager;
