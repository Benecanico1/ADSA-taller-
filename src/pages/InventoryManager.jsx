import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { appConfig } from '../config';
import { addAuditLog } from '../utils/auditLogger';
import AdminBottomNav from '../components/ui/AdminBottomNav';

const InventoryManager = () => {
    const { currentUser } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [selectedIconFilter, setSelectedIconFilter] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef(null);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Repuesto',
        sku: '',
        purchasePrice: '',
        salePrice: '',
        currentStock: '',
        minStock: '5', // Default min stock
        supplierEmail: '', // optional direct supplier email
        icon: 'inventory_2',
        isPublic: false
    });
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

    const ITEM_ICONS = [
        { id: 'oil_barrel', name: 'Aceite', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30 hover:border-amber-500' },
        { id: 'filter_alt', name: 'Filtro', color: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-300/30 hover:border-slate-300' },
        { id: 'album', name: 'Frenos', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30 hover:border-red-500' },
        { id: 'settings', name: 'Repuesto', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30 hover:border-blue-500' },
        { id: 'tire_repair', name: 'Neumático', color: 'text-zinc-400', bg: 'bg-zinc-400/10', border: 'border-zinc-400/30 hover:border-zinc-400' },
        { id: 'cleaning_services', name: 'Consumible', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30 hover:border-emerald-500' },
        { id: 'handyman', name: 'Mano de Obra', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30 hover:border-purple-500' },
        { id: 'inventory_2', name: 'Otro', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/30 hover:border-slate-400' },
    ];

    // Bulk Update State
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkData, setBulkData] = useState({
        category: '',
        percentage: ''
    });
    const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);

    useEffect(() => {
        if (!currentUser?.sucursalId) return;
        const q = query(collection(db, 'Inventory'), where('sucursalId', '==', currentUser.sucursalId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const inventoryData = [];
            snapshot.forEach((doc) => {
                inventoryData.push({ id: doc.id, ...doc.data() });
            });
            setItems(inventoryData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser?.sucursalId]);

    // Scanner Logic
    useEffect(() => {
        if (isScanning && !scannerRef.current) {
            scannerRef.current = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: { width: 250, height: 150 }, rememberLastUsedCamera: true },
                /* verbose= */ false
            );

            scannerRef.current.render(
                (decodedText) => {
                    // Success callback
                    setFormData(prev => ({ ...prev, sku: decodedText }));
                    setIsScanning(false); // Auto close

                    // Cleanup Scanner instance
                    if (scannerRef.current) {
                        scannerRef.current.clear().catch(console.error);
                        scannerRef.current = null;
                    }
                },
                (errorMessage) => {
                    // Ignore constant errors from video stream reading
                }
            );
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
                scannerRef.current = null;
            }
        };
    }, [isScanning]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name || '',
                description: item.description || '',
                category: item.category || 'Repuesto',
                sku: item.sku || '',
                purchasePrice: item.purchasePrice || '',
                salePrice: item.salePrice || '',
                currentStock: item.currentStock || '',
                minStock: item.minStock || '5',
                supplierEmail: item.supplierEmail || '',
                icon: item.icon || 'inventory_2',
                isPublic: item.isPublic || false
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                description: '',
                category: 'Repuesto',
                sku: '',
                purchasePrice: '',
                salePrice: '',
                currentStock: '',
                minStock: '5',
                supplierEmail: '',
                icon: 'inventory_2',
                isPublic: false
            });
        }
        setIsModalOpen(true);
        setIsScanning(false); // reset state on open
    };

    const handleSaveItem = async (e) => {
        e.preventDefault();

        const itemData = {
            ...formData,
            purchasePrice: parseFloat(formData.purchasePrice) || 0,
            salePrice: parseFloat(formData.salePrice) || 0,
            currentStock: formData.category !== 'Mano de Obra' ? (parseInt(formData.currentStock) || 0) : null,
            minStock: formData.category !== 'Mano de Obra' ? (parseInt(formData.minStock) || 5) : null,
            isPublic: formData.isPublic || false,
            updatedAt: serverTimestamp()
        };

        try {
            if (editingItem) {
                const docRef = doc(db, 'Inventory', editingItem.id);
                await updateDoc(docRef, itemData);
            } else {
                itemData.createdAt = serverTimestamp();
                itemData.sucursalId = currentUser.sucursalId;
                itemData.empresaId = currentUser.empresaId;
                await addDoc(collection(db, 'Inventory'), itemData);
            }
            await addAuditLog(`Ítem ${editingItem ? 'actualizado' : 'creado'}: ${itemData.name}`, 'inventory', currentUser.email, currentUser.empresaId, currentUser.sucursalId);
            setIsModalOpen(false);
            setIsScanning(false);
        } catch (error) {
            console.error("Error saving inventory item:", error);
            alert("Error al guardar el ítem.");
        }
    };

    const handleGenerateDescription = async () => {
        if (!formData.name) {
            alert("Por favor ingresa primero el Nombre del producto para que la IA sepa qué describir.");
            return;
        }

        setIsGeneratingDesc(true);
        try {
            const generateDesc = httpsCallable(functions, 'generateCommercialDescription');
            const result = await generateDesc({
                name: formData.name,
                brand: formData.category, // Pass Category as brand/context
                attributes: `Precio: $${formData.salePrice || 'N/A'}`
            });
            
            if (result.data && result.data.description) {
                setFormData(prev => ({ ...prev, description: result.data.description.trim() }));
            }
        } catch (error) {
            console.error("Error generating description:", error);
            alert("Hubo un error al generar la descripción con IA. Intenta de nuevo.");
        } finally {
            setIsGeneratingDesc(false);
        }
    };

    const handleOrderAutomated = (item) => {
        const email = item.supplierEmail || appConfig.supportEmail;
        const subject = encodeURIComponent(`Pedido de Reposición Urgente: ${item.name} (${item.sku || 'N/A'})`);
        const body = encodeURIComponent(
            `Hola equipo de ventas,\n\n` +
            `Nos estamos quedando sin stock del siguiente producto y necesitamos reponer a la brevedad:\n\n` +
            `- Producto: ${item.name}\n` +
            `- SKU: ${item.sku || 'N/A'}\n` +
            `- Categoría: ${item.category}\n` +
            `- Cantidad Solicitada: ____\n\n` +
            `Por favor, confirmar disponibilidad y tiempo de entrega.\n\n` +
            `${appConfig.companyName} - Área de Compras`
        );
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este ítem del inventario?")) {
            try {
                const itemToDelete = items.find(i => i.id === id);
                await deleteDoc(doc(db, 'Inventory', id));
                await addAuditLog(`Ítem eliminado: ${itemToDelete?.name || 'Desconocido'}`, 'inventory', currentUser.email, currentUser.empresaId, currentUser.sucursalId);
            } catch (error) {
                console.error("Error deleting item:", error);
            }
        }
    };

    const handleBulkUpdate = async (e) => {
        e.preventDefault();
        const percentage = parseFloat(bulkData.percentage);

        if (isNaN(percentage) || percentage <= 0) {
            alert("Por favor ingresa un porcentaje válido mayor a 0.");
            return;
        }

        if (!window.confirm(`¿Estás seguro de aumentar los precios de venta un ${percentage}% para ${bulkData.category || 'TODAS las categorías'}?`)) {
            return;
        }

        setIsUpdatingBulk(true);
        try {
            const batch = writeBatch(db);
            const itemsToUpdate = bulkData.category
                ? items.filter(i => i.category === bulkData.category)
                : items;

            itemsToUpdate.forEach(item => {
                if (item.salePrice) {
                    const newSalePrice = item.salePrice * (1 + (percentage / 100));
                    const docRef = doc(db, 'Inventory', item.id);
                    batch.update(docRef, {
                        salePrice: parseFloat(newSalePrice.toFixed(2)),
                        updatedAt: serverTimestamp()
                    });
                }
            });

            await batch.commit();
            await addAuditLog(`Aumento masivo del ${percentage}% a ${itemsToUpdate.length} ítems`, 'inventory', currentUser.email, currentUser.empresaId, currentUser.sucursalId);
            setIsBulkModalOpen(false);
            setBulkData({ category: '', percentage: '' });
            alert(`¡Se han actualizado los precios de ${itemsToUpdate.length} ítems exitosamente!`);
        } catch (error) {
            console.error("Error bulk updating prices:", error);
            alert("Error al actualizar los precios masivamente.");
        } finally {
            setIsUpdatingBulk(false);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory ? item.category === filterCategory : true;
        const matchesIcon = selectedIconFilter ? (item.icon || 'inventory_2') === selectedIconFilter.id : true;
        return matchesSearch && matchesCategory && matchesIcon;
    });

    const categories = ['Repuesto', 'Aceite', 'Mano de Obra', 'Consumible', 'Herramienta'];

    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
            </div>
        );
    }

    return (
        <div className="bg-[#0a0c14] text-slate-100 min-h-screen font-display relative overflow-hidden shadow-2xl">
            {/* Carbon Pattern Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-40"
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

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#161b2a]/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4 relative z-10">
                    <Link to="/admin" className="p-2 rounded-xl bg-[#161b2a] border border-slate-700/50 hover:border-primary/50 transition-colors shadow-lg active:scale-95">
                        <span className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-sm">Inventario & Precios</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Gestión de repuestos y mano de obra</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 relative z-10">
                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        Aumento Masivo %
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-primary hover:bg-primary/90 text-background-dark px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(255,40,0,0.3)]"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Nuevo Ítem
                    </button>
                </div>
            </header>

            <main className="relative z-10 p-6 max-w-7xl mx-auto pb-24">
                {/* Icon Filter Bar */}
                <div className="mb-6 bg-[#161b2a] border border-slate-700/50 rounded-2xl p-4 shadow-lg shadow-black/50">
                    <div className="flex flex-wrap items-center gap-3">
                        {ITEM_ICONS.map(iconObj => {
                            const isSelected = selectedIconFilter?.id === iconObj.id;
                            return (
                            <button
                                key={iconObj.id}
                                onClick={() => setSelectedIconFilter(isSelected ? null : iconObj)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all active:scale-95 ${
                                    isSelected
                                        ? `${iconObj.bg} ${iconObj.color} border-primary shadow-[0_0_15px_rgba(255,40,0,0.2)]`
                                        : `bg-[#0a0c14] border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-500`
                                }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">{iconObj.id}</span>
                                <span className="text-xs font-bold uppercase tracking-wider">{iconObj.name}</span>
                            </button>
                            );
                        })}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#161b2a] border border-slate-700/50 pl-10 pr-4 py-3 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm font-medium shadow-lg shadow-black/50 text-slate-100"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-[#161b2a] border border-slate-700/50 px-4 py-3 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm font-medium min-w-[200px] shadow-lg shadow-black/50 text-slate-100"
                    >
                        <option value="">Todas las Categorías</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Data Table */}
                <div className="bg-[#161b2a] border border-slate-700/50 rounded-2xl shadow-lg shadow-black/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[#0a0c14]/50 border-b border-slate-700/50 text-xs uppercase text-slate-400 font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Item / SKU</th>
                                    <th className="px-6 py-4">Categoría</th>
                                    <th className="px-6 py-4 text-right">Costo (Compra)</th>
                                    <th className="px-6 py-4 text-right">Precio Venta</th>
                                    <th className="px-6 py-4 text-right">Margen</th>
                                    <th className="px-6 py-4 text-center">Stock</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                            No se encontraron ítems en el inventario.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map(item => {
                                        const cost = Number(item.purchasePrice || 0);
                                        const sale = Number(item.salePrice || 0);
                                        const margin = cost > 0 ? ((sale - cost) / cost * 100).toFixed(1) : 100;

                                        return (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                                                onClick={() => handleOpenModal(item)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {(() => {
                                                            const iconData = ITEM_ICONS.find(i => i.id === (item.icon || 'inventory_2')) || ITEM_ICONS[7];
                                                            return (
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${iconData.bg} ${iconData.border} ${iconData.color}`}>
                                                                    <span className="material-symbols-outlined text-[20px]">{iconData.id}</span>
                                                                </div>
                                                            );
                                                        })()}
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-slate-100">{item.name}</p>
                                                                {item.isPublic && (
                                                                    <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest flex items-center gap-0.5">
                                                                        <span className="material-symbols-outlined text-[10px]">storefront</span>
                                                                        Tienda
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.sku || 'Sin SKU'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.category === 'Mano de Obra' ? 'bg-amber-500/10 text-amber-500' :
                                                        item.category === 'Repuesto' ? 'bg-red-500/10 text-red-500' :
                                                            'bg-slate-500/10 text-slate-500'
                                                        }`}>
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-400 font-medium tracking-wide">
                                                    ${cost.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-bold text-emerald-400 tracking-wide text-md">
                                                        ${sale.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-xs">
                                                    <span className={`font-medium ${margin >= 30 ? 'text-green-500' : margin > 0 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                        {margin}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {item.category === 'Mano de Obra' ? (
                                                        <span className="text-slate-500 text-xs italic">-</span>
                                                    ) : (
                                                        <div className="flex flex-col items-center">
                                                            <span className={`font-black ${item.currentStock <= (item.minStock || 5) ? 'text-red-500' : 'text-slate-100'}`}>
                                                                {item.currentStock || 0}
                                                            </span>
                                                            {item.currentStock <= (item.minStock || 5) && (
                                                                <span className="text-[9px] font-bold text-red-500 bg-red-500/10 px-1 py-0.5 rounded mt-0.5 uppercase tracking-widest">Low Stock</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 items-center">
                                                        {item.category !== 'Mano de Obra' && item.currentStock <= (item.minStock || 5) && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleOrderAutomated(item); }}
                                                                className="ml-2 px-2 py-1.5 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-lg flex items-center gap-1 text-[10px] uppercase font-black tracking-widest"
                                                                title="Pedir a Proveedor"
                                                            >
                                                                <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                                                                Pedir
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }}
                                                            className="p-1.5 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                                                            title="Editar"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                                                            title="Eliminar"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <AdminBottomNav />

            {/* CREATE / EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#0a0c14] border border-slate-700/80 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-xl my-8 relative flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#161b2a] rounded-t-2xl shrink-0">
                            <h2 className="text-lg font-bold">
                                {editingItem ? 'Editar Ítem' : 'Nuevo Ítem de Inventario'}
                            </h2>
                            <button onClick={() => { setIsModalOpen(false); setIsScanning(false); }} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="itemForm" onSubmit={handleSaveItem} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Icono Identificador *</label>
                                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
                                            {ITEM_ICONS.map(iconObj => (
                                                <button
                                                    key={iconObj.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, icon: iconObj.id })}
                                                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center transition-all ${
                                                        formData.icon === iconObj.id
                                                            ? `${iconObj.bg} ${iconObj.color} border-primary shadow-[0_0_15px_rgba(255,40,0,0.3)] scale-105`
                                                            : `bg-[#0a0c14] border-slate-700/50 text-slate-500 ${iconObj.border} hover:scale-105`
                                                    }`}
                                                    title={iconObj.name}
                                                >
                                                    <span className="material-symbols-outlined text-2xl">{iconObj.id}</span>
                                                    <span className="text-[8px] font-bold mt-1 tracking-widest uppercase hidden sm:block truncate w-full px-1 text-center">{iconObj.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre Corto del Producto *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-sm font-medium shadow-inner shadow-black/50 text-slate-100"
                                            placeholder="Ej: Pastillas de Freno Brembo"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción Comercial</label>
                                            <button
                                                type="button"
                                                onClick={handleGenerateDescription}
                                                disabled={isGeneratingDesc || !formData.name}
                                                className="text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
                                            >
                                                {isGeneratingDesc ? (
                                                    <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                                                )}
                                                Generar con IA
                                            </button>
                                        </div>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-sm font-medium shadow-inner shadow-black/50 text-slate-100 resize-none"
                                            placeholder="Descripción detallada para catálogos o ventas..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Categoría *</label>
                                        <select
                                            name="category"
                                            required
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-sm font-medium shadow-inner shadow-black/50 text-slate-100"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                            <span>Código / SKU</span>
                                            {isScanning ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsScanning(false)}
                                                    className="text-red-500 hover:text-red-400 flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded text-[10px]"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">cancel</span>
                                                    Cancelar
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsScanning(true)}
                                                    className="text-primary hover:text-primary/80 flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded text-[10px] transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">barcode_scanner</span>
                                                    Escanear
                                                </button>
                                            )}
                                        </label>

                                        {isScanning ? (
                                            <div className="w-full bg-[#161b2a] border border-primary/50 rounded-xl overflow-hidden mb-2">
                                                <div id="qr-reader" className="w-full"></div>
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                name="sku"
                                                value={formData.sku}
                                                onChange={handleInputChange}
                                                className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-sm font-medium uppercase min-[100px] shadow-inner shadow-black/50 text-slate-100 placeholder:normal-case placeholder:text-slate-600"
                                                placeholder="Ej: BRM-01 o escanea"
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Precio de Costo ($) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            name="purchasePrice"
                                            required
                                            value={formData.purchasePrice}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-sm font-medium shadow-inner shadow-black/50 text-slate-100"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Precio de Venta ($) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            name="salePrice"
                                            required
                                            value={formData.salePrice}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-sm font-bold text-emerald-400 shadow-inner shadow-black/50"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    {formData.category !== 'Mano de Obra' && (
                                        <>
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Stock Actual *</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    name="currentStock"
                                                    required
                                                    value={formData.currentStock}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-sm font-medium shadow-inner shadow-black/50 text-slate-100"
                                                    placeholder="Cantidad en almacén"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Stock Mínimo</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    name="minStock"
                                                    value={formData.minStock}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 text-sm font-medium shadow-inner shadow-black/50 text-slate-100"
                                                    placeholder="Ej: 5"
                                                    title="Nivel de alerta para reposición"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email del Proveedor</label>
                                                <input
                                                    type="email"
                                                    name="supplierEmail"
                                                    value={formData.supplierEmail}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-sm font-medium shadow-inner shadow-black/50 text-slate-100"
                                                    placeholder="Email para pedidos automáticos"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* isPublic Toggle */}
                                    <div className="sm:col-span-2 mt-4 pt-4 border-t border-slate-700/50">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input 
                                                    type="checkbox" 
                                                    name="isPublic"
                                                    checked={formData.isPublic}
                                                    onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-700/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-200 uppercase tracking-wider group-hover:text-white transition-colors flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[16px]">storefront</span>
                                                    Publicar en Tienda
                                                </span>
                                                <span className="text-xs text-slate-500 font-medium">El producto aparecerá visible en el catálogo público online.</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3 bg-[#161b2a] rounded-b-2xl shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="itemForm"
                                className="px-6 py-2 bg-primary hover:bg-primary/90 text-background-dark text-sm font-bold rounded-xl transition-colors shadow-lg shadow-primary/20"
                            >
                                Guardar Ítem
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* BULK UPDATE MODAL */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-[#0a0c14] border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.15)] w-full max-w-md overflow-hidden relative">
                        <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundColor: '#0a0c14', backgroundImage: `linear-gradient(45deg, #111 25%, transparent 25%), linear-gradient(-45deg, #111 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111 75%), linear-gradient(-45deg, transparent 75%, #111 75%)`, backgroundSize: '4px 4px' }}></div>
                        <div className="p-6 relative z-10">
                            <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 mb-6">
                                <span className="material-symbols-outlined text-3xl">price_change</span>
                                <div>
                                    <h2 className="text-xl font-bold">Aumento Masivo de Precios</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Aplica un % al Precio de Venta</p>
                                </div>
                            </div>

                            <form onSubmit={handleBulkUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Aplicar a Categoría</label>
                                    <select
                                        className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl px-4 py-3 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 text-sm font-medium shadow-inner shadow-black/50 text-slate-100"
                                        value={bulkData.category}
                                        onChange={(e) => setBulkData({ ...bulkData, category: e.target.value })}
                                    >
                                        <option value="">TODAS LAS CATEGORÍAS (Precaución)</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Porcentaje de Aumento (%) *</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0.1"
                                            required
                                            className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl pl-4 pr-10 py-3 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 font-bold text-purple-400 text-lg shadow-inner shadow-black/50"
                                            placeholder="Ej: 15.5"
                                            value={bulkData.percentage}
                                            onChange={(e) => setBulkData({ ...bulkData, percentage: e.target.value })}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 italic">
                                        Ejemplo: Si un repuesto cuesta $100 y aplicas 10%, el nuevo precio será $110.00
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsBulkModalOpen(false)}
                                        className="flex-1 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdatingBulk}
                                        className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                                    >
                                        {isUpdatingBulk ? (
                                            <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-[18px]">outbox_alt</span>
                                                Aplicar Aumento
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default InventoryManager;
