import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ManageBranchesModal = ({ empresa, onClose }) => {
    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showNewForm, setShowNewForm] = useState(false);
    
    const [newBranch, setNewBranch] = useState({ name: '', city: '', address: '' });

    useEffect(() => {
        if (!empresa) return;
        fetchSucursales();
    }, [empresa]);

    const fetchSucursales = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'Sucursales'), where('empresaId', '==', empresa.id));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSucursales(data);
        } catch (error) {
            console.error("Error fetching sucursales:", error);
            alert("Error al cargar las sucursales");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBranch = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await addDoc(collection(db, 'Sucursales'), {
                ...newBranch,
                empresaId: empresa.id,
                createdAt: serverTimestamp(),
                status: 'active'
            });
            alert('Sucursal añadida exitosamente a ' + empresa.name);
            setNewBranch({ name: '', city: '', address: '' });
            setShowNewForm(false);
            await fetchSucursales(); // Refresh list
        } catch (error) {
            console.error("Error creating branch:", error);
            alert('Ocurrió un error al crear la sucursal');
        } finally {
            setActionLoading(false);
        }
    };

    if (!empresa) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0c14]/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#161b2a] border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0a0c14]/50">
                    <div>
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-indigo-400">store</span>
                            Gestionar Sucursales
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">Franquicia: <span className="text-white font-bold">{empresa.name}</span></p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <span className="material-symbols-outlined animate-spin text-indigo-400 text-3xl">sync</span>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Actions */}
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Sedes Actuales ({sucursales.length})</h3>
                                {!showNewForm && (
                                    <button 
                                        onClick={() => setShowNewForm(true)}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">add</span>
                                        Nueva Sede
                                    </button>
                                )}
                            </div>

                            {/* New Branch Form */}
                            {showNewForm && (
                                <form onSubmit={handleCreateBranch} className="bg-[#0a0c14] border border-indigo-500/30 p-4 rounded-xl animate-fade-in-up">
                                    <h4 className="text-xs font-bold text-indigo-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                        <span className="material-symbols-outlined text-[14px]">add_circle</span>
                                        Registrar Nueva Sucursal
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nombre de la Sede *</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={newBranch.name}
                                                onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
                                                className="w-full bg-[#161b2a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 text-sm focus:outline-none"
                                                placeholder="Ej. Sede Norte"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ciudad *</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={newBranch.city}
                                                onChange={(e) => setNewBranch({...newBranch, city: e.target.value})}
                                                className="w-full bg-[#161b2a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 text-sm focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dirección</label>
                                            <input 
                                                type="text" 
                                                value={newBranch.address}
                                                onChange={(e) => setNewBranch({...newBranch, address: e.target.value})}
                                                className="w-full bg-[#161b2a] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 text-sm focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-800">
                                        <button 
                                            type="button"
                                            onClick={() => setShowNewForm(false)}
                                            className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={actionLoading}
                                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {actionLoading ? <span className="material-symbols-outlined text-[14px] animate-spin">sync</span> : 'Guardar Sede'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Branches List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sucursales.map(suc => (
                                    <div key={suc.id} className="bg-[#0a0c14] border border-slate-700/50 hover:border-slate-600 p-4 rounded-xl flex items-start gap-3 transition-colors">
                                        <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-400 shrink-0 mt-0.5">
                                            <span className="material-symbols-outlined text-[18px]">storefront</span>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-white font-bold text-sm truncate">{suc.name}</h4>
                                            <p className="text-slate-400 text-xs mt-1 truncate">{suc.city}</p>
                                            {suc.address && <p className="text-slate-500 text-xs truncate mt-0.5">{suc.address}</p>}
                                            <div className="mt-2 inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                Activa
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {sucursales.length === 0 && (
                                    <div className="col-span-full text-center py-8 text-slate-500">
                                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">store_off</span>
                                        <p className="text-sm">No se encontraron sucursales para esta empresa.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageBranchesModal;
