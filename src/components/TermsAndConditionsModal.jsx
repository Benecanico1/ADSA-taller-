import React from 'react';
import { appConfig } from '../config';

const TermsAndConditionsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-[#121826] rounded-3xl border border-slate-700/50 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#161b2a] sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                            <span className="material-symbols-outlined text-primary">gavel</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-widest">Términos y Condiciones</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{appConfig.companyName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-slate-400">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto text-slate-300 text-sm space-y-6 flex-1 custom-scrollbar leading-relaxed font-light">
                    <p>
                        Al hacer uso de los servicios proporcionados por <strong>{appConfig.companyName}</strong>, usted (el "Cliente") acepta los siguientes términos y condiciones que rigen la recepción, diagnóstico, reparación, entrega y garantía de las motocicletas.
                    </p>

                    <ol className="list-decimal pl-5 space-y-4 marker:font-bold marker:text-primary">
                        <li>
                            <strong className="text-white block mb-1">Autorización de Servicios:</strong>
                            El Cliente autoriza a {appConfig.companyName} a realizar los servicios técnicos y de mantenimiento detallados en la orden de trabajo (OT) digital. Las pruebas de diagnóstico que impliquen rodar la motocicleta en vía pública o en dinamómetro se realizan bajo autorización implícita al ingresar el vehículo.
                        </li>

                        <li>
                            <strong className="text-white block mb-1">Presupuestos y Costos Adicionales:</strong>
                            Los diagnósticos iniciales pueden revelar problemas ocultos o secundarios no detectados en la recepción. Si se requiere trabajo adicional o repuestos no presupuestados, el taller detendrá el proceso y solicitará la aprobación del Cliente (vía app o WhatsApp) antes de continuar.
                        </li>

                        <li>
                            <strong className="text-white block mb-1">Uso de Repuestos:</strong>
                            {appConfig.companyName} instalará repuestos originales (OEM) o alternativos de alta calidad, según lo acordado con el Cliente. El taller no se hace responsable por fallas derivadas de repuestos de baja calidad o usados proporcionados directamente por el Cliente.
                        </li>

                        <li>
                            <strong className="text-white block mb-1">Custodia y Responsabilidad:</strong>
                            El taller asume la custodia del vehículo desde la recepción formal hasta la entrega. Sin embargo, no nos hacemos responsables por pérdidas de objetos personales (cascos, accesorios, documentos) dejados en la moto que no hayan sido declarados en el inventario de ingreso. Recomendamos retirar pertenencias de valor.
                        </li>

                        <li>
                            <strong className="text-white block mb-1">Tiempos de Entrega:</strong>
                            Las fechas estimadas de entrega son referenciales. Los tiempos pueden variar debido a la complejidad de la reparación, la disponibilidad de repuestos en el mercado o retrasos logísticos de terceros (importadores). El Cliente será notificado periódicamente mediante la aplicación.
                        </li>

                        <li>
                            <strong className="text-white block mb-1">Aceptación y Retiro:</strong>
                            Una vez notificada la finalización del servicio, el Cliente dispone de un plazo máximo de cinco (5) días hábiles para retirar la motocicleta y cancelar el saldo pendiente. Vencido este plazo, {appConfig.appName} aplicará un cargo diario en concepto de guarda y custodia.
                        </li>

                        <li>
                            <strong className="text-white block mb-1">Garantía del Servicio:</strong>
                            Toda reparación cuenta con una garantía estándar de noventa (90) días o 3,000 km (lo que ocurra primero), exclusivamente sobre la mano de obra realizada y repuestos provistos por el taller. <strong>La garantía queda nula si:</strong>
                            <ul className="list-disc pl-5 mt-2 space-y-1 marker:text-slate-500">
                                <li>La motocicleta es manipulada mecánicamente por el Cliente o terceros ajenos a {appConfig.appName} tras la entrega.</li>
                                <li>Se detecta un uso indebido, negligente, de competición o acrobático del vehículo.</li>
                                <li>La falla proviene de un repuesto proporcionado directamente por el Cliente.</li>
                            </ul>
                        </li>

                        <li>
                            <strong className="text-white block mb-1">Gestión de Residuos:</strong>
                            En cumplimiento con las normativas ambientales, el taller dispone de manera segura de todos los residuos peligrosos (aceite, refrigerante, baterías). Las piezas reemplazadas serán desechadas a menos que el Cliente solicite explícitamente su devolución en el momento de la orden de trabajo.
                        </li>
                    </ol>

                    <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                        <p className="text-xs text-slate-400 italic">
                            Estos términos constituyen el acuerdo completo entre {appConfig.companyName} y el Cliente. Al utilizar la plataforma digital o entregar su motocicleta, se asume la comprensión y aceptación total de este documento. Última actualización: Marzo 2024.
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-800 bg-[#161b2a] flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-primary hover:bg-primary/90 text-[#121826] font-bold py-3 px-8 rounded-xl uppercase tracking-widest text-sm transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">check</span>
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditionsModal;
