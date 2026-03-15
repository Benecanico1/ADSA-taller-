import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const SuperAdminDashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Redirigir si no es super admin
        if (currentUser?.role !== 'super_admin') {
            navigate('/dashboard');
            return;
        }

        const q = query(collection(db, 'Empresas'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const empData = [];
            snapshot.forEach((doc) => {
                empData.push({ id: doc.id, ...doc.data() });
            });
            setEmpresas(empData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, navigate]);

    // Estadísticas calculadas
    const totalEmpresas = empresas.length;
    const empresasActivas = empresas.filter(e => e.subscriptionStatus === 'active').length;
    const ingresosEstimados = empresas.reduce((acc, curr) => acc + (curr.planPrice || 0), 0);

    return (
        <div className="bg-[#0a0c14] text-slate-100 min-h-screen flex flex-col font-display max-w-7xl mx-auto shadow-2xl relative overflow-x-hidden md:flex-row">
            {/* Sidebar (Desktop) / Header (Mobile) */}
            <aside className="md:w-64 bg-[#161b2a] border-r border-slate-800 flex flex-col md:min-h-screen shrink-0">
                <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg">
                        <span className="material-symbols-outlined text-white text-xl">admin_panel_settings</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-white tracking-wide">Dynotech SaaS</h1>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">Súper Admin</p>
                    </div>
                </div>
                
                <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto hidden md:flex">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 mt-2">Gestión Global</div>
                    <Link to="/saas-admin" className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 transition-all font-bold text-xs uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[18px]">apartment</span>
                        Empresas
                    </Link>
                    <Link to="/saas-admin/billing" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all font-bold text-xs uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        Facturación
                    </Link>
                    <Link to="/saas-admin/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all font-bold text-xs uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                        Configuración
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-full">
                {/* Topbar */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                            Dashboard de Inquilinos
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Gestión del modelo Multi-Tenant para talleres y concesionarias.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/saas-admin/empresa/nueva"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-[18px]">add_business</span>
                            Afiliar Taller
                        </Link>
                    </div>
                </header>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#161b2a] border border-slate-800 rounded-2xl p-5 shadow-sm">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">apartment</span> Total Afiliados
                        </p>
                        <p className="text-3xl font-black text-white">{totalEmpresas}</p>
                    </div>
                    <div className="bg-[#161b2a] border border-slate-800 rounded-2xl p-5 shadow-sm">
                        <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">power</span> Activos
                        </p>
                        <p className="text-3xl font-black text-white">{empresasActivas}</p>
                    </div>
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-5 shadow-inner">
                        <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span> MRR Estimado
                        </p>
                        <p className="text-3xl font-black text-white flex items-baseline gap-1">
                            <span className="text-lg text-indigo-400/50">$</span>{ingresosEstimados}
                        </p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-[#161b2a] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-200">Plataformas Registradas</h3>
                        <div className="relative">
                            <input type="text" placeholder="Buscar empresa..." className="bg-[#0a0c14] border border-slate-700 rounded-lg px-4 py-2 text-xs text-white placeholder:text-slate-500 w-48 focus:outline-none focus:border-indigo-500 transition-colors pl-9" />
                            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">search</span>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-[#0a0c14]">
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800">Nombre del Taller</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800">Plan Mensual</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800">Estado</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800">Alta</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-500">
                                            <span className="material-symbols-outlined animate-spin text-2xl">sync</span>
                                        </td>
                                    </tr>
                                ) : empresas.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">No hay empresas registradas aún.</td>
                                    </tr>
                                ) : (
                                    empresas.map((empresa) => (
                                        <tr key={empresa.id} className="hover:bg-slate-800/50 transition-colors group border-b border-slate-800/50 last:border-0">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                                                        <span className="material-symbols-outlined text-slate-400">storefront</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{empresa.name}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">ID: {empresa.id.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-bold text-slate-300 text-sm">${empresa.planPrice || 0} / mes</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1 ${
                                                    empresa.subscriptionStatus === 'active' 
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                        : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                                }`}>
                                                    <span className={`size-1.5 rounded-full ${empresa.subscriptionStatus === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-orange-400'}`}></span>
                                                    {empresa.subscriptionStatus || 'trial'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-xs text-slate-400 font-medium">{empresa.createdAt?.toDate().toLocaleDateString() || 'N/A'}</p>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button className="text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 p-2 rounded-lg transition-colors inline-flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-[18px]">settings</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Mobile Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#161b2a]/95 backdrop-blur-md border-t border-slate-800 flex justify-around p-3 z-50">
                <Link to="/saas-admin" className="flex flex-col items-center gap-1 text-indigo-400 w-16">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>apartment</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Empresas</span>
                </Link>
                <Link to="/saas-admin/billing" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 w-16 transition-colors">
                    <span className="material-symbols-outlined">receipt_long</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Cobros</span>
                </Link>
                <Link to="/saas-admin/settings" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 w-16 transition-colors">
                    <span className="material-symbols-outlined">settings</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Ajustes</span>
                </Link>
                <Link to="/dashboard" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 w-16 transition-colors">
                    <span className="material-symbols-outlined">exit_to_app</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Salir</span>
                </Link>
            </nav>
        </div>
    );
};

export default SuperAdminDashboard;
