import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SuperAdminSettings = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        platformName: 'adsa_taller SaaS',
        supportEmail: 'soporte@adsataller.com',
        maintenanceMode: false,
        allowNewRegistrations: true
    });

    useEffect(() => {
        if (currentUser?.role !== 'super_admin') {
            navigate('/dashboard');
            return;
        }

        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'PlatformSettings', 'global');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings(docSnap.data());
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };

        fetchSettings();
    }, [currentUser, navigate]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setSettings({ ...settings, [e.target.name]: value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await setDoc(doc(db, 'PlatformSettings', 'global'), settings);
            alert('Configuración global actualizada correctamente');
        } catch (error) {
            console.error("Error saving settings:", error);
            alert('Ocurrió un error al guardar los ajustes');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#0a0c14] text-slate-100 min-h-screen flex flex-col font-display max-w-7xl mx-auto shadow-2xl relative overflow-x-hidden md:flex-row">
            {/* Sidebar (Desktop) */}
            <aside className="md:w-64 bg-[#161b2a] border-r border-slate-800 flex flex-col md:min-h-screen shrink-0">
                <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg">
                        <span className="material-symbols-outlined text-white text-xl">admin_panel_settings</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-white tracking-wide">adsa_taller SaaS</h1>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">Súper Admin</p>
                    </div>
                </div>
                
                <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto hidden md:flex">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 mt-2">Gestión Global</div>
                    <Link to="/saas-admin" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all font-bold text-xs uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[18px]">apartment</span>
                        Empresas
                    </Link>
                    <Link to="/saas-admin/billing" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all font-bold text-xs uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        Facturación
                    </Link>
                    <Link to="/saas-admin/settings" className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 transition-all font-bold text-xs uppercase tracking-wider">
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
                            Ajustes Maestros
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Configuración global que rige a todos los Inquilinos de la Plataforma SaaS.</p>
                    </div>
                </header>

                <div className="max-w-2xl">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="bg-[#161b2a] border border-slate-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-4">Información de Evidencia SaaS</h3>
                            
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Nombre Público de la Plataforma
                                    </label>
                                    <input 
                                        type="text" 
                                        name="platformName"
                                        value={settings.platformName}
                                        onChange={handleChange}
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                    />
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Correo Corporativo (Soporte)
                                    </label>
                                    <input 
                                        type="email" 
                                        name="supportEmail"
                                        value={settings.supportEmail}
                                        onChange={handleChange}
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#161b2a] border border-slate-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-orange-400">warning</span>
                                Controles de Emergencia
                            </h3>
                            
                            <div className="space-y-4">
                                <label className="flex items-center justify-between p-4 bg-[#0a0c14] border border-slate-700 rounded-xl cursor-pointer hover:border-indigo-500/50 transition-colors">
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Modo Mantenimiento</h4>
                                        <p className="text-xs text-slate-500 mt-1">Cierra el acceso temporalmente a todos los inquilinos no-administradores.</p>
                                    </div>
                                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input 
                                            type="checkbox" 
                                            name="maintenanceMode" 
                                            checked={settings.maintenanceMode}
                                            onChange={handleChange}
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-600 checked:right-0 checked:border-indigo-500" 
                                            style={{ right: settings.maintenanceMode ? '0' : '1.5rem', transition: 'all 0.2s ease-in-out' }}
                                        />
                                        <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${settings.maintenanceMode ? 'bg-indigo-500' : 'bg-slate-700'}`}></label>
                                    </div>
                                </label>

                                <label className="flex items-center justify-between p-4 bg-[#0a0c14] border border-slate-700 rounded-xl cursor-pointer hover:border-indigo-500/50 transition-colors">
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Permitir Nuevos Registros</h4>
                                        <p className="text-xs text-slate-500 mt-1">Habilita la inscripción de nuevos usuarios sin intervención administrativa.</p>
                                    </div>
                                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input 
                                            type="checkbox" 
                                            name="allowNewRegistrations" 
                                            checked={settings.allowNewRegistrations}
                                            onChange={handleChange}
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-600 checked:right-0 checked:border-indigo-500" 
                                            style={{ right: settings.allowNewRegistrations ? '0' : '1.5rem', transition: 'all 0.2s ease-in-out' }}
                                        />
                                        <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${settings.allowNewRegistrations ? 'bg-indigo-500' : 'bg-slate-700'}`}></label>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button 
                                type="submit"
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-widest disabled:opacity-50 transition-all flex items-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95"
                            >
                                {loading ? (
                                    <><span className="material-symbols-outlined text-[18px] animate-spin">sync</span> Guardando...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-[18px]">save</span> Aplicar Configuración</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Mobile Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#161b2a]/95 backdrop-blur-md border-t border-slate-800 flex justify-around p-3 z-50">
                <Link to="/saas-admin" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 w-16 transition-colors">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>apartment</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Empresas</span>
                </Link>
                <Link to="/saas-admin/billing" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 w-16 transition-colors">
                    <span className="material-symbols-outlined">receipt_long</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest">Cobros</span>
                </Link>
                <Link to="/saas-admin/settings" className="flex flex-col items-center gap-1 text-indigo-400 w-16">
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

export default SuperAdminSettings;
