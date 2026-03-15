import React from 'react';

const LiveTelemetryCard = ({ appointment }) => {
    if (!appointment) return null;

    // Define the sequence of phases
    const PHASES = [
        { id: 'pending', label: 'Recepción', icon: 'check', desc: 'Moto ingresada al Taller' },
        { id: 'diagnosing', label: 'Diagnóstico', icon: 'analytics', desc: 'Revisión General Evaluada' },
        { id: 'working', label: 'En Reparación', icon: 'engineering', desc: 'Mantenimiento en Progreso' },
        { id: 'quality', label: 'Control Calidad', icon: 'verified', desc: 'Pruebas Finales' },
        { id: 'ready', label: 'Lavar y Facturar', icon: 'cleaning_services', desc: 'Limpieza y Administración' },
        { id: 'delivery_pending', label: 'Listo para Entregar', icon: 'sports_score', desc: 'Vehículo Disponible para Retiro' }
    ];

    const currentPhaseIndex = PHASES.findIndex(p => p.id === appointment.status);
    const safeIndex = currentPhaseIndex >= 0 ? currentPhaseIndex : 0; // Default to first if not found

    const repairSteps = appointment.repairSteps || [];
    const completedSteps = repairSteps.filter(s => s.completed).length;
    const totalSteps = repairSteps.length;
    const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return (
        <div className="w-full flex flex-col font-display bg-[#0a0c14] rounded-2xl overflow-hidden shadow-lg shadow-black/50 border border-slate-700/50">
            {/* Header del Card */}
            <div className="bg-[#161b2a] p-4 flex items-center justify-between border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">sensors</span>
                    <h3 className="text-slate-100 text-sm font-black uppercase tracking-widest drop-shadow-sm">
                        Telemetría en Vivo
                    </h3>
                </div>
                {appointment.status === 'working' ? (
                    <div className="flex items-center gap-1.5 bg-primary/20 border border-primary/40 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(13,204,242,0.2)]">
                        <span className="size-1.5 bg-primary rounded-full animate-ping"></span>
                        <p className="text-primary text-[10px] font-black uppercase tracking-widest">Activo</p>
                    </div>
                ) : appointment.status === 'ready' ? (
                    <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-emerald-500 text-[12px]">done_all</span>
                        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Listo</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-slate-400 text-[12px]">schedule</span>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">En Cola</p>
                    </div>
                )}
            </div>

            {/* Timeline */}
            <div className="px-5 py-6">
                <div className="grid grid-cols-[32px_1fr] gap-x-5 px-1 relative">
                    {/* Continuous line background */}
                    <div className="absolute left-[19px] top-4 bottom-10 w-0.5 bg-slate-800"></div>

                    {PHASES.map((phase, index) => {
                        const isCompleted = index < safeIndex || (index === safeIndex && phase.id === 'ready');
                        const isCurrent = index === safeIndex && phase.id !== 'ready';
                        const isPending = index > safeIndex;

                        return (
                            <React.Fragment key={phase.id}>
                                {/* Node */}
                                <div className="flex flex-col items-center relative z-10">
                                    <div className={`size-8 rounded-full flex items-center justify-center ring-4 ring-[#0a0c14] transition-all
                                        ${isCompleted ? 'bg-primary shadow-[0_0_15px_rgba(13,204,242,0.4)]' :
                                            isCurrent ? 'bg-[#0a0c14] border-2 border-primary shadow-[0_0_15px_rgba(13,204,242,0.2)]' :
                                                'bg-[#161b2a] border border-slate-700'}
                                    `}>
                                        <span className={`material-symbols-outlined text-[16px] font-bold 
                                            ${isCompleted ? 'text-[#0a0c14]' :
                                                isCurrent ? 'text-primary animate-pulse' :
                                                    'text-slate-500'}
                                        `}>
                                            {isCompleted ? 'check' : phase.icon}
                                        </span>
                                    </div>

                                    {/* Vertical line fill up to next node */}
                                    {index < PHASES.length - 1 && (
                                        <div className={`w-0.5 h-14 transition-colors ${isCompleted ? 'bg-primary' : 'bg-transparent'}`}></div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className={`pt-1 ${index < PHASES.length - 1 ? 'pb-8' : 'pb-2'}`}>
                                    <p className={`text-sm font-bold transition-colors
                                        ${isCompleted || isCurrent ? 'text-slate-100' : 'text-slate-500'}
                                        ${isCurrent ? 'text-primary drop-shadow-[0_0_5px_rgba(13,204,242,0.3)]' : ''}
                                    `}>
                                        {phase.label}
                                    </p>
                                    <p className={`text-[11px] font-medium mt-0.5 transition-colors
                                        ${isCurrent ? 'text-slate-300' : 'text-slate-600'}
                                    `}>
                                        {isCurrent && phase.id === 'working' ? 'Progreso de Checklist:' : phase.desc}
                                    </p>

                                    {/* Si es fase de reparación, mostrar progreso de tareas */}
                                    {phase.id === 'working' && (isCurrent || isCompleted) && totalSteps > 0 && (
                                        <div className="mt-4 flex flex-col gap-2">
                                            {/* Progress Bar */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                    <div className="bg-primary h-full transition-all duration-1000 relative shadow-[0_0_10px_rgba(13,204,242,0.8)]" style={{ width: `${progressPercent}%` }}>
                                                        {isCurrent && <div className="absolute inset-0 bg-white/30 animate-pulse"></div>}
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-primary font-black tracking-widest">{progressPercent}%</span>
                                            </div>

                                            {/* Checklist Mapped */}
                                            <div className="flex flex-col gap-1.5">
                                                {repairSteps.map((step) => (
                                                    <div key={step.id} className="flex items-start gap-2">
                                                        <span className={`material-symbols-outlined text-[14px] shrink-0 mt-0.5
                                                            ${step.completed ? 'text-emerald-500' : 'text-slate-600'}
                                                        `}>
                                                            {step.completed ? 'check_circle' : 'radio_button_unchecked'}
                                                        </span>
                                                        <span className={`text-[11px] leading-tight
                                                            ${step.completed ? 'text-slate-400 line-through' : 'text-slate-300 font-medium'}
                                                        `}>
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            <div className="bg-[#161b2a] p-3 border-t border-slate-700/50 flex justify-between items-center px-5">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                    Técnico Asignado:
                </span>
                <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-primary">engineering</span>
                    <span className="text-xs text-slate-300 font-bold">{appointment.mechanicName || 'En Cola'}</span>
                </div>
            </div>
        </div>
    );
};

export default LiveTelemetryCard;
