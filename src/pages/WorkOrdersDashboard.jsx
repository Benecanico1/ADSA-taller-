import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import AdminBottomNav from '../components/ui/AdminBottomNav';
import { collection, query, onSnapshot, getDoc, doc, where } from 'firebase/firestore';
import { useNotifications } from '../lib/NotificationContext';
import { useAuth } from '../lib/AuthContext';
import CreateWorkOrderModal from '../components/CreateWorkOrderModal';
import DeliveryReportModal from '../components/DeliveryReportModal';

const WorkOrdersDashboard = () => {
    const { togglePanel, unreadCount } = useNotifications();
    
    const { currentUser } = useAuth();
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'finished'
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedReportId, setSelectedReportId] = useState(null);

    useEffect(() => {
        if (!currentUser?.sucursalId) return;

        // Obtenemos todas las appointments y luego filtramos localmente para facilitar la búsqueda
        const q = query(collection(db, 'Appointments'), where('sucursalId', '==', currentUser.sucursalId));
        
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const fetchedOrders = [];
            for (const document of snapshot.docs) {
                const data = document.data();
                
                // Fetch vehicle if it's not a manual entry with embedded vehicle data
                let vehicleData = data.vehicle || { brand: 'Desc.', model: 'Desc.', plate: '---' };
                if (data.vehicleId && data.vehicleId !== 'manual_entry' && !data.vehicle) {
                    try {
                        const vDoc = await getDoc(doc(db, 'Motorcycles', data.vehicleId));
                        if (vDoc.exists()) {
                            vehicleData = vDoc.data();
                        }
                    } catch (e) {
                        console.error('Error fetching vehicle:', e);
                    }
                }

                fetchedOrders.push({
                    id: document.id,
                    ...data,
                    vehicle: vehicleData
                });
            }
            // Sort by createdAt desc
            fetchedOrders.sort((a, b) => {
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return b.createdAt.seconds - a.createdAt.seconds;
            });

            setOrders(fetchedOrders);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser?.sucursalId]);

    // Helper functions for status
    const activeStatuses = ['pending', 'diagnosing', 'working', 'quality'];
    const readyStatuses = ['ready'];
    const finishedStatuses = ['delivered', 'cancelled']; // assuming 'delivered' is the end state in current flow

    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'Por Iniciar',
            'diagnosing': 'Diagnóstico',
            'working': 'En Reparación',
            'quality': 'C. Calidad',
            'ready': 'Terminada',
            'delivered': 'Entregada/Cobrada',
            'cancelled': 'Cancelada'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'pending': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
            'diagnosing': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            'working': 'bg-primary/10 text-primary border-primary/20',
            'quality': 'bg-red-500/10 text-red-500 border-red-500/20',
            'ready': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            'delivered': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'cancelled': 'bg-slate-800 text-slate-500 border-slate-700'
        };
        return colorMap[status] || 'bg-slate-800 text-slate-400';
    };

    // Filter logic
    const filteredOrders = orders.filter(order => {
        // Tab filtering
        if (activeTab === 'active' && !activeStatuses.includes(order.status)) return false;
        if (activeTab === 'ready' && !readyStatuses.includes(order.status)) return false;
        if (activeTab === 'finished' && !finishedStatuses.includes(order.status)) return false;
        
        // Search filtering
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const searchString = `
                ${order.id} 
                ${order.clientName || ''} 
                ${order.vehicle?.brand || ''} 
                ${order.vehicle?.model || ''} 
                ${order.vehicle?.plate || ''}
            `.toLowerCase();
            return searchString.includes(term);
        }
        return true;
    });

    return (
        <div className="bg-[#0a0c14] min-h-screen text-slate-100 font-display flex flex-col relative overflow-x-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40" style={{ backgroundColor: '#0a0c14', backgroundImage: `linear-gradient(45deg, #111 25%, transparent 25%), linear-gradient(-45deg, #111 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111 75%), linear-gradient(-45deg, transparent 75%, #111 75%)`, backgroundSize: '4px 4px' }}></div>
            
            <div className="relative z-10 flex flex-col min-h-screen pb-24">
                {/* Header */}
                <header className="sticky top-0 z-40 bg-[#161b2a]/90 backdrop-blur-md border-b border-slate-700/50 p-4 shrink-0 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold text-white tracking-wide">Órdenes de Trabajo</h1>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">Gestión Administrativa</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={togglePanel} className="relative text-slate-400 hover:text-primary transition-colors size-10 flex items-center justify-center bg-slate-800/50 rounded-full border border-slate-700/50">
                            <span className="material-symbols-outlined text-xl">notifications</span>
                            {unreadCount > 0 && <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
                        </button>
                        <Link to="/admin" className="size-10 bg-slate-800/50 rounded-full flex flex-col items-center justify-center border border-slate-700/50 hover:text-primary transition-colors text-slate-400">
                             <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 flex flex-col gap-6">
                    {/* Top Actions & Search */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="w-full md:w-96 relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                            <input 
                                type="text" 
                                placeholder="Buscar por ID, Cliente, Patente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#161b2a] border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner"
                            />
                        </div>
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-[#0a0c14] px-6 py-3 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(255,40,0,0.3)] hover:shadow-[0_0_20px_rgba(255,40,0,0.4)] transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <span className="material-symbols-outlined">add_task</span>
                            Nueva OT Manual
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-[#161b2a] rounded-xl p-1.5 border border-slate-700/50 max-w-full md:max-w-2xl">
                        <button 
                            onClick={() => setActiveTab('active')}
                            className={`flex-[1] py-2.5 rounded-lg text-sm font-bold transition-all relative overflow-hidden ${activeTab === 'active' ? 'text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {activeTab === 'active' && <span className="absolute inset-0 bg-primary/20 opacity-50"></span>}
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Activas
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'active' ? 'bg-primary text-[#0a0c14]' : 'bg-slate-800 text-slate-400'}`}>
                                    {orders.filter(o => activeStatuses.includes(o.status)).length}
                                </span>
                            </span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('ready')}
                            className={`flex-[1] py-2.5 rounded-lg text-sm font-bold transition-all relative overflow-hidden ${activeTab === 'ready' ? 'text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {activeTab === 'ready' && <span className="absolute inset-0 bg-emerald-500/20 opacity-50"></span>}
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Terminadas
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'ready' ? 'bg-emerald-500 text-[#0a0c14]' : 'bg-slate-800 text-slate-400'}`}>
                                    {orders.filter(o => readyStatuses.includes(o.status)).length}
                                </span>
                            </span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('finished')}
                            className={`flex-[1] py-2.5 rounded-lg text-sm font-bold transition-all relative overflow-hidden ${activeTab === 'finished' ? 'text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {activeTab === 'finished' && <span className="absolute inset-0 bg-slate-700 opacity-50"></span>}
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Histórico
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'finished' ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                    {orders.filter(o => finishedStatuses.includes(o.status)).length}
                                </span>
                            </span>
                        </button>
                    </div>

                    {/* Table / List */}
                    <div className="bg-[#161b2a] border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg shadow-black/30 w-full animate-in fade-in duration-300">
                        {/* Desktop Table Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-slate-700/80 bg-slate-800/30 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <div className="col-span-2">ID Orden</div>
                            <div className="col-span-3">Vehículo</div>
                            <div className="col-span-2">Cliente</div>
                            <div className="col-span-2">Estado</div>
                            <div className="col-span-2">Mecánico</div>
                            <div className="col-span-1 text-center">Acciones</div>
                        </div>

                        {loading ? (
                            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
                                <span className="material-symbols-outlined text-3xl animate-spin text-primary mb-2">sync</span>
                                <p className="text-sm">Cargando órdenes...</p>
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inventory_2</span>
                                <p className="text-sm">No se encontraron órdenes de trabajo.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-700/50">
                                {filteredOrders.map(order => (
                                    <div key={order.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-slate-800/30 transition-colors group">
                                        
                                        {/* Mobile view top part */}
                                        <div className="flex md:hidden justify-between items-center mb-2">
                                            <span className="text-[10px] font-technical tracking-[0.2em] text-cyan-500 font-bold">#{order.id.slice(0, 8).toUpperCase()}</span>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${getStatusColor(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>

                                        <div className="hidden md:flex flex-col col-span-2">
                                            <span className="text-xs font-technical tracking-[0.1em] text-cyan-500 font-bold">#{order.id.slice(0, 8).toUpperCase()}</span>
                                            <span className="text-[10px] text-slate-500 mt-1">{order.date} {order.time}</span>
                                        </div>

                                        <div className="col-span-1 md:col-span-3">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-lg bg-slate-800 border border-slate-700/50 overflow-hidden flex-shrink-0">
                                                     {order.vehicle?.imageUrl ? (
                                                        <img src={order.vehicle.imageUrl} alt="Moto" className="w-full h-full object-cover" loading="lazy" />
                                                     ) : (
                                                         <div className="w-full h-full flex items-center justify-center text-slate-600"><span className="material-symbols-outlined text-sm">motorcycle</span></div>
                                                     )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-200">{order.vehicle?.brand} {order.vehicle?.model}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{order.vehicle?.plate || 'Sin Placa'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-500 text-sm md:hidden">person</span>
                                                <p className="text-sm text-slate-300 font-medium truncate">{order.clientName || 'Cliente No Registrado'}</p>
                                            </div>
                                        </div>

                                        <div className="hidden md:flex col-span-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${getStatusColor(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                             <div className="flex items-center gap-1.5 md:gap-2">
                                                <span className="material-symbols-outlined text-primary text-sm">engineering</span>
                                                <span className="text-xs text-slate-400 font-bold">{order.mechanicName || 'Sin asignar'}</span>
                                             </div>
                                        </div>

                                        <div className="col-span-1 text-right md:text-center mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800 flex justify-end md:justify-center gap-2">
                                            {['ready', 'delivered'].includes(order.status) ? (
                                                <button
                                                    onClick={() => setSelectedReportId(order.id)}
                                                    className="inline-flex items-center justify-center p-2 bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-500 rounded-lg transition-colors border border-slate-700 hover:border-emerald-500/50 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                                    title="Imprimir Reporte Final"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">print</span>
                                                </button>
                                            ) : (
                                                <Link 
                                                    to={`/reception/${order.id}`}
                                                    className="inline-flex items-center justify-center p-2 bg-slate-800 hover:bg-primary/20 text-slate-300 hover:text-primary rounded-lg transition-colors border border-slate-700 hover:border-primary/50 group-hover:shadow-[0_0_10px_rgba(255,40,0,0.2)]"
                                                    title="Ver Ficha de Recepción"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">description</span>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>

                <AdminBottomNav />
            </div>
            


            {/* Modal */}
            <CreateWorkOrderModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
            <DeliveryReportModal isOpen={!!selectedReportId} onClose={() => setSelectedReportId(null)} appointmentId={selectedReportId} />
        </div>
    );
};

export default WorkOrdersDashboard;
