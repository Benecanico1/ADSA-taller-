import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const NewTenantForm = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [empresaDatos, setEmpresaDatos] = useState({
        name: '',
        legalName: '',
        documentId: '', // RUC / NIT
        planPrice: 50,
        contactEmail: '',
        contactPhone: ''
    });

    const [sucursalDatos, setSucursalDatos] = useState({
        name: 'Matriz Principal',
        address: '',
        city: ''
    });

    const handleEmpresaChange = (e) => {
        setEmpresaDatos({ ...empresaDatos, [e.target.name]: e.target.value });
    };

    const handleSucursalChange = (e) => {
        setSucursalDatos({ ...sucursalDatos, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate super admin
            if (currentUser?.role !== 'super_admin') {
                throw new Error("Permisos insuficientes. Solo el Súper Administrador puede crear franquicias.");
            }

            // 1. Create Empresa
            const empresaRef = await addDoc(collection(db, 'Empresas'), {
                ...empresaDatos,
                planPrice: Number(empresaDatos.planPrice),
                subscriptionStatus: 'trial',
                createdAt: serverTimestamp(),
                createdBy: currentUser.uid,
                status: 'active'
            });

            const empresaId = empresaRef.id;

            // 2. Create Initial Sucursal for this Empresa
            const sucursalRef = await addDoc(collection(db, 'Sucursales'), {
                ...sucursalDatos,
                empresaId: empresaId,
                createdAt: serverTimestamp(),
                status: 'active'
            });

            // Navigation success
            alert(`Taller registrado exitosamente. ID Empresa: ${empresaId}.
            
Nota: Debes crear al usuario Administrador de este taller solicitándole que se registre y luego asignándole el rol 'empresa_admin' con este empresaId y sucursalId.`);
            
            navigate('/saas-admin');

        } catch (err) {
            console.error("Error creating tenant:", err);
            setError(err.message || 'Error al crear la franquicia');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#0a0c14] text-slate-100 min-h-screen py-8 px-4 font-display">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={() => navigate('/saas-admin')}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                    >
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white">Afiliar Nuevo Taller</h1>
                        <p className="text-sm text-slate-400 mt-1">Ingresa los datos del nuevo cliente SaaS para generar su espacio en la plataforma.</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Sección Empresa */}
                    <div className="bg-[#161b2a] border border-slate-800 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-indigo-400">domain</span>
                            Datos de la Empresa
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nombre Comercial *</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    required
                                    value={empresaDatos.name}
                                    onChange={handleEmpresaChange}
                                    className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                    placeholder="Ej. Taller MotoMaster"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Razón Social</label>
                                <input 
                                    type="text" 
                                    name="legalName"
                                    value={empresaDatos.legalName}
                                    onChange={handleEmpresaChange}
                                    className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                    placeholder="MotoMaster S.A.S"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Identificación (RUT/NIT)</label>
                                <input 
                                    type="text" 
                                    name="documentId"
                                    value={empresaDatos.documentId}
                                    onChange={handleEmpresaChange}
                                    className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                    placeholder="123456789-0"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-indigo-400">Plan Mensual (USD) *</label>
                                <input 
                                    type="number" 
                                    name="planPrice"
                                    required
                                    min="0"
                                    value={empresaDatos.planPrice}
                                    onChange={handleEmpresaChange}
                                    className="w-full bg-indigo-500/5 border border-indigo-500/20 rounded-xl px-4 py-3 text-indigo-300 focus:border-indigo-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email de Contacto *</label>
                                <input 
                                    type="email" 
                                    name="contactEmail"
                                    required
                                    value={empresaDatos.contactEmail}
                                    onChange={handleEmpresaChange}
                                    className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                    placeholder="contacto@taller.com"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Teléfono</label>
                                <input 
                                    type="tel" 
                                    name="contactPhone"
                                    value={empresaDatos.contactPhone}
                                    onChange={handleEmpresaChange}
                                    className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                    placeholder="+1 234 567 8900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección Sucursal Matriz */}
                    <div className="bg-[#161b2a] border border-slate-800 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-indigo-400">store</span>
                            Sucursal Principal
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nombre de la Sucursal *</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    required
                                    value={sucursalDatos.name}
                                    onChange={handleSucursalChange}
                                    className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Ciudad/Región *</label>
                                <input 
                                    type="text" 
                                    name="city"
                                    required
                                    value={sucursalDatos.city}
                                    onChange={handleSucursalChange}
                                    className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                    placeholder="Ciudad"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Dirección</label>
                                <input 
                                    type="text" 
                                    name="address"
                                    value={sucursalDatos.address}
                                    onChange={handleSucursalChange}
                                    className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                    placeholder="Av. Principal 123"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest disabled:opacity-50 transition-all flex items-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95"
                        >
                            {loading ? (
                                <><span className="material-symbols-outlined animate-spin">sync</span> Creando Espacio...</>
                            ) : (
                                <><span className="material-symbols-outlined">rocket_launch</span> Activar Nueva Franquicia</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewTenantForm;
