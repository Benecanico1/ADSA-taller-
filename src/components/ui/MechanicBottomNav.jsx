import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';

const MechanicBottomNav = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const { currentUser, isDemoAdmin } = useAuth();

    const isAdmin = currentUser?.role === 'admin' || isDemoAdmin;
    const homePath = isAdmin ? '/admin' : '/mechanic-dashboard';

    const navItems = [
        { path: homePath, icon: 'home', label: 'Inicio', alternativePaths: ['/mechanic-dashboard'] },
        { path: '/kanban', icon: 'developer_board', label: 'Taller', alternativePaths: ['/reception', '/scanner'] },
        { path: '/mechanic-budget', icon: 'inventory_2', label: 'Repuestos' },
        { path: '/admin-turnos', icon: 'event_available', label: 'Turnos' },
        { path: '/commissions', icon: 'bar_chart', label: 'Stats' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto flex justify-between border-t border-slate-700/50 bg-[#161b2a]/95 backdrop-blur-md px-6 pb-6 pt-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            {navItems.map((item) => {
                const isActive = currentPath.startsWith(item.path) || (item.alternativePaths && item.alternativePaths.some(p => currentPath.startsWith(p)));

                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center justify-end gap-1 cursor-pointer w-16 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
                    >
                        <div className="flex h-8 items-center justify-center">
                            <span
                                className="material-symbols-outlined transition-all"
                                style={isActive || item.filledIcon ? { fontVariationSettings: "'FILL' 1" } : { fontVariationSettings: "'FILL' 0" }}
                            >
                                {item.icon}
                            </span>
                        </div>
                        <p className="text-[8px] sm:text-[9px] font-bold leading-none tracking-widest uppercase mt-0.5">{item.label}</p>
                    </Link>
                );
            })}
        </nav>
    );
};

export default MechanicBottomNav;
