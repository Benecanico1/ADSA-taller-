import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db, storage } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import imageCompression from 'browser-image-compression';
import { useNotifications } from '../lib/NotificationContext';
import MechanicBottomNav from '../components/ui/MechanicBottomNav';

const MechanicProfile = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { togglePanel, unreadCount } = useNotifications();

    // User data states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // UI states
    const [isSaving, setIsSaving] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!currentUser) return;
            setEmail(currentUser.email || "");
            try {
                const userDoc = await getDoc(doc(db, 'Users', currentUser.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setName(data.name || "");
                    setPhone(data.phone || "");
                    if (data.notificationsEnabled !== undefined) {
                        setNotificationsEnabled(data.notificationsEnabled);
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoadingData(false);
            }
        };
        fetchUserData();
    }, [currentUser]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!currentUser) return;
        setIsSaving(true);

        try {
            await updateDoc(doc(db, 'Users', currentUser.uid), {
                name,
                phone,
                notificationsEnabled,
                updatedAt: new Date()
            });
            alert("¡Cambios guardados exitosamente!");
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Error al guardar los cambios.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        let file = e.target.files?.[0];
        if (!file || !currentUser) return;

        try {
            setIsUploadingPhoto(true);

            // Compresión
            let finalFile = file;
            let extension = file.type.split('/')[1] || 'jpg';

            try {
                // Intento 1: WebP ~100KB
                const primaryOptions = {
                    maxSizeMB: 0.095,
                    maxWidthOrHeight: 400,
                    useWebWorker: true,
                    fileType: 'image/webp',
                    initialQuality: 0.8
                };
                finalFile = await imageCompression(file, primaryOptions);
                extension = 'webp';
            } catch (compressionError) {
                console.warn("Fallo compresión primaria WebP, intentando JPEG:", compressionError);
                try {
                    // Intento 2: Fallback estándar JPEG ~200KB
                    const fallbackOptions = {
                        maxSizeMB: 0.2,
                        maxWidthOrHeight: 400,
                        useWebWorker: true,
                        fileType: 'image/jpeg'
                    };
                    finalFile = await imageCompression(file, fallbackOptions);
                    extension = 'jpg';
                } catch (fallbackError) {
                    console.error("Fallo compresión secundaria, subiendo original:", fallbackError);
                    // Si ambos fallan, finalFile sigue siendo el 'file' original subido por el input.
                    extension = file.type.split('/')[1] || 'jpg';
                }
            }

            // Subida a Storage
            let downloadUrl = "";
            try {
                const fileRef = ref(storage, `Users/${currentUser.uid}/profile_${Date.now()}.${extension}`);
                const metadata = {
                    contentType: finalFile.type || file.type || 'image/jpeg'
                };
                await uploadBytes(fileRef, finalFile, metadata);
                downloadUrl = await getDownloadURL(fileRef);
            } catch (uploadError) {
                console.error("Error específico al subir archivo a Firebase Storage:", uploadError);
                throw new Error("No se pudo guardar la imagen en el servidor (Firebase Storage Error).");
            }

            // Update Auth Profile
            await updateProfile(currentUser, {
                photoURL: downloadUrl
            });

            // Update Firestore Profile
            await updateDoc(doc(db, 'Users', currentUser.uid), {
                photoUrl: downloadUrl, // Keeping consistency with how other parts of the app might read it
                updatedAt: new Date()
            });

            // Forzar un "parcheo" pequeño a la vista local para que se vea rápido (en caso que Auth tarde un ms)
            // Ya que usamos currentUser?.photoURL, recargar para jalar los cambios recientes del auth.
            window.location.reload(); 

        } catch (error) {
            console.error("Error al subir la foto de perfil:", error);
            alert(`Error al subir la foto: ${error.message || error.code || 'Desconocido'}. Por favor, toma una captura y compártela para soporte.`);
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    if (loadingData) {
        return <div className="min-h-screen bg-[#0a0c14] flex items-center justify-center"><p className="text-white">Cargando...</p></div>;
    }

    return (
        <div className="bg-[#0a0c14] text-slate-100 min-h-screen flex flex-col font-display max-w-[1200px] w-full mx-auto shadow-2xl relative overflow-x-hidden lg:border-x lg:border-slate-800/50">
            {/* Header */}
            <div className="flex items-center p-4 justify-between bg-[#161b2a]/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800 shadow-sm">
                <button onClick={() => navigate('/mechanic-dashboard')} className="flex size-10 items-center justify-center rounded-full bg-[#161b2a] border border-slate-700/80 hover:border-primary/50 transition-colors shadow-inner text-slate-400 hover:text-white">
                    <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
                </button>
                <div className="flex-1 text-center">
                    <h2 className="text-white text-lg font-black tracking-tight drop-shadow-md">Ajustes de Perfil</h2>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-0.5">Mecánico</p>
                </div>
                <button onClick={togglePanel} className="relative flex size-10 items-center justify-center rounded-full bg-[#161b2a] border border-slate-700/80 hover:border-primary/50 transition-colors shadow-inner text-slate-400 hover:text-white">
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 rounded-full bg-red-500 border border-[#161b2a] animate-pulse"></span>
                    )}
                </button>
            </div>

            <main className="flex-1 overflow-y-auto p-4 space-y-8 pb-32">

                {/* Photo Update Section */}
                <section className="flex flex-col items-center gap-4 py-4">
                    <label className={`relative group cursor-pointer ${isUploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="size-28 rounded-full overflow-hidden bg-slate-800 border-2 border-primary/50 mb-1 flex items-center justify-center relative shadow-lg"
                            style={{ backgroundImage: `url(${currentUser?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuDiVtdcZ9EEjYLFHEUHaagwZbCrKEXxcldZTSUkevl3D4RNGa1ZAXJzy_oeJ_WkGGvBbhM-i1ILy2Ss3kPU6NbOMqktS2DiaXzboKk0zw6utPXXzdlbrWAyq_AVTKfvtLzv66XBkAvKT1SC03ihyVgNeb488IPfLURcFO_kwWA-M_y8Eqd448cy7tVHoG3-WoO1qAarPo4WmTyL4YLG1wafP3VbvwopopIiZaHtrWBFWYSgA-pZ3pKnh3nNOGbGnqsHu6TnO6d6IYFLSE"})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                            {isUploadingPhoto && (
                                <span className="material-symbols-outlined animate-spin text-white">sync</span>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                            <span className="text-[10px] text-white font-bold uppercase mt-1">Cambiar</span>
                        </div>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handlePhotoUpload} 
                            disabled={isUploadingPhoto} 
                            className="hidden" 
                        />
                    </label>
                    <p className="text-xs text-slate-400 tracking-wide">
                        {isUploadingPhoto ? 'Subiendo imagen...' : 'Toca la imagen para editar'}
                    </p>
                </section>

                <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    {/* General Info */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
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
                            <label className="text-[10px] font-bold tracking-widest uppercase text-slate-400 ml-1">Correo Electrónico de Registro</label>
                            <input
                                type="email"
                                value={email}
                                disabled={true}
                                className="w-full bg-[#161b2a] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed focus:outline-none transition-colors"
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
                    </div>

                    {/* Right Column (Security & Preferences) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Security */}
                        <section className="space-y-4 pt-2 lg:pt-0">
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
                    </div>

                    {/* Submit Bar Fixed Bottom with padding over BottomNav */}
                    <div className="fixed bottom-24 left-0 right-0 max-w-[1200px] w-full mx-auto p-4 bg-[#0a0c14]/90 backdrop-blur-xl border-t border-slate-800 z-40 lg:border-x lg:border-slate-800/50">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[13px] flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,40,0,0.3)]
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
            <MechanicBottomNav />
        </div>
    );
};

export default MechanicProfile;
