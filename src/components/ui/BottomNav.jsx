import React from 'react';
import { Link } from 'react-router-dom';

const BottomNav = ({ active = 'dashboard' }) => {
    return (
        <nav className="fixed bottom-0 z-50 flex w-full max-w-[430px] mx-auto left-0 right-0 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl px-4 pb-6 pt-3">
            <Link
                to="/dashboard"
                className={`flex flex-1 flex-col items-center justify-end gap-1 transition-colors cursor-pointer ${active === 'dashboard' ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary'}`}
            >
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: active === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
                <p className="text-[10px] font-bold uppercase tracking-wider">Inicio</p>
            </Link>

            <Link
                to="/warranties"
                className={`flex flex-1 flex-col items-center justify-end gap-1 transition-colors cursor-pointer ${active === 'garage' ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary'}`}
            >
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: active === 'garage' ? "'FILL' 1" : "'FILL' 0" }}>two_wheeler</span>
                <p className="text-[10px] font-bold uppercase tracking-wider">Garaje</p>
            </Link>

            <Link
                to="/appointments"
                className={`flex flex-1 flex-col items-center justify-end gap-1 transition-colors cursor-pointer ${active === 'appointments' ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary'}`}
            >
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: active === 'appointments' ? "'FILL' 1" : "'FILL' 0" }}>calendar_month</span>
                <p className="text-[10px] font-bold uppercase tracking-wider">Citas</p>
            </Link>

            <Link
                to="/profile"
                className={`flex flex-1 flex-col items-center justify-end gap-1 transition-colors cursor-pointer ${active === 'profile' ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary'}`}
            >
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: active === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>account_circle</span>
                <p className="text-[10px] font-bold uppercase tracking-wider">Perfil</p>
            </Link>
        </nav>
    );
};

export default BottomNav;
