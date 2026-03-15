import React from 'react';

const NotificationPanel = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const notifications = [
        {
            id: 1,
            title: "Revisión Anual Cercana",
            message: "A tu Kawasaki Z900 le faltan 10 días para su servicio.",
            time: "Hace 2 horas",
            isNew: true,
            icon: "warning",
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            id: 2,
            title: "Cita Confirmada",
            message: "Mantenimiento General agendado para el 15 de Octubre.",
            time: "Hace 1 día",
            isNew: false,
            icon: "event_available",
            color: "text-primary",
            bg: "bg-primary/10"
        },
        {
            id: 3,
            title: "¡Bienvenido a Dynotech!",
            message: "Gracias por confiar el cuidado de tus motocicletas en nosotros.",
            time: "Hace 1 semana",
            isNew: false,
            icon: "celebration",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        }
    ];

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
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`relative p-4 border-b border-slate-800/50 hover:bg-[#161b2a]/50 transition-colors cursor-pointer group`}
                                >
                                    {notification.isNew && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r"></div>
                                    )}
                                    <div className="flex gap-4">
                                        <div className={`shrink-0 size-10 rounded-xl ${notification.bg} flex items-center justify-center shadow-inner`}>
                                            <span className={`material-symbols-outlined ${notification.color}`}>{notification.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-sm font-bold truncate pr-3 ${notification.isNew ? 'text-white' : 'text-slate-200'}`}>
                                                    {notification.title}
                                                </h4>
                                            </div>
                                            <p className="text-xs text-slate-400 leading-snug line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-2">
                                                {notification.time}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                    <button className="w-full py-2.5 rounded-xl text-primary text-xs font-black tracking-widest uppercase hover:bg-primary/10 transition-colors border border-primary/20">
                        Marcar todas como leídas
                    </button>
                </div>
            </div>
        </>
    );
};

export default NotificationPanel;
