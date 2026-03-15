import React, { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc, updateDoc, onSnapshot, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';

const MechanicTelemetryModal = ({ isOpen, onClose, appointmentId, vehicleName }) => {
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newTaskText, setNewTaskText] = useState('');
    const [saving, setSaving] = useState(false);

    // Diagnosis states
    const [diagnosisNotes, setDiagnosisNotes] = useState('');
    const [newDiagnosisNote, setNewDiagnosisNote] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);

    // New checklist states
    const [liquidoRefrigerante, setLiquidoRefrigerante] = useState('');
    const [liquidoGasolina, setLiquidoGasolina] = useState('');
    const [liquidoFrenos, setLiquidoFrenos] = useState('');
    const [presionLlantas, setPresionLlantas] = useState('');
    const [estadoPlasticos, setEstadoPlasticos] = useState('');
    // New inventory request state
    const [repuestoSolicitado, setRepuestoSolicitado] = useState('');

    // Timer states
    const [liveTimer, setLiveTimer] = useState(0);
    const [timerInterval, setTimerInterval] = useState(null);

    // Evidence upload states
    const [uploadingEvidence, setUploadingEvidence] = useState(false);

    // AI Diagnostic Assistant
    const [symptoms, setSymptoms] = useState('');
    const [diagnosticResult, setDiagnosticResult] = useState('');
    const [isDiagnosing, setIsDiagnosing] = useState(false);

    // Common phases
    const PHASES = [
        { id: 'pending', label: 'Recepción' },
        { id: 'diagnosing', label: 'Diagnóstico' },
        { id: 'working', label: 'En Reparación' },
        { id: 'quality', label: 'Control Calidad' },
        { id: 'ready', label: 'Listo para Entrega' }
    ];

    useEffect(() => {
        if (!isOpen || !appointmentId) {
            setLiveTimer(0);
            if (timerInterval) clearInterval(timerInterval);
            return;
        }

        setLoading(true);
        const docRef = doc(db, 'Appointments', appointmentId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setAppointment({ id: docSnap.id, ...data });

                // Keep local timer synced with DB's accumulated time + live session time
                let currentSeconds = data.totalLaborSeconds || 0;
                if (data.laborStatus === 'active' && data.currentSessionStart) {
                    const diffMs = Date.now() - data.currentSessionStart;
                    currentSeconds += Math.floor(diffMs / 1000);
                }
                setLiveTimer(currentSeconds);

                if (data.diagnosisNotes) setDiagnosisNotes(data.diagnosisNotes);
                if (data.liquidoRefrigerante) setLiquidoRefrigerante(data.liquidoRefrigerante);
                if (data.liquidoGasolina) setLiquidoGasolina(data.liquidoGasolina);
                if (data.liquidoFrenos) setLiquidoFrenos(data.liquidoFrenos);
                if (data.presionLlantas) setPresionLlantas(data.presionLlantas);
                if (data.estadoPlasticos) setEstadoPlasticos(data.estadoPlasticos);
            }
            setLoading(false);
        });

        return () => {
            unsubscribe();
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [isOpen, appointmentId]);

    // Live timer logic
    useEffect(() => {
        if (appointment?.laborStatus === 'active') {
            const interval = setInterval(() => {
                setLiveTimer(prev => prev + 1);
            }, 1000);
            setTimerInterval(interval);
            return () => clearInterval(interval);
        } else {
            if (timerInterval) clearInterval(timerInterval);
        }
    }, [appointment?.laborStatus]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target.id === 'telemetry-modal-backdrop') {
            onClose();
        }
    };

    const toggleTimer = async () => {
        try {
            setSaving(true);
            const refDoc = doc(db, 'Appointments', appointmentId);

            if (appointment.laborStatus === 'active') {
                // Pause timer
                const now = Date.now();
                const diffSecs = Math.floor((now - (appointment.currentSessionStart || now)) / 1000);
                const newTotal = (appointment.totalLaborSeconds || 0) + diffSecs;

                await updateDoc(refDoc, {
                    laborStatus: 'paused',
                    currentSessionStart: null,
                    totalLaborSeconds: newTotal
                });
            } else {
                // Play timer
                await updateDoc(refDoc, {
                    laborStatus: 'active',
                    currentSessionStart: Date.now()
                });
            }
        } catch (error) {
            console.error("Error toggling timer:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleEvidenceUpload = async (e) => {
        let file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingEvidence(true);

            // Compress if it is an image
            if (file.type.startsWith('image/')) {
                try {
                    const options = {
                        maxSizeMB: 0.1,
                        maxWidthOrHeight: 800,
                        useWebWorker: true,
                        fileType: 'image/webp'
                    };
                    file = await imageCompression(file, options);
                } catch (error) {
                    console.error("Error compressing image:", error);
                    // Continue with uncompressed file if it fails
                }
            }

            const fileRef = ref(storage, `Appointments/${appointmentId}/evidence/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const downloadUrl = await getDownloadURL(fileRef);

            const refDoc = doc(db, 'Appointments', appointmentId);
            const currentEvidence = appointment.evidenceFiles || [];
            await updateDoc(refDoc, {
                evidenceFiles: [...currentEvidence, downloadUrl]
            });
        } catch (error) {
            console.error("Error uploading evidence:", error);
            alert("No se pudo subir la evidencia. Comprueba las reglas de Storage publico o tu conexión.");
        } finally {
            setUploadingEvidence(false);
        }
    };

    const openManual = () => {
        if (!appointment?.vehicle) return;
        const brand = appointment.vehicle.brand || '';
        const model = appointment.vehicle.model || '';
        // Un query generico pero muy acertado para DuckDuckGo:
        const query = encodeURIComponent(`manual taller ${brand} ${model} pdf`);
        window.open(`https://duckduckgo.com/?q=${query}`, '_blank');
    };

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const updatePhase = async (newPhase) => {
        try {
            setSaving(true);
            const refDoc = doc(db, 'Appointments', appointmentId);

            // Si pasamos a ready y el cronómetro está activo, debemos pausarlo primero auto-magicamente.
            let extraUpdates = {};
            if (newPhase === 'ready') {
                extraUpdates.mechanicCompletedAt = new Date().toISOString();
                if (appointment.laborStatus === 'active') {
                    const now = Date.now();
                    const diffSecs = Math.floor((now - (appointment.currentSessionStart || now)) / 1000);
                    extraUpdates.laborStatus = 'paused';
                    extraUpdates.currentSessionStart = null;
                    extraUpdates.totalLaborSeconds = (appointment.totalLaborSeconds || 0) + diffSecs;
                }
            }

            await updateDoc(refDoc, { status: newPhase, ...extraUpdates });

            // If the service is marked as ready, update the motorcycle's last service date to reset the 180-day counter
            if (newPhase === 'ready' && appointment?.vehicleId) {
                const motoRef = doc(db, 'Motorcycles', appointment.vehicleId);
                await updateDoc(motoRef, {
                    lastServiceDate: serverTimestamp()
                });

                // Also award 100 points to the customer for completing a service
                if (appointment?.customerId) {
                    try {
                        const userRef = doc(db, 'Users', appointment.customerId);
                        const userSnap = await getDoc(userRef);

                        if (userSnap.exists()) {
                            const userData = userSnap.data();
                            // Only award if they are subscribed (or optionally unconditionally to encourage signup)
                            if (userData.rewardsStatus === 'active') {
                                const currentPoints = userData.points || 0;
                                const newHistoryItem = {
                                    amount: 100,
                                    reason: `Servicio Completado OT #${appointmentId.slice(-4).toUpperCase()}`,
                                    date: new Date().toISOString()
                                };

                                await updateDoc(userRef, {
                                    points: currentPoints + 100,
                                    pointsHistory: [...(userData.pointsHistory || []), newHistoryItem]
                                });
                            }
                        }
                    } catch (userErr) {
                        console.error("Error awarding points to user:", userErr);
                    }
                }
            }
        } catch (error) {
            console.error("Error updating phase:", error);
        } finally {
            setSaving(false);
        }
    };

    const addTask = async () => {
        if (!newTaskText.trim()) return;
        try {
            setSaving(true);
            const refDoc = doc(db, 'Appointments', appointmentId);
            const currentSteps = appointment.repairSteps || [];

            const newStep = {
                id: Date.now().toString(),
                label: newTaskText.trim(),
                completed: false,
                timestamp: new Date().toISOString()
            };

            await updateDoc(refDoc, {
                repairSteps: [...currentSteps, newStep]
            });
            setNewTaskText('');
        } catch (error) {
            console.error("Error adding task:", error);
        } finally {
            setSaving(false);
        }
    };

    const toggleStepStatus = async (stepId, currentStatus) => {
        try {
            setSaving(true);
            const ref = doc(db, 'Appointments', appointmentId);
            const currentSteps = appointment.repairSteps || [];

            const updatedSteps = currentSteps.map(step =>
                step.id === stepId ? { ...step, completed: !currentStatus } : step
            );

            await updateDoc(ref, {
                repairSteps: updatedSteps
            });
        } catch (error) {
            console.error("Error updating step:", error);
        } finally {
            setSaving(false);
        }
    };

    const deleteStep = async (stepId) => {
        try {
            setSaving(true);
            const ref = doc(db, 'Appointments', appointmentId);
            const currentSteps = appointment.repairSteps || [];

            const updatedSteps = currentSteps.filter(step => step.id !== stepId);

            await updateDoc(ref, {
                repairSteps: updatedSteps
            });
        } catch (error) {
            console.error("Error deleting step:", error);
        } finally {
            setSaving(false);
        }
    };

    const addDiagnosisNote = async () => {
        if (!newDiagnosisNote.trim()) return;
        try {
            setSavingNotes(true);
            const refDoc = doc(db, 'Appointments', appointmentId);
            const currentNotes = appointment.diagnosisNotesList || [];

            const newNote = {
                id: Date.now().toString(),
                text: newDiagnosisNote.trim(),
                timestamp: new Date().toISOString()
            };

            await updateDoc(refDoc, {
                diagnosisNotesList: [...currentNotes, newNote]
            });
            setNewDiagnosisNote('');
        } catch (error) {
            console.error("Error adding diagnosis note:", error);
        } finally {
            setSavingNotes(false);
        }
    };

    const deleteDiagnosisNote = async (noteId) => {
        try {
            setSavingNotes(true);
            const refDoc = doc(db, 'Appointments', appointmentId);
            const currentNotes = appointment.diagnosisNotesList || [];
            const updatedNotes = currentNotes.filter(n => n.id !== noteId);

            await updateDoc(refDoc, {
                diagnosisNotesList: updatedNotes
            });
        } catch (error) {
            console.error("Error deleting diagnosis note:", error);
        } finally {
            setSavingNotes(false);
        }
    };

    const handleSaveDiagnosis = async () => {
        try {
            setSavingNotes(true);
            const refDoc = doc(db, 'Appointments', appointmentId);
            await updateDoc(refDoc, {
                diagnosisNotes: diagnosisNotes,
                liquidoRefrigerante: liquidoRefrigerante,
                liquidoGasolina: liquidoGasolina,
                liquidoFrenos: liquidoFrenos,
                presionLlantas: presionLlantas,
                estadoPlasticos: estadoPlasticos
            });
            alert("Diagnóstico guardado correctamente.");
        } catch (error) {
            console.error("Error saving diagnosis:", error);
            alert("No se pudo guardar el diagnóstico.");
        } finally {
            setSavingNotes(false);
        }
    };

    const handleRequestPart = async () => {
        if (!repuestoSolicitado.trim()) return;
        try {
            setSaving(true);
            const refDoc = doc(db, 'Appointments', appointmentId);
            const currentParts = appointment.requestedParts || [];
            
            const newPart = {
                id: Date.now().toString(),
                name: repuestoSolicitado.trim(),
                status: 'pending',
                timestamp: new Date().toISOString()
            };

            await updateDoc(refDoc, {
                requestedParts: [...currentParts, newPart]
            });
            
            setRepuestoSolicitado('');
            alert("Repuesto solicitado a inventario.");
        } catch (error) {
            console.error("Error requesting part:", error);
            alert("Hubo un error al solicitar el repuesto.");
        } finally {
            setSaving(false);
        }
    };

    const handleDiagnosticAssistant = async () => {
        if (!symptoms.trim()) return;
        setIsDiagnosing(true);
        setDiagnosticResult('');

        try {
            const contextStr = appointment?.vehicle 
                ? `${appointment.vehicle.brand} ${appointment.vehicle.model} ${appointment.vehicle.year} (${appointment.vehicle.mileage}km)`
                : 'Vehículo desconocido';

            const assist = httpsCallable(functions, 'diagnosticAssistant');
            const res = await assist({
                symptoms: symptoms.trim(),
                motorcycleContext: contextStr
            });

            if (res.data && res.data.response) {
                setDiagnosticResult(res.data.response);
            }
        } catch (error) {
            console.error("Error calling diagnosticAssistant:", error);
            setDiagnosticResult("Error interno: No se pudo obtener el diagnóstico del Jefe Clínico.");
        } finally {
            setIsDiagnosing(false);
        }
    };

    const handleRequestAuthorization = async () => {
        const targetUserId = appointment?.customerId || appointment?.userId;
        if (!targetUserId) {
            alert("El cliente no está registrado en la app, no se puede enviar notificación push.");
            return;
        }

        const confirmReq = window.confirm("¿Estás seguro de solicitar autorización al cliente? Esto le enviará una notificación sobre costos imprevistos.");
        if (!confirmReq) return;

        try {
            setSaving(true);
            const refDoc = doc(db, 'Appointments', appointmentId);
            
            // Auto pause the timer if active
            let extraUpdates = {};
            if (appointment.laborStatus === 'active') {
                const now = Date.now();
                const diffSecs = Math.floor((now - (appointment.currentSessionStart || now)) / 1000);
                extraUpdates = {
                    laborStatus: 'paused',
                    currentSessionStart: null,
                    totalLaborSeconds: (appointment.totalLaborSeconds || 0) + diffSecs
                };
            }

            await updateDoc(refDoc, {
                pendingAuthorization: true,
                authorizationRequestedAt: new Date().toISOString(),
                ...extraUpdates
            });

            await addDoc(collection(db, 'Notifications'), {
                title: "Autorización de Presupuesto",
                message: `El técnico ha detectado adicionales en tu ${appointment.vehicle?.brand || 'moto'}. Por favor revisá y contactá al taller para autorizar.`,
                targetUserId: targetUserId,
                createdAt: new Date(),
                readBy: [],
                icon: "gavel",
                color: "text-amber-500",
                bg: "bg-amber-500/10"
            });

            alert('Solicitud de autorización enviada correctamente.');
            onClose();
        } catch (error) {
            console.error("Error request auth:", error);
            alert("Hubo un error al enviar la autorización.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            id="telemetry-modal-backdrop"
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-display print:bg-white print:absolute print:inset-0 print:p-0"
        >
            <div className="bg-[#161b2a] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[95vh] md:h-auto md:max-h-[90vh] print:shadow-none print:border-none print:h-auto print:max-h-none print:bg-white print:text-black">
                {/* Header */}
                <div className="p-5 border-b border-slate-700/50 flex items-center justify-between bg-[#161b2a] sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">sensors</span>
                            Telemetría y Checklist
                        </h2>
                        {vehicleName && (
                            <p className="text-xs text-primary font-black uppercase tracking-widest mt-0.5">{vehicleName}</p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">OT #{appointmentId?.slice(-4).toUpperCase() || '---'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.print()}
                            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors print:hidden"
                            title="Imprimir Orden de Trabajo"
                        >
                            <span className="material-symbols-outlined text-xl">print</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors print:hidden"
                            title="Cerrar"
                        >
                            <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 p-10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
                    </div>
                ) : !appointment ? (
                    <div className="flex-1 p-10 flex items-center justify-center text-red-400">
                        Error al cargar la orden de trabajo.
                    </div>
                ) : (
                    <div className="p-4 md:p-5 overflow-y-auto flex-1 flex flex-col gap-6 min-h-0">

                        {/* Selector de Fase */}
                        <div className="flex flex-col gap-3">
                            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-500 text-sm">timeline</span>
                                Fase Actual
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {PHASES.map(phase => {
                                    const isActive = appointment.status === phase.id;
                                    return (
                                        <div
                                            key={phase.id}
                                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between
                                                ${isActive
                                                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(255,40,0,0.15)] ring-1 ring-primary'
                                                    : 'bg-[#0a0c14] border-slate-700 text-slate-400 opacity-70'
                                                }
                                            `}
                                        >
                                            {phase.label}
                                            {isActive && <span className="material-symbols-outlined text-sm">check_circle</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <hr className="border-slate-700/50" />

                        {/* Funciones Next Level del Mecánico */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Cronómetro */}
                            <div className="bg-[#0a0c14] border border-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tiempo Operativo</span>
                                <div className="text-3xl font-black text-white font-mono tracking-wider tabular-nums">
                                    {formatTime(liveTimer)}
                                </div>
                                <button
                                    onClick={toggleTimer}
                                    disabled={saving}
                                    className={`mt-2 flex items-center justify-center gap-2 px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all print:hidden
                                        ${appointment?.laborStatus === 'active'
                                            ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border border-amber-500/50'
                                            : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 border border-emerald-500/50'
                                        }
                                    `}
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        {appointment?.laborStatus === 'active' ? 'pause' : 'play_arrow'}
                                    </span>
                                    {appointment?.laborStatus === 'active' ? 'Pausar OT' : 'Iniciar OT'}
                                </button>
                            </div>

                            {/* Manual y Evidencia */}
                            <div className="flex flex-col gap-3">
                                {/* Botón Manual */}
                                <button
                                    onClick={openManual}
                                    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-xl flex items-center justify-center gap-2 transition-colors flex-1 print:hidden"
                                >
                                    <span className="material-symbols-outlined">menu_book</span>
                                    <span className="text-[11px] font-bold uppercase tracking-widest">Ver Manual Técnico</span>
                                </button>

                                {/* Botón Evidencia */}
                                <label className={`bg-[#0a0c14] hover:bg-slate-800 border border-slate-700 border-dashed text-slate-300 p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors flex-1 print:hidden ${uploadingEvidence ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <span className="material-symbols-outlined text-slate-400">add_a_photo</span>
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                        {uploadingEvidence ? 'Subiendo...' : 'Adjuntar Evidencia'}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={handleEvidenceUpload}
                                        disabled={uploadingEvidence}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Galería de Evidencias */}
                        {appointment.evidenceFiles && appointment.evidenceFiles.length > 0 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                                {appointment.evidenceFiles.map((url, i) => (
                                    <div key={i} className="w-[100px] h-[100px] rounded-xl overflow-hidden border border-slate-700 snap-start flex-shrink-0 relative group">
                                        {url.includes('.mp4') || url.includes('.mov') ? (
                                            <video src={url} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={url} alt={`Evidencia ${i + 1}`} className="w-full h-full object-cover" />
                                        )}
                                        <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span className="material-symbols-outlined text-white">zoom_in</span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}

                        <hr className="border-slate-700/50" />

                        {appointment.status === 'diagnosing' && (
                            <div className="flex flex-col gap-4 flex-1">
                                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-500 text-sm">plumbing</span>
                                    Checklist de Revisión y Diagnóstico
                                </h3>

                                {/* Asistente de Diagnóstico con IA */}
                                <div className="bg-[#0a0c14] border border-primary/30 rounded-2xl p-4 overflow-hidden relative shadow-[0_0_15px_rgba(13,204,242,0.1)] mb-2 mt-1">
                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                        <span className="material-symbols-outlined text-8xl text-primary">psychiatry</span>
                                    </div>
                                    <h4 className="flex items-center gap-2 text-[11px] font-bold text-primary uppercase tracking-widest mb-3 relative z-10">
                                        <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                                        Ingeniero Jefe IA
                                    </h4>
                                    
                                    <div className="flex flex-col gap-2 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={symptoms}
                                                onChange={(e) => setSymptoms(e.target.value)}
                                                placeholder="Describí los síntomas (ej. 'Falla en alta después de calentar', 'ruido metálico al embragar')..."
                                                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleDiagnosticAssistant();
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={handleDiagnosticAssistant}
                                                disabled={!symptoms.trim() || isDiagnosing}
                                                className="bg-primary text-[#0a0c14] hover:bg-cyan-400 font-bold px-4 rounded-xl transition-all disabled:opacity-50 flex flex-col items-center justify-center h-full aspect-square md:aspect-auto md:py-3"
                                            >
                                                {isDiagnosing ? (
                                                    <span className="material-symbols-outlined animate-spin text-xl">sync</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-xl">temp_preferences_custom</span>
                                                )}
                                                <span className="text-[10px] hidden md:block uppercase mt-1">Consultar</span>
                                            </button>
                                        </div>

                                        {diagnosticResult && (
                                            <div className="mt-2 bg-slate-900/80 border text-slate-200 border-primary/20 rounded-xl p-3 text-sm whitespace-pre-wrap leading-relaxed shadow-inner">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mb-0.5"></span>
                                                    <span className="text-[10px] uppercase text-primary font-bold tracking-widest">Respuesta de IA</span>
                                                </div>
                                                {diagnosticResult}
                                                
                                                {/* Botón para añadir la sugerencia de la IA directo al checklist de tareas si se desea */}
                                                <button 
                                                    className="mt-3 bg-primary/10 text-primary border border-primary/30 w-full rounded-lg py-2 flex items-center justify-center gap-2 text-xs font-bold transition-all hover:bg-primary/20"
                                                    onClick={() => setNewDiagnosisNote("DIAGNÓSTICO IA: " + diagnosticResult.split('\n')[0])} 
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">edit_note</span>
                                                    Copiar al borrador de Fase
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <hr className="border-slate-700/50 my-1" />
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2 mt-2">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Líquido Refrigerante</label>
                                        <select value={liquidoRefrigerante} onChange={e => setLiquidoRefrigerante(e.target.value)} className="bg-[#0a0c14] border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-primary focus:outline-none">
                                            <option value="">Seleccionar...</option>
                                            <option value="Normal">Normal</option>
                                            <option value="Medio">Medio</option>
                                            <option value="Bajo">Bajo</option>
                                            <option value="Alto">Alto</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Líquido de Gasolina</label>
                                        <select value={liquidoGasolina} onChange={e => setLiquidoGasolina(e.target.value)} className="bg-[#0a0c14] border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-primary focus:outline-none">
                                            <option value="">Seleccionar...</option>
                                            <option value="Normal">Normal</option>
                                            <option value="Medio">Medio</option>
                                            <option value="Bajo">Bajo</option>
                                            <option value="Alto">Alto</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Líquido de Frenos</label>
                                        <select value={liquidoFrenos} onChange={e => setLiquidoFrenos(e.target.value)} className="bg-[#0a0c14] border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-primary focus:outline-none">
                                            <option value="">Seleccionar...</option>
                                            <option value="Normal">Normal</option>
                                            <option value="Medio">Medio</option>
                                            <option value="Bajo">Bajo</option>
                                            <option value="Alto">Alto</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Presión Llantas</label>
                                        <select value={presionLlantas} onChange={e => setPresionLlantas(e.target.value)} className="bg-[#0a0c14] border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-primary focus:outline-none">
                                            <option value="">Seleccionar...</option>
                                            <option value="Normal">Normal</option>
                                            <option value="Baja">Baja</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1 sm:col-span-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Estado Plásticos (Revisión Total)</label>
                                        <select value={estadoPlasticos} onChange={e => setEstadoPlasticos(e.target.value)} className="bg-[#0a0c14] border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-primary focus:outline-none">
                                            <option value="">Seleccionar...</option>
                                            <option value="Bien">Bien</option>
                                            <option value="Mal">Mal</option>
                                        </select>
                                    </div>
                                </div>
                                
                                {/* Legacy Text Notes (if exists) */}
                                {diagnosisNotes && (
                                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Nota antigua (Legacy)</p>
                                        <p className="text-sm text-slate-300">{diagnosisNotes}</p>
                                    </div>
                                )}

                                {/* Multiple Notes List */}
                                <div className="flex flex-col gap-2">
                                    {(!appointment.diagnosisNotesList || appointment.diagnosisNotesList.length === 0) ? (
                                        <div className="text-center py-6 bg-[#0a0c14] border border-dashed border-slate-700 rounded-xl">
                                            <span className="material-symbols-outlined text-slate-600 text-3xl mb-2">note_add</span>
                                            <p className="text-[11px] text-slate-400">No hay escritos en el diagnóstico.</p>
                                        </div>
                                    ) : (
                                        appointment.diagnosisNotesList.map((note) => (
                                            <div key={note.id} className="bg-[#0a0c14] border border-slate-700 p-3 rounded-xl relative group">
                                                <p className="text-sm text-slate-200 pr-6 whitespace-pre-wrap">{note.text}</p>
                                                <span className="text-[9px] text-slate-500 mt-2 block">{new Date(note.timestamp).toLocaleString()}</span>
                                                <button
                                                    onClick={() => deleteDiagnosisNote(note.id)}
                                                    className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-2 print:hidden">
                                    <input
                                        type="text"
                                        value={newDiagnosisNote}
                                        onChange={(e) => setNewDiagnosisNote(e.target.value)}
                                        placeholder="Escribir un hallazgo o falla..."
                                        className="flex-1 bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addDiagnosisNote();
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={addDiagnosisNote}
                                        disabled={!newDiagnosisNote.trim() || savingNotes}
                                        className="bg-primary/20 hover:bg-primary text-primary hover:text-[#0a0c14] border border-primary/30 p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-full aspect-square"
                                    >
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                </div>
                                
                                <div className="flex gap-3 mt-2 print:hidden">
                                    <button 
                                        onClick={handleSaveDiagnosis}
                                        disabled={savingNotes}
                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors text-xs flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">save</span>
                                        {savingNotes ? 'Guardando...' : 'Guardar Checklist'}
                                    </button>
                                    
                                    <button 
                                        onClick={handleRequestAuthorization}
                                        disabled={saving}
                                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-xl transition-colors text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">gavel</span>
                                        Solicitar Autorización
                                    </button>
                                </div>

                                {/* Request parts from inventory */}
                                <div className="mt-4 border-t border-slate-700/50 pt-4 print:hidden">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Solicitar a Inventario</h4>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={repuestoSolicitado}
                                            onChange={(e) => setRepuestoSolicitado(e.target.value)}
                                            placeholder="Ej. Pastillas de freno traseras..."
                                            className="flex-1 bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                        <button
                                            onClick={handleRequestPart}
                                            disabled={!repuestoSolicitado.trim() || saving}
                                            className="bg-primary/20 hover:bg-primary text-primary hover:text-[#0a0c14] border border-primary/30 px-4 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xs uppercase"
                                        >
                                            Pedir
                                        </button>
                                    </div>
                                    {appointment.requestedParts && appointment.requestedParts.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {appointment.requestedParts.map(part => (
                                                <span key={part.id} className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px] flex items-center gap-1 border border-slate-700">
                                                    <span className="material-symbols-outlined text-[12px] text-amber-400">inventory_2</span>
                                                    {part.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {(appointment.status === 'working' || appointment.status === 'quality') && (
                            <div className="flex flex-col gap-4 flex-1">
                                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-500 text-sm">checklist</span>
                                    Checklist Médico
                                </h3>

                                {/* Lista de Tareas */}
                                <div className="flex flex-col gap-2">
                                    {(!appointment.repairSteps || appointment.repairSteps.length === 0) ? (
                                        <div className="text-center py-6 bg-[#0a0c14] border border-dashed border-slate-700 rounded-xl">
                                            <span className="material-symbols-outlined text-slate-600 text-3xl mb-2">fact_check</span>
                                            <p className="text-[11px] text-slate-400">No hay tareas de reparación registradas.</p>
                                        </div>
                                    ) : (
                                        appointment.repairSteps.map((step) => (
                                            <div
                                                key={step.id}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-colors
                                                    ${step.completed
                                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                                        : 'bg-[#0a0c14] border-slate-700'
                                                    }
                                                `}
                                            >
                                                <div
                                                    className="flex items-center gap-3 flex-1 cursor-pointer"
                                                    onClick={() => toggleStepStatus(step.id, step.completed)}
                                                >
                                                    <div className={`size-6 rounded-md flex items-center justify-center border transition-colors
                                                        ${step.completed ? 'bg-emerald-500 border-emerald-500 text-[#161b2a]' : 'bg-[#161b2a] border-slate-600 text-transparent'}
                                                    `}>
                                                        <span className="material-symbols-outlined text-[16px]">check</span>
                                                    </div>
                                                    <span className={`text-sm font-medium transition-all flex-1 ${step.completed ? 'text-emerald-400 line-through opacity-70' : 'text-slate-200'}`}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => deleteStep(step.id)}
                                                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors ml-2"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Nuevo Item Input */}
                                <div className="flex items-center gap-2 mt-2 print:hidden">
                                    <input
                                        type="text"
                                        value={newTaskText}
                                        onChange={(e) => setNewTaskText(e.target.value)}
                                        placeholder="Ej. Cambio de Aceite Motul 7100..."
                                        className="flex-1 bg-[#0a0c14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addTask();
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={addTask}
                                        disabled={!newTaskText.trim() || saving}
                                        className="bg-primary/20 hover:bg-primary text-primary hover:text-[#0a0c14] border border-primary/30 p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-full aspect-square"
                                    >
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                </div>

                                {/* Checklist Médico - Tareas Rápidas */}
                                <div className="mt-4 border-t border-slate-700/50 pt-4 print:hidden">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Tareas Rápidas Frecuentes</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            "Cambio de Aceite",
                                            "Filtro de Aceite",
                                            "Ajuste y Lubricación de Cadena",
                                            "Revisión de Frenos (Del/Tras)",
                                            "Presión de Neumáticos",
                                            "Revisión de Batería y Carga",
                                            "Sincronización de Cuerpo Mariposa"
                                        ].map((sugerencia, index) => {
                                            const isAlreadyAdded = appointment?.repairSteps?.some(
                                                step => step.label.toLowerCase() === sugerencia.toLowerCase()
                                            );

                                            if (isAlreadyAdded) return null; // Hide the option if it's already in the checklist

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        setNewTaskText(sugerencia);
                                                    }}
                                                    className="bg-[#0a0c14] hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium py-1.5 px-3 rounded-full transition-colors active:scale-95 flex items-center gap-1.5"
                                                >
                                                    <span className="material-symbols-outlined text-[14px] text-slate-500">add_circle</span>
                                                    {sugerencia}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {(appointment.status !== 'diagnosing' && appointment.status !== 'working' && appointment.status !== 'quality') && (
                            <div className="flex flex-col items-center justify-center p-6 bg-slate-800/20 border border-slate-700/50 rounded-xl flex-1 print:hidden">
                                <span className="material-symbols-outlined text-slate-500 text-4xl mb-3">linear_scale</span>
                                <p className="text-sm text-slate-400 text-center font-bold">Cambia la Fase Superior</p>
                                <p className="text-xs text-slate-500 text-center mt-1">Avanzá la orden a Diagnóstico o Reparación para acceder al checklist correspondiente.</p>
                            </div>
                        )}

                    </div>
                )}

                {/* Botón de Progreso Funcional (Fijado abajo) */}
                {appointment && appointment.status !== 'ready' && !loading && (
                    <div className="p-4 bg-[#161b2a] border-t border-slate-700/50 shrink-0 print:hidden">
                        {appointment.status === 'pending' && (
                            <button
                                onClick={() => updatePhase('diagnosing')}
                                disabled={saving}
                                className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black uppercase tracking-widest py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all active:scale-95 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined font-bold">search</span>
                                Iniciar Diagnóstico
                            </button>
                        )}
                        {appointment.status === 'diagnosing' && (
                            <button
                                onClick={() => updatePhase('working')}
                                disabled={saving}
                                className="w-full bg-primary hover:bg-primary/90 text-slate-950 font-black uppercase tracking-widest py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,40,0,0.3)] hover:shadow-[0_0_30px_rgba(255,40,0,0.5)] transition-all active:scale-95 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined font-bold">build</span>
                                Listo para Reparación
                            </button>
                        )}
                        {appointment.status === 'working' && (
                            <button
                                onClick={() => updatePhase('quality')}
                                disabled={saving}
                                className="w-full bg-red-500 hover:bg-red-400 text-slate-950 font-black uppercase tracking-widest py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all active:scale-95 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined font-bold">verified</span>
                                Control de Calidad
                            </button>
                        )}
                        {appointment.status === 'quality' && (
                            <button
                                onClick={() => updatePhase('ready')}
                                disabled={saving}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-95 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined font-bold">price_check</span>
                                Listo para Entrega
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MechanicTelemetryModal;
