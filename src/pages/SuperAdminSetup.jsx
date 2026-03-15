import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { ShieldAlert, Building2, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminSetup() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    const [empresaName, setEmpresaName] = useState('ADSA Taller Inicial');
    const [sucursalName, setSucursalName] = useState('Central');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSetup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            if (!currentUser) throw new Error("Debes iniciar sesión primero");

            // 1. Create Empresa
            const empresaRef = await addDoc(collection(db, 'Empresas'), {
                nombre: empresaName,
                activa: true,
                plan: 'beta_tester',
                createdAt: new Date(),
                createdBy: currentUser.uid
            });

            // 2. Create Sucursal tied to that Empresa
            const sucursalRef = await addDoc(collection(db, 'Sucursales'), {
                empresaId: empresaRef.id,
                nombre: sucursalName,
                direccion: 'Configurar luego',
                createdAt: new Date()
            });

            // 3. Elevate current user to Super Admin and link to Empresa/Sucursal
            const userRef = doc(db, 'Users', currentUser.uid);
            await updateDoc(userRef, {
                role: 'super_admin',
                empresaId: empresaRef.id,
                sucursalId: sucursalRef.id,
                profileSetupComplete: true
            });

            setSuccess(`¡Éxito! Base de datos inicializada. Eres Súper Administrador. ID Empresa: ${empresaRef.id}`);
            
            setTimeout(() => {
                navigate('/');
                // Forzar recarga para actualizar el contexto de Auth
                window.location.reload();
            }, 3000);

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500"></div>
                
                <div className="flex justify-center mb-6">
                    <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                        <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-white text-center mb-2">Inicializador de Sistema SaaS</h1>
                <p className="text-slate-400 text-center text-sm mb-8">
                    Esta herramienta es de un solo uso. Configurará la primera empresa inquilina y te otorgará poderes de Súper Administrador.
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-sm p-4 rounded-lg mb-6 text-center">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSetup} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Nombre de la Empresa Padre</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={empresaName}
                                onChange={(e) => setEmpresaName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg pl-10 pr-4 py-2.5 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Nombre de la 1° Sucursal</label>
                        <div className="relative">
                            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={sucursalName}
                                onChange={(e) => setSucursalName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg pl-10 pr-4 py-2.5 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || success}
                        className="w-full mt-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                    >
                        {loading ? 'Configurando Base de Datos...' : 'Inicializar Plataforma'}
                    </button>
                </form>
            </div>
        </div>
    );
}
