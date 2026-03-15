import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../lib/AuthContext';
import { appConfig } from '../config';

const AdminProfileModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { currentUser, setIsDemoAdmin } = useAuth();

    const defaultProfile = {
        name: currentUser?.name || currentUser?.displayName || 'Usuario Administrador',
        role: currentUser?.role || 'Admin',
        email: currentUser?.email || appConfig.supportEmail,
        initials: (currentUser?.name || currentUser?.displayName || currentUser?.email || 'AD').substring(0, 2).toUpperCase(),
        avatarBg: 'bg-primary/20',
        avatarText: 'text-primary',
        borderColor: 'border-primary/40',
        permissions: ['Acceso Total', 'Gestión de Usuarios', 'Configuración de Sistema', 'Reportes Financieros']
    };

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSwitchProfile = () => {
        // Redirigir al dashboard de gerencia si lo desea
        onClose();
        navigate('/operations');
    };

    const handleLogout = async () => {
        try {
            // If they are using the demo credentials bypass
            if (setIsDemoAdmin) {
                setIsDemoAdmin(false);
            }
            await signOut(auth);
            onClose();
            navigate('/admin-login');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0c14]/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div className="bg-[#161b2a] border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl shadow-black/50 overflow-hidden transform transition-all animate-in slide-in-from-bottom-8 duration-300">

                {/* Modal Header showing current profile */}
                <div className="relative p-6 px-8 flex flex-col items-center justify-center text-center border-b border-slate-700/50">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>

                    <div className={`h-20 w-20 rounded-full flex items-center justify-center border-2 shadow-lg mb-4 transition-all duration-300 ${defaultProfile.avatarBg} ${defaultProfile.borderColor} shadow-${defaultProfile.avatarText.split('-')[1]}/20`}>
                        <span className={`text-2xl font-black ${defaultProfile.avatarText}`}>{defaultProfile.initials}</span>
                    </div>

                    <h2 className="text-xl font-bold text-white tracking-wide">{defaultProfile.name}</h2>
                    <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${defaultProfile.avatarText}`}>{defaultProfile.role}</p>
                    <p className="text-sm text-slate-400 mt-1">{defaultProfile.email}</p>
                </div>

                {/* Profile Details */}
                <div className="p-6 bg-slate-900/50">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Permisos Activos</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {defaultProfile.permissions.map((perm, idx) => (
                            <span key={idx} className="text-[10px] bg-[#161b2a] border border-slate-700 text-slate-300 px-2.5 py-1 rounded-full font-medium">
                                {perm}
                            </span>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                onClose();
                                navigate('/settings');
                            }}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-slate-800/50 text-slate-300 border border-slate-700 hover:bg-slate-700/50 hover:text-white transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">manage_accounts</span>
                            Administrar Datos
                        </button>

                        <button
                            onClick={handleSwitchProfile}
                            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all border bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20`}
                        >
                            <span className="material-symbols-outlined text-lg">swap_horiz</span>
                            Ir a Dashboard Operaciones
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfileModal;
