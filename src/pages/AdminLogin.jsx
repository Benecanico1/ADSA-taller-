import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../lib/AuthContext';
import { addAuditLog } from '../utils/auditLogger';
import appConfig from '../config';

const AdminLogin = () => {
    const navigate = useNavigate();

    // Pre-filled credentials for testing
    const [email, setEmail] = useState(`admin@${appConfig.appShortName.toLowerCase()}.com`);
    const [password, setPassword] = useState('demo1234');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { setIsDemoAdmin } = useAuth();

    const handleAuth = async (e) => {
        if (e) e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Por favor, ingresa correo y contraseña.');
            return;
        }

        setLoading(true);

        try {
            // Normal login attempt
            let userCredential;
            try {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            } catch (signInError) {
                const isDemoAccount = email === `admin@${appConfig.appShortName.toLowerCase()}.com` && password === 'demo1234';
                if (isDemoAccount && (signInError.code === 'auth/invalid-credential' || signInError.code === 'auth/user-not-found' || signInError.code === 'auth/wrong-password')) {
                    console.log("Auto-creando administrador de demostración...");
                    userCredential = await createUserWithEmailAndPassword(auth, email, password);
                } else {
                    throw signInError;
                }
            }

            // 🚀 FAST-PATH: If this is the known Admin Demo account, skip the slow Firestore check locally
            const isDemoAdminAccount = email === `admin@${appConfig.appShortName.toLowerCase()}.com` && password === 'demo1234';
            
            let role = 'client';
            
            if (isDemoAdminAccount) {
                console.log("⚡ Fast-path: Bypassing Firestore role check for demo admin.");
                role = 'admin';
            } else {
                const userDocRef = doc(db, 'Users', userCredential.user.uid);
                
                const fetchWithTimeout = (promise, ms) => {
                    return Promise.race([
                        promise,
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), ms))
                    ]);
                };

                let userDoc;
                try {
                    userDoc = await fetchWithTimeout(getDoc(userDocRef), 1500); // 1.5s max wait
                    if (userDoc.exists()) {
                        role = userDoc.data().role;
                    }
                } catch (e) {
                    console.warn("Firestore timeout during admin login, proceeding with optimistic demo check", e);
                }
            }

            if (role === 'admin') {
                addAuditLog('Inicio de sesión exitoso (Administrador)', 'auth', email).catch(console.error);
                if (email === `admin@${appConfig.appShortName.toLowerCase()}.com`) {
                    navigate('/role-selector');
                } else {
                    navigate('/admin');
                }
            } else if (!userDoc.exists() && email === `admin@${appConfig.appShortName.toLowerCase()}.com`) {
                // Auto-create admin role for demo account
                setDoc(userDocRef, {
                    email: email,
                    role: 'admin',
                    createdAt: new Date()
                }).catch(console.error);
                addAuditLog('Inicio de sesión exitoso (Administrador Auto-generado)', 'auth', email).catch(console.error);
                navigate('/role-selector');
            } else {
                setError('Acceso denegado. Se requieren privilegios de administrador.');
                // Sign out if not admin? Optional for demo.
            }
        } catch (err) {
            console.error("Admin Authentication error:", err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Credenciales de administrador incorrectas.');
            } else {
                setError(`Error de autenticación: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-[100dvh] w-full flex-col bg-[#0b0f19] overflow-x-hidden font-display text-slate-100 lg:justify-center">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[100px] rounded-full"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
            </div>

            {/* Main Content Wrapper for PC */}
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center w-full max-w-6xl mx-auto gap-4 lg:gap-20 px-4">

            {/* Header Area */}
            <div className="flex flex-col items-center pt-12 lg:pt-0 shrink-0 lg:w-[400px]">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-amber-500/10 rounded-3xl flex items-center justify-center border border-amber-500/30 mb-6 shadow-[0_0_30px_rgba(245,158,11,0.15)] backdrop-blur-md overflow-hidden p-2">
                    {appConfig.images.logoLight ? (
                        <img src={appConfig.images.logoLight} alt="Admin Logo" className="w-full h-full object-contain drop-shadow-lg" />
                    ) : (
                        <span className="material-symbols-outlined text-amber-500 text-6xl">shield_person</span>
                    )}
                </div>
                <h1 className="font-technical text-2xl font-bold tracking-widest text-slate-100 uppercase">{appConfig.appName}</h1>
                <p className="text-amber-500 text-[10px] font-technical tracking-[0.3em] uppercase mt-2">Portal Administrativo</p>
                
                {/* Desktop Links */}
                <div className="hidden lg:flex flex-col items-center mt-12 gap-4">
                    <Link to="/" className="text-slate-500 text-sm font-medium hover:text-amber-500 transition-colors inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Volver al Portal Público
                    </Link>
                </div>
            </div>

            {/* Login Container */}
            <div className="flex-1 lg:flex-none pb-12 lg:pb-0 max-w-md w-full lg:w-[450px]">
                <div className="bg-[#121826]/80 backdrop-blur-xl border border-slate-800/60 p-8 rounded-3xl shadow-2xl mt-6 lg:mt-0">
                    <div className="text-left mb-8">
                        <h2 className="text-2xl font-black text-white tracking-tight">Acceso Restringido</h2>
                        <p className="text-slate-400 text-sm mt-2 font-medium">Ingrese credenciales autorizadas</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl mb-6 flex items-start gap-2">
                            <span className="material-symbols-outlined text-base">error</span>
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Input: Correo */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-technical uppercase tracking-widest text-amber-500/80 ml-1">Identificador (Correo)</label>
                            <div className="relative group rounded-xl border border-slate-700/50 bg-[#0b0f19] transition-all focus-within:border-amber-500/50 focus-within:shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-500 text-xl group-focus-within:text-amber-500 transition-colors">badge</span>
                                </div>
                                <input
                                    className="block w-full pl-12 pr-4 py-3.5 bg-transparent border-none focus:ring-0 text-slate-100 placeholder:text-slate-600 font-medium outline-none [&:-webkit-autofill]:shadow-[0_0_0_100px_#0b0f19_inset] [&:-webkit-autofill]:text-fill-slate-100"
                                    placeholder={`admin@${appConfig.appName.replace(/\s+/g, '').toLowerCase()}.com`}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Input: Contraseña */}
                        <div className="flex flex-col gap-1.5 pt-2">
                            <label className="text-[10px] font-technical uppercase tracking-widest text-amber-500/80 ml-1">Clave de Acceso</label>
                            <div className="relative group rounded-xl border border-slate-700/50 bg-[#0b0f19] transition-all focus-within:border-amber-500/50 focus-within:shadow-[0_0_15px_rgba(245,158,11,0.1)] flex items-center">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-500 text-xl group-focus-within:text-amber-500 transition-colors">vpn_key</span>
                                </div>
                                <input
                                    className="block w-full pl-12 pr-12 py-3.5 bg-transparent border-none focus:ring-0 text-slate-100 placeholder:text-slate-600 font-medium tracking-widest outline-none [&:-webkit-autofill]:shadow-[0_0_0_100px_#0b0f19_inset] [&:-webkit-autofill]:text-fill-slate-100"
                                    placeholder="••••••••"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-amber-500 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Login Button */}
                        <div className="pt-8">
                            <button
                                onClick={handleAuth}
                                disabled={loading}
                                className="relative w-full overflow-hidden bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-[#0b0f19] font-black py-4 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 group transition-all active:scale-[0.98]"
                            >
                                {loading ? (
                                    <span className="material-symbols-outlined animate-spin">sync</span>
                                ) : (
                                    <>
                                        <span className="tracking-wide">AUTENTICAR</span>
                                        <span className="material-symbols-outlined text-[18px]">arrow_forward_ios</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                </div>

                <div className="lg:hidden text-center mt-8">
                    <Link to="/" className="text-slate-500 text-sm font-medium hover:text-amber-500 transition-colors inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Volver al Portal Público
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <div className="relative w-full text-center z-10 flex flex-col gap-1 items-center mt-auto pt-8 pb-4">
                <span className="text-[9px] font-technical text-slate-700 tracking-widest">SYSTEM SECURED VER 2.1.4</span>
                <span className="text-amber-500/70 text-[9px] font-technical tracking-widest uppercase font-bold">Realizada por el ING. Jesus Hidalgo</span>
            </div>
        </div>
    );
};

export default AdminLogin;
