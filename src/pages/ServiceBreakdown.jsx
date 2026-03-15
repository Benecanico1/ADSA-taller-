import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { appConfig } from '../config';

const ServiceBreakdown = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve the service name passed from Appointments, default if accessed directly
    const selectedService = location.state?.serviceName || 'Detalles del Servicio';

    // Mock data for the breakdowns
    const breakdowns = {
        'Mantenimiento General': [
            { id: 1, text: 'Cambio de aceite sintético y filtro original', status: 'pending' },
            { id: 2, text: 'Inspección de desgaste y presión de neumáticos', status: 'pending' },
            { id: 3, text: 'Revisión y lubricación de cadena de transmisión', status: 'pending' },
            { id: 4, text: 'Control de niveles de líquidos (frenos, refrigerante)', status: 'pending' },
            { id: 5, text: 'Escaneo electrónico y borrado de fallas DTC', status: 'pending' },
            { id: 6, text: 'Verificación de luces y sistema eléctrico general', status: 'pending' },
        ],
        'Servicio Preventivo': [
            { id: 1, text: 'Inspección visual de componentes críticos', status: 'pending' },
            { id: 2, text: 'Ajuste de holgura de cables (acelerador, embrague)', status: 'pending' },
            { id: 3, text: 'Lubricación de puntos de pivote articulados', status: 'pending' },
            { id: 4, text: 'Verificación de desgaste de pastillas de freno', status: 'pending' },
            { id: 5, text: 'Comprobación del estado de la batería (voltaje)', status: 'pending' },
        ],
        'Revisión por Falla': [
            { id: 1, text: 'Entrevista de recepción para detallar la falla', status: 'pending' },
            { id: 2, text: 'Prueba de ruta diagnóstica (si procede)', status: 'pending' },
            { id: 3, text: 'Conexión a escáner de telemetría OBD2', status: 'pending' },
            { id: 4, text: 'Inspección física del sistema afectado', status: 'pending' },
            { id: 5, text: 'Emisión de reporte técnico y presupuesto', status: 'pending' },
        ]
    };

    // Use specific breakdown or fallback to a generic one
    const checklist = breakdowns[selectedService] || breakdowns['Mantenimiento General'];

    return (
        <div className="bg-[#0a0c14] text-slate-100 min-h-screen flex flex-col font-display max-w-[1000px] w-full mx-auto shadow-2xl relative overflow-hidden lg:border-x lg:border-slate-800/50">
            {/* Ambient Background */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center bg-[#161b2a]/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-slate-800 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="text-slate-100 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-800 transition-colors -ml-2"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <div className="flex flex-col flex-1 px-2">
                    <h2 className="text-slate-100 text-lg font-black leading-tight tracking-tight text-center">Desglose Técnico</h2>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest text-center mt-0.5">{appConfig.companyName}</p>
                </div>
                <div className="w-10"></div> {/* Spacer to align title properly */}
            </header>

            <main className="flex-1 overflow-y-auto px-5 py-6 space-y-8 pb-10">
                {/* Intro Section */}
                <div>
                    <h3 className="text-white text-2xl font-black leading-tight tracking-tight mb-2">{selectedService}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        A continuación se detallan los procedimientos estándar que nuestros mecánicos certificados realizarán sobre tu vehículo para garantizar su óptimo rendimiento corporativo.
                    </p>
                </div>

                {/* Checklist Section */}
                <div className="bg-[#161b2a] border border-slate-700/50 rounded-2xl p-5 shadow-lg shadow-black/50 relative overflow-hidden">
                    {/* Inner subtle glow */}
                    <div className="absolute -left-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>

                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-300 mb-5 flex items-center gap-2 relative z-10">
                        <span className="material-symbols-outlined text-primary text-sm">construction</span>
                        Procedimientos Operativos
                    </h4>

                    <div className="space-y-4 relative z-10">
                        {checklist.map((item, index) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="size-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center shadow-inner shrink-0 mt-0.5">
                                        <span className="text-[10px] text-slate-400 font-bold">{index + 1}</span>
                                    </div>
                                    {index !== checklist.length - 1 && (
                                        <div className="w-px h-full bg-slate-800/80 my-1"></div>
                                    )}
                                </div>
                                <div className="flex-1 pb-4">
                                    <p className="text-sm font-medium text-slate-200 leading-snug">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Disclaimer/Footer Card */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 shadow-md">
                    <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                    <div>
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">
                            <strong className="text-primary font-bold">Nota:</strong> Este es un desglose general del protocolo estandarizado. Durante la inspección, el técnico puede omitir o agregar procedimientos dependiendo de las condiciones específicas en las que se encuentre la motocicleta.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ServiceBreakdown;
