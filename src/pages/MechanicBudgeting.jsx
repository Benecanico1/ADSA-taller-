import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';

const MechanicBudgeting = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [activeJobs, setActiveJobs] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [loadingInv, setLoadingInv] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Active Jobs for this mechanic
    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'Appointments'),
            where('mechanicId', '==', currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const jobs = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                // Only show jobs that are actively being worked on (diagnosing or working)
                if (data.status === 'diagnosing' || data.status === 'working') {
                    jobs.push({ id: doc.id, ...data });
                }
            });
            setActiveJobs(jobs);

            // Auto-select if there's only one job and none selected, or update selected job data
            if (jobs.length > 0) {
                if (!selectedJob) {
                    setSelectedJob(jobs[0]);
                } else {
                    const updatedSelected = jobs.find(j => j.id === selectedJob.id);
                    if (updatedSelected) setSelectedJob(updatedSelected);
                }
            } else {
                setSelectedJob(null);
            }

            setLoadingJobs(false);
        });

        return () => unsubscribe();
    }, [currentUser, selectedJob]);

    // Fetch Inventory
    useEffect(() => {
        const q = query(collection(db, 'Inventory'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            setInventory(items);
            setLoadingInv(false);
        });
        return () => unsubscribe();
    }, []);

    const handleAddPartToJob = async (part) => {
        if (!selectedJob) return;

        try {
            const jobRef = doc(db, 'Appointments', selectedJob.id);
            const newItem = {
                id: Date.now().toString(), // Unique ID for the line item
                partId: part.id,
                name: part.name,
                price: Number(part.unitPrice) || 0,
                quantity: 1,
                addedAt: new Date().toISOString()
            };

            await updateDoc(jobRef, {
                budgetItems: arrayUnion(newItem)
            });

            console.log(`Added ${part.name} to job ${selectedJob.id}`);
        } catch (error) {
            console.error('Error adding part to budget:', error);
            alert('Error al agregar el repuesto. Revise la conexión.');
        }
    };

    const handleRemovePartFromJob = async (budgetItemToRemove) => {
        if (!selectedJob || !selectedJob.budgetItems) return;

        try {
            const jobRef = doc(db, 'Appointments', selectedJob.id);
            // Filter out the item to remove
            const updatedItems = selectedJob.budgetItems.filter(item => item.id !== budgetItemToRemove.id);

            await updateDoc(jobRef, {
                budgetItems: updatedItems
            });
        } catch (error) {
            console.error('Error removing part from budget:', error);
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const calculateTotal = () => {
        if (!selectedJob || !selectedJob.budgetItems) return 0;
        return selectedJob.budgetItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    if (loadingJobs || loadingInv) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display max-w-2xl mx-auto shadow-2xl relative">
            {/* Header */}
            <header className="flex items-center bg-white/95 dark:bg-[#161b2a]/95 backdrop-blur-md p-4 pb-3 justify-between sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col">
                    <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">Presupuestos / OT</h2>
                    <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Carga de Repuestos</p>
                </div>
            </header>

            <main className="flex flex-col gap-6 p-4 pb-32">

                {/* Job Selector */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Trabajo Activo</label>
                    {activeJobs.length > 0 ? (
                        <select
                            className="bg-white dark:bg-[#161b2a] border border-slate-200 dark:border-slate-700 text-sm rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none font-medium"
                            value={selectedJob?.id || ''}
                            onChange={(e) => {
                                const job = activeJobs.find(j => j.id === e.target.value);
                                setSelectedJob(job);
                            }}
                        >
                            {activeJobs.map(job => (
                                <option key={job.id} value={job.id}>
                                    OT #{job.id.slice(-4).toUpperCase()} - {job.vehicle?.brand} {job.vehicle?.model} ({job.clientName})
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-4 flex items-center gap-3">
                            <span className="material-symbols-outlined text-orange-500">warning</span>
                            <p className="text-sm font-medium text-orange-700 dark:text-orange-400">No tienes trabajos activos (en diagnóstico o en proceso) en este momento.</p>
                        </div>
                    )}
                </div>

                {/* Selected Job Budget View */}
                {selectedJob && (
                    <div className="flex flex-col gap-4">

                        {/* Current Budget Summary */}
                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                            <h3 className="text-sm font-bold flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">receipt_long</span>
                                    Repuestos en esta OT
                                </span>
                                <span className="text-primary">${calculateTotal().toFixed(2)}</span>
                            </h3>

                            <div className="flex flex-col gap-2 mt-2">
                                {selectedJob.budgetItems && selectedJob.budgetItems.length > 0 ? (
                                    selectedJob.budgetItems.map(item => (
                                        <div key={item.id} className="flex items-center justify-between bg-white dark:bg-[#161b2a] p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <div className="flex flex-col min-w-0 flex-1 mr-2">
                                                <span className="text-xs font-bold truncate">{item.name}</span>
                                                <span className="text-[10px] text-slate-500">Cant: {item.quantity} x ${item.price.toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                                                <button
                                                    onClick={() => handleRemovePartFromJob(item)}
                                                    className="text-red-400 hover:text-red-500 bg-red-50 dark:bg-red-500/10 p-1.5 rounded-md transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-500 text-center py-2 italic">Aún no se han agregado repuestos a esta orden.</p>
                                )}
                            </div>
                        </div>

                        {/* Inventory Search & Add */}
                        <div className="flex flex-col gap-3 mt-4">
                            <h3 className="text-sm font-bold flex items-center gap-2 px-1">
                                <span className="material-symbols-outlined text-slate-400">search</span>
                                Buscar en Inventario
                            </h3>

                            <input
                                type="text"
                                placeholder="Escribe el nombre o SKU del repuesto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white dark:bg-[#161b2a] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-sm w-full outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                            />

                            <div className="flex flex-col gap-2 mt-2 max-h-[40vh] overflow-y-auto no-scrollbar pb-2">
                                {filteredInventory.length > 0 ? (
                                    filteredInventory.map(part => (
                                        <div key={part.id} className="flex items-center justify-between bg-white dark:bg-[#161b2a] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/40 transition-colors">
                                            <div className="flex flex-col min-w-0 flex-1 mr-3">
                                                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{part.name}</span>
                                                <span className="text-[10px] uppercase text-slate-500 tracking-wider">SKU: {part.sku || 'N/A'} • Stock: {part.currentStock || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-black text-emerald-500">${Number(part.unitPrice || 0).toFixed(2)}</span>
                                                <button
                                                    onClick={() => handleAddPartToJob(part)}
                                                    className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-lg flex items-center justify-center transition-colors active:scale-95"
                                                    disabled={!part.currentStock || part.currentStock <= 0}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500 text-center py-6">No se encontraron repuestos.</p>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto flex justify-around border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111718]/95 backdrop-blur-md px-6 pb-6 pt-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
                <Link to="/mechanic-dashboard" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer w-[60px]">
                    <span className="material-symbols-outlined">home</span>
                    <p className="text-[9px] font-bold leading-none tracking-widest uppercase mt-0.5">Inicio</p>
                </Link>
                <Link to="/kanban" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer w-[60px]">
                    <span className="material-symbols-outlined">developer_board</span>
                    <p className="text-[9px] font-bold leading-none tracking-widest uppercase mt-0.5">Tablero</p>
                </Link>
                <Link to="/mechanic-budget" className="flex flex-col items-center gap-1 text-primary cursor-pointer w-[60px]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                    <p className="text-[9px] font-bold leading-none tracking-widest uppercase mt-0.5">Repuestos</p>
                </Link>
            </nav>
        </div>
    );
};

export default MechanicBudgeting;
