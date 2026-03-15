import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import appConfig from '../config';

const RoleSelector = () => {
    const navigate = useNavigate();
    const { currentUser, updateUserRole } = useAuth();
    const [loadingRole, setLoadingRole] = useState(null);

    // If not a demo user or no user, redirect to login (or dashboard)
    if (!currentUser) {
        navigate('/login');
        return null;
    }

    const handleRoleSelect = async (role, path) => {
        setLoadingRole(role);
        try {
            // Update role in Firestore ONLY if not demo user
            if (currentUser.uid !== 'demo-user') {
                const userRef = doc(db, 'Users', currentUser.uid);
                await updateDoc(userRef, { role: role });
            } else {
                console.log(`⚡ Demo Mode: Switched to ${role} locally`);
            }
            
            // Update sessionStorage cache
            sessionStorage.setItem(`userRole_${currentUser.uid}`, role);
            
            // For admin bypass
            if (role === 'admin') {
                sessionStorage.setItem('isDemoAdmin', 'true');
            } else {
                sessionStorage.removeItem('isDemoAdmin');
            }

            // Update context state directly to avoid flash of unauthorized
            updateUserRole(role);

            // Small delay to ensure context caches it
            setTimeout(() => {
                navigate(path);
            }, 300);

        } catch (error) {
            console.error("Error updating role:", error);
            alert("Hubo un error al cambiar de rol.");
            setLoadingRole(null);
        }
    };

    return (
        <div className="min-h-[100dvh] w-full bg-[#0b0f19] flex flex-col items-center justify-center p-4 font-display text-slate-100 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
            </div>

            {/* Back Button */}
            <button 
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-[#121826]/80 backdrop-blur-md border border-slate-700/50 hover:border-slate-500/50 hover:bg-[#1a2333]/80 rounded-xl text-slate-300 hover:text-white transition-all shadow-lg active:scale-95"
            >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
                <span className="text-xs font-bold uppercase tracking-widest">Volver</span>
            </button>

            <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/30 mb-6 shadow-[0_0_30px_rgba(255,40,0,0.15)] backdrop-blur-md overflow-hidden p-2">
                    {appConfig.images.logoLight ? (
                        <img src={appConfig.images.logoLight} alt="App Logo" className="w-full h-full object-contain" />
                    ) : (
                        <span className="material-symbols-outlined text-primary text-4xl">settings</span>
                    )}
                </div>
                
                <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight text-center mb-2">
                    Bienvenido, Usuario de Prueba
                </h1>
                <p className="text-slate-400 text-sm lg:text-base font-medium text-center max-w-lg mb-12">
                    Selecciona en cuál de los perfiles deseas ingresar para explorar la plataforma. Podrás cambiar de rol más tarde desde tu panel.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    
                    {/* Cliente */ }
                    <button 
                        onClick={() => handleRoleSelect('client', '/dashboard')}
                        disabled={loadingRole !== null}
                        className="group relative bg-[#121826]/80 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 p-8 rounded-3xl flex flex-col items-center text-center transition-all hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(59,130,246,0.15)] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-blue-500/20">
                            {loadingRole === 'client' ? (
                                <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
                            ) : (
                                <span className="material-symbols-outlined text-3xl">person</span>
                            )}
                        </div>
                        <h2 className="text-xl font-black text-white mb-2">Portal de Clientes</h2>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            Visualiza el estado de las reparaciones de tus vehículos, aprueba presupuestos y agenda citas.
                        </p>
                    </button>

                    {/* Mecánico */ }
                    <button 
                        onClick={() => handleRoleSelect('mechanic', '/mechanic-dashboard')}
                        disabled={loadingRole !== null}
                        className="group relative bg-[#121826]/80 backdrop-blur-xl border border-slate-700/50 hover:border-emerald-500/50 p-8 rounded-3xl flex flex-col items-center text-center transition-all hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(16,185,129,0.15)] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-emerald-500/20">
                            {loadingRole === 'mechanic' ? (
                                <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
                            ) : (
                                <span className="material-symbols-outlined text-3xl">build</span>
                            )}
                        </div>
                        <h2 className="text-xl font-black text-white mb-2">Portal de Mecánicos</h2>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            Gestiona tus órdenes de trabajo activas, realiza diagnósticos y diagnostica servicios en el taller.
                        </p>
                    </button>

                    {/* Administrador */ }
                    <button 
                        onClick={() => handleRoleSelect('admin', '/admin')}
                        disabled={loadingRole !== null}
                        className="group relative bg-[#121826]/80 backdrop-blur-xl border border-slate-700/50 hover:border-amber-500/50 p-8 rounded-3xl flex flex-col items-center text-center transition-all hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(245,158,11,0.15)] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-amber-500/20">
                            {loadingRole === 'admin' ? (
                                <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
                            ) : (
                                <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                            )}
                        </div>
                        <h2 className="text-xl font-black text-white mb-2">Portal Administrador</h2>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            Control total sobre el taller. Facturación, gestión de turnos, mecánicos, clientes e inventario.
                        </p>
                    </button>

                </div>
            </div>
            
            <div className="absolute bottom-6 left-0 w-full text-center">
                <span className="text-[10px] font-technical text-slate-600 tracking-widest uppercase">
                    Modo Demostración Activado
                </span>
            </div>
        </div>
    );
};

export default RoleSelector;
