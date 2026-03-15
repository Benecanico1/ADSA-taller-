import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const UserRoles = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('todos');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'Users'), (snapshot) => {
            const usersData = [];
            snapshot.forEach((doc) => {
                usersData.push({ id: doc.id, ...doc.data() });
            });
            setUsers(usersData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredUsers = users.filter(u => {
        if (activeTab === 'todos') return true;
        if (activeTab === 'mecanicos') return u.role === 'mechanic' || u.role === 'mecanico';
        if (activeTab === 'admins') return u.role === 'admin';
        if (activeTab === 'finanzas') return u.role === 'finance' || u.role === 'finanzas';
        return true;
    });

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display max-w-2xl mx-auto shadow-2xl relative">
            {/* Header Section */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#161b2a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center p-4 pb-2 justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-primary flex size-10 flex-shrink-0 items-center justify-center -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <h2 className="text-slate-900 dark:text-slate-100 text-lg font-extrabold leading-tight tracking-tight flex-1 px-2">Gestión de Usuarios</h2>
                    <div className="flex items-center justify-end">
                        <button className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-primary hover:bg-primary/90 text-[#101f22] transition-colors shadow-lg shadow-primary/20 active:scale-95">
                            <span className="material-symbols-outlined text-xl">person_add</span>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="px-4 py-3">
                    <label className="flex flex-col min-w-40 h-11 w-full">
                        <div className="flex w-full flex-1 items-stretch rounded-xl h-full overflow-hidden bg-slate-50 dark:bg-[#111718] border border-slate-200 dark:border-slate-700/80 focus-within:border-primary transition-colors focus-within:ring-1 focus-within:ring-primary shadow-inner">
                            <div className="text-slate-400 dark:text-slate-500 flex items-center justify-center pl-4">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </div>
                            <input
                                className="flex w-full min-w-0 flex-1 border-none bg-transparent focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 px-3 text-sm font-medium"
                                placeholder="Buscar por nombre, rol o email..."
                            />
                        </div>
                    </label>
                </div>

                {/* Tabs */}
                <div className="flex border-t border-slate-100 dark:border-slate-800 px-4 overflow-x-auto [&::-webkit-scrollbar]:hidden bg-slate-50 dark:bg-transparent">
                    <button
                        onClick={() => setActiveTab('todos')}
                        className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 px-4 flex-none transition-colors ${activeTab === 'todos' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-primary hover:border-slate-300 dark:hover:border-slate-700'}`}
                    >
                        <p className="text-xs font-bold uppercase tracking-wider">Todos</p>
                    </button>
                    <button
                        onClick={() => setActiveTab('mecanicos')}
                        className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 px-4 flex-none transition-colors ${activeTab === 'mecanicos' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-primary hover:border-slate-300 dark:hover:border-slate-700'}`}
                    >
                        <p className="text-xs font-bold uppercase tracking-wider">Mecánicos</p>
                    </button>
                    <button
                        onClick={() => setActiveTab('admins')}
                        className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 px-4 flex-none transition-colors ${activeTab === 'admins' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-primary hover:border-slate-300 dark:hover:border-slate-700'}`}
                    >
                        <p className="text-xs font-bold uppercase tracking-wider">Admins</p>
                    </button>
                    <button
                        onClick={() => setActiveTab('finanzas')}
                        className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 px-4 flex-none transition-colors ${activeTab === 'finanzas' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-primary hover:border-slate-300 dark:hover:border-slate-700'}`}
                    >
                        <p className="text-xs font-bold uppercase tracking-wider">Finanzas</p>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-4 py-5 space-y-4 pb-32">
                {loading ? (
                    <p className="text-sm text-slate-500 text-center py-10 font-bold">Cargando usuarios...</p>
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map(user => {
                        const initials = (user.displayName || user.email || 'U').substring(0, 2).toUpperCase();
                        const roleColors = {
                            'admin': 'text-red-500 bg-red-500/10 border-red-500/20',
                            'client': 'text-primary bg-primary/10 border-primary/20',
                            'mechanic': 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                        };
                        const colorClass = roleColors[user.role] || 'text-slate-500 bg-slate-500/10 border-slate-500/20';

                        // Map role to display text safely
                        const displayRole = user.role === 'client' ? 'Cliente' :
                            user.role === 'admin' ? 'Administrador' :
                                user.role === 'mechanic' ? 'Mecánico' : (user.role || 'Usuario');

                        return (
                            <div key={user.id} className="bg-white dark:bg-[#161b2a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4 shadow-sm hover:border-primary/30 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className={`size-12 rounded-full flex items-center justify-center font-black text-lg border ${colorClass}`}>
                                                {initials}
                                            </div>
                                            <div className="absolute bottom-0 right-0 size-3 rounded-full bg-primary border-2 border-white dark:border-[#161b2a]"></div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100">{user.displayName || 'adsa_taller User'}</h4>
                                            <p className={`text-[11px] font-bold uppercase tracking-widest mt-0.5 ${user.role === 'admin' ? 'text-red-500' : 'text-primary'}`}>
                                                {displayRole}
                                            </p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 -mr-2">
                                        <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">block</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <button className="flex-1 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-[#111718] text-primary text-xs font-bold py-2.5 rounded-xl transition-colors border-2 border-primary shadow-sm active:scale-95">
                                        Gestionar
                                    </button>
                                    <button className="flex-1 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 transition-colors shadow-sm active:scale-95">
                                        Ver Registro
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-10">
                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 mb-2">person_off</span>
                        <p className="text-sm text-slate-500 font-bold tracking-tight">No se encontraron usuarios</p>
                    </div>
                )}
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto flex justify-between border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111718]/95 backdrop-blur-md px-6 pb-6 pt-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
                <Link to="/bi" className="flex flex-col items-center justify-end gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer w-14">
                    <div className="flex h-8 items-center justify-center">
                        <span className="material-symbols-outlined">dashboard</span>
                    </div>
                    <p className="text-[8px] font-bold leading-none tracking-widest uppercase">Panel</p>
                </Link>
                <Link to="/users" className="flex flex-col items-center justify-end gap-1 text-primary cursor-pointer w-14">
                    <div className="flex h-8 items-center justify-center">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                    </div>
                    <p className="text-[8px] font-bold leading-none tracking-widest uppercase">Usuarios</p>
                </Link>
                <Link to="/inventory" className="flex flex-col items-center justify-end gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer w-14">
                    <div className="flex h-8 items-center justify-center">
                        <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <p className="text-[8px] font-bold leading-none tracking-widest uppercase">Stock</p>
                </Link>
                <Link to="/budget" className="flex flex-col items-center justify-end gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer w-14">
                    <div className="flex h-8 items-center justify-center">
                        <span className="material-symbols-outlined">payments</span>
                    </div>
                    <p className="text-[8px] font-bold leading-none tracking-widest uppercase">Finanzas</p>
                </Link>
                <Link to="/profile/settings" className="flex flex-col items-center justify-end gap-1 text-slate-400 hover:text-primary transition-colors cursor-pointer w-14">
                    <div className="flex h-8 items-center justify-center">
                        <span className="material-symbols-outlined">settings</span>
                    </div>
                    <p className="text-[8px] font-bold leading-none tracking-widest uppercase">Ajustes</p>
                </Link>
            </nav>
        </div>
    );
};

export default UserRoles;
