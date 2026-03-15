import React, { useState } from 'react';

const DigitalSignatureModal = ({ isOpen, onClose, onConfirm, customerName }) => {
    const [damagePoints, setDamagePoints] = useState([]);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [currentPoint, setCurrentPoint] = useState(null);
    const [noteText, setNoteText] = useState('');
    const [viewSide, setViewSide] = useState('left'); // 'left' or 'right'

    if (!isOpen) return null;

    const handleImageClick = (e) => {
        if (isAddingNote) return;
        const rect = e.target.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setCurrentPoint({ x, y, id: Date.now(), side: viewSide });
        setIsAddingNote(true);
    };

    const saveNote = () => {
        if (noteText.trim()) {
            setDamagePoints([...damagePoints, { ...currentPoint, note: noteText }]);
        }
        setIsAddingNote(false);
        setNoteText('');
        setCurrentPoint(null);
    };

    const cancelNote = () => {
        setIsAddingNote(false);
        setNoteText('');
        setCurrentPoint(null);
    };

    const removePoint = (id) => {
        setDamagePoints(damagePoints.filter(p => p.id !== id));
    };

    const handleConfirm = () => {
        if (!acceptedTerms) return;

        const signatureData = {
            signedAt: new Date().toISOString(),
            damageReport: damagePoints,
            termsAccepted: true,
            signatureText: customerName
        };

        onConfirm(signatureData);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-lg bg-[#0a0c14] border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-[#161b2a]">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                            <span className="material-symbols-outlined">draw</span>
                        </div>
                        <div>
                            <h2 className="text-white font-black text-sm uppercase tracking-wider">Check-in Digital</h2>
                            <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mt-0.5">Declaración de Estado</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 overflow-y-auto space-y-6">
                    <div>
                        <p className="text-xs text-slate-300 font-medium leading-relaxed mb-4">
                            Por favor, si tu motocicleta presenta rayones, golpes o daños estéticos previos a este servicio,
                            márcalos en el siguiente esquema haciendo click en la zona afectada.
                        </p>

                        {/* View Switcher */}
                        <div className="flex bg-[#161b2a] rounded-xl border border-slate-700/50 p-1 mb-4">
                            <button
                                onClick={() => setViewSide('left')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${viewSide === 'left' ? 'bg-primary text-[#0a0c14] shadow-md shadow-primary/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                            >
                                Lateral Izquierdo
                            </button>
                            <button
                                onClick={() => setViewSide('right')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${viewSide === 'right' ? 'bg-primary text-[#0a0c14] shadow-md shadow-primary/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                            >
                                Lateral Derecho
                            </button>
                        </div>

                        <div className="relative w-full bg-[#161b2a] rounded-xl border border-slate-700/50 overflow-hidden"
                            style={{ aspectRatio: '16/9' }}>
                            <img
                                loading="lazy"
                                src={viewSide === 'left' ? "https://firebasestorage.googleapis.com/v0/b/adsa_taller-power-garaje.appspot.com/o/System%2F2025-yamaha-mt09-sp-studio-left-black-gray.jpg?alt=media" : "https://firebasestorage.googleapis.com/v0/b/adsa_taller-power-garaje.appspot.com/o/System%2F2025-yamaha-mt09-sp-studio-right-black-gray.jpg?alt=media"}
                                alt={`Perfil ${viewSide === 'left' ? 'Izquierdo' : 'Derecho'}`}
                                className="w-full h-full object-contain select-none"
                                onClick={handleImageClick}
                                onError={(e) => {
                                    // Fallback if image fails to load
                                    e.target.src = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800";
                                }}
                            />

                            {/* Damage Markers (filtered by active side) */}
                            {damagePoints.filter(p => !p.side || p.side === viewSide).map((point, i) => (
                                <div
                                    key={point.id}
                                    className="absolute size-5 -ml-2.5 -mt-2.5 bg-red-500/80 border-2 border-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-125 transition-transform group"
                                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                                    onClick={() => removePoint(point.id)}
                                >
                                    <span className="text-[10px] font-black text-white leading-none">!</span>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none border border-slate-700">
                                        {point.note} (Click para borrar)
                                    </div>
                                </div>
                            ))}

                            {/* Note Input Popover */}
                            {isAddingNote && (
                                <div
                                    className="absolute bg-[#161b2a] border border-primary/50 p-3 rounded-xl shadow-2xl z-20 min-w-[200px]"
                                    style={{
                                        left: currentPoint.x > 50 ? 'auto' : `${currentPoint.x}%`,
                                        right: currentPoint.x > 50 ? `${100 - currentPoint.x}%` : 'auto',
                                        top: currentPoint.y > 50 ? 'auto' : `${currentPoint.y}%`,
                                        bottom: currentPoint.y > 50 ? `${100 - currentPoint.y}%` : 'auto',
                                    }}
                                >
                                    <p className="text-[10px] font-bold text-primary mb-2 uppercase tracking-wider">Describir Daño:</p>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && saveNote()}
                                        className="w-full bg-[#0a0c14] border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-primary mb-2"
                                        placeholder="Ej: Rayón profundo"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={cancelNote} className="text-[10px] text-slate-400 font-bold px-2 py-1 hover:text-white transition-colors">Cancelar</button>
                                        <button onClick={saveNote} className="text-[10px] bg-primary text-[#0a0c14] font-black px-3 py-1 rounded">Guardar</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {damagePoints.length > 0 && (
                            <div className="mt-4 flex flex-col gap-2">
                                {/* Left Side Damages */}
                                {damagePoints.filter(p => p.side === 'left').length > 0 && (
                                    <div className="mb-1">
                                        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Perfil Izquierdo:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {damagePoints.filter(p => !p.side || p.side === 'left').map((p, i) => (
                                                <div key={p.id} className="bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] px-2 py-1 rounded flex items-center gap-1.5 cursor-pointer hover:bg-red-500/20" onClick={() => setViewSide('left')}>
                                                    <span className="font-black bg-red-500 text-white size-3.5 rounded-full flex items-center justify-center leading-none">!</span>
                                                    {p.note}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Right Side Damages */}
                                {damagePoints.filter(p => p.side === 'right').length > 0 && (
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Perfil Derecho:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {damagePoints.filter(p => p.side === 'right').map((p, i) => (
                                                <div key={p.id} className="bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] px-2 py-1 rounded flex items-center gap-1.5 cursor-pointer hover:bg-red-500/20" onClick={() => setViewSide('right')}>
                                                    <span className="font-black bg-red-500 text-white size-3.5 rounded-full flex items-center justify-center leading-none">!</span>
                                                    {p.note}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="h-px w-full bg-slate-800"></div>

                    <div className="space-y-4">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center mt-0.5">
                                <input
                                    type="checkbox"
                                    className="appearance-none size-5 rounded-md border-2 border-slate-600 bg-transparent checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                />
                                <span className={`material-symbols-outlined text-[14px] text-black absolute pointer-events-none transition-opacity ${acceptedTerms ? 'opacity-100' : 'opacity-0'}`}>check</span>
                            </div>
                            <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                                Declaro y acepto que el vehículo ingresa a las instalaciones en las condiciones estéticas aquí documentadas.
                                Además, acepto los Términos y Condiciones generales del servicio aplicables a {appConfig.companyName}.
                            </p>
                        </label>

                        {/* Signature Preview */}
                        <div className={`p-4 rounded-xl border transition-all ${acceptedTerms ? 'border-primary/50 bg-primary/5' : 'border-slate-800 bg-[#0a0c14] opacity-50'}`}>
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest border-b border-slate-800 pb-2 mb-3">Firma Digital del Cliente</p>
                            <p className="font-writing text-3xl text-primary drop-shadow-sm opacity-90 pl-2">
                                {acceptedTerms ? customerName : "Pendiente..."}
                            </p>
                            {acceptedTerms && <p className="text-[8px] text-primary/60 font-mono mt-2 pl-2">SIGN-{(Date.now()).toString(16).toUpperCase()}</p>}
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                            <span className="material-symbols-outlined text-red-400 text-[16px]">gavel</span>
                            <p className="text-[10px] text-red-300 leading-relaxed font-medium">Esta acción genera un comprobante legal irrenunciable que protege tanto al taller como a tu vehículo de daños no reportados previamente.</p>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-slate-700/50 bg-[#161b2a]">
                    <button
                        onClick={handleConfirm}
                        disabled={!acceptedTerms}
                        className="w-full bg-primary hover:bg-primary/90 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-[#0a0c14] font-black uppercase tracking-widest text-[13px] py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(13,204,242,0.3)] disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined font-bold">verified</span>
                        Confirmar Recepción
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DigitalSignatureModal;
