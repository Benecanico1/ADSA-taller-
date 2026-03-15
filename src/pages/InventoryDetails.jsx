import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, query, limit } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';

const InventoryDetails = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // We only have a details page, so we just fetch the first item in the Inventory collection for demonstration.
        const q = query(collection(db, 'Inventory'), limit(1));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            if (snapshot.empty) {
                console.log("No inventory items found. Creating a dummy item...");
                const dummyRef = doc(collection(db, 'Inventory'));
                const dummyData = {
                    name: "Pastillas de Freno Brembo Sinterizadas",
                    sku: "BRM-59021-HP",
                    category: "Frenado",
                    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqGbhbkTR5zOWBmQkq0bvCFXQaaFOp1b87Bvge70HSy1Svv2Oyf4Gvps4x0EKv9ROco8AXWKIQXWuN4vGVz2F7oHzFLJl1AEX-bU1esg58eopLNEKgCIlUfuOjC2O8fgkLNlxvEmn1tPQviWnKRphvQHy6v4AG9nj89cnpAkGn_Hmw14g4ZwQN1BQq_JNSH9T_H-Qpa7iP8O_zYZCXT35UAng-c2ElgiqdL_Ji_p-_c3ngtv7gAiBMzTZv9HmhCS3Pjl1TmuKuk9Pk",
                    currentStock: 12,
                    minimumStock: 10,
                    monthlyConsumption: 42,
                    consumptionTrend: "+15%",
                    unitPrice: 85.00
                };
                await setDoc(dummyRef, dummyData);
                // The snapshot listener will trigger again automatically after creation
                return;
            }

            const docData = snapshot.docs[0];
            setItem({ id: docData.id, ...docData.data() });
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
            </div>
        );
    }

    if (!item) return null;

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display max-w-md mx-auto relative shadow-2xl">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background-light/90 dark:bg-[#161b2a]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold tracking-tight">Detalle de Repuesto</h1>
                </div>
                <button className="flex items-center justify-center p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto pb-24">
                {/* Product Hero Card */}
                <div className="p-4">
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#161b2a] mb-4 shadow-xl">
                        <img
                            alt={item.name}
                            className="w-full h-full object-cover"
                            src={item.imageUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400"}
                        />
                        {item.currentStock <= item.minimumStock && (
                            <div className="absolute top-3 right-3 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Stock Crítico
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-1">{item.name}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">SKU: {item.sku} | Categoría: {item.category}</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-[#161b2a] rounded-xl p-4 border border-slate-800 shadow-lg">
                            <p className="text-slate-400 text-xs font-medium uppercase mb-1">Stock Actual</p>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-2xl font-bold ${item.currentStock <= item.minimumStock ? 'text-orange-500' : 'text-primary'}`}>{item.currentStock}</span>
                                <span className="text-xs text-slate-500">unidades</span>
                            </div>
                        </div>
                        <div className="bg-[#161b2a] rounded-xl p-4 border border-slate-800 shadow-lg">
                            <p className="text-slate-400 text-xs font-medium uppercase mb-1">Consumo Mes</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-100">{item.monthlyConsumption}</span>
                                <span className={`text-xs font-bold ${item.consumptionTrend.startsWith('+') ? 'text-red-500' : 'text-green-500'}`}>{item.consumptionTrend}</span>
                            </div>
                        </div>
                        <div className="bg-[#161b2a] rounded-xl p-4 border border-slate-800 shadow-lg">
                            <p className="text-slate-400 text-xs font-medium uppercase mb-1">Stock Mínimo</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-100">{item.minimumStock}</span>
                            </div>
                        </div>
                        <div className="bg-[#161b2a] rounded-xl p-4 border border-slate-800 shadow-lg">
                            <p className="text-slate-400 text-xs font-medium uppercase mb-1">Precio Unitario</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-100">${Number(item.unitPrice).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Adjustment Button */}
                    {currentUser?.role === 'admin' && (
                        <button className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-4 rounded-xl flex items-center justify-center gap-2 mb-8 transition-all active:scale-95 shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined">edit_square</span>
                            Ajuste de Stock
                        </button>
                    )}

                    {/* Chart Section Placeholder */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Consumo Mensual</h3>
                            <span className="text-xs text-slate-500">Últimos 6 meses</span>
                        </div>
                        <div className="bg-[#161b2a] rounded-xl p-4 h-40 flex items-end justify-between gap-2 border border-slate-800 shadow-lg">
                            <div className="flex-1 bg-primary/20 rounded-t-lg h-1/2 relative group hover:bg-primary/40 transition-colors">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">12</div>
                            </div>
                            <div className="flex-1 bg-primary/20 rounded-t-lg h-3/4 hover:bg-primary/40 transition-colors"></div>
                            <div className="flex-1 bg-primary/20 rounded-t-lg h-2/3 hover:bg-primary/40 transition-colors"></div>
                            <div className="flex-1 bg-primary/20 rounded-t-lg h-5/6 hover:bg-primary/40 transition-colors"></div>
                            <div className="flex-1 bg-primary rounded-t-lg h-full shadow-[0_0_10px_rgba(37,209,244,0.5)] fade-in"></div>
                            <div className="flex-1 bg-primary/40 rounded-t-lg h-4/5 hover:bg-primary/60 transition-colors"></div>
                        </div>
                        <div className="flex justify-between mt-2 px-1 text-[10px] text-slate-500 uppercase font-medium">
                            <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span>
                        </div>
                    </div>

                    {/* Movement History */}
                    {currentUser?.role === 'admin' && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">Historial de Movimientos</h3>
                                <button className="text-primary text-sm font-semibold hover:underline">Ver todos</button>
                            </div>
                            <div className="space-y-3">
                                {/* Movement Item: Exit */}
                                <div className="bg-[#161b2a] border border-slate-800 rounded-xl p-4 flex items-center gap-4 shadow-lg">
                                    <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                                        <span className="material-symbols-outlined">outbox</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate uppercase">Orden de Trabajo #4502</p>
                                        <p className="text-xs text-slate-500 italic">Mecánico: Carlos Ruiz</p>
                                        <p className="text-[10px] text-slate-500 mt-1">12 Oct 2023 • 14:30</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-red-500 font-bold">-2</p>
                                        <p className="text-[10px] text-slate-500">Salida</p>
                                    </div>
                                </div>

                                {/* Movement Item: Entry */}
                                <div className="bg-[#161b2a] border border-slate-800 rounded-xl p-4 flex items-center gap-4 shadow-lg">
                                    <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                                        <span className="material-symbols-outlined">inventory_2</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate uppercase">Compra Proveedor: Brembo Latam</p>
                                        <p className="text-xs text-slate-500 italic">Factura: F-9920</p>
                                        <p className="text-[10px] text-slate-500 mt-1">08 Oct 2023 • 09:15</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-green-500 font-bold">+20</p>
                                        <p className="text-[10px] text-slate-500">Entrada</p>
                                    </div>
                                </div>

                                {/* Movement Item: Adjustment */}
                                <div className="bg-[#161b2a] border border-slate-800 rounded-xl p-4 flex items-center gap-4 shadow-lg">
                                    <div className="size-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
                                        <span className="material-symbols-outlined">build</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate uppercase">Ajuste de Inventario</p>
                                        <p className="text-xs text-slate-500 italic">Motivo: Rotura de empaque</p>
                                        <p className="text-[10px] text-slate-500 mt-1">01 Oct 2023 • 17:00</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-yellow-500 font-bold">-1</p>
                                        <p className="text-[10px] text-slate-500">Ajuste</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="fixed w-full max-w-md mx-auto bottom-0 left-0 right-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
                <div className="flex items-center justify-around h-16 mb-2">
                    <Link to="/kanban" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">home</span>
                        <span className="text-[10px] font-medium uppercase tracking-tighter">Inicio</span>
                    </Link>
                    <Link to="/inventory" className="flex flex-col items-center gap-1 text-primary">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                        <span className="text-[10px] font-medium uppercase tracking-tighter">Inventario</span>
                    </Link>
                    <Link to="/commissions" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">payments</span>
                        <span className="text-[10px] font-medium uppercase tracking-tighter">Liquidación</span>
                    </Link>
                    <Link to="/settings" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">settings</span>
                        <span className="text-[10px] font-medium uppercase tracking-tighter">Ajustes</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
};

export default InventoryDetails;
