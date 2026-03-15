import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import AdminBottomNav from '../components/ui/AdminBottomNav';
import { useAuth } from '../lib/AuthContext';

const SupplierManagement = () => {
    const { currentUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [viewingOrdersSupplier, setViewingOrdersSupplier] = useState(null);
    const [viewingSupplierDetails, setViewingSupplierDetails] = useState(null);
    const [supplierOrders, setSupplierOrders] = useState([]);

    // Filtering State
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('Todos');

    // Categorías disponibles
    const CATEGORIES = ['Todos', 'Repuestos Generales', 'Lubricantes y Fluidos', 'Neumáticos', 'Accesorios'];

    // Order Creation State
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [newOrder, setNewOrder] = useState({ description: '', amount: '' });

    // Rating State
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [ratingSupplier, setRatingSupplier] = useState(null);
    const [newRating, setNewRating] = useState(0);

    const [newSupplier, setNewSupplier] = useState({
        name: '',
        category: '',
        contact: '',
        phone: '',
        email: '',
        address: ''
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        if (!currentUser?.sucursalId) return;
        setIsLoading(true);
        try {
            // Fetch Suppliers
            const qSuppliers = query(collection(db, 'suppliers'), where('sucursalId', '==', currentUser.sucursalId));
            const querySnapshot = await getDocs(qSuppliers);
            const suppliersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSuppliers(suppliersList);

            // Fetch all orders
            const qOrders = query(collection(db, 'SupplierOrders'), where('sucursalId', '==', currentUser.sucursalId));
            const ordersSnapshot = await getDocs(qOrders);
            const ordersList = ordersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSupplierOrders(ordersList);

        } catch (error) {
            console.error("Error fetching data: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSupplier = async () => {
        if (!newSupplier.name || !newSupplier.category) return;

        setIsSaving(true);
        try {
            if (editingSupplier) {
                // Update existing supplier
                const supplierRef = doc(db, 'suppliers', editingSupplier.id);
                await updateDoc(supplierRef, {
                    name: newSupplier.name,
                    category: newSupplier.category,
                    contact: newSupplier.contact,
                    phone: newSupplier.phone,
                    email: newSupplier.email,
                    address: newSupplier.address
                });

                // Update local state
                setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...newSupplier } : s));
            } else {
                // Create new supplier
                const supplierData = {
                    ...newSupplier,
                    sucursalId: currentUser.sucursalId,
                    empresaId: currentUser.empresaId,
                    status: 'active',
                    rating: 0,
                    createdAt: serverTimestamp()
                };
                const docRef = await addDoc(collection(db, 'suppliers'), supplierData);
                setSuppliers(prev => [{ id: docRef.id, ...supplierData, rating: 5.0 }, ...prev]);
            }

            // Clean up and close
            setNewSupplier({ name: '', category: '', contact: '', phone: '', email: '', address: '' });
            setEditingSupplier(null);
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Error saving supplier: ", error);
            alert("Hubo un error al guardar el proveedor.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditClick = (supplier) => {
        setEditingSupplier(supplier);
        setNewSupplier({
            name: supplier.name,
            category: supplier.category,
            contact: supplier.contact,
            phone: supplier.phone,
            email: supplier.email,
            address: supplier.address || ''
        });
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingSupplier(null);
        setNewSupplier({ name: '', category: '', contact: '', phone: '', email: '', address: '' });
    };

    const toggleSupplierStatus = async (id, currentStatus) => {

        const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            const supplierRef = doc(db, 'suppliers', id);
            await updateDoc(supplierRef, { status: nextStatus });

            // Actualizar vista local
            setSuppliers(prev => prev.map(s => s.id === id ? { ...s, status: nextStatus } : s));
        } catch (error) {
            console.error("Error updating status: ", error);
        }
    };

    const handleSaveRating = async () => {
        if (!ratingSupplier) return;
        setIsSaving(true);
        try {
            const supplierRef = doc(db, 'suppliers', ratingSupplier.id);
            await updateDoc(supplierRef, { rating: newRating });
            
            // Update local state
            setSuppliers(prev => prev.map(s => s.id === ratingSupplier.id ? { ...s, rating: newRating } : s));
            
            // If the details modal is open, we can update it too
            if (viewingSupplierDetails?.id === ratingSupplier.id) {
                setViewingSupplierDetails({ ...ratingSupplier, rating: newRating });
            }

            setIsRatingModalOpen(false);
            setRatingSupplier(null);
        } catch (error) {
            console.error("Error updating rating: ", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateOrder = async () => {
        if (!newOrder.description || !newOrder.amount || !viewingOrdersSupplier) return;

        setIsSaving(true);
        try {
            const orderData = {
                supplierId: viewingOrdersSupplier.id,
                description: newOrder.description,
                amount: parseFloat(newOrder.amount),
                status: 'pending',
                sucursalId: currentUser.sucursalId,
                empresaId: currentUser.empresaId,
                receiptNumber: null,
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'SupplierOrders'), orderData);

            // Add to local state (stubbing createdAt to current date for immediate UI)
            setSupplierOrders(prev => [{ id: docRef.id, ...orderData, createdAt: { toDate: () => new Date() } }, ...prev]);

            setNewOrder({ description: '', amount: '' });
            setIsCreatingOrder(false);
        } catch (error) {
            console.error("Error creating order:", error);
            alert("Error al generar el pedido.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleMarkOrderReceived = async (orderId) => {
        const receiptNum = window.prompt("Ingresar el Número de Remito oficial del proveedor:");
        if (receiptNum === null) return; // Cancelled
        if (receiptNum.trim() === '') {
            alert("El número de remito es obligatorio para cerrar la orden.");
            return;
        }

        try {
            const orderRef = doc(db, 'SupplierOrders', orderId);
            await updateDoc(orderRef, {
                status: 'completed',
                receiptNumber: receiptNum,
                completedAt: serverTimestamp()
            });

            // Update local state
            setSupplierOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: 'completed', receiptNumber: receiptNum } : o
            ));
        } catch (error) {
            console.error("Error marking order as received:", error);
            alert("Error al actualizar el pedido.");
        }
    };

    const filteredSuppliers = suppliers.filter(supplier => {
        const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            supplier.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategoryFilter === 'Todos' || supplier.category === activeCategoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Agrupar proveedores por categoría (útil cuando estamos en la vista "Todos")
    const groupedSuppliers = filteredSuppliers.reduce((acc, supplier) => {
        if (!acc[supplier.category]) {
            acc[supplier.category] = [];
        }
        acc[supplier.category].push(supplier);
        return acc;
    }, {});

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-transparent text-green-500 border-green-500/20 hover:bg-green-500/5';
            case 'inactive': return 'bg-transparent text-red-500 border-red-500/20 hover:bg-red-500/5';
            default: return 'bg-transparent text-slate-400 border-slate-700 hover:bg-slate-800/50';
        }
    };

    return (
        <div className="bg-[#0a0c14] text-slate-100 min-h-screen flex flex-col max-w-md mx-auto relative font-display overflow-hidden">
            {/* Carbon Pattern Background */}
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-40"
                style={{
                    backgroundColor: '#0a0c14',
                    backgroundImage: `
                        linear-gradient(45deg, #111 25%, transparent 25%), 
                        linear-gradient(-45deg, #111 25%, transparent 25%), 
                        linear-gradient(45deg, transparent 75%, #111 75%), 
                        linear-gradient(-45deg, transparent 75%, #111 75%)
                    `,
                    backgroundSize: '4px 4px'
                }}
            ></div>
            <div className="relative z-10 flex flex-col flex-1 h-screen">

                {/* Header */}
                <header className="sticky top-0 z-40 bg-[#161b2a]/80 backdrop-blur-md border-b border-slate-700/50 px-4 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <Link to="/admin" className="p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors text-primary">
                            <span className="material-symbols-outlined text-xl">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-sm font-bold leading-none text-white">Gestión de Proveedores</h1>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Control de Compras</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setEditingSupplier(null);
                            setNewSupplier({ name: '', category: '', contact: '', phone: '', email: '', address: '' });
                            setIsAddModalOpen(true);
                        }}
                        className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-[#0a0c14] shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm font-bold">add</span>
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
                    {/* Stats */}
                    <section className="flex gap-2">
                        <div className="bg-[#161b2a] flex-1 px-3 py-2 rounded-lg border border-slate-700/50 flex flex-col justify-center items-center shadow-md hover:border-primary/30 transition-colors">
                            <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                                <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider">Activos</span>
                            </div>
                            <div className="text-lg font-black text-white leading-none">{suppliers.filter(s => s.status === 'active').length}</div>
                        </div>
                        <div className="bg-[#161b2a] flex-1 px-3 py-2 rounded-lg border border-slate-700/50 flex flex-col justify-center items-center shadow-md hover:border-primary/30 transition-colors">
                            <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                                <span className="material-symbols-outlined text-[14px]">block</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider">Inactivos</span>
                            </div>
                            <div className="text-lg font-black text-red-500 leading-none">{suppliers.filter(s => s.status === 'inactive').length}</div>
                        </div>
                    </section>

                    {/* Search and Filters */}
                    <section className="space-y-4">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
                            <input
                                type="text"
                                placeholder="Buscar proveedor o categoría..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-all placeholder:text-slate-500 text-white shadow-inner"
                            />
                        </div>

                        {/* Category Chips */}
                        <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                            {CATEGORIES.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategoryFilter(category)}
                                    className={`shrink-0 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all border ${activeCategoryFilter === category
                                        ? 'bg-primary text-[#0a0c14] border-primary shadow-[0_0_15px_rgba(255,255,255,0.15)] glow-text-dark'
                                        : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700/50 hover:text-slate-300'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Provider List */}
                    <section className="space-y-3">
                        <div className="flex justify-between items-center px-1 mb-2">
                            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                {activeCategoryFilter === 'Todos' ? 'Directorio Completo' : `Categoría: ${activeCategoryFilter}`}
                            </h2>
                            <span className="text-[10px] text-slate-500 font-bold bg-[#161b2a] px-2 py-0.5 rounded-full border border-slate-700/50">
                                {filteredSuppliers.length} {filteredSuppliers.length === 1 ? 'Prov.' : 'Provs.'}
                            </span>
                        </div>

                        <div className="space-y-6">
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : filteredSuppliers.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                                    <p className="text-sm font-medium">No se encontraron proveedores</p>
                                    {activeCategoryFilter !== 'Todos' && (
                                        <button
                                            onClick={() => setActiveCategoryFilter('Todos')}
                                            className="mt-3 text-xs text-primary hover:underline font-bold"
                                        >
                                            Ver todos los proveedores
                                        </button>
                                    )}
                                </div>
                            ) : (
                                /* Grouped Rendering */
                                Object.keys(groupedSuppliers).sort().map(category => (
                                    <div key={category} className="space-y-3">
                                        {/* Category Header (Only if 'Todos' is active and there are multiple categories) */}
                                        {activeCategoryFilter === 'Todos' && (
                                            <div className="flex items-center gap-2 mt-4 first:mt-0">
                                                <div className="h-px bg-slate-700/50 flex-1"></div>
                                                <h3 className="text-[10px] text-primary/80 font-bold uppercase tracking-widest">
                                                    // {category}
                                                </h3>
                                                <div className="h-px bg-slate-700/50 flex-1"></div>
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            {groupedSuppliers[category].map(supplier => (
                                                <div key={supplier.id} className="bg-[#161b2a] rounded-xl border border-slate-700/50 p-4 transition-all hover:border-primary/30 group shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col cursor-pointer" onClick={() => setViewingSupplierDetails(supplier)}>
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-700 group-hover:bg-primary transition-colors"></div>
                                                    <div className="flex justify-between items-center mb-1 pl-2">
                                                        <div>
                                                            <h3 className="font-black text-sm text-white group-hover:text-primary transition-colors">{supplier.name}</h3>
                                                            {/* Only show category pill if we are not already filtering by it */}
                                                            {activeCategoryFilter === 'Todos' && (
                                                                <p className="inline-block mt-0.5 px-1.5 py-0.5 bg-slate-800 rounded text-[9px] text-slate-400 font-bold tracking-wide">
                                                                    {supplier.category}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleSupplierStatus(supplier.id, supplier.status);
                                                            }}
                                                            className={`relative z-10 flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-widest cursor-pointer transition-all flex-shrink-0 ${getStatusColor(supplier.status)} hover:scale-105`}
                                                        >
                                                            <span className={`w-1 h-1 rounded-full ${supplier.status === 'active' ? 'bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]'}`}></span>
                                                            {supplier.status === 'active' ? 'Activo' : 'Inact.'}
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center justify-end mt-2 pt-2 border-t border-slate-700/50">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditClick(supplier);
                                                                }}
                                                                className="h-6 px-2.5 rounded bg-slate-800 text-slate-300 text-[10px] uppercase tracking-wider font-bold hover:bg-slate-700 transition-colors border border-slate-700/50 z-10 relative"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setViewingOrdersSupplier(supplier);
                                                                }}
                                                                className="h-6 px-2.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase tracking-wider font-bold hover:bg-primary hover:text-[#0a0c14] transition-colors z-10 relative"
                                                            >
                                                                Pedidos
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </main>

                <AdminBottomNav />


            </div>

            {/* Supplier Details Modal */}
            {viewingSupplierDetails && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center bg-black/80 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
                    <div className="bg-[#161b2a] w-full max-w-md sm:rounded-3xl rounded-t-3xl border-t sm:border border-slate-700/50 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
                        {/* Header */}
                        <div className="p-5 border-b border-slate-700/50 flex items-start justify-between bg-[#0a0c14] relative overflow-hidden">
                            {/* Decorative background accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
                            
                            <div className="relative z-10">
                                <h2 className="text-xl font-black text-white">{viewingSupplierDetails.name}</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {viewingSupplierDetails.category}
                                </p>
                            </div>
                            <button
                                onClick={() => setViewingSupplierDetails(null)}
                                className="h-8 w-8 shrink-0 rounded-full bg-slate-800/80 backdrop-blur-md flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700/50 relative z-10"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-6">
                            {/* Status and Rating Row */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 bg-[#0a0c14] rounded-xl p-3 border border-slate-700/50 flex flex-col items-center justify-center">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Estado</span>
                                    <div className={`flex items-center gap-1.5 text-xs font-bold ${viewingSupplierDetails.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                                        <span className={`w-2 h-2 rounded-full ${viewingSupplierDetails.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></span>
                                        {viewingSupplierDetails.status === 'active' ? 'Proveído Activo' : 'Proveído Inactivo'}
                                    </div>
                                </div>
                                <div 
                                    className="flex-1 bg-[#0a0c14] rounded-xl p-3 border border-slate-700/50 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors group relative"
                                    onClick={() => {
                                        setRatingSupplier(viewingSupplierDetails);
                                        setNewRating(viewingSupplierDetails.rating || 0);
                                        setIsRatingModalOpen(true);
                                    }}
                                >
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-amber-500/70 transition-colors">Desempeño</span>
                                    <div className="flex items-center gap-1.5 text-amber-500 font-black">
                                        <span className="material-symbols-outlined text-[16px] group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span>{viewingSupplierDetails.rating?.toFixed(1) || 'N/A'}</span>
                                    </div>
                                    <span className="text-[7.5px] text-slate-500 font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1">Click para evaluar</span>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="bg-[#0a0c14] rounded-xl border border-slate-700/50 overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-sm">contact_page</span>
                                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Información de Contacto</h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 h-7 w-7 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
                                            <span className="material-symbols-outlined text-[14px]">person</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Representante</p>
                                            <p className="text-sm font-medium text-white">{viewingSupplierDetails.contact || 'No registrado'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 h-7 w-7 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
                                            <span className="material-symbols-outlined text-[14px]">call</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Teléfono</p>
                                            <p className="text-sm font-medium text-white">{viewingSupplierDetails.phone || 'No registrado'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 h-7 w-7 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
                                            <span className="material-symbols-outlined text-[14px]">mail</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Correo Electrónico</p>
                                            <p className="text-sm font-medium text-white">{viewingSupplierDetails.email || 'No registrado'}</p>
                                        </div>
                                    </div>
                                        <button
                                            className="flex items-start gap-3 w-full text-left group transition-all hover:bg-[#161b2a] p-2 -mx-2 rounded-xl"
                                            onClick={() => {
                                                if (viewingSupplierDetails.address) {
                                                    const formattedAddress = encodeURIComponent(viewingSupplierDetails.address);
                                                    window.open(`https://www.google.com/maps/search/?api=1&query=${formattedAddress}`, '_blank');
                                                }
                                            }}
                                            title={viewingSupplierDetails.address ? "Abrir en Google Maps" : ""}
                                            disabled={!viewingSupplierDetails.address}
                                        >
                                            <div className="mt-0.5 h-7 w-7 shrink-0 rounded-lg bg-slate-800 group-hover:bg-primary/20 flex items-center justify-center border border-slate-700 group-hover:border-primary/30 text-slate-400 group-hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Dirección</p>
                                                    {viewingSupplierDetails.address && (
                                                        <span className="material-symbols-outlined text-[12px] text-slate-500 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100">open_in_new</span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-white group-hover:text-primary transition-colors pr-4">{viewingSupplierDetails.address || 'No registrada'}</p>
                                            </div>
                                        </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="p-4 border-t border-slate-700/50 bg-[#0a0c14] flex gap-3">
                            <button
                                onClick={() => {
                                    handleEditClick(viewingSupplierDetails);
                                    setViewingSupplierDetails(null);
                                }}
                                className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                Editar
                            </button>
                            <button
                                onClick={() => {
                                    setViewingOrdersSupplier(viewingSupplierDetails);
                                    setViewingSupplierDetails(null);
                                }}
                                className="flex-1 bg-primary text-black font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,200,0,0.2)]"
                            >
                                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                                Ver Pedidos
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Supplier Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#161b2a] w-full max-w-md rounded-2xl md:rounded-3xl border border-slate-700/50 shadow-2xl shadow-primary/10 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-[#0a0c14]">
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                                </h2>
                                <p className="text-xs text-slate-400">
                                    {editingSupplier ? 'Actualizar información del directorio' : 'Registrar en el directorio'}
                                </p>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Nombre de la Empresa</label>
                                <input
                                    type="text"
                                    value={newSupplier.name}
                                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                                    placeholder="Ej. Filtros y Partes Ltda"
                                    className="w-full bg-[#0a0c14] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-white placeholder-slate-600 shadow-inner"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Categoría Principal</label>
                                <select
                                    value={newSupplier.category}
                                    onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                                    className="w-full bg-[#0a0c14] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-white font-medium appearance-none shadow-inner"
                                >
                                    <option value="" className="text-slate-500">Seleccionar categoría...</option>
                                    <option value="Repuestos Generales">Repuestos Generales</option>
                                    <option value="Lubricantes y Fluidos">Lubricantes y Fluidos</option>
                                    <option value="Neumáticos">Neumáticos</option>
                                    <option value="Accesorios">Accesorios</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Contacto Mto.</label>
                                    <input
                                        type="text"
                                        value={newSupplier.contact}
                                        onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                                        placeholder="Nombre"
                                        className="w-full bg-[#0a0c14] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-white placeholder-slate-600 shadow-inner"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        value={newSupplier.phone}
                                        onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                                        placeholder="+00 000 000"
                                        className="w-full bg-[#0a0c14] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-white placeholder-slate-600 shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={newSupplier.email}
                                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                                    placeholder="ventas@empresa.com"
                                    className="w-full bg-[#0a0c14] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-white placeholder-slate-600 shadow-inner"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Dirección Física</label>
                                <input
                                    type="text"
                                    value={newSupplier.address}
                                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                                    placeholder="Av. Ejemplo 1234, Ciudad"
                                    className="w-full bg-[#0a0c14] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-white placeholder-slate-600 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-700/50 flex gap-3 h-20 shrink-0 bg-[#0a0c14] items-center">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 bg-slate-800 text-slate-300 font-bold py-3 rounded-xl transition-all hover:bg-slate-700 border border-slate-700/50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveSupplier}
                                disabled={isSaving || !newSupplier.name || !newSupplier.category}
                                className="flex-[2] bg-primary text-[#0a0c14] font-bold py-3 rounded-xl transition-all hover:bg-primary/90 shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0a0c14]"></div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">save</span>
                                        {editingSupplier ? 'Guardar Cambios' : 'Guardar Proveedor'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Orders Modal */}
            {viewingOrdersSupplier && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center bg-black/80 backdrop-blur-sm sm:p-4">
                    <div className="bg-[#0a0c14] w-full max-w-2xl sm:rounded-3xl border-t sm:border border-slate-700/50 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-[#161b2a]">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">receipt_long</span>
                                    Panel de Pedidos
                                </h2>
                                <p className="text-xs text-slate-400 tracking-wide mt-0.5">
                                    Proveedor: <span className="text-primary font-bold">{viewingOrdersSupplier.name}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setViewingOrdersSupplier(null);
                                    setIsCreatingOrder(false);
                                }}
                                className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1 bg-[#0a0c14] custom-scrollbar">

                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-[#161b2a] border border-slate-700/50 rounded-xl p-3 flex flex-col justify-center items-center">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Pedidos</span>
                                    <span className="text-2xl font-bold text-white">
                                        {supplierOrders.filter(o => o.supplierId === viewingOrdersSupplier.id).length}
                                    </span>
                                </div>
                                <div className="bg-[#161b2a] border border-slate-700/50 rounded-xl p-3 flex flex-col justify-center items-center">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Invertido</span>
                                    <span className="text-xl font-bold text-primary">
                                        $ {supplierOrders.filter(o => o.supplierId === viewingOrdersSupplier.id && o.status === 'completed').reduce((sum, order) => sum + (order.amount || 0), 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest pl-1">Historial</h3>
                                {!isCreatingOrder && (
                                    <button
                                        onClick={() => setIsCreatingOrder(true)}
                                        className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-black font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span> Nuevo Pedido
                                    </button>
                                )}
                            </div>

                            {/* Create Order Form */}
                            {isCreatingOrder && (
                                <div className="bg-[#161b2a] rounded-xl border border-primary/30 p-4 mb-4 shadow-lg shadow-black/30">
                                    <h4 className="text-xs font-bold text-white mb-3">Emitir Orden de Compra</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Descripción del pedido (Ej. 10 Aceites Motul 10W40)"
                                                value={newOrder.description}
                                                onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
                                                className="w-full bg-[#0a0c14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                placeholder="Monto Estimado ($)"
                                                value={newOrder.amount}
                                                onChange={(e) => setNewOrder({ ...newOrder, amount: e.target.value })}
                                                className="w-full bg-[#0a0c14] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2 pt-1">
                                            <button
                                                onClick={() => setIsCreatingOrder(false)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleCreateOrder}
                                                disabled={isSaving || !newOrder.description || !newOrder.amount}
                                                className="bg-primary text-black font-bold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1 disabled:opacity-50"
                                            >
                                                {isSaving ? 'Guardando...' : 'Emitir Orden'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Orders List */}
                            <div className="space-y-2">
                                {supplierOrders.filter(o => o.supplierId === viewingOrdersSupplier.id).length === 0 ? (
                                    <div className="text-center py-6 bg-[#161b2a]/50 rounded-xl border border-slate-800">
                                        <span className="material-symbols-outlined text-slate-500 mb-1">hourglass_empty</span>
                                        <p className="text-xs text-slate-400 font-medium">No hay historial de pedidos.</p>
                                    </div>
                                ) : (
                                    supplierOrders
                                        .filter(o => o.supplierId === viewingOrdersSupplier.id)
                                        .sort((a, b) => b.createdAt?.toMillis?.() - a.createdAt?.toMillis?.() || 0)
                                        .map(order => (
                                            <div key={order.id} className="bg-[#161b2a] border border-slate-700/50 rounded-xl p-3 flex justify-between items-center group">
                                                <div>
                                                    <p className="font-bold text-sm text-white mb-0.5">{order.description}</p>
                                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                                        <span className="font-medium text-emerald-400">$ {(order.amount || 0).toLocaleString()}</span>
                                                        <span>•</span>
                                                        <span>{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('es-AR') : 'Reciente'}</span>
                                                        {order.receiptNumber && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="text-primary font-bold">Remito: {order.receiptNumber}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    {order.status === 'pending' ? (
                                                        <button
                                                            onClick={() => handleMarkOrderReceived(order.id)}
                                                            className="bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-black font-bold text-[10px] px-2 py-1 rounded-md transition-colors"
                                                        >
                                                            Marcar Recibido
                                                        </button>
                                                    ) : (
                                                        <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold text-[10px] px-2 py-1 rounded-md flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                                            Completado
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {isRatingModalOpen && ratingSupplier && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#161b2a] w-full max-w-sm rounded-3xl border border-slate-700/50 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-slate-700/50 flex flex-col items-center justify-center bg-[#0a0c14] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
                            
                            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-3 border border-amber-500/20 relative z-10">
                                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            </div>
                            <h2 className="text-lg font-black text-white relative z-10">Evaluar Desempeño</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 text-center relative z-10">
                                {ratingSupplier.name}
                            </p>
                        </div>

                        <div className="p-6 space-y-6 flex flex-col items-center">
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setNewRating(star)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <span 
                                            className={`material-symbols-outlined text-4xl transition-colors ${star <= newRating ? 'text-amber-500' : 'text-slate-700'}`}
                                            style={{ fontVariationSettings: star <= newRating ? "'FILL' 1" : "'FILL' 0" }}
                                        >
                                            star
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm font-bold text-slate-300 text-center">
                                {newRating === 0 ? 'Selecciona una calificación' : 
                                 newRating === 1 ? 'Deficiente' :
                                 newRating === 2 ? 'Regular' :
                                 newRating === 3 ? 'Aceptable' :
                                 newRating === 4 ? 'Bueno' : 'Excelente'}
                            </p>
                        </div>

                        <div className="p-4 border-t border-slate-700/50 bg-[#0a0c14] flex gap-3">
                            <button
                                onClick={() => {
                                    setIsRatingModalOpen(false);
                                    setRatingSupplier(null);
                                }}
                                className="flex-1 bg-slate-800 text-slate-300 font-bold py-3 rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveRating}
                                disabled={isSaving || newRating === 0}
                                className="flex-1 bg-amber-500 text-black font-bold py-3 rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                ) : (
                                    "Guardar"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierManagement;
