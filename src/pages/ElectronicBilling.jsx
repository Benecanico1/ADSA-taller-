import React from 'react';
import { useNavigate } from 'react-router-dom';

const ElectronicBilling = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display max-w-2xl mx-auto shadow-2xl relative">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#161b2a]/95 backdrop-blur-md flex items-center p-4 pb-3 justify-between border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="text-primary flex size-10 shrink-0 items-center justify-center -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 px-2 text-center">Pago y Facturación</h2>
                <div className="w-10"></div> {/* Spacer for centering */}
            </header>

            <main className="flex-1 pb-32">
                <div className="p-4 pt-6">
                    {/* Billing Summary */}
                    <div className="bg-white dark:bg-[#11151e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6 shadow-sm">
                        <h2 className="text-primary text-[10px] font-black uppercase tracking-widest mb-4">Resumen de Facturación</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-1">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Repuestos y Componentes</p>
                                <p className="text-slate-900 dark:text-slate-100 text-sm font-bold">$450.00</p>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Mano de Obra Especializada</p>
                                <p className="text-slate-900 dark:text-slate-100 text-sm font-bold">$120.00</p>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">IVA (19%)</p>
                                <p className="text-slate-900 dark:text-slate-100 text-sm font-bold">$108.30</p>
                            </div>
                            <div className="flex justify-between items-center pt-3">
                                <p className="text-slate-900 dark:text-slate-100 text-base font-black uppercase tracking-widest">Total a Pagar</p>
                                <p className="text-primary text-2xl font-black drop-shadow-[0_0_10px_rgba(13,204,242,0.3)]">$678.30</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <h3 className="text-slate-900 dark:text-slate-100 text-[11px] font-black uppercase tracking-widest px-1 mb-4 mt-8">Método de Pago</h3>
                    <div className="flex gap-3 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
                        <div className="flex flex-col items-center justify-center min-w-[110px] h-24 gap-y-2 rounded-2xl bg-primary/10 border-2 border-primary shadow-lg shadow-primary/10 active:scale-95 transition-transform cursor-pointer">
                            <span className="material-symbols-outlined text-primary text-3xl">credit_card</span>
                            <p className="text-primary text-xs font-bold text-center leading-tight uppercase tracking-wider">Tarjeta</p>
                        </div>
                        <div className="flex flex-col items-center justify-center min-w-[110px] h-24 gap-y-2 rounded-2xl bg-white dark:bg-[#161b2a] border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors shadow-sm active:scale-95 cursor-pointer">
                            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-3xl">account_balance</span>
                            <p className="text-slate-600 dark:text-slate-300 text-[10px] font-bold text-center leading-tight uppercase tracking-widest">Transferencia</p>
                        </div>
                        <div className="flex flex-col items-center justify-center min-w-[110px] h-24 gap-y-2 rounded-2xl bg-white dark:bg-[#161b2a] border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors shadow-sm active:scale-95 cursor-pointer">
                            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-3xl">account_balance_wallet</span>
                            <p className="text-slate-600 dark:text-slate-300 text-[10px] font-bold text-center leading-tight uppercase tracking-widest">Billetera</p>
                        </div>
                    </div>

                    {/* Electronic Billing Data */}
                    <div className="mt-8 space-y-4">
                        <h3 className="text-slate-900 dark:text-slate-100 text-[11px] font-black uppercase tracking-widest px-1">Datos de Facturación Electrónica</h3>
                        <div className="space-y-4 bg-white dark:bg-[#161b2a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="group">
                                <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 ml-1">Identificación (RUC/NIT/DNI)</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-[#111718] border border-slate-200 dark:border-slate-700/80 rounded-xl py-3 px-4 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm shadow-inner"
                                    placeholder="Ej: 1045829304"
                                    type="text"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 ml-1">Nombre Completo / Razón Social</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-[#111718] border border-slate-200 dark:border-slate-700/80 rounded-xl py-3 px-4 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm shadow-inner"
                                    placeholder="Ej: Juan Pérez o Empresa S.A.S"
                                    type="text"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 ml-1">Correo Electrónico para Factura</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-[#111718] border border-slate-200 dark:border-slate-700/80 rounded-xl py-3 px-4 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm shadow-inner"
                                    placeholder="facturacion@ejemplo.com"
                                    type="email"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 ml-1">Dirección Fiscal</label>
                                <textarea
                                    className="w-full bg-slate-50 dark:bg-[#111718] border border-slate-200 dark:border-slate-700/80 rounded-xl py-3 px-4 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm shadow-inner resize-none"
                                    placeholder="Calle 123 #45-67, Ciudad"
                                    rows="2"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-start gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                        <span className="material-symbols-outlined text-primary text-xl mt-0.5">verified_user</span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                            Sus datos están protegidos por encriptación de grado bancario para la emisión legal de su factura electrónica.
                        </p>
                    </div>
                </div>
            </main>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 w-full max-w-2xl px-6 py-5 bg-white/95 dark:bg-[#111718]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] pb-8">
                <button className="w-full bg-primary hover:bg-primary/90 text-[#101f22] font-black text-[13px] uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(13,204,242,0.4)] transition-transform active:scale-95 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined font-bold">receipt_long</span>
                    Pagar y Generar Factura
                </button>
            </div>
        </div>
    );
};

export default ElectronicBilling;
