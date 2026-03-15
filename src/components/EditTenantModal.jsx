import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const EditTenantModal = ({ empresa, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        planPrice: empresa?.planPrice || 0,
        subscriptionStatus: empresa?.subscriptionStatus || 'trial',
        status: empresa?.status || 'active'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const empresaRef = doc(db, 'Empresas', empresa.id);
            await updateDoc(empresaRef, {
                planPrice: Number(formData.planPrice),
                subscriptionStatus: formData.subscriptionStatus,
                status: formData.status
            });

            alert('Franquicia actualizada correctamente');
            onClose();
        } catch (error) {
            console.error("Error al actualizar la empresa:", error);
            alert('Ocurrió un error al guardar los cambios');
        } finally {
            setLoading(false);
        }
    };

    if (!empresa) return null;

    return (
        <div className="fixed inset-0 bg-[#0a0c14]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#161b2a] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-fade-in-up">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h2 className="text-white font-black text-lg">Administrar Plan</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{empresa.name}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-500 hover:text-white transition-colors bg-slate-800 rounded-lg p-1.5"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                            Precio del Plan Mensual ($)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                            <input 
                                type="number" 
                                name="planPrice"
                                min="0"
                                value={formData.planPrice}
                                onChange={handleChange}
                                className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Estado de la Suscripción
                        </label>
                        <select 
                            name="subscriptionStatus"
                            value={formData.subscriptionStatus}
                            onChange={handleChange}
                            className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none"
                        >
                            <option value="trial">Trial (De Prueba)</option>
                            <option value="active">Activa (Pagando)</option>
                            <option value="past_due">Atrasada (Past Due)</option>
                            <option value="canceled">Cancelada</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Restricción de Acceso
                        </label>
                        <select 
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none"
                        >
                            <option value="active">Permitir Acceso (Operativo)</option>
                            <option value="suspended">Suspender Cuenta (Bloqueado)</option>
                        </select>
                        <p className="text-[10px] text-slate-500">
                            Si suspendes la cuenta, ningún usuario de este taller podrá iniciar sesión.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><span className="material-symbols-outlined text-[18px] animate-spin">sync</span> Guardando...</>
                            ) : (
                                "Guardar Cambios"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTenantModal;
