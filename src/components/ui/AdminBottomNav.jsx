import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminBottomNav = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const navItems = [
        { path: '/admin', icon: 'admin_panel_settings', label: 'Admin' },
        { path: '/bi', icon: 'dashboard', label: 'Panel' },
        { path: '/admin/finance', icon: 'payments', label: 'Finanzas' },
        { path: '/admin/routes', icon: 'forum', label: 'Rutas' },
        { path: '/admin/settings', icon: 'settings', label: 'Ajustes' }
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto flex justify-between border-t border-slate-700/50 bg-[#161b2a]/95 backdrop-blur-md px-3 sm:px-6 pb-6 pt-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            {navItems.map((item) => {
                const isActive = item.path === '/admin'
                    ? currentPath === '/admin'
                    : currentPath.startsWith(item.path);

                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center justify-end gap-1 cursor-pointer flex-1 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
                    >
                        <div className="flex h-8 items-center justify-center">
                            <span
                                className="material-symbols-outlined transition-all"
                                style={isActive || item.filledIcon ? { fontVariationSettings: "'FILL' 1" } : { fontVariationSettings: "'FILL' 0" }}
                            >
                                {item.icon}
                            </span>
                        </div>
                        <p className="text-[8px] font-bold leading-none tracking-widest uppercase">{item.label}</p>
                    </Link>
                );
            })}
        </nav>
    );
};

export default AdminBottomNav;
