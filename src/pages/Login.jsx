import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { addAuditLog } from '../utils/auditLogger';
import { appConfig } from '../config';

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e) => {
        if (e) e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Por favor, ingresa tu correo y contraseña.');
            return;
        }

        setLoading(true);

        try {
            let userCredential;
            if (isRegistering) {
                // Register
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await addAuditLog(`Nuevo usuario registrado (${email})`, 'auth', email);
            } else {
                // Login
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }

            // Role check and User Document creation
            let role = 'client';
            try {
                const userDocRef = doc(db, 'Users', userCredential.user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    role = userDoc.data().role || 'client';
                } else if (isRegistering) {
                    await setDoc(userDocRef, {
                        email: email,
                        role: 'client',
                        createdAt: new Date()
                    });
                }
            } catch (firestoreError) {
                console.warn("Firestore error during login role check (using fallback 'client'):", firestoreError);
            }

            if (!isRegistering) {
                await addAuditLog(`Inicio de sesión exitoso (${role})`, 'auth', email);
            }

            if (role === 'super_admin') {
                navigate('/saas-admin');
            } else if (role === 'admin' || role === 'admin_empresa') {
                navigate('/admin');
            } else if (role === 'mechanic') {
                navigate('/mechanic-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error("Authentication error:", err);
            // Translate common Firebase errors
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Este correo ya está registrado.');
            } else if (err.code === 'auth/weak-password') {
                setError('La contraseña debe tener al menos 6 caracteres.');
            } else {
                setError(`Error: ${err.message || 'Error desconocido'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setError('');
        setLoading(true);
        try {
            const userCredential = await signInWithPopup(auth, googleProvider);

            // Role check with fallback for offline mode
            let role = 'client';
            try {
                const userDocRef = doc(db, 'Users', userCredential.user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    role = userDoc.data().role || 'client';
                } else {
                    await setDoc(userDocRef, {
                        email: userCredential.user.email,
                        name: userCredential.user.displayName,
                        role: 'client',
                        createdAt: new Date()
                    });
                }
            } catch (firestoreError) {
                console.warn("Firestore error during login role check (using fallback 'client'):", firestoreError);
            }

            await addAuditLog(`Inicio de sesión exitoso con Google (${role})`, 'auth', userCredential.user.email);

            if (role === 'super_admin') {
                navigate('/saas-admin');
            } else if (role === 'admin' || role === 'admin_empresa') {
                navigate('/admin');
            } else if (role === 'mechanic') {
                navigate('/mechanic-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error("Google Auth error:", err);
            setError(`Error de acceso: ${err.message || 'Fallo desconocido'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-[100dvh] w-full flex-col bg-[#0b0f19] overflow-x-hidden font-display text-slate-100 lg:justify-center">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[100px] rounded-full"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
            </div>

            {/* Back Button */}
            <div className="absolute top-4 left-4 z-50">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors text-slate-400 hover:text-primary"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
            </div>

            {/* Main Content Wrapper for PC */}
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center w-full max-w-6xl mx-auto gap-4 lg:gap-20 px-4">
                
                {/* Header / Logo Area */}
                <div className="flex flex-col items-center pt-12 lg:pt-0 shrink-0 lg:w-[400px]">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/30 mb-6 shadow-[0_0_30px_rgba(255,40,0,0.15)] backdrop-blur-md">
                    <span className="material-symbols-outlined text-primary text-5xl">settings_input_component</span>
                </div>
                <h1 className="font-technical text-2xl font-bold tracking-widest text-white uppercase text-center">{appConfig.companyName}</h1>
                <p className="text-white/80 text-[10px] font-technical tracking-[0.3em] uppercase mt-2 text-center">Plataforma de Clientes</p>
                
                {/* Desktop Links */}
                <div className="hidden lg:flex flex-col items-center mt-12 gap-4">
                    <Link to="/" className="text-slate-500 text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Volver al Portal Público
                    </Link>
                    <Link to="/admin-login" className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] font-technical font-bold uppercase tracking-widest hover:bg-amber-500/20 hover:border-amber-500/40 transition-all inline-flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                        <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                        Portal Administrativo
                    </Link>
                </div>
            </div>

            {/* Login Container */}
            <div className="flex-1 lg:flex-none pb-12 lg:pb-0 max-w-md w-full lg:w-[450px]">
                <div className="bg-[#121826]/80 backdrop-blur-xl border border-slate-800/60 p-6 rounded-3xl shadow-2xl mt-6 lg:mt-0">
                    <div className="text-left mb-6">
                        <h2 className="text-xl font-black text-white tracking-tight">{isRegistering ? 'Crear Cuenta' : 'Acceso Seguro'}</h2>
                        <p className="text-slate-400 text-xs mt-1.5 font-medium">{isRegistering ? 'Únete a la plataforma de gestión' : 'Identifícate para gestionar tus servicios'}</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl mb-6 flex items-start gap-2">
                            <span className="material-symbols-outlined text-base">error</span>
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Input: Correo */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-technical uppercase tracking-widest text-white ml-1 font-bold">Correo Electrónico</label>
                            <div className="relative group rounded-xl border border-slate-700/50 bg-[#0b0f19] transition-all focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(255,40,0,0.1)]">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-500 text-lg group-focus-within:text-primary transition-colors">mail</span>
                                </div>
                                <input
                                    className="block w-full pl-11 pr-4 py-2.5 bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-400 font-medium text-sm outline-none [&:-webkit-autofill]:shadow-[0_0_0_100px_#0b0f19_inset] [&:-webkit-autofill]:text-fill-white"
                                    placeholder="usuario@empresa.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Input: Contraseña */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-technical uppercase tracking-widest text-white ml-1 font-bold">Contraseña</label>
                            <div className="relative group rounded-xl border border-slate-700/50 bg-[#0b0f19] transition-all focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(255,40,0,0.1)] flex items-center">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-500 text-lg group-focus-within:text-primary transition-colors">vpn_key</span>
                                </div>
                                <input
                                    className="block w-full pl-11 pr-11 py-2.5 bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-400 font-medium text-sm tracking-widest outline-none [&:-webkit-autofill]:shadow-[0_0_0_100px_#0b0f19_inset] [&:-webkit-autofill]:text-fill-white"
                                    placeholder="••••••••"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 text-slate-500 hover:text-primary transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* 2FA Toggle (Only show on Login) */}
                        {!isRegistering && (
                            <div className="flex items-center justify-between px-1 py-1">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">Autenticación 2FA</span>
                                    <span className="text-[10px] text-white/70 uppercase font-technical">Seguridad reforzada</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input defaultChecked className="sr-only peer" type="checkbox" />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        )}

                        {/* Login/Register Button */}
                        <div className="pt-4">
                            <button
                                onClick={handleAuth}
                                disabled={loading}
                                className="relative w-full overflow-hidden bg-primary hover:bg-primary/90 disabled:opacity-50 text-[#0b0f19] font-black py-3 text-sm rounded-xl shadow-[0_4px_20px_rgba(255,40,0,0.25)] flex items-center justify-center gap-2 group transition-all active:scale-[0.98]"
                            >
                                {loading ? (
                                    <span className="material-symbols-outlined animate-spin font-bold text-base">sync</span>
                                ) : (
                                    <>
                                        <span className="tracking-widest uppercase">{isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
                                        <span className="material-symbols-outlined text-base font-bold">{isRegistering ? 'person_add' : 'arrow_forward_ios'}</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="text-center pt-1">
                            <button
                                onClick={() => {
                                    setIsRegistering(!isRegistering);
                                    setError('');
                                }}
                                className="text-white text-xs font-technical font-bold uppercase tracking-[0.2em] hover:text-white/80 transition-colors"
                            >
                                {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                            </button>
                        </div>

                        {/* Options */}
                        {!isRegistering && (
                            <div className="flex flex-col items-center gap-4 mt-4">
                                <Link to="/recovery" className="text-white/90 text-[11px] font-technical font-bold uppercase tracking-wider hover:text-white transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </Link>

                                <div className="w-full flex items-center gap-4">
                                    <div className="h-[1px] flex-1 bg-primary/10"></div>
                                    <span className="text-[10px] font-technical text-slate-500 uppercase tracking-widest">O accede con</span>
                                    <div className="h-[1px] flex-1 bg-primary/10"></div>
                                </div>

                                {/* Biometric / Google Access */}
                                <div className="flex gap-6">
                                    <button type="button" onClick={handleGoogleAuth} disabled={loading} className="flex flex-col items-center gap-1.5 group transition-all hover:-translate-y-1">
                                        <div className="w-14 h-14 rounded-xl border border-primary/20 bg-[#0b0f19] flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(255,40,0,0.15)] transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="28px" height="28px">
                                                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                                            </svg>
                                        </div>
                                        <span className="text-[10px] font-technical text-slate-500 group-hover:text-primary uppercase tracking-tighter">Google</span>
                                    </button>

                                    <button type="button" className="flex flex-col items-center gap-1.5 group cursor-not-allowed opacity-50">
                                        <div className="w-14 h-14 rounded-xl border border-slate-700/50 bg-[#0b0f19] flex items-center justify-center transition-all">
                                            <span className="material-symbols-outlined text-slate-500 text-3xl">fingerprint</span>
                                        </div>
                                        <span className="text-[10px] font-technical text-slate-500 uppercase tracking-tighter">Huella</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                </div>

                <div className="lg:hidden text-center mt-8">
                    <Link to="/" className="text-slate-500 text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Volver al Portal Público
                    </Link>
                </div>

                {/* Admin Access Link */}
                <div className="lg:hidden text-center mt-6">
                    <Link to="/admin-login" className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] font-technical font-bold uppercase tracking-widest hover:bg-amber-500/20 hover:border-amber-500/40 transition-all inline-flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                        <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                        Portal Administrativo
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <div className="relative w-full text-center z-10 pointer-events-none flex flex-col gap-1 items-center mt-auto pt-8 pb-4">
                <span className="text-[9px] font-technical text-slate-700 tracking-widest">SYSTEM SECURED VER 2.1.4</span>
                <span className="text-primary/70 text-[9px] font-technical tracking-widest uppercase font-bold">Developer: Ing. Jesus A. Hidalgo</span>
            </div>
        </div>
    );
};

export default Login;
