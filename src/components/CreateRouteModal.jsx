import React, { useState } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../lib/AuthContext';
import imageCompression from 'browser-image-compression';

const CreateRouteModal = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        destination: '',
        date: '',
        time: '',
        meetingPoint: '',
        description: '',
        contactLink: '',
        difficulty: 'General'
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = async (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];

            // Show preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Compress immediately
            try {
                const options = {
                    maxSizeMB: 0.2, // Slightly larger for flyers
                    maxWidthOrHeight: 1200,
                    useWebWorker: true,
                    fileType: 'image/webp'
                };
                const compressedFile = await imageCompression(file, options);
                setImageFile(compressedFile);
            } catch (error) {
                console.error("Error compressing image:", error);
                setImageFile(file);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let uploadedFlyerUrl = '';

            // Upload Flyer if selected
            if (imageFile) {
                const storageRef = ref(storage, `routes/${currentUser.uid}/${Date.now()}_flyer.webp`);
                const uploadTask = await uploadBytesResumable(storageRef, imageFile);
                uploadedFlyerUrl = await getDownloadURL(uploadTask.ref);
            }
            // Combine date and time to create a single timestamp for sorting
            const dateTimeString = `${formData.date}T${formData.time}`;
            const routeDate = new Date(dateTimeString);

            // 1. Create the Route Document
            const routeRef = await addDoc(collection(db, 'Routes'), {
                title: formData.title,
                destination: formData.destination,
                date: routeDate.toISOString(),
                meetingPoint: formData.meetingPoint,
                description: formData.description,
                contactLink: formData.contactLink,
                flyerUrl: uploadedFlyerUrl,
                difficulty: formData.difficulty,
                promoterId: currentUser.uid,
                promoterName: currentUser.displayName || currentUser.email.split('@')[0],
                status: 'active',
                createdAt: serverTimestamp()
            });

            // 2. Post a message to the Chat Feed with the Flyer
            await addDoc(collection(db, 'RouteChatMessages'), {
                text: `¡Prepárense! Nueva ruta confirmada a ${formData.destination}.`,
                userId: currentUser.uid,
                userName: currentUser.displayName || currentUser.email.split('@')[0],
                isPromoter: true,
                attachedRouteId: routeRef.id,
                attachedFlyerUrl: uploadedFlyerUrl,
                createdAt: serverTimestamp()
            });

            onClose();
        } catch (error) {
            console.error("Error creating route:", error);
            alert("Hubo un error al crear la ruta. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
            <div className="bg-[#161b2a] w-full max-w-md rounded-3xl border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col max-h-[90vh]">

                <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#1a1f2e] sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                            <span className="material-symbols-outlined text-purple-400">add_location_alt</span>
                        </div>
                        <div>
                            <h3 className="text-white font-black tracking-tight text-lg leading-tight">Nueva Ruta</h3>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Crear evento oficial</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="size-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>

                <div className="p-5 overflow-y-auto no-scrollbar flex-1 relative">
                    <form id="createRouteForm" onSubmit={handleSubmit} className="space-y-4">

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Título de la Rodada *</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Ej: Rodada Dominguera a..."
                                    className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Destino *</label>
                                    <input
                                        type="text"
                                        name="destination"
                                        required
                                        value={formData.destination}
                                        onChange={handleChange}
                                        placeholder="Ej: Villa de Leyva"
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Nivel *</label>
                                    <select
                                        name="difficulty"
                                        value={formData.difficulty}
                                        onChange={handleChange}
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium appearance-none"
                                    >
                                        <option value="General">General (Todos)</option>
                                        <option value="Principiante">Principiante</option>
                                        <option value="Intermedio">Intermedio</option>
                                        <option value="Experto">Experto</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Fecha *</label>
                                    <input
                                        type="date"
                                        name="date"
                                        required
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Hora de Salida *</label>
                                    <input
                                        type="time"
                                        name="time"
                                        required
                                        value={formData.time}
                                        onChange={handleChange}
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Punto de Encuentro *</label>
                                <input
                                    type="text"
                                    name="meetingPoint"
                                    required
                                    value={formData.meetingPoint}
                                    onChange={handleChange}
                                    placeholder="Ej: Gasolinera Primax, Calle 100"
                                    className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Enlace Grupo Whatsapp *</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 material-symbols-outlined text-lg">link</span>
                                    <input
                                        type="url"
                                        name="contactLink"
                                        required
                                        value={formData.contactLink}
                                        onChange={handleChange}
                                        placeholder="https://chat.whatsapp.com/..."
                                        className="w-full bg-[#0a0c14] border border-emerald-500/30 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                                    />
                                </div>
                                <p className="text-[9px] text-slate-500 mt-1 ml-2">Los moteros usarán este link para unirse al chat del evento.</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Flyer Oficial (Opcional)</label>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700/50 border-dashed rounded-xl cursor-pointer bg-[#0a0c14] hover:bg-slate-800/50 hover:border-purple-500/50 transition-all overflow-hidden relative group">
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white font-bold text-xs tracking-wider uppercase">Cambiar Flyer</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <div className="size-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-purple-400 text-xl">image</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest"><span className="text-purple-400">Subir Imagen</span></p>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                                <p className="text-[9px] text-slate-500 mt-1 ml-2">Esta foto se exhibirá en el chat general.</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Detalles Adicionales</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Recomendaciones de equipo, paradas estimadas, peajes..."
                                    rows="3"
                                    className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium resize-none"
                                ></textarea>
                            </div>
                        </div>

                    </form>
                </div>

                <div className="p-5 border-t border-slate-800 bg-[#1a1f2e]">
                    <button
                        type="submit"
                        form="createRouteForm"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                            ${loading
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] active:scale-[0.98]'
                            }
                        `}
                    >
                        {loading ? (
                            <><span className="material-symbols-outlined animate-spin">refresh</span> Guardando...</>
                        ) : (
                            <><span className="material-symbols-outlined">publish</span> Publicar Ruta Oficial</>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreateRouteModal;
