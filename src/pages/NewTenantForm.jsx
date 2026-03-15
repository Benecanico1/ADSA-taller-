import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseConfig } from '../lib/firebase';

const NewTenantForm = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [createAdmin, setCreateAdmin] = useState(false);
    
    const [adminDatos, setAdminDatos] = useState({
        email: '',
        password: '',
        displayName: ''
    });

    const handleAdminChange = (e) => {
        setAdminDatos({ ...adminDatos, [e.target.name]: e.target.value });
    };

    const [empresaDatos, setEmpresaDatos] = useState({
        name: '',
        legalName: '',
        documentId: '', // RUC / NIT
        planPrice: 50,
        contactEmail: '',
        contactPhone: ''
    });

    const [sucursales, setSucursales] = useState([
        { name: 'Matriz Principal', address: '', city: '' }
    ]);

    const handleEmpresaChange = (e) => {
        setEmpresaDatos({ ...empresaDatos, [e.target.name]: e.target.value });
    };

    const handleSucursalChange = (index, e) => {
        const updated = [...sucursales];
        updated[index][e.target.name] = e.target.value;
        setSucursales(updated);
    };

    const addSucursal = () => {
        setSucursales([...sucursales, { name: '', address: '', city: '' }]);
    };

    const removeSucursal = (index) => {
        if (sucursales.length > 1) {
            const updated = sucursales.filter((_, i) => i !== index);
            setSucursales(updated);
        }
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

            // 2. Create Initial Sucursales for this Empresa
            const promises = sucursales.map(sucursal => {
                return addDoc(collection(db, 'Sucursales'), {
                    ...sucursal,
                    empresaId: empresaId,
                    createdAt: serverTimestamp(),
                    status: 'active'
                });
            });

            const sucursalesRefs = await Promise.all(promises);
            const firstSucursalId = sucursalesRefs[0].id;

            // Navigation success
            let successMessage = `Taller registrado exitosamente. ID Empresa: ${empresaId}.`;

            if (createAdmin && adminDatos.email && adminDatos.password) {
                try {
                    // Create Secondary App to avoid logging out Super Admin
                    const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
                    const secondaryAuth = getAuth(secondaryApp);
                    
                    const res = await createUserWithEmailAndPassword(secondaryAuth, adminDatos.email, adminDatos.password);
                    
                    // Create User Document
                    await setDoc(doc(db, 'Users', res.user.uid), {
                        email: adminDatos.email,
                        displayName: adminDatos.displayName || 'Administrador',
                        role: 'empresa_admin',
                        empresaId: empresaId,
                        sucursalId: firstSucursalId,
                        status: 'active',
                        createdAt: serverTimestamp()
                    });

                    // Avoid staying logged in on secondary app
                    await signOut(secondaryAuth);
                    
                    successMessage += `\nCuenta de Administrador (${adminDatos.email}) creada y vinculada correctamente.`;
                } catch (authErr) {
                    console.error("Error creating admin user:", authErr);
                    successMessage += `\nPero hubo un error al crear el usuario administrador: ${authErr.message}`;
                }
            } else {
                successMessage += `\nNota: Debes crear al usuario Administrador de este taller solicitándole que se registre y luego asignándole el rol 'empresa_admin' con este empresaId y sucursalId.`;
            }

            alert(successMessage);
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
                                <label className="text-xs font-bold uppercase tracking-widest text-indigo-400">Precio Paquete Mensual (USD) *</label>
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

                    {/* Sección Sucursales */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-indigo-400">store</span>
                                Sucursales / Sedes
                            </h2>
                            <button 
                                type="button" 
                                onClick={addSucursal}
                                className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[16px]">add</span>
                                Añadir Sucursal
                            </button>
                        </div>
                        
                        {sucursales.map((sucursal, index) => (
                            <div key={index} className="bg-[#161b2a] border border-slate-800 rounded-2xl p-6 shadow-sm relative">
                                {sucursales.length > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => removeSucursal(index)}
                                        className="absolute top-4 right-4 text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 p-2 rounded-xl transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                )}
                                <h3 className="text-sm font-bold text-slate-300 mb-4 border-b border-slate-800 pb-2">
                                    Sucursal {index + 1} {index === 0 ? '(Matriz)' : ''}
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nombre de la Sucursal *</label>
                                        <input 
                                            type="text" 
                                            name="name"
                                            required
                                            value={sucursal.name}
                                            onChange={(e) => handleSucursalChange(index, e)}
                                            className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Ciudad/Región *</label>
                                        <input 
                                            type="text" 
                                            name="city"
                                            required
                                            value={sucursal.city}
                                            onChange={(e) => handleSucursalChange(index, e)}
                                            className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                            placeholder="Ciudad"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Dirección</label>
                                        <input 
                                            type="text" 
                                            name="address"
                                            value={sucursal.address}
                                            onChange={(e) => handleSucursalChange(index, e)}
                                            className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                            placeholder="Av. Principal 123"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sección Creación Automática de Administrador */}
                    <div className="bg-[#161b2a] border border-slate-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-indigo-400">shield_person</span>
                                Alta de Usuario Administrador (Opcional)
                            </h2>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={createAdmin}
                                    onChange={(e) => setCreateAdmin(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                            </label>
                        </div>

                        {createAdmin && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nombre del Administrador *</label>
                                    <input 
                                        type="text" 
                                        name="displayName"
                                        required={createAdmin}
                                        value={adminDatos.displayName}
                                        onChange={handleAdminChange}
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                        placeholder="Ej. Juan Pérez"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Correo Electrónico (Login) *</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        required={createAdmin}
                                        value={adminDatos.email}
                                        onChange={handleAdminChange}
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                        placeholder="admin@sucursal.com"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Contraseña Provisoria *</label>
                                    <input 
                                        type="text" 
                                        name="password"
                                        required={createAdmin}
                                        value={adminDatos.password}
                                        onChange={handleAdminChange}
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                        placeholder="Genera una contraseña fuerte"
                                    />
                                </div>
                                <div className="md:col-span-2 mt-2">
                                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">info</span>
                                        El sistema le asignará el rol "empresa_admin" vinculado a esta nueva Franquicia inmediatamente.
                                    </p>
                                </div>
                            </div>
                        )}
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
