import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNotifications } from '../lib/NotificationContext';
import { useAuth } from '../lib/AuthContext';

const AdminMarketplaceOrders = () => {
    const { addNotification } = useNotifications();
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (!currentUser?.sucursalId) return;
        const q = query(
            collection(db, 'MarketplaceOrders'),
            where('sucursalId', '==', currentUser.sucursalId),
            orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = [];
            snapshot.forEach((doc) => {
                ordersData.push({ id: doc.id, ...doc.data() });
            });
            setOrders(ordersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser?.sucursalId]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const orderRef = doc(db, 'MarketplaceOrders', orderId);
            await updateDoc(orderRef, { status: newStatus });
            addNotification('success', 'check_circle', 'Estado actualizado correctamente.');
        } catch (error) {
            console.error("Error updating order status:", error);
            addNotification('error', 'error', 'No se pudo actualizar el estado del pedido.');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este pedido permanentemente? Esta acción no se puede deshacer.')) {
            try {
                await deleteDoc(doc(db, 'MarketplaceOrders', orderId));
                addNotification('success', 'check_circle', 'Pedido eliminado correctamente.');
            } catch (error) {
                console.error("Error deleting order:", error);
                addNotification('error', 'error', 'No se pudo eliminar el pedido.');
            }
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending':
                return { label: 'Pendiente', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' };
            case 'processing':
                return { label: 'Procesando (Pagado)', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' };
            case 'shipped':
                return { label: 'Enviado / Listo Reparto', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' };
            case 'completed':
                return { label: 'Completado', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' };
            case 'cancelled':
                return { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' };
            default:
                return { label: 'Desconocido', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/30' };
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerData?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerData?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px]">
                <span className="material-symbols-outlined animate-spin text-primary text-5xl mb-4">sync</span>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm animate-pulse">Cargando pedidos de la tienda...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in font-display">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-4xl">store</span>
                        Pedidos Tienda
                    </h1>
                    <p className="text-slate-400 font-medium mt-1">Gestión de compras realizadas en el Marketplace</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[#121826]/80 backdrop-blur-xl border border-slate-800/60 p-4 rounded-2xl flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por ID, Cliente o Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#161b2a] border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#161b2a] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors md:w-64"
                >
                    <option value="all">Todos los Estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="processing">Procesando (Pagado)</option>
                    <option value="shipped">Enviado / Listo Reparto</option>
                    <option value="completed">Completado</option>
                    <option value="cancelled">Cancelado</option>
                </select>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="bg-[#121826]/80 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-12 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-600 mb-4">package_2</span>
                        <h3 className="text-xl font-bold text-slate-300">No hay pedidos</h3>
                        <p className="text-slate-500 mt-2">No se encontraron pedidos con los filtros actuales.</p>
                    </div>
                ) : (
                    filteredOrders.map(order => {
                        const statusConfig = getStatusConfig(order.status);
                        const orderDate = order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString('es-AR') : 'Fecha desconocida';

                        return (
                            <div key={order.id} className="bg-[#121826]/80 backdrop-blur-xl border border-slate-800/60 rounded-2xl overflow-hidden flex flex-col lg:flex-row hover:border-slate-700 transition-colors">
                                {/* Left section: Order Info & Customer */}
                                <div className="p-6 flex-1 border-b lg:border-b-0 lg:border-r border-slate-800/60 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-500">tag</span>
                                                <span className="text-lg font-black text-white">{order.id.substring(0,8).toUpperCase()}</span>
                                            </div>
                                            <span className="text-xs text-slate-400 font-medium">{orderDate}</span>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Cliente</h4>
                                                <p className="font-bold text-slate-200">{order.customerData?.fullName || 'Desconocido'}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="material-symbols-outlined text-[14px] text-slate-400">mail</span>
                                                    <a href={`mailto:${order.customerData?.email}`} className="text-sm text-primary hover:underline">{order.customerData?.email}</a>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="material-symbols-outlined text-[14px] text-slate-400">call</span>
                                                    <a href={`https://wa.me/549${order.customerData?.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{order.customerData?.phone}</a>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Envío a</h4>
                                                <p className="text-sm text-slate-300">
                                                    {order.customerData?.address}, {order.customerData?.city} ({order.customerData?.zipCode})
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6">
                                        <button 
                                            onClick={() => handleDeleteOrder(order.id)}
                                            className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">delete</span>
                                            Eliminar Pedido
                                        </button>
                                    </div>
                                </div>

                                {/* Middle section: Items List */}
                                <div className="p-6 flex-1 lg:max-w-md bg-[#161b2a]/30">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800/60 pb-2 flex justify-between">
                                        <span>Productos ({order.totals?.itemsCount})</span>
                                        <span>Total: ${Number(order.totals?.totalPrice).toLocaleString()}</span>
                                    </h4>
                                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {(order.items || []).map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-start">
                                                <div className="flex-1 pr-2">
                                                    <p className="text-sm font-bold text-slate-200 line-clamp-1">{item.name}</p>
                                                    <p className="text-[10px] text-slate-500">SKU: {item.sku}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-sm font-black text-slate-100">${Number(item.salePrice * item.quantity).toLocaleString()}</p>
                                                    <p className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded ml-auto w-fit mt-1">x{item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right section: Actions & Status */}
                                <div className="p-6 w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-slate-800/60 flex flex-col justify-center bg-background-dark/30">
                                    <div className="mb-6">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Estado Actual</h4>
                                        <div className={`px-3 py-2 rounded-lg border ${statusConfig.bg} ${statusConfig.border} flex items-center justify-center`}>
                                            <span className={`text-sm font-black uppercase tracking-widest ${statusConfig.color}`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Cambiar Estado</h4>
                                        <select
                                            value={order.status || 'pending'}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className="w-full bg-[#161b2a] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                        >
                                            <option value="pending">Pendiente (Sin Pagar)</option>
                                            <option value="processing">Procesando (Pagado)</option>
                                            <option value="shipped">Enviado / Retiro Confirmado</option>
                                            <option value="completed">Completado</option>
                                            <option value="cancelled">Cancelado</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default AdminMarketplaceOrders;
