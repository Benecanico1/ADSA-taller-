import React from 'react';
import { useNavigate } from 'react-router-dom';

const BottomNav = ({ active = 'dashboard' }) => {
    const navigate = useNavigate();

    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto border-t border-slate-800/80 bg-[#0a1315]/95 backdrop-blur-xl px-4 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-[72px] pb-2 text-white">
            <button onClick={() => navigate('/dashboard')} className={`flex flex-1 flex-col items-center justify-center gap-1.5 transition-colors group ${active === 'dashboard' ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}>
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: active === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
                <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5">Panel</span>
            </button>

            <button onClick={() => navigate('/warranties')} className={`flex flex-1 flex-col items-center justify-center gap-1.5 transition-colors group ${active === 'garage' ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}>
                <span className="material-symbols-outlined text-[22px] group-hover:-translate-y-1 transition-transform duration-300" style={{ fontVariationSettings: active === 'garage' ? "'FILL' 1" : "'FILL' 0" }}>motorcycle</span>
                <span className="text-[9px] font-black uppercase tracking-widest mt-0.5">Garaje</span>
            </button>

            <button onClick={() => navigate('/appointments')} className={`flex flex-1 flex-col items-center justify-center gap-1.5 transition-colors group ${active === 'appointments' ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}>
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: active === 'appointments' ? "'FILL' 1" : "'FILL' 0" }}>calendar_today</span>
                <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5">Citas</span>
            </button>

            <button
                onClick={() => navigate('/rewards')}
                className={`flex flex-1 flex-col items-center justify-center gap-1.5 transition-colors ${active === 'rewards' ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5">Estrella</span>
            </button>

            <button onClick={() => navigate('/profile')} className={`flex flex-1 flex-col items-center justify-center gap-1.5 transition-colors group ${active === 'profile' ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}>
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: active === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
                <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5">Cuenta</span>
            </button>
            <div className="absolute -bottom-4 left-0 w-full text-center hidden mb-1.5">
                {/* Hidden utility container if we want to add the text outside the flex row but inside the nav block. However, putting it below the nav isn't great for fixed elements. */}
            </div>
            {/* Developer Credits - Positioned absolutely at the very bottom center of the nav block */}
            <div className="absolute bottom-0.5 left-0 w-full text-center pointer-events-none">
                <span className="text-primary/40 text-[7px] font-technical tracking-[0.2em] uppercase font-bold">Developer: Ing. Jesus A. Hidalgo</span>
            </div>
        </nav>
    );
};

export default BottomNav;
