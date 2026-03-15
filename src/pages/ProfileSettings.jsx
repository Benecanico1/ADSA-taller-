import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
    const navigate = useNavigate();

    // Mock user states
    const [name, setName] = useState("Alejandro Rivera");
    const [email, setEmail] = useState("alejandro.rivera@example.com");
    const [phone, setPhone] = useState("+52 55 1234 5678");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // UI states
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulate an API call
        setTimeout(() => {
            setIsSaving(false);
            alert("¡Cambios guardados exitosamente!");
            // Optionally navigate back or stay here
            // navigate('/profile');
        }, 1500);
    };

    return (
        <div className="bg-[#0a0c14] text-slate-100 min-h-screen flex flex-col font-display max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center p-4 justify-between bg-[#161b2a]/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800 shadow-sm">
                <button onClick={() => navigate('/profile')} className="flex size-10 items-center justify-center rounded-full bg-[#161b2a] border border-slate-700/80 hover:border-primary/50 transition-colors shadow-inner text-slate-400 hover:text-white">
                    <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
                </button>
                <div className="flex-1 text-center">
                    <h2 className="text-white text-lg font-black tracking-tight drop-shadow-md">Ajustes de Perfil</h2>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-0.5">Configuración General</p>
                </div>
                <div className="flex w-10"></div> {/* Spacer to center the title */}
            </div>

            <main className="flex-1 overflow-y-auto p-4 space-y-8 pb-12">

                {/* Photo Update Section */}
                <section className="flex flex-col items-center gap-4 py-4">
                    <div className="relative group cursor-pointer">
                        <div className="size-28 rounded-full overflow-hidden bg-slate-800 border-2 border-primary/50 mb-1"
                            style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDiVtdcZ9EEjYLFHEUHaagwZbCrKEXxcldZTSUkevl3D4RNGa1ZAXJzy_oeJ_WkGGvBbhM-i1ILy2Ss3kPU6NbOMqktS2DiaXzboKk0zw6utPXXzdlbrWAyq_AVTKfvtLzv66XBkAvKT1SC03ihyVgNeb488IPfLURcFO_kwWA-M_y8Eqd448cy7tVHoG3-WoO1qAarPo4WmTyL4YLG1wafP3VbvwopIiZaHtrWBFWYSgA-pZ3pKnh3nNOGbGnqsHu6TnO6d6IYFLSE")`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        </div>
                        <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                            <span className="text-[10px] text-white font-bold uppercase mt-1">Cambiar</span>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 tracking-wide">Toca la imagen para editar</p>
                </section>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* General Info */}
                    <section className="space-y-4">
                        <h3 className="text-[11px] font-black tracking-widest text-primary uppercase border-b border-slate-800 pb-2">Datos Personales</h3>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold tracking-widest uppercase text-slate-400 ml-1">Nombre Completo</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#161b2a] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold tracking-widest uppercase text-slate-400 ml-1">Correo Electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#161b2a] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold tracking-widest uppercase text-slate-400 ml-1">Teléfono Móvil</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-[#161b2a] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                    </section>

                    {/* Security */}
                    <section className="space-y-4 pt-2">
                        <h3 className="text-[11px] font-black tracking-widest text-primary uppercase border-b border-slate-800 pb-2">Seguridad</h3>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold tracking-widest uppercase text-slate-400 ml-1">Contraseña Actual</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-[#161b2a] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold tracking-widest uppercase text-slate-400 ml-1">Nueva Contraseña</label>
                            <input
                                type="password"
                                placeholder="Dejar en blanco para no cambiar"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-[#161b2a] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-slate-600"
                            />
                        </div>
                    </section>

                    {/* Preferences */}
                    <section className="space-y-4 pt-2 pb-6">
                        <h3 className="text-[11px] font-black tracking-widest text-primary uppercase border-b border-slate-800 pb-2">Preferencias</h3>

                        <div className="flex items-center justify-between p-4 bg-[#161b2a] border border-slate-700/80 rounded-xl">
                            <div>
                                <p className="text-sm font-bold text-white">Notificaciones Push</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Alertas de servicios y citas</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${notificationsEnabled ? 'bg-primary' : 'bg-slate-700'}`}
                            >
                                <div className={`size-4 bg-white rounded-full mx-1 transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </section>

                    {/* Submit Bar Fixed Bottom */}
                    <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto p-4 bg-[#0a0c14]/90 backdrop-blur-xl border-t border-slate-800 z-50">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[13px] flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(37,123,244,0.3)]
                                ${isSaving ? 'bg-primary/50 text-slate-800 cursor-not-allowed' : 'bg-primary text-[#0a0c14] hover:bg-primary/90 active:scale-[0.98]'}`}
                        >
                            {isSaving ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">refresh</span>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default ProfileSettings;
