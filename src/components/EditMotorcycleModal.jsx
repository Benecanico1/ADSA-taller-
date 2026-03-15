import React, { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { doc, updateDoc, deleteDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../lib/AuthContext';
import imageCompression from 'browser-image-compression';
import { getAvailableModels } from '../data/motorcycleModels';

const EditMotorcycleModal = ({ isOpen, onClose, motorcycle }) => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: '',
        plate: '',
        vin: '',
        mileage: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isCustomModel, setIsCustomModel] = useState(false);
    const [customModelsDB, setCustomModelsDB] = useState([]); // Models fetched from DB

    // Derived state
    const staticModels = getAvailableModels(formData.brand);
    // Combine static models and unique custom models from DB
    const availableModels = Array.from(new Set([...staticModels, ...customModelsDB])).sort();
    const showModelDropdown = availableModels.length > 0 && !isCustomModel;

    // Fetch custom models when brand changes
    useEffect(() => {
        const fetchCustomModels = async () => {
            if (!formData.brand) {
                setCustomModelsDB([]);
                return;
            }
            try {
                const normalizedBrand = formData.brand.trim().toLowerCase();
                const q = query(collection(db, 'CustomModels'), where('brandId', '==', normalizedBrand));
                const snapshot = await getDocs(q);
                const models = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.model) models.push(data.model);
                });
                setCustomModelsDB(models);
            } catch (err) {
                console.error("Error fetching custom models:", err);
            }
        };
        fetchCustomModels();
    }, [formData.brand]);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

    useEffect(() => {
        if (motorcycle && isOpen) {
            const initialBrand = motorcycle.brand || '';
            const initialModel = motorcycle.model || '';
            setFormData({
                brand: initialBrand,
                model: initialModel,
                year: motorcycle.year || '',
                plate: motorcycle.plate || '',
                vin: motorcycle.vin || '',
                mileage: motorcycle.mileage || ''
            });
            setImagePreview(motorcycle.imageUrl || null);
            setImageFile(null);
            setError('');
            setConfirmDelete(false);
            
            
            const modelsForBrand = getAvailableModels(initialBrand);
            if (modelsForBrand.length > 0 && !modelsForBrand.includes(initialModel) && !customModelsDB.includes(initialModel)) {
                setIsCustomModel(true);
            } else {
                setIsCustomModel(false);
            }
        }
    }, [motorcycle, isOpen]);

    if (!isOpen || !motorcycle) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'brand') {
            setFormData(prev => ({ ...prev, brand: value, model: '' }));
            setIsCustomModel(false);
            setCustomModelsDB([]); // Reset custom models while fetching new ones
        } else if (name === 'modelSelect') {
            if (value === 'OTHER') {
                setIsCustomModel(true);
                setFormData(prev => ({ ...prev, model: '' }));
            } else {
                setFormData(prev => ({ ...prev, model: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = async (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setIsCompressing(true);

            // Show instant preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Compress image
            try {
                const options = {
                    maxSizeMB: 0.8,
                    maxWidthOrHeight: 1280,
                    useWebWorker: true,
                    fileType: 'image/webp',
                    initialQuality: 0.8
                };
                const compressedFile = await imageCompression(file, options);
                setImageFile(compressedFile);
            } catch (error) {
                console.error("Error compressing image:", error);
                // Fallback to original if compression fails
                setImageFile(file);
            } finally {
                setIsCompressing(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.brand || !formData.model || !formData.year || !formData.plate || !formData.vin || !formData.mileage) {
            setError('Todos los campos son obligatorios exceptuando la foto.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let imageUrl = motorcycle.imageUrl;

            if (imageFile) {
                const storageRef = ref(storage, `motorcycles/${currentUser.uid}/${Date.now()}_${imageFile.name}`);
                const uploadTask = await uploadBytesResumable(storageRef, imageFile);
                imageUrl = await getDownloadURL(uploadTask.ref);
            }

            const motoRef = doc(db, 'Motorcycles', motorcycle.id);
            await updateDoc(motoRef, {
                ...formData,
                mileage: Number(formData.mileage),
                imageUrl,
                updatedAt: new Date()
            });

            // If it's a completely new brand or a new custom model not in DB or static list, save to CustomModels
            if (formData.brand && formData.model) {
                const normalizedBrand = formData.brand.trim().toLowerCase();
                const finalModel = formData.model.trim();
                
                const isInDataBase = customModelsDB.includes(finalModel);
                const isStatic = staticModels.includes(finalModel);

                if (!isInDataBase && !isStatic) {
                     try {
                         await addDoc(collection(db, 'CustomModels'), {
                             brandId: normalizedBrand,
                             originalBrand: formData.brand.trim(),
                             model: finalModel,
                             createdBy: currentUser.uid,
                             createdAt: new Date()
                         });
                     } catch(err) {
                         console.error("Silently failing to save custom model entry", err);
                     }
                }
            }

            onClose();
        } catch (err) {
            console.error('Error updating motorcycle:', err);
            setError('Error al actualizar la moto. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }

        setLoading(true);
        try {
            await deleteDoc(doc(db, 'Motorcycles', motorcycle.id));
            onClose();
        } catch (err) {
            console.error('Error deleting motorcycle:', err);
            setError('Error al eliminar la moto.');
        } finally {
            setLoading(false);
            setConfirmDelete(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center font-display">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-[#0a0c14] w-full max-w-lg sm:rounded-3xl rounded-t-3xl border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-[#161b2a] px-6 py-4 flex items-center justify-between border-b border-slate-700/50">
                    <div>
                        <h2 className="text-lg font-black text-white tracking-tight">Editar Vehículo</h2>
                        <p className="text-xs text-primary font-bold uppercase tracking-widest">{motorcycle.brand} {motorcycle.model}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors border border-slate-700/50"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg text-center font-bold">
                            {error}
                        </div>
                    )}

                    <form id="edit-moto-form" onSubmit={handleSubmit} className="space-y-4">
                        {/* Image Upload */}
                        <div className="flex flex-col items-center justify-center w-full">
                            <label htmlFor="edit-dropzone-file" className={`flex flex-col items-center justify-center w-full h-40 border-2 border-slate-700 border-dashed rounded-2xl ${isCompressing ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-slate-800/50 hover:border-primary/50'} bg-[#161b2a] transition-all overflow-hidden relative group`}>
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className={`w-full h-full object-cover ${isCompressing ? 'blur-sm grayscale' : ''}`} />
                                        {isCompressing ? (
                                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-10">
                                                <span className="material-symbols-outlined animate-spin text-primary text-2xl mb-1">sync</span>
                                                <span className="text-primary font-bold text-xs tracking-wider uppercase animate-pulse">Optimizando...</span>
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white font-bold text-sm tracking-wider uppercase">Cambiar Foto</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-primary text-2xl">add_a_photo</span>
                                        </div>
                                        <p className="mb-1 text-xs text-slate-400 font-bold"><span className="text-primary">Sube una foto</span></p>
                                    </div>
                                )}
                                <input id="edit-dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={isCompressing} />
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Marca</label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#161b2a] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                    required
                                />
                            </div>
                            <div className="space-y-1 flex flex-col justify-end">
                                <div className="flex justify-between items-end">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Modelo</label>
                                    {isCustomModel && availableModels.length > 0 && (
                                        <button type="button" onClick={() => setIsCustomModel(false)} className="text-[9px] text-primary hover:text-white uppercase tracking-widest font-bold">Ver Lista</button>
                                    )}
                                </div>
                                {showModelDropdown ? (
                                    <div className="relative">
                                        <select
                                            name="modelSelect"
                                            value={availableModels.includes(formData.model) ? formData.model : ""}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#161b2a] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors appearance-none pr-8"
                                            required
                                        >
                                            <option value="" disabled>Selecciona el modelo...</option>
                                            {availableModels.map(model => (
                                                <option key={model} value={model}>{model}</option>
                                            ))}
                                            <option value="OTHER" className="font-bold text-primary">Otro Modelo...</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</span>
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleInputChange}
                                        placeholder={availableModels.length > 0 ? "Escribe el modelo..." : "Ej. Panigale V4"}
                                        className="w-full bg-[#161b2a] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        required
                                        disabled={!formData.brand && (formData.brand.length === 0)}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Año</label>
                            <select
                                name="year"
                                value={formData.year}
                                onChange={handleInputChange}
                                className="w-full bg-[#161b2a] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors appearance-none"
                                required
                            >
                                <option value="" disabled>Selecciona el año</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Patente</label>
                                <input
                                    type="text"
                                    name="plate"
                                    value={formData.plate}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#161b2a] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 uppercase focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kilometraje</label>
                                <input
                                    type="number"
                                    name="mileage"
                                    value={formData.mileage}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#161b2a] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">VIN (Número de Chasis)</label>
                            <input
                                type="text"
                                name="vin"
                                value={formData.vin}
                                onChange={handleInputChange}
                                className="w-full bg-[#161b2a] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 uppercase focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                required
                            />
                        </div>
                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="bg-[#161b2a] border-t border-slate-700/50 p-4 flex flex-col gap-3">
                    <button
                        type="submit"
                        form="edit-moto-form"
                        disabled={loading || isCompressing}
                        className="w-full bg-primary hover:bg-primary/90 text-[#0a0c14] font-black uppercase tracking-widest py-3.5 rounded-xl text-sm transition-all flex justify-center items-center shadow-[0_0_15px_rgba(13,204,242,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading || isCompressing ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-sm mr-2">sync</span>
                                <span>{isCompressing ? 'Optimizando...' : (confirmDelete ? 'Guardar Cambios' : 'Guardando...')}</span>
                            </>
                        ) : (
                            'Guardar Cambios'
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading && confirmDelete}
                        className={`w-full py-3 rounded-xl text-sm font-bold transition-all uppercase tracking-widest flex justify-center items-center border ${confirmDelete
                            ? 'bg-red-500 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:bg-red-600'
                            : 'bg-transparent text-slate-400 border-slate-700 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50'
                            }`}
                    >
                        {loading && confirmDelete ? (
                            <span className="material-symbols-outlined animate-spin text-sm mr-2">sync</span>
                        ) : (
                            <span className="material-symbols-outlined text-sm mr-2">delete</span>
                        )}
                        {confirmDelete ? '¿Estás Seguro? Confirmar' : 'Eliminar Vehículo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditMotorcycleModal;
