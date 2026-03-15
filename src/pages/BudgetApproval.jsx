import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '../components/ui/BottomNav';

const BudgetApproval = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col max-w-md mx-auto relative shadow-2xl">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center bg-white/90 dark:bg-[#161b2a]/90 backdrop-blur-md p-4 justify-between border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back_ios_new</span>
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-lg font-bold leading-tight tracking-tight">Aprobación de Cotización</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Orden #DT-8829 • Yamaha MT-09</p>
                </div>
                <button className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">share</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto pb-48">
                {/* Active Reception Evidence */}
                <section className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-md font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">photo_library</span>
                            Evidencia de Recepción
                        </h3>
                        <span className="text-xs text-primary font-semibold">4 Fotos</span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 no-scrollbar">
                        <div className="min-w-[140px] flex flex-col gap-2">
                            <div
                                className="w-full h-32 bg-center bg-no-repeat bg-cover rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
                                title="Close up of a motorcycle engine chain wear"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCEhXHGLgiA01wuKkK1STzo25YNKwuiop5lZJJ8c6_8I1QZsrCNHaab5FRc0UKe88pzsEwIILfXn1NzQK0WZSTPs0LHzWNvZ_X17rDBV2bApH-yaiAyCPZnODqxKJdt2LSf70O4fyp3Ple23aBKSmwHaJKsOC3QFZRjS_LRBJkm8Wg6hU9dhjwA2j6DB9pMUATxsUfy29QqexXx1PR3HOB9Zm3WQ5vk9Vj8_nk29MSwDntlPH56gSGRDEdnSodwn74UgKyzg3Swdaa1")' }}
                            ></div>
                            <p className="text-[10px] text-slate-500 font-medium text-center uppercase tracking-wider">Desgaste de Cadena</p>
                        </div>
                        <div className="min-w-[140px] flex flex-col gap-2">
                            <div
                                className="w-full h-32 bg-center bg-no-repeat bg-cover rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
                                title="Close up of worn motorcycle brake pads"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA-J3OdxQsdJn7EMIuWKBStrGWXhR65QLy7GQaU3oO7Ecy3G8hV6-KAsQYZFzSXuGmYbWiEbWc9wCU46uH7TvgxHYDD4GTdEfaJ4zrWg6x2athLGMohIa8kf1oeZiFNm8gAxAumA66Yjq6U07vJvFmV7EKsj9mr7bnpAT4Jn3VTjNt7dFz75WjnGj4HSL4vF4XzEKh4BC2ihp8zM4gHm-HidaIaDUmGtBcelQhapo0rINOdwXaH_WZUrX6_Rh7sAO9SvypqNJFf0rxN")' }}
                            ></div>
                            <p className="text-[10px] text-slate-500 font-medium text-center uppercase tracking-wider">Pastillas Traseras</p>
                        </div>
                        <div className="min-w-[140px] flex flex-col gap-2">
                            <div
                                className="w-full h-32 bg-center bg-no-repeat bg-cover rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
                                title="Motorcycle dashboard showing error code lights"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDXoFuM-sNxpfSkp5Pyf7S4xZlHjEwyFcM8XP7AfyW9RLNLe9oHuekjvUO0GpsLGJaw8rSr9sG3vhGRUDWen4-1J9AIQ6-THOTPr5P3_idItFKGrMGGSM8e_dXlKeUfEO69Z-6XpkXS2JreislSkpxfTFta6tMVQnS1ebXbFv9AUGZowR02S7LfcItiRt1yDsNl9o_VpNt569K2IXSOIoxNB-6nuCK4fuY48Z4-3UWt69PSv6JM3nCwj8Ic0dE4oAIBkVAmFD8Ic06T")' }}
                            ></div>
                            <p className="text-[10px] text-slate-500 font-medium text-center uppercase tracking-wider">Diagnóstico ECU</p>
                        </div>
                    </div>
                </section>

                {/* Service Breakdown */}
                <section className="px-4 py-2">
                    <h3 className="text-md font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">list_alt</span>
                        Detalle de Servicio
                    </h3>

                    {/* Category: Spare Parts */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Repuestos</span>
                            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
                        </div>
                        <div className="space-y-3">
                            {/* Part Item 1 */}
                            <div className="flex justify-between items-start bg-slate-50 dark:bg-[#161b2a] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex-1 pr-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-semibold text-sm">Cadena DID Pro Gold 525</p>
                                        <span className="px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold whitespace-nowrap">EN STOCK</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Cadena de transmisión de alto rendimiento</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">$185.00</p>
                                    <p className="text-[10px] text-slate-500">Cant: 1</p>
                                </div>
                            </div>

                            {/* Part Item 2 */}
                            <div className="flex justify-between items-start bg-slate-50 dark:bg-[#161b2a] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex-1 pr-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-semibold text-sm">Pastillas Brembo Sinterizadas</p>
                                        <span className="px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold whitespace-nowrap">QUEDAN 2</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Kit trasero 07HO30SA</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">$64.50</p>
                                    <p className="text-[10px] text-slate-500">Cant: 1</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category: Labor */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mano de Obra y Trabajos Especiales</span>
                            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-3">
                                <div className="flex-1 pr-2">
                                    <p className="text-sm font-semibold">Instalación de Kit de Arrastre</p>
                                    <p className="text-xs text-slate-500">Estimado: 1.5 horas</p>
                                </div>
                                <p className="font-bold text-sm">$105.00</p>
                            </div>
                            <div className="flex justify-between items-center px-3">
                                <div className="flex-1 pr-2">
                                    <p className="text-sm font-semibold">Purga de Sistema de Frenos</p>
                                    <p className="text-xs text-slate-500">Mano de obra especializada</p>
                                </div>
                                <p className="font-bold text-sm">$45.00</p>
                            </div>
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="mt-8 p-5 rounded-2xl bg-primary/5 border border-primary/20">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-500 text-sm font-medium">Subtotal</span>
                            <span className="text-sm font-semibold">$399.50</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-500 text-sm font-medium">Impuesto (7%)</span>
                            <span className="text-sm font-semibold">$27.96</span>
                        </div>
                        <div className="h-[1px] bg-primary/20 my-3"></div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold">Monto Total</span>
                            <span className="text-primary text-2xl font-extrabold tracking-tight">$427.46</span>
                        </div>
                    </div>
                </section>
            </main>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-[88px] left-0 right-0 w-full max-w-md mx-auto bg-white/95 dark:bg-[#0a1214]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-4 py-4 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-40">
                <div className="flex gap-3 mb-3">
                    <button className="flex-1 h-14 flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-sm transition-all active:scale-95 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700">
                        <span className="material-symbols-outlined text-primary">forum</span>
                        Asesor por Chat
                    </button>
                    <button className="flex-[1.5] h-14 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-background-dark font-bold text-sm shadow-lg shadow-primary/30 transition-all active:scale-95">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>draw</span>
                        Aprobar y Firmar
                    </button>
                </div>
                <p className="text-[10px] text-slate-500 text-center px-4 leading-tight">
                    Al aprobar, autorizas a Dynotech Power Garage a proceder con las reparaciones especificadas.
                </p>
            </div>

            <BottomNav active="budgets" />
        </div>
    );
};

export default BudgetApproval;
