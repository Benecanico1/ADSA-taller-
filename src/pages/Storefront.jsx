import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCart } from '../lib/CartContext';

const Storefront = () => {
    const navigate = useNavigate();
    const { cart, addToCart, removeFromCart, updateQuantity, cartTotalPrice, cartTotalItems } = useCart();
    
    const [activeTab, setActiveTab] = useState('parts'); // 'parts' or 'motos'
    const [items, setItems] = useState([]);
    const [motos, setMotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isCartOpen, setIsCartOpen] = useState(false);

    const garagePhone = "5491100000000"; // Define the garage's WhatsApp number

    useEffect(() => {
        const fetchPublicData = async () => {
            setLoading(true);
            try {
                // Fetch public inventory
                const invQuery = query(collection(db, 'Inventory'), where('isPublic', '==', true));
                const invSnapshot = await getDocs(invQuery);
                const publicItems = [];
                invSnapshot.forEach(doc => {
                    publicItems.push({ id: doc.id, ...doc.data() });
                });

                // Fetch public motorcycles
                const motoQuery = query(collection(db, 'Motorcycles'), where('isPublic', '==', true));
                const motoSnapshot = await getDocs(motoQuery);
                const publicMotos = [];
                motoSnapshot.forEach(doc => {
                    publicMotos.push({ id: doc.id, ...doc.data() });
                });

                setItems(publicItems);
                setMotos(publicMotos);
            } catch (error) {
                console.error("Error fetching public data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicData();
    }, []);

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', ...new Set(items.map(item => item.category).filter(Boolean))];

    const filteredMotos = motos.filter(moto => 
        moto.brand?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        moto.model?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleWhatsAppInquiry = (product, isMoto = false) => {
        let text = "";
        if (isMoto) {
            text = `Hola adsa_taller, vengo de la página web. Quería consultar por la moto en venta: ${product.brand} ${product.model} (${product.year}).`;
        } else {
            text = `Hola adsa_taller, vengo de la página web. Me interesa el producto: ${product.name} (SKU: ${product.sku || 'N/A'}).`;
        }
        const encodedText = encodeURIComponent(text);
        window.open(`https://wa.me/${garagePhone}?text=${encodedText}`, '_blank');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen relative pb-20 overflow-x-hidden">
            {/* Header / Navigation */}
            <header className="sticky top-0 z-50 flex items-center bg-background-dark/95 backdrop-blur-md border-b border-border-dark p-4 justify-between">
                <div 
                    className="flex items-center gap-2 cursor-pointer" 
                    onClick={() => navigate('/')}
                >
                    <span className="material-symbols-outlined text-primary text-3xl">precision_manufacturing</span>
                    <h2 className="text-slate-100 text-lg font-bold leading-tight tracking-tight hidden sm:block">{appConfig.companyName}</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2 text-slate-300 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-2xl">shopping_cart</span>
                        {cartTotalItems > 0 && (
                            <span className="absolute top-0 right-0 bg-primary text-[#0a0c10] text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-background-dark">
                                {cartTotalItems}
                            </span>
                        )}
                    </button>
                    <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-colors font-bold text-sm">
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        <span className="uppercase tracking-widest hidden sm:inline">Mi Cuenta</span>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-16 px-6 bg-[#0a0c10] border-b border-border-dark overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent z-10"></div>
                </div>
                <div className="max-w-7xl mx-auto relative z-20 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-6 text-primary">
                        <span className="material-symbols-outlined text-sm">storefront</span>
                        <span className="text-xs font-black uppercase tracking-widest">Store Oficial</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
                        Catálogo <span className="text-primary italic">Premium</span>
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto leading-relaxed">
                        Explora nuestra selección de repuestos, accesorios de alto rendimiento y motocicletas verificadas por nuestros expertos. Calidad garantizada.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8 relative z-20">
                {/* Controls (Search & Tabs) */}
                <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-10">
                    {/* Tabs */}
                    <div className="flex bg-[#161b2a] border border-slate-800 rounded-xl p-1 w-full md:w-auto">
                        <button 
                            onClick={() => setActiveTab('parts')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'parts' ? 'bg-primary text-[#0a0c10] shadow-[0_0_15px_rgba(255,40,0,0.3)]' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <span className="material-symbols-outlined text-[18px]">build_circle</span>
                            Repuestos
                        </button>
                        <button 
                            onClick={() => setActiveTab('motos')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'motos' ? 'bg-primary text-[#0a0c10] shadow-[0_0_15px_rgba(255,40,0,0.3)]' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
                            Motocicletas
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-80 group mt-4 md:mt-0">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            type="text"
                            placeholder="Buscar en el catálogo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#161b2a] border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-slate-500"
                        />
                    </div>
                </div>

                {/* Category Filters for Parts */}
                {activeTab === 'parts' && categories.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-6 custom-scrollbar hide-scrollbar">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                                    selectedCategory === category 
                                        ? 'bg-primary/20 text-primary border border-primary/30' 
                                        : 'bg-[#161b2a] text-slate-400 border border-slate-800 hover:bg-slate-800'
                                }`}
                            >
                                {category === 'All' ? 'Todas las Categorías' : category}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 min-h-[300px]">
                        <span className="material-symbols-outlined animate-spin text-primary text-5xl mb-4">sync</span>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm animate-pulse">Cargando catálogo...</p>
                    </div>
                ) : activeTab === 'parts' ? (
                    filteredItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredItems.map(item => (
                                <div key={item.id} className="bg-[#121826]/80 backdrop-blur-xl border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl flex flex-col group hover:border-primary/40 transition-all hover:-translate-y-1">
                                    <div className="h-48 bg-slate-900 border-b border-slate-800/60 flex items-center justify-center relative overflow-hidden group-hover:bg-[#161b2a] transition-colors">
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <span className="material-symbols-outlined text-[80px] text-slate-700/50 group-hover:text-primary/20 transition-colors" style={{ fontVariationSettings: "'wght' 200" }}>{item.icon || 'inventory_2'}</span>
                                        )}
                                        {item.category && (
                                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-slate-700 text-xs px-2 py-1 rounded text-slate-300 font-bold uppercase tracking-wider shadow-sm">
                                                {item.category}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow relative">
                                        <div className="mb-2">
                                            <h3 className="text-lg font-black text-slate-100 leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">{item.name}</h3>
                                            {item.sku && <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">SKU: {item.sku}</p>}
                                        </div>
                                        <p className="text-xs text-slate-400 font-light leading-relaxed mb-6 line-clamp-3">
                                            {item.description || "Sin descripción adicional."}
                                        </p>
                                        <div className="mt-auto pt-4 border-t border-slate-800/60 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Precio</span>
                                                <span className="text-xl font-black text-white">${Number(item.salePrice).toLocaleString()}</span>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    addToCart(item);
                                                    setIsCartOpen(true);
                                                }}
                                                className="bg-primary/10 hover:bg-primary border border-primary/30 hover:border-primary text-primary hover:text-[#0a0c10] size-10 rounded-xl flex items-center justify-center transition-all shadow-[0_0_15px_rgba(255,40,0,0)] hover:shadow-[0_0_20px_rgba(255,40,0,0.4)]"
                                                title="Agregar al Carrito"
                                            >
                                                <span className="material-symbols-outlined">add_shopping_cart</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-[#121826]/50 border border-slate-800/50 rounded-3xl">
                            <span className="material-symbols-outlined text-[60px] text-slate-700 mb-4">search_off</span>
                            <h3 className="text-xl font-bold text-slate-300">No se encontraron productos</h3>
                            <p className="text-slate-500 mt-2">Intenta modificar los filtros de búsqueda.</p>
                        </div>
                    )
                ) : (
                    filteredMotos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {filteredMotos.map(moto => (
                                <div key={moto.id} className="bg-[#121826]/80 backdrop-blur-xl border border-slate-800/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col group hover:border-primary/40 transition-all hover:-translate-y-1">
                                    <div className="h-64 bg-slate-900 relative overflow-hidden">
                                        {moto.imageUrl ? (
                                            <img src={moto.imageUrl} alt={`${moto.brand} ${moto.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[80px] text-slate-700/50" style={{ fontVariationSettings: "'wght' 200" }}>two_wheeler</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#121826] via-[#121826]/40 to-transparent"></div>
                                        <div className="absolute top-4 left-4 bg-primary/90 text-[#0a0c10] text-xs font-black px-3 py-1.5 rounded-lg shadow-lg uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
                                            <span className="material-symbols-outlined text-[14px]">sell</span>
                                            En Venta
                                        </div>
                                    </div>
                                    <div className="p-6 md:p-8 flex flex-col flex-grow relative -mt-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-2xl font-black text-white leading-none mb-1 group-hover:text-primary transition-colors">{moto.brand} <span className="font-light">{moto.model}</span></h3>
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Año {moto.year}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="flex items-center gap-1.5 text-slate-300 text-sm font-medium">
                                                <span className="material-symbols-outlined text-primary text-[18px]">speed</span>
                                                {Number(moto.mileage).toLocaleString()} km
                                            </div>
                                        </div>

                                        <div className="bg-[#161b2a] p-4 rounded-xl border border-slate-800 mb-6 flex-grow">
                                            <p className="text-sm text-slate-300 font-light leading-relaxed whitespace-pre-line line-clamp-4">
                                                {moto.description || "Vehículo en excelentes condiciones, listo para transferir."}
                                            </p>
                                        </div>
                                        
                                        <div className="mt-auto pt-2 flex flex-col gap-4">
                                            <div className="flex items-end justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Precio Sugerido</span>
                                                    <span className="text-3xl font-black text-emerald-400">${Number(moto.salePrice || 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleWhatsAppInquiry(moto, true)}
                                                className="w-full h-14 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-600/30 hover:border-emerald-600 text-emerald-500 hover:text-white rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(5,150,105,0)] hover:shadow-[0_0_30px_rgba(5,150,105,0.4)]"
                                            >
                                                <span className="material-symbols-outlined text-lg">chat</span>
                                                Consultar por Vehículo
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-[#121826]/50 border border-slate-800/50 rounded-3xl">
                            <span className="material-symbols-outlined text-[60px] text-slate-700 mb-4">two_wheeler</span>
                            <h3 className="text-xl font-bold text-slate-300">Sin vehículos en venta</h3>
                            <p className="text-slate-500 mt-2">Pronto publicaremos motocicletas verificadas.</p>
                        </div>
                    )
                )}
            </main>

            {/* Cart Slide-over */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-[#121826] border-l border-slate-800 shadow-2xl flex flex-col h-full transform transition-transform duration-300 translate-x-0">
                        <div className="flex items-center justify-between p-6 border-b border-slate-800/60">
                            <h2 className="text-xl font-black text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">shopping_cart</span>
                                Tu Carrito
                            </h2>
                            <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                    <span className="material-symbols-outlined text-5xl mb-4 opacity-50">remove_shopping_cart</span>
                                    <p className="font-medium text-sm">Tu carrito está vacío</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="size-20 bg-slate-900 rounded-xl border border-slate-800/60 flex items-center justify-center overflow-hidden shrink-0">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-slate-700">inventory_2</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-between flex-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="text-sm font-bold text-slate-200 line-clamp-2 leading-snug">{item.name}</h4>
                                                <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-red-500 transition-colors shrink-0">
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-end mt-2">
                                                <div className="flex items-center gap-3 bg-[#161b2a] border border-slate-800 rounded-lg px-2 py-1">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-slate-400 hover:text-white">
                                                        <span className="material-symbols-outlined text-[16px]">remove</span>
                                                    </button>
                                                    <span className="text-xs font-bold text-slate-200 w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-slate-400 hover:text-white">
                                                        <span className="material-symbols-outlined text-[16px]">add</span>
                                                    </button>
                                                </div>
                                                <span className="font-black text-primary">${Number(item.salePrice * item.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 border-t border-slate-800 bg-[#0a0c10]">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Total</span>
                                    <span className="text-2xl font-black text-white">${Number(cartTotalPrice).toLocaleString()}</span>
                                </div>
                                <button 
                                    onClick={() => navigate('/checkout')}
                                    className="w-full bg-primary hover:bg-primary-hover text-[#0a0c10] font-black uppercase tracking-widest text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,40,0,0.3)] hover:shadow-[0_0_30px_rgba(255,40,0,0.5)]"
                                >
                                    Iniciar Compra
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Storefront;
