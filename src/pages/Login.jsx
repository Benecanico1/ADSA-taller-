import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            } else {
                // Login
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }

            // Role check with fallback for offline mode
            let role = 'client';
            try {
                const userDocRef = doc(db, 'Users', userCredential.user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    role = userDoc.data().role || 'client';
                }
            } catch (firestoreError) {
                console.warn("Firestore error during login role check (using fallback 'client'):", firestoreError);
            }

            if (role === 'admin') {
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
                }
            } catch (firestoreError) {
                console.warn("Firestore error during login role check (using fallback 'client'):", firestoreError);
            }

            if (role === 'admin') {
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
        <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden carbon-pattern font-display text-slate-900 dark:text-slate-100">
            {/* Header / Logo Area */}
            <div className="flex flex-col items-center pt-16 pb-10 px-6">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/30 mb-6">
                    <span className="material-symbols-outlined text-primary text-6xl">settings_input_component</span>
                </div>
                <h1 className="font-technical text-3xl font-bold tracking-wider text-slate-100 uppercase">Dynotech</h1>
                <p className="text-primary text-xs font-technical tracking-[0.2em] uppercase mt-1">Power Garage Ecosystem</p>
            </div>

            {/* Login Container */}
            <div className="flex-1 px-6 pb-12">
                <div className="space-y-6">
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-bold text-slate-100">{isRegistering ? 'Crear Cuenta' : 'Acceso Seguro'}</h2>
                        <p className="text-slate-400 text-sm mt-1">{isRegistering ? 'Únete a la plataforma de gestión' : 'Identifícate para gestionar tu taller'}</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center font-bold">
                            {error}
                        </div>
                    )}

                    {/* Input: Correo */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-technical uppercase tracking-widest text-primary ml-1">Correo Electrónico</label>
                        <div className="relative group neon-border-focus rounded-lg border border-primary/20 bg-garage-dark/80 backdrop-blur-sm transition-all">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-500 text-xl">mail</span>
                            </div>
                            <input
                                className="block w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 text-slate-100 placeholder:text-slate-600 font-technical outline-none"
                                placeholder="usuario@dynotech.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Input: Contraseña */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-technical uppercase tracking-widest text-primary ml-1">Contraseña</label>
                        <div className="relative group neon-border-focus rounded-lg border border-primary/20 bg-garage-dark/80 backdrop-blur-sm transition-all flex items-center">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-500 text-xl">lock</span>
                            </div>
                            <input
                                className="block w-full pl-12 pr-12 py-4 bg-transparent border-none focus:ring-0 text-slate-100 placeholder:text-slate-600 font-technical outline-none"
                                placeholder="••••••••"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button className="absolute right-4 text-slate-500 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-xl">visibility</span>
                            </button>
                        </div>
                    </div>

                    {/* 2FA Toggle (Only show on Login) */}
                    {!isRegistering && (
                        <div className="flex items-center justify-between px-1 py-1">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-200">Autenticación 2FA</span>
                                <span className="text-[10px] text-slate-500 uppercase font-technical">Seguridad reforzada</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input defaultChecked className="sr-only peer" type="checkbox" />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    )}

                    {/* Login/Register Button */}
                    <div className="pt-2">
                        <button
                            onClick={handleAuth}
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-garage-dark font-technical font-bold py-4 rounded-lg shadow-[0_0_15px_rgba(37,209,244,0.3)] flex items-center justify-center gap-2 group transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="material-symbols-outlined animate-spin font-bold">sync</span>
                            ) : (
                                <>
                                    {isRegistering ? 'CREAR CUENTA' : 'INICIAR SESIÓN'}
                                    <span className="material-symbols-outlined font-bold">{isRegistering ? 'person_add' : 'login'}</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="text-center pt-2">
                        <button
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setError('');
                            }}
                            className="text-primary text-sm font-technical font-bold uppercase tracking-wider hover:underline"
                        >
                            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                        </button>
                    </div>

                    {/* Options */}
                    {!isRegistering && (
                        <div className="flex flex-col items-center gap-6 mt-6">
                            <Link to="/recovery" className="text-slate-400 text-sm font-technical uppercase tracking-wider hover:text-primary transition-colors">
                                ¿Olvidaste tu contraseña?
                            </Link>

                            <div className="w-full flex items-center gap-4">
                                <div className="h-[1px] flex-1 bg-primary/10"></div>
                                <span className="text-[10px] font-technical text-slate-500 uppercase tracking-widest">O accede con</span>
                                <div className="h-[1px] flex-1 bg-primary/10"></div>
                            </div>

                            {/* Biometric / Google Access */}
                            <div className="flex gap-8">
                                <button type="button" onClick={handleGoogleAuth} disabled={loading} className="flex flex-col items-center gap-2 group transition-all hover:-translate-y-1">
                                    <div className="w-14 h-14 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-[0_0_10px_rgba(37,209,244,0.2)] transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="28px" height="28px">
                                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-technical text-slate-400 group-hover:text-primary uppercase tracking-tighter">Google</span>
                                </button>

                                <button type="button" className="flex flex-col items-center gap-2 group cursor-not-allowed opacity-50">
                                    <div className="w-14 h-14 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-center group-hover:border-primary/50 transition-all">
                                        <span className="material-symbols-outlined text-primary text-3xl">fingerprint</span>
                                    </div>
                                    <span className="text-[10px] font-technical text-slate-400 uppercase tracking-tighter">Huella</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Decoration */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        </div>
    );
};

export default Login;
