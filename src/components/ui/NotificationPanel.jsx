import React from 'react';
import { db } from '../../lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

const NotificationPanel = ({ isOpen, onClose, notifications = [], currentUser }) => {
    if (!isOpen) return null;

    const handleMarkAsRead = async (notificationId) => {
        if (!currentUser) return;
        try {
            const notifRef = doc(db, 'Notifications', notificationId);
            await updateDoc(notifRef, {
                readBy: arrayUnion(currentUser.uid)
            });
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!currentUser || !notifications.length) return;
        try {
            // Find logic for unread notifications
            const unread = notifications.filter(n => !(n.readBy || []).includes(currentUser.uid));
            await Promise.all(unread.map(n => {
                const notifRef = doc(db, 'Notifications', n.id);
                return updateDoc(notifRef, {
                    readBy: arrayUnion(currentUser.uid)
                });
            }));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return 'Reciente';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Hace un momento';
        if (diffMins < 60) return `Hace ${diffMins} minutos`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `Hace ${diffHours} horas`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'Hace 1 día';
        return `Hace ${diffDays} días`;
    };

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Sliding Panel */}
            <div className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-[#0a0c14] border-l border-slate-800 z-[101] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#161b2a]/80 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-xl">notifications</span>
                        <h2 className="text-white font-black tracking-tight text-lg">Notificaciones</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Content List */}
                <div className="flex-1 overflow-y-auto w-full">
                    {notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {notifications.map(notification => {
                                const isUnread = !(notification.readBy || []).includes(currentUser?.uid);

                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => isUnread && handleMarkAsRead(notification.id)}
                                        className={`relative p-4 border-b border-slate-800/50 hover:bg-[#161b2a]/50 transition-colors cursor-pointer group`}
                                    >
                                        {isUnread && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r"></div>
                                        )}
                                        <div className="flex gap-4">
                                            <div className={`shrink-0 size-10 rounded-xl ${notification.bg || 'bg-slate-800'} flex items-center justify-center shadow-inner`}>
                                                <span className={`material-symbols-outlined ${notification.color || 'text-slate-400'}`}>{notification.icon || 'notifications'}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`text-sm font-bold pr-3 ${isUnread ? 'text-white' : 'text-slate-400'}`}>
                                                        {notification.title}
                                                    </h4>
                                                </div>
                                                <p className={`text-xs leading-snug ${isUnread ? 'text-slate-300' : 'text-slate-500'}`}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-2">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
                            <span className="material-symbols-outlined text-4xl mb-3 opacity-30">notifications_paused</span>
                            <p className="text-sm">No tienes notificaciones por el momento.</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-800 bg-[#0a0c14]">
                    <button
                        onClick={handleMarkAllAsRead}
                        className="w-full py-2.5 rounded-xl text-primary text-xs font-black tracking-widest uppercase hover:bg-primary/10 transition-colors border border-primary/20"
                    >
                        Marcar todas como leídas
                    </button>
                </div>
            </div>
        </>
    );
};

export default NotificationPanel;
