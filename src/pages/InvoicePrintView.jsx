import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { appConfig } from '../config';

const InvoicePrintView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [invoiceData, setInvoiceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const docRef = doc(db, 'Appointments', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setInvoiceData({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError('Factura no encontrada.');
                }
            } catch (err) {
                console.error("Error fetching invoice:", err);
                setError('Error al cargar la factura.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchInvoice();
        }
    }, [id]);

    useEffect(() => {
        if (!loading && invoiceData && !error) {
            // Wait for images/fonts to render before printing
            const timer = setTimeout(() => {
                window.print();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [loading, invoiceData, error]);

    if (loading) {
        return <div className="p-10 text-center font-display">Cargando documento...</div>;
    }

    if (error || !invoiceData) {
        return (
            <div className="p-10 text-center font-display text-red-600">
                <h2>{error}</h2>
                <button onClick={() => navigate(-1)} className="mt-4 underline">Volver</button>
            </div>
        );
    }

    // Calculations
    const totalParts = (invoiceData.budgetItems || []).reduce((acc, item) => {
        if (item.category !== 'Mano de Obra') {
            return acc + (parseFloat(item.price) * parseInt(item.quantity || 1));
        }
        return acc;
    }, 0);

    const totalLabor = (invoiceData.budgetItems || []).reduce((acc, item) => {
        if (item.category === 'Mano de Obra') {
            return acc + (parseFloat(item.price) * parseInt(item.quantity || 1));
        }
        return acc;
    }, 0);

    const subtotal = totalParts + totalLabor;
    const dateFormatted = invoiceData.updatedAt || invoiceData.date 
        ? new Date(invoiceData.updatedAt || invoiceData.date).toLocaleDateString('es-AR')
        : new Date().toLocaleDateString('es-AR');

    // Simulate AFIP Data if not present
    const afipMock = invoiceData.afipData || {
        invoiceNumber: `0001-${Math.floor(Math.random() * 90000000).toString().padStart(8, '0')}`,
        cae: (Math.floor(Math.random() * 90000000000000) + 10000000000000).toString(),
        documentNumber: invoiceData.clientDni || '99.999.999',
    };

    return (
        <div className="bg-white text-black min-h-screen font-sans">
            {/* Screen-only back button */}
            <div className="print:hidden p-4 bg-slate-100 border-b flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="text-slate-600 font-bold flex items-center gap-2 hover:text-black">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Volver
                </button>
                <button onClick={() => window.print()} className="bg-black text-white px-4 py-2 rounded font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined">print</span>
                    Imprimir de nuevo
                </button>
            </div>

            {/* Print Container: A4 Dimensions approx */}
            <div className="max-w-3xl mx-auto p-8 sm:p-12 print:p-0 print:max-w-none bg-white">
                
                {/* Header Row */}
                <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                    {/* Left: Logo/Company */}
                    <div className="w-1/3">
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">{appConfig.companyName}</h1>
                        <div className="mt-4 text-[10px] leading-tight text-slate-600">
                            <p>Av. Siempre Viva 123, CABA</p>
                            <p>Tel: {appConfig.supportPhone}</p>
                            <p>{appConfig.supportEmail}</p>
                            <p className="mt-2 font-bold text-black">IVA Responsable Inscripto</p>
                        </div>
                    </div>

                    {/* Middle: Document Letter */}
                    <div className="flex flex-col items-center justify-start w-1/3 mt-2">
                        <div className="border border-black flex flex-col items-center justify-center size-14 mb-1 bg-white">
                            <span className="text-3xl font-black leading-none">C</span>
                        </div>
                        <span className="text-[8px] font-bold text-slate-500">COD. 011</span>
                    </div>

                    {/* Right: Invoice Meta */}
                    <div className="w-1/3 text-right">
                        <h2 className="text-xl font-bold uppercase tracking-tight mb-2">Factura</h2>
                        <div className="text-xs mb-1">
                            <span className="font-bold mr-2 text-slate-500">Nº</span> 
                            <span className="font-mono">{afipMock.invoiceNumber}</span>
                        </div>
                        <div className="text-xs mb-4">
                            <span className="font-bold mr-2 text-slate-500">Fecha</span> 
                            <span className="font-mono">{dateFormatted}</span>
                        </div>
                        <div className="text-[10px] leading-tight text-slate-600">
                            <p><span className="font-bold text-slate-800">CUIT:</span> 30-71649281-9</p>
                            <p><span className="font-bold text-slate-800">Ingresos Brutos:</span> 901-234567-8</p>
                            <p><span className="font-bold text-slate-800">Inicio de Actividades:</span> 01/01/2023</p>
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="flex justify-between items-start mb-8 text-sm">
                    <div className="w-2/3">
                        <p className="mb-1"><span className="font-bold text-slate-500 inline-block w-20">Sr/a:</span> <span className="font-bold uppercase">{invoiceData.clientName || 'Consumidor Final'}</span></p>
                        <p className="mb-1"><span className="font-bold text-slate-500 inline-block w-20">Domicilio:</span> <span>{invoiceData.clientAddress || 'No especificado'}</span></p>
                        <p className="mb-1"><span className="font-bold text-slate-500 inline-block w-20">Cond. IVA:</span> <span>Consumidor Final</span></p>
                    </div>
                    <div className="w-1/3 text-right">
                        <p className="mb-1"><span className="font-bold text-slate-500 mr-2">DNI/CUIT:</span> <span className="font-mono">{afipMock.documentNumber}</span></p>
                        <p className="mb-1"><span className="font-bold text-slate-500 mr-2">Cond. Venta:</span> <span>Contado</span></p>
                    </div>
                </div>

                {/* Vehicle Target (Optional Context) */}
                <div className="mb-6 p-2 bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-600 uppercase mr-2">Vehículo Ref:</span> 
                    <span className="uppercase">{invoiceData.vehicle?.brand} {invoiceData.vehicle?.model} - Dom: {invoiceData.vehicle?.plate || 'S/P'} (OT #{invoiceData.id.slice(-4).toUpperCase()})</span>
                </div>

                {/* Line Items Table */}
                <div className="mb-8">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b-2 border-slate-300">
                                <th className="py-2 w-16 text-center font-bold text-slate-500 uppercase text-xs">Cant.</th>
                                <th className="py-2 font-bold text-slate-500 uppercase text-xs">Descripción</th>
                                <th className="py-2 w-24 text-right font-bold text-slate-500 uppercase text-xs">P. Unit</th>
                                <th className="py-2 w-28 text-right font-bold text-slate-500 uppercase text-xs">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {/* Budget Items */}
                            {(invoiceData.budgetItems || []).map((item, idx) => {
                                const qty = parseInt(item.quantity || 1);
                                const price = parseFloat(item.price);
                                return (
                                    <tr key={`item-${idx}`}>
                                        <td className="py-3 text-center align-top">{qty}</td>
                                        <td className="py-3 pr-4 align-top">
                                            <p className="font-semibold">{item.name}</p>
                                            {item.sku && <p className="text-[10px] text-slate-400 font-mono mt-0.5">Cod: {item.sku}</p>}
                                        </td>
                                        <td className="py-3 text-right align-top">${price.toFixed(2)}</td>
                                        <td className="py-3 text-right align-top font-semibold">${(qty * price).toFixed(2)}</td>
                                    </tr>
                                );
                            })}

                            {/* Optional: Add a note if no items exist */}
                            {(!invoiceData.budgetItems || invoiceData.budgetItems.length === 0) && (
                                <tr>
                                    <td colSpan="4" className="py-4 text-center text-slate-500 italic text-xs">Sin detalle de ítems registrados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Totals Box */}
                <div className="flex justify-end mb-12">
                    <div className="w-64">
                        <div className="flex justify-between py-1 text-sm">
                            <span className="text-slate-600">Subtotal Repuestos:</span>
                            <span>${totalParts.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-1 text-sm border-b border-slate-200 mb-2 pb-2">
                            <span className="text-slate-600">Subtotal Servicios:</span>
                            <span>${totalLabor.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 text-xl font-black items-end">
                            <span className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-1">Total a Pagar</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* AFIP Footer */}
                <div className="flex items-end justify-between border-t border-slate-300 pt-6 mt-auto">
                   <div className="flex gap-4 items-center">
                        {/* Mock QR */}
                        <div className="size-24 border-2 border-black p-1">
                             <div className="w-full h-full flex flex-wrap opacity-80" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cpath fill=\'%23000\' d=\'M10,10 h30 v30 h-30 z M50,10 h40 v10 h-40 z M60,30 h30 v10 h-30 z M10,60 h30 v30 h-30 z M50,50 h10 v20 h-10 z M70,50 h20 v20 h-20 z M50,80 h40 v10 h-40 z\'/%3E%3C/svg%3E")', backgroundSize: 'cover' }}></div>
                        </div>
                        <div>
                            <p className="text-2xl font-black italic tracking-tighter leading-none mb-1">AFIP</p>
                            <p className="text-[10px] font-bold">Comprobante Autorizado</p>
                            <p className="text-[9px] text-slate-500">Esta administración no se responsabiliza por los datos consignados.</p>
                        </div>
                   </div>
                   <div className="text-right">
                        <p className="font-bold text-[10px] text-slate-500 uppercase tracking-widest mb-1">C.A.E. Nº</p>
                        <p className="font-mono font-bold">{afipMock.cae}</p>
                        <p className="font-bold text-[10px] text-slate-500 uppercase tracking-widest mt-2 mb-1">Fecha Vto. C.A.E.</p>
                        <p className="font-mono text-sm">{new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR')}</p>
                   </div>
                </div>

            </div>
        </div>
    );
};

export default InvoicePrintView;
