import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

const PasswordRecovery = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleResetPassword = async () => {
        setError('');
        setSuccess('');

        if (!email) {
            setError('Por favor, ingresa tu correo electrónico.');
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess('Correo de recuperación enviado. Revisa tu bandeja de entrada.');
            setEmail(''); // Clear email on success
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/invalid-email') {
                setError('El formato del correo electrónico no es válido.');
            } else if (err.code === 'auth/user-not-found') {
                setError('No hay ninguna cuenta registrada con este correo.');
            } else {
                setError('Ocurrió un error. Verifica la información e intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#101e22] text-slate-100 min-h-screen flex flex-col font-technical antialiased max-w-md mx-auto relative overflow-hidden shadow-2xl">
            {/* Carbon Background Pattern (CSS defined inline for simplicity, or in tailwind.config) */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-50"
                style={{
                    backgroundColor: '#101e22',
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(13, 204, 242, 0.08) 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                }}
            ></div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full w-full flex-1">

                {/* Top Navigation */}
                <header className="flex items-center p-4 pb-2 justify-between mt-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-slate-100 flex size-10 shrink-0 items-center justify-center hover:bg-primary/10 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex-1 text-center pr-10">
                        <span className="text-primary text-[10px] font-bold tracking-[0.25em] uppercase">Security Protocol</span>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex-1 px-6 pt-12 pb-6 flex flex-col">
                    <div className="mb-10 flex justify-center">
                        <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(13,204,242,0.2)]">
                            <span className="material-symbols-outlined text-primary text-5xl">lock_reset</span>
                        </div>
                    </div>

                    <h1 className="text-slate-100 tracking-tight text-3xl font-black leading-tight text-center mb-4">Recuperar Contraseña</h1>
                    <p className="text-slate-400 text-[15px] font-medium leading-relaxed text-center px-2 mb-10">
                        Ingresa tu correo para recibir un código de restauración segura.
                    </p>

                    {/* Form Section */}
                    <div className="flex flex-col gap-6 flex-1">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center font-bold">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-sm p-3 rounded-lg text-center font-bold">
                                {success}
                            </div>
                        )}

                        <label className="flex flex-col gap-2.5">
                            <span className="text-slate-300 text-xs font-bold uppercase tracking-widest pl-1">Correo Electrónico</span>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 text-[22px]">mail</span>
                                <input
                                    className="w-full rounded-2xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 border border-primary/30 bg-[#0a1315]/80 h-16 pl-12 pr-4 placeholder:text-slate-600 font-normal transition-all text-base shadow-inner"
                                    placeholder="ejemplo@dynotech.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </label>

                        <button
                            onClick={handleResetPassword}
                            disabled={loading || success}
                            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-[#101e22] font-black tracking-widest uppercase text-[15px] py-4 rounded-2xl shadow-[0_0_25px_rgba(13,204,242,0.3)] transition-transform active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                            ) : (
                                <>
                                    <span>Enviar Código</span>
                                    <span className="material-symbols-outlined text-[20px]">send</span>
                                </>
                            )}
                        </button>

                        <div className="mt-4 flex flex-col items-center gap-4">
                            <Link to="/login" className="text-primary/80 hover:text-primary text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-1 group">
                                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">login</span>
                                Volver al Inicio de Sesión
                            </Link>
                        </div>
                    </div>
                </main>

                {/* Branding Footer */}
                <footer className="p-8 text-center mt-auto">
                    <div className="flex flex-col items-center gap-1 opacity-50">
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-primary text-2xl">bolt</span>
                            <span className="font-display font-black text-slate-100 tracking-tighter text-xl">DYNOTECH</span>
                        </div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-[0.4em] ml-1">Power Garage Systems</p>
                    </div>
                </footer>

                {/* Navigation Bar (Optional for this screen, but keeping it per original design if it's meant to be a logged-in state. Usually recovery is logged out, but the original HTML had it. I will keep it for fidelity.) */}
                <nav className="flex justify-between gap-2 border-t border-slate-800/80 bg-[#0a1315]/90 backdrop-blur-md px-6 pb-8 pt-4">
                    <Link to="/" className="flex flex-col items-center justify-center text-slate-500 hover:text-primary transition-colors p-2">
                        <span className="material-symbols-outlined">home</span>
                    </Link>
                    <Link to="/settings" className="flex flex-col items-center justify-center text-slate-500 hover:text-primary transition-colors p-2">
                        <span className="material-symbols-outlined">settings</span>
                    </Link>
                    <Link to="/recovery" className="flex flex-col items-center justify-center text-primary p-2">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                    </Link>
                    <Link to="/profile" className="flex flex-col items-center justify-center text-slate-500 hover:text-primary transition-colors p-2">
                        <span className="material-symbols-outlined">person</span>
                    </Link>
                </nav>

            </div>
        </div>
    );
};

export default PasswordRecovery;
