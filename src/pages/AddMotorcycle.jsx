import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db, storage } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const AddMotorcycle = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: '',
        plate: '',
        vin: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.brand || !formData.model || !formData.year || !formData.plate || !formData.vin) {
            setError('Todos los campos son obligatorios exceptuando la foto.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let imageUrl = null;

            if (imageFile) {
                const storageRef = ref(storage, `motorcycles/${currentUser.uid}/${Date.now()}_${imageFile.name}`);
                const uploadTask = await uploadBytesResumable(storageRef, imageFile);
                imageUrl = await getDownloadURL(uploadTask.ref);
            } else {
                // Default placeholder
                imageUrl = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=500';
            }

            await addDoc(collection(db, 'Motorcycles'), {
                ...formData,
                imageUrl,
                ownerId: currentUser.uid,
                createdAt: new Date(),
                status: 'active'
            });

            navigate('/dashboard');
        } catch (err) {
            console.error('Error adding motorcycle:', err);
            setError('Error al registrar la moto. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#0a0c14] text-slate-100 min-h-screen flex flex-col font-display max-w-2xl mx-auto shadow-2xl relative overflow-x-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30 carbon-pattern"></div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#161b2a]/90 backdrop-blur-md border-b border-slate-800 px-4 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="size-10 rounded-full flex items-center justify-center bg-slate-800 hover:bg-slate-700 transition cursor-pointer">
                        <span className="material-symbols-outlined text-slate-300">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-base font-black leading-none text-white tracking-wide">Agregar Vehículo</h1>
                        <p className="text-[10px] text-primary uppercase tracking-widest font-bold mt-0.5">Registra tu motocicleta</p>
                    </div>
                </div>
            </header>

            {/* Form */}
            <main className="relative z-10 flex-1 px-5 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 rounded-xl text-center font-bold">
                            {error}
                        </div>
                    )}

                    {/* Image Upload */}
                    <div className="flex flex-col items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-700 border-dashed rounded-2xl cursor-pointer bg-[#161b2a] hover:bg-slate-800/50 hover:border-primary/50 transition-all overflow-hidden relative group">
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white font-bold text-sm tracking-wider uppercase">Cambiar Foto</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-primary text-3xl">add_a_photo</span>
                                    </div>
                                    <p className="mb-1 text-sm text-slate-400 font-bold"><span className="text-primary">Sube una foto</span> o arrastra</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest">PNG, JPG, WEBP</p>
                                </div>
                            )}
                            <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Brand */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Marca</label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleInputChange}
                                    placeholder="Ej. Ducati"
                                    className="w-full bg-[#161b2a] border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    required
                                />
                            </div>

                            {/* Model */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Modelo</label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleInputChange}
                                    placeholder="Ej. Panigale V4"
                                    className="w-full bg-[#161b2a] border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        {/* Year */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Año</label>
                            <select
                                name="year"
                                value={formData.year}
                                onChange={handleInputChange}
                                className="w-full bg-[#161b2a] border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                                required
                            >
                                <option value="" disabled>Selecciona el año</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        {/* Plate */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Patente / Dominio</label>
                            <input
                                type="text"
                                name="plate"
                                value={formData.plate}
                                onChange={handleInputChange}
                                placeholder="Ej. DX-9982"
                                className="w-full bg-[#161b2a] border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-slate-100 uppercase focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                required
                            />
                        </div>

                        {/* VIN */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Número de Chasis (VIN)</label>
                            <input
                                type="text"
                                name="vin"
                                value={formData.vin}
                                onChange={handleInputChange}
                                placeholder="17 caracteres"
                                className="w-full bg-[#161b2a] border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-slate-100 uppercase focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4 pb-12">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-primary text-[#0a0c14] rounded-xl font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(13,204,242,0.3)]"
                        >
                            {loading ? (
                                <span className="material-symbols-outlined animate-spin">sync</span>
                            ) : (
                                <>
                                    <span>Registrar Vehículo</span>
                                    <span className="material-symbols-outlined text-[18px]">motorcycle</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default AddMotorcycle;
