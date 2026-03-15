import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../lib/CartContext';
import { useAuth } from '../lib/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { appConfig } from '../config';

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, cartTotalPrice, cartTotalItems, clearCart } = useCart();
    const { currentUser } = useAuth();
    
    // Using Garage Phone for WhatsApp confirmation
    const garagePhone = appConfig.supportPhone || "5491100000000";

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: currentUser?.displayName || '',
        email: currentUser?.email || '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        paymentMethod: 'whatsapp_transfer' // default
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        
        if (cartTotalItems === 0) {
            alert("Tu carrito está vacío.");
            return;
        }

        setLoading(true);
        try {
            // 1. Prepare order object
            const orderData = {
                userId: currentUser?.uid || 'guest',
                customerData: formData,
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    sku: item.sku || 'N/A',
                    salePrice: item.salePrice,
                    quantity: item.quantity,
                    imageUrl: item.imageUrl || null
                })),
                totals: {
                    itemsCount: cartTotalItems,
                    totalPrice: cartTotalPrice
                },
                empresaId: currentUser?.empresaId || 'default',
                sucursalId: currentUser?.sucursalId || 'default',
                status: 'pending',
                createdAt: serverTimestamp(),
            };

            // 2. Save to Firestore MarketplaceOrders collection
            const docRef = await addDoc(collection(db, 'MarketplaceOrders'), orderData);
            const orderId = docRef.id;

            // 3. Generate WhatsApp message string
            let wpMessage = `*NUEVO PEDIDO TIENDA ${appConfig.appName.toUpperCase()}*\n`;
            wpMessage += `*Orden ID:* ${orderId.substring(0,6).toUpperCase()}\n\n`;
            wpMessage += `*Cliente:* ${formData.fullName}\n`;
            wpMessage += `*Email:* ${formData.email}\n`;
            wpMessage += `*Tel:* ${formData.phone}\n`;
            wpMessage += `*Envío:* ${formData.address}, ${formData.city} (${formData.zipCode})\n\n`;
            wpMessage += `*PRODUCTOS:*\n`;
            
            cart.forEach(item => {
                wpMessage += `- ${item.quantity}x ${item.name} ($${Number(item.salePrice * item.quantity).toLocaleString()})\n`;
            });
            
            wpMessage += `\n*TOTAL:* $${Number(cartTotalPrice).toLocaleString()}\n`;
            wpMessage += `*Método de Pago Preferido:* Transferencia/Acordar por este medio\n\n`;
            wpMessage += `¡Hola! Acabo de realizar este pedido en su página web. Aguardo confirmación.`;

            // 4. Clear Cart
            clearCart();

            // 5. Open WhatsApp and Navigate user to success/dashboard
            window.open(`https://wa.me/${garagePhone}?text=${encodeURIComponent(wpMessage)}`, '_blank');
            navigate('/dashboard', { state: { orderSuccess: true, orderId } });

        } catch (error) {
            console.error("Error al procesar el checkout:", error);
            alert("Hubo un error al procesar tu pedido. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    if (cartTotalItems === 0) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col items-center justify-center p-6 font-display overflow-x-hidden">
                <span className="material-symbols-outlined text-[80px] text-slate-700/50 mb-6">production_quantity_limits</span>
                <h2 className="text-2xl font-black text-white mb-2">Tu carrito está vacío</h2>
                <p className="text-slate-400 mb-8 text-center max-w-md">No tienes productos en el carrito actualmente. Vuelve a la tienda para agregar repuestos y accesorios.</p>
                <button 
                    onClick={() => navigate('/tienda')}
                    className="bg-primary hover:bg-primary-hover text-[#0a0c10] font-black uppercase tracking-widest px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(255,40,0,0.3)] transition-all"
                >
                    Volver a la Tienda
                </button>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-100 font-display min-h-screen relative pb-20 overflow-x-hidden">
            <header className="sticky top-0 z-50 flex items-center bg-background-dark/95 backdrop-blur-md border-b border-border-dark p-4 justify-between">
                <div 
                    className="flex items-center gap-2 cursor-pointer" 
                    onClick={() => navigate('/tienda')}
                >
                    <span className="material-symbols-outlined text-primary text-2xl">arrow_back</span>
                    <h2 className="text-slate-100 text-lg font-bold">Volver a Tienda</h2>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8 relative z-20">
                <h1 className="text-3xl md:text-4xl font-black text-white mb-8 tracking-tight">Checkout Pedido</h1>
                
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Left Col: Forms */}
                    <div className="flex-1 space-y-8">
                        <form id="checkout-form" onSubmit={handleCheckout} className="bg-[#121826]/80 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-6 md:p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary">
                                <span className="material-symbols-outlined">person</span>
                                Datos de Contacto y Envío
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nombre Completo *</label>
                                    <input 
                                        type="text" 
                                        name="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email *</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Teléfono/Celular *</label>
                                    <input 
                                        type="tel" 
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                        placeholder="Ej: 1112345678"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dirección de Envío *</label>
                                    <input 
                                        type="text" 
                                        name="address"
                                        required
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                        placeholder="Calle, Número, Piso/Depto"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ciudad/Localidad *</label>
                                    <input 
                                        type="text" 
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Código Postal *</label>
                                    <input 
                                        type="text" 
                                        name="zipCode"
                                        required
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    />
                                </div>
                            </div>
                        </form>

                        <div className="bg-[#121826]/80 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-6 md:p-8">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                                <span className="material-symbols-outlined">payments</span>
                                Método de Pago
                            </h2>
                            <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl mb-4">
                                <p className="text-sm text-emerald-400/90 leading-relaxed font-medium">
                                    El pago será coordinado directamente por WhatsApp. Te emitiremos un comprobante y te indicaremos cómo transferir o concretar el pago y coordinar el envío o retiro en el taller.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Summary */}
                    <div className="w-full lg:w-96">
                        <div className="bg-[#161b2a] border border-primary/20 rounded-3xl sticky top-24 overflow-hidden">
                            <div className="bg-primary/5 p-6 border-b border-primary/10">
                                <h3 className="text-lg font-black text-white">Resumen de Pedido</h3>
                            </div>
                            
                            <div className="p-6 max-h-[40vh] overflow-y-auto space-y-4">
                                {cart.map(item => (
                                    <div key={item.id} className="flex justify-between items-start pb-4 border-b border-slate-800/60 last:border-0 last:pb-0">
                                        <div className="flex-1 pr-4">
                                            <p className="text-sm font-bold text-slate-200 line-clamp-2">{item.name}</p>
                                            <p className="text-xs text-slate-500 mt-1">Cant: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-black text-slate-100">${Number(item.salePrice * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-[#0a0c10] border-t border-slate-800">
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Subtotal ({cartTotalItems} items)</p>
                                    <p className="text-xl font-black text-white">${Number(cartTotalPrice).toLocaleString()}</p>
                                </div>
                                <button 
                                    form="checkout-form"
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary-hover border border-primary text-[#0a0c10] font-black uppercase tracking-widest px-4 py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,40,0,0.3)] hover:shadow-[0_0_30px_rgba(255,40,0,0.5)] transition-all disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            Confirmar Pedido
                                            <span className="material-symbols-outlined text-lg">call_made</span>
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-xs text-slate-500 mt-4 leading-relaxed font-medium">Al confirmar, se guardará tu pedido y serás redirigido a WhatsApp para coordinar el pago.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Checkout;
