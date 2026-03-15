import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, setDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useNotifications } from '../lib/NotificationContext';
import { useAuth } from '../lib/AuthContext';
import { addAuditLog } from '../utils/auditLogger';
import AdminBottomNav from '../components/ui/AdminBottomNav';
import { appConfig } from '../config';

const SystemSettings = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { togglePanel, unreadCount } = useNotifications();
    const [activeTab, setActiveTab] = useState('usuarios');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // User management state
    const [userTab, setUserTab] = useState('todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingUserId, setEditingUserId] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editOptOutRoute, setEditOptOutRoute] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [viewingUser, setViewingUser] = useState(null);

    // Real settings state
    const [isWorkshopOpen, setIsWorkshopOpen] = useState(true);
    const [globalNotifications, setGlobalNotifications] = useState(true);
    const [taxRate, setTaxRate] = useState(0);
    const [isSavingSetting, setIsSavingSetting] = useState(false);
    const [isPurging, setIsPurging] = useState(false);
    const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
    // Workshop Schedule Automation State
    const [scheduleEnabled, setScheduleEnabled] = useState(false);
    const [openTime, setOpenTime] = useState('09:00');
    const [closeTime, setCloseTime] = useState('17:00');
    const [operatingDays, setOperatingDays] = useState({
        mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false
    });
    const [notificationTarget, setNotificationTarget] = useState('all'); // 'all' or 'active_appointments'

    useEffect(() => {
        if (!currentUser?.sucursalId) return;

        // Fetch all users for this branch
        const qUsers = query(collection(db, 'Users'), where('sucursalId', '==', currentUser.sucursalId));
        const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
            const usersData = [];
            snapshot.forEach((doc) => {
                usersData.push({ id: doc.id, ...doc.data() });
            });
            setUsers(usersData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            setLoading(false);
        });

        // Fetch global settings scoped to tenant
        const unsubscribeSettings = onSnapshot(doc(db, 'Settings', `general_${currentUser.sucursalId}`), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.isWorkshopOpen !== undefined) setIsWorkshopOpen(data.isWorkshopOpen);
                if (data.globalNotifications !== undefined) setGlobalNotifications(data.globalNotifications);
                if (data.taxRate !== undefined) setTaxRate(data.taxRate);
            }
        });

        // Fetch workshop schedule settings scoped to tenant
        const unsubscribeWorkshopSettings = onSnapshot(doc(db, 'Settings', `Workshop_${currentUser.sucursalId}`), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.scheduleEnabled !== undefined) setScheduleEnabled(data.scheduleEnabled);
                if (data.openTime !== undefined) setOpenTime(data.openTime);
                if (data.closeTime !== undefined) setCloseTime(data.closeTime);
                if (data.operatingDays !== undefined) setOperatingDays(data.operatingDays);
                if (data.notificationTarget !== undefined) setNotificationTarget(data.notificationTarget);
            }
        });

        return () => {
            unsubscribeUsers();
            unsubscribeSettings();
            unsubscribeWorkshopSettings();
        };
    }, [currentUser?.sucursalId]);

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (u.role || '').toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        if (userTab === 'todos') return true;
        if (userTab === 'mecanicos') return u.role === 'mechanic' || u.role === 'mecanico';
        if (userTab === 'admins') return u.role === 'admin';
        if (userTab === 'finanzas') return u.role === 'finance' || u.role === 'finanzas';
        return true;
    });

    const handleUpdateUser = async (userId) => {
        if (!selectedRole || updating) return;
        setUpdating(true);
        try {
            await updateDoc(doc(db, 'Users', userId), {
                role: selectedRole,
                optOutRouteNotifications: editOptOutRoute,
                ...(editEmail && { email: editEmail })
            });

            const targetedUser = users.find(u => u.id === userId);
            await addAuditLog(`Actualizó perfil de usuario: ${targetedUser?.name || targetedUser?.email || userId}. Nuevo Rol: ${selectedRole}${editEmail ? `, Nuevo Email: ${editEmail}` : ''}`, 'security', currentUser?.email || 'Administrador');

            setEditingUserId(null);
            setSelectedRole('');
            setEditEmail('');
            setEditOptOutRoute(false);
            alert("Usuario actualizado exitosamente. Nota: Modificar el acceso real de Auth requiere un cambio en la sesión actual para el usuario.");
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Error al actualizar el usuario");
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar a este usuario permanentemente? Esta acción NO se puede deshacer.")) return;
        
        setUpdating(true);
        try {
            const functions = getFunctions();
            const deleteUserFn = httpsCallable(functions, 'deleteUser');
            await deleteUserFn({ uid: userId });
            
            await deleteDoc(doc(db, 'Users', userId));
            
            const targetedUser = users.find(u => u.id === userId);
            await addAuditLog(`Eliminó permanentemente al usuario: ${targetedUser?.name || targetedUser?.email || userId}`, 'security', currentUser?.email || 'Administrador');
            
            alert("Usuario eliminado exitosamente.");
            setViewingUser(null);
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Error al eliminar el usuario. Asegúrate de tener los permisos necesarios u observar logs en la Consola Firebase.");
        } finally {
            setUpdating(false);
        }
    };

    const renderUserCard = (user) => {
        const initials = (user.name || user.displayName || user.email || 'U').substring(0, 2).toUpperCase();
        const roleColors = {
            'admin': 'text-red-500 bg-red-500/10 border-red-500/20',
            'client': 'text-primary bg-primary/10 border-primary/20',
            'mechanic': 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
        };
        const colorClass = roleColors[user.role] || 'text-slate-500 bg-slate-500/10 border-slate-500/20';

        const displayRole = user.role === 'client' ? 'Cliente' :
            user.role === 'admin' ? 'Administrador' :
                user.role === 'mechanic' ? 'Mecánico' : (user.role || 'Usuario');

        return (
            <div key={user.id} className="bg-[#161b2a] border border-slate-700/50 rounded-xl p-4 space-y-4 shadow-lg shadow-black/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className={`size-12 rounded-full flex items-center justify-center font-black text-lg border ${colorClass}`}>
                                {initials}
                            </div>
                            <div className="absolute bottom-0 right-0 size-3 rounded-full bg-primary border-2 border-[#161b2a]"></div>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-100">{user.name || user.displayName || `${appConfig.appName} User`}</h4>
                            <p className={`text-[11px] font-bold uppercase tracking-widest mt-0.5 ${user.role === 'admin' ? 'text-red-500' : 'text-primary'}`}>
                                {displayRole}
                            </p>
                            <p className="text-[10px] text-slate-400">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex gap-1 -mr-2">
                        <button
                            onClick={() => { setEditingUserId(user.id); setSelectedRole(user.role || 'client'); setEditEmail(user.email || ''); setEditOptOutRoute(user.optOutRouteNotifications || false); }}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                            onClick={() => alert("Para eliminar el usuario, abre Ver Registro y usa el botón Eliminar Usuario.")}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">block</span>
                        </button>
                    </div>
                </div>
                {editingUserId === user.id ? (
                    <div className="mt-4 bg-[#0a0c14] border border-slate-700/50 p-3 rounded-xl shadow-inner">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3">Editar Usuario</p>
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2 items-center">
                                <span className="text-xs text-slate-500 w-12 font-bold uppercase tracking-wider">Rol:</span>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="flex-1 bg-[#161b2a] border border-slate-700/50 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors disabled:opacity-50"
                                    disabled={updating}
                                >
                                    <option value="" disabled>Seleccionar rol...</option>
                                    <option value="client">Cliente</option>
                                    <option value="mechanic">Mecánico</option>
                                    <option value="admin">Administrador</option>
                                    <option value="finance">Finanzas</option>
                                </select>
                            </div>
                            <div className="flex gap-2 items-center">
                                <span className="text-xs text-slate-500 w-12 font-bold uppercase tracking-wider">Email:</span>
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    className="flex-1 bg-[#161b2a] border border-slate-700/50 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors disabled:opacity-50"
                                    disabled={updating}
                                    placeholder="Nuevo correo..."
                                />
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50">
                                <div>
                                    <span className="text-xs text-slate-200 font-bold tracking-wider">Notificaciones de Rutas</span>
                                    <p className="text-[9px] text-slate-500 max-w-[200px] leading-tight mt-0.5">Si se desactiva, este dev no recibirá alertas masivas de rodadas.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditOptOutRoute(!editOptOutRoute)}
                                    className={`w-10 h-5 rounded-full transition-colors relative flex items-center shrink-0 ${!editOptOutRoute ? 'bg-primary' : 'bg-slate-700'}`}
                                >
                                    <div className={`size-3.5 bg-white rounded-full mx-[3px] transition-transform shadow-sm ${!editOptOutRoute ? 'translate-x-[18px]' : 'translate-x-0'}`}></div>
                                </button>
                            </div>
                            <div className="flex gap-2 justify-end mt-1">
                                <button
                                    onClick={() => handleUpdateUser(user.id)}
                                    disabled={updating || !selectedRole}
                                    className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:bg-primary/50 text-[#101f22] px-4 py-2 rounded-lg font-bold text-sm shadow-lg transition-colors flex items-center justify-center gap-1"
                                >
                                    {updating ? '...' : <><span className="material-symbols-outlined text-sm">check</span> Guardar</>}
                                </button>
                                <button
                                    onClick={() => { setEditingUserId(null); setSelectedRole(''); setEditEmail(''); setEditOptOutRoute(false); }}
                                    disabled={updating}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => { setEditingUserId(user.id); setSelectedRole(user.role || 'client'); setEditEmail(user.email || ''); setEditOptOutRoute(user.optOutRouteNotifications || false); }}
                            className="flex-1 bg-transparent hover:bg-primary/10 text-primary text-xs font-bold py-2.5 rounded-xl transition-colors border border-primary/50 shadow-sm active:scale-95"
                        >
                            Editar Perfil
                        </button>
                        <button
                            onClick={() => setViewingUser(user)}
                            className="flex-1 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-bold py-2.5 rounded-xl border border-slate-700/80 transition-colors shadow-sm active:scale-95"
                        >
                            Ver Registro
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        if (!currentUser?.sucursalId) return;
        setIsSavingSetting(true);
        try {
            // Save general settings scoped to tenant
            await setDoc(doc(db, 'Settings', `general_${currentUser.sucursalId}`), {
                isWorkshopOpen,
                globalNotifications,
                taxRate
            }, { merge: true });

            // Save workshop schedule settings scoped to tenant
            await setDoc(doc(db, 'Settings', `Workshop_${currentUser.sucursalId}`), {
                scheduleEnabled,
                openTime,
                closeTime,
                operatingDays,
                notificationTarget
            }, { merge: true });
            
            await addAuditLog(`Actualizó configuración general y de horarios del taller.`, 'admin', currentUser?.email || 'Administrador');
            
            alert("Configuraciones generales guardadas exitosamente en la base de datos.");
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Error al guardar las configuraciones.");
        } finally {
            setIsSavingSetting(false);
        }
    };

    const handlePurgeTestData = async () => {
        if (!currentUser?.sucursalId) return;
        setIsPurging(true);
        try {
            const appointmentsQuery = await getDocs(query(collection(db, 'Appointments'), where('sucursalId', '==', currentUser.sucursalId)));
            const deleteAppointmentsPromises = appointmentsQuery.docs.map(document => deleteDoc(doc(db, 'Appointments', document.id)));

            const supplierOrdersQuery = await getDocs(query(collection(db, 'SupplierOrders'), where('sucursalId', '==', currentUser.sucursalId)));
            const deleteSupplierPromises = supplierOrdersQuery.docs.map(document => deleteDoc(doc(db, 'SupplierOrders', document.id)));

            const notificationsQuery = await getDocs(query(collection(db, 'Notifications'), where('sucursalId', '==', currentUser.sucursalId)));
            const deleteNotificationsPromises = notificationsQuery.docs.map(document => deleteDoc(doc(db, 'Notifications', document.id)));

            await Promise.all([...deleteAppointmentsPromises, ...deleteSupplierPromises, ...deleteNotificationsPromises]);
            
            await addAuditLog('Purgó los datos de prueba masivamente exitosamente', 'system', currentUser?.email || 'Administrador');
            alert('¡Datos de prueba purgados correctamente!');
        } catch (error) {
            console.error('Error purgando datos: ', error);
            await addAuditLog(`Error al purgar los datos masivamente: ${error.message}`, 'error', currentUser?.email || 'Administrador');
            alert('Error eliminando datos. Verifica la consola.');
        } finally {
            setIsPurging(false);
            setShowPurgeConfirm(false);
        }
    };

    return (
        <div className="bg-[#0a0c14] text-slate-100 min-h-screen flex flex-col font-display max-w-[1600px] w-full mx-auto relative pb-20 overflow-x-hidden">
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
            <div className="relative z-10 flex flex-col flex-1 w-full min-h-screen">

                {/* Header */}
                <header className="sticky top-0 z-50 bg-[#161b2a]/80 backdrop-blur-md border-b border-slate-700/50 flex flex-col shadow-sm">
                    <div className="flex items-center p-4 pb-2 justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-primary flex size-10 flex-shrink-0 items-center justify-center -ml-2 rounded-full hover:bg-slate-800/50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-2xl">arrow_back</span>
                        </button>
                        <div className="flex-1 text-center px-2">
                            <h2 className="text-slate-100 text-lg font-extrabold leading-tight tracking-tight">Admin Settings</h2>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-primary mt-0.5">Control Master</p>
                        </div>
                        <button onClick={togglePanel} className="relative text-slate-400 hover:text-primary transition-colors cursor-pointer" title="Notificaciones">
                            <span className="material-symbols-outlined">notifications</span>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-red-500 border border-[#161b2a] animate-pulse"></span>
                            )}
                        </button>
                    </div>

                    {/* Tabs (Mobile Only) */}
                    <div className="flex border-t border-slate-700/50 px-4 bg-transparent mt-1 lg:hidden">
                        <button
                            onClick={() => setActiveTab('usuarios')}
                            className={`flex-1 flex flex-col items-center justify-center border-b-[3px] py-3 transition-colors ${activeTab === 'usuarios' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-primary hover:border-slate-700'}`}
                        >
                            <span className="material-symbols-outlined text-xl mb-1">manage_accounts</span>
                            <p className="text-[10px] font-bold uppercase tracking-wider">Gestión Usuarios</p>
                        </button>
                        <button
                            onClick={() => setActiveTab('sistema')}
                            className={`flex-1 flex flex-col items-center justify-center border-b-[3px] py-3 transition-colors ${activeTab === 'sistema' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-primary hover:border-slate-700'}`}
                        >
                            <span className="material-symbols-outlined text-xl mb-1">room_preferences</span>
                            <p className="text-[10px] font-bold uppercase tracking-wider">Config. Taller</p>
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-6 lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Users Column */}
                    <div className={`lg:col-span-8 lg:block transition-all duration-300 ${activeTab === 'usuarios' ? 'block' : 'hidden'} space-y-4`}>
                            {/* Search Bar */}
                            <div className="bg-[#161b2a] border border-slate-700/50 p-3 rounded-xl shadow-lg shadow-black/50">
                                <label className="flex w-full items-stretch rounded-lg h-10 overflow-hidden bg-[#0a0c14] border border-slate-700/80 focus-within:border-primary transition-colors focus-within:ring-1 focus-within:ring-primary shadow-inner">
                                    <div className="text-slate-500 flex items-center justify-center pl-3">
                                        <span className="material-symbols-outlined text-[18px]">search</span>
                                    </div>
                                    <input
                                        className="flex w-full min-w-0 border-none bg-transparent focus:outline-none placeholder:text-slate-500 text-slate-100 px-3 text-xs font-medium"
                                        placeholder="Buscar por nombre, rol o email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </label>
                            </div>

                            {/* Filters */}
                            <div className="flex border-b border-slate-700/50 pb-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                                <button
                                    onClick={() => setUserTab('todos')}
                                    className={`flex-none px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${userTab === 'todos' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-200'}`}
                                >Todos</button>
                                <button
                                    onClick={() => setUserTab('mecanicos')}
                                    className={`flex-none px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${userTab === 'mecanicos' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-200'}`}
                                >Mecánicos</button>
                                <button
                                    onClick={() => setUserTab('admins')}
                                    className={`flex-none px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${userTab === 'admins' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-200'}`}
                                >Admins</button>
                                <button
                                    onClick={() => setUserTab('finanzas')}
                                    className={`flex-none px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${userTab === 'finanzas' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-200'}`}
                                >Finanzas</button>
                            </div>

                            {loading ? (
                                <p className="text-sm text-slate-500 text-center font-bold py-10">Cargando directorio...</p>
                            ) : filteredUsers.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center font-bold py-10">No se encontraron usuarios.</p>
                            ) : (
                                <div className="space-y-3 pb-6">
                                    {filteredUsers.map(user => renderUserCard(user))}
                                </div>
                            )}
                        </div>

                    {/* System Column */}
                    <div className={`lg:col-span-4 lg:block transition-all duration-300 ${activeTab === 'sistema' ? 'block' : 'hidden'}`}>
                        <form onSubmit={handleSaveSettings} className="space-y-6">
                            <section className="bg-[#161b2a] rounded-xl border border-slate-700/50 p-4 shadow-lg shadow-black/50">
                                <h3 className="text-[11px] font-black tracking-widest text-primary uppercase border-b border-slate-700/50 pb-2 mb-4">Estado Operativo</h3>

                                <div className="flex items-center justify-between p-3 bg-[#0a0c14] rounded-lg border border-slate-700/80">
                                    <div>
                                        <p className="text-sm font-bold text-white">Taller Abierto</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Permite recepción de motos nuevas</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsWorkshopOpen(!isWorkshopOpen)}
                                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${isWorkshopOpen ? 'bg-primary' : 'bg-slate-700'}`}
                                    >
                                        <div className={`size-4 bg-white rounded-full mx-1 transition-transform shadow-sm ${isWorkshopOpen ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                            </section>

                            <section className="bg-[#161b2a] rounded-xl border border-slate-700/50 p-4 shadow-lg shadow-black/50">
                                <h3 className="text-[11px] font-black tracking-widest text-primary uppercase border-b border-slate-700/50 pb-2 mb-4">Globales</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-[#0a0c14] rounded-lg border border-slate-700/80">
                                        <div>
                                            <p className="text-sm font-bold text-white">Notificaciones Activas</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Alertas push masivas del sistema</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setGlobalNotifications(!globalNotifications)}
                                            className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${globalNotifications ? 'bg-primary' : 'bg-slate-700'}`}
                                        >
                                            <div className={`size-4 bg-white rounded-full mx-1 transition-transform shadow-sm ${globalNotifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-2 p-3 bg-[#0a0c14] rounded-lg border border-slate-700/80">
                                        <label className="text-sm font-bold text-white">Tasa de Impuestos (IVA %)</label>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Porcentaje base para cotizaciones</p>
                                        <input
                                            type="number"
                                            value={taxRate}
                                            onChange={(e) => setTaxRate(Number(e.target.value))}
                                            className="w-full bg-[#161b2a] border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Workshop Schedule Automation Section */}
                            <section className="bg-[#161b2a] rounded-xl border border-primary/30 p-4 shadow-lg shadow-black/50 mt-6 relative overflow-hidden">
                                {/* Background Accent */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
                                <div className="relative z-10">
                                    <h3 className="text-[11px] font-black tracking-widest text-primary uppercase border-b border-primary/20 pb-2 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                                        Horarios y Notificaciones del Taller
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-[#0a0c14] rounded-lg border border-primary/20">
                                            <div>
                                                <p className="text-sm font-bold text-white">Automatizar Apertura/Cierre</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">Envía notificaciones automáticas y actualiza el estado operativo</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setScheduleEnabled(!scheduleEnabled)}
                                                className={`w-12 h-6 rounded-full transition-colors relative flex items-center shrink-0 ${scheduleEnabled ? 'bg-primary' : 'bg-slate-700'}`}
                                            >
                                                <div className={`size-4 bg-white rounded-full mx-1 transition-transform shadow-sm ${scheduleEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                            </button>
                                        </div>

                                        {scheduleEnabled && (
                                            <div className="p-3 bg-[#0a0c14] rounded-lg border border-slate-700/80 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                {/* Times */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Hora Apertura</label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <span className="material-symbols-outlined text-[16px] text-primary">wb_sunny</span>
                                                            </div>
                                                            <input
                                                                type="time"
                                                                value={openTime}
                                                                onChange={(e) => setOpenTime(e.target.value)}
                                                                className="w-full bg-[#161b2a] pl-9 pr-3 py-2 rounded-lg border border-slate-600 focus:border-primary focus:outline-none text-slate-200 text-sm transition-colors"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Hora Cierre</label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <span className="material-symbols-outlined text-[16px] text-slate-500">bedtime</span>
                                                            </div>
                                                            <input
                                                                type="time"
                                                                value={closeTime}
                                                                onChange={(e) => setCloseTime(e.target.value)}
                                                                className="w-full bg-[#161b2a] pl-9 pr-3 py-2 rounded-lg border border-slate-600 focus:border-primary focus:outline-none text-slate-200 text-sm transition-colors"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Operating Days */}
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block border-b border-slate-700/50 pb-1">Días Operativos</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.entries({ mon: 'Lun', tue: 'Mar', wed: 'Mié', thu: 'Jue', fri: 'Vie', sat: 'Sáb', sun: 'Dom' }).map(([key, label]) => (
                                                            <button
                                                                key={key}
                                                                type="button"
                                                                onClick={() => setOperatingDays(prev => ({ ...prev, [key]: !prev[key] }))}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${operatingDays[key] ? 'bg-primary/20 text-primary border-primary/50' : 'bg-[#161b2a] text-slate-400 border-slate-700/50 hover:border-slate-500 hover:text-slate-300'}`}
                                                            >
                                                                {label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Target Audience */}
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block border-b border-slate-700/50 pb-1">Destinatarios de Alertas</label>
                                                    <div className="space-y-2">
                                                        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${notificationTarget === 'all' ? 'bg-primary/10 border-primary/50' : 'bg-[#161b2a] border-slate-700/50 hover:border-slate-600'}`}>
                                                            <div className="mt-0.5 flex items-center justify-center">
                                                                <div className={`size-4 rounded-full border flex items-center justify-center ${notificationTarget === 'all' ? 'border-primary' : 'border-slate-500'}`}>
                                                                    {notificationTarget === 'all' && <div className="size-2 rounded-full bg-primary" />}
                                                                </div>
                                                                <input
                                                                    type="radio"
                                                                    name="target"
                                                                    value="all"
                                                                    checked={notificationTarget === 'all'}
                                                                    onChange={() => setNotificationTarget('all')}
                                                                    className="hidden"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-bold ${notificationTarget === 'all' ? 'text-primary' : 'text-slate-300'}`}>Todos los Clientes</p>
                                                                <p className="text-[10px] text-slate-500 mt-0.5">Alertas masivas a toda la base de datos de usuarios.</p>
                                                            </div>
                                                        </label>

                                                        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${notificationTarget === 'active_appointments' ? 'bg-primary/10 border-primary/50' : 'bg-[#161b2a] border-slate-700/50 hover:border-slate-600'}`}>
                                                            <div className="mt-0.5 flex items-center justify-center">
                                                                <div className={`size-4 rounded-full border flex items-center justify-center ${notificationTarget === 'active_appointments' ? 'border-primary' : 'border-slate-500'}`}>
                                                                    {notificationTarget === 'active_appointments' && <div className="size-2 rounded-full bg-primary" />}
                                                                </div>
                                                                <input
                                                                    type="radio"
                                                                    name="target"
                                                                    value="active_appointments"
                                                                    checked={notificationTarget === 'active_appointments'}
                                                                    onChange={() => setNotificationTarget('active_appointments')}
                                                                    className="hidden"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-bold ${notificationTarget === 'active_appointments' ? 'text-primary' : 'text-slate-300'}`}>Solo con Turnos o OTs Activas</p>
                                                                <p className="text-[10px] text-slate-500 mt-0.5">Evita el spam. Solo notifica a quienes tienen motos en el taller.</p>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <section className="bg-[#161b2a] rounded-xl border border-red-500/30 p-4 shadow-lg shadow-black/50 mt-6">
                                <h3 className="text-[11px] font-black tracking-widest text-red-500 uppercase border-b border-red-500/20 pb-2 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">warning</span> Acciones de Mantenimiento
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                                        <div>
                                            <p className="text-sm font-bold text-red-500">Borrar Datos Falsos</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Limpia OTs, citas y notificaciones de prueba.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowPurgeConfirm(true)}
                                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
                                            Purgar Todo
                                        </button>
                                    </div>
                                </div>
                            </section>

                            <button
                                type="submit"
                                disabled={isSavingSetting}
                                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[13px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20
                                ${isSavingSetting ? 'bg-primary/50 text-slate-800 cursor-not-allowed' : 'bg-primary text-[#0a0c14] hover:bg-primary/90 active:scale-[0.98]'}`}
                            >
                                {isSavingSetting ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">refresh</span>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        Guardar Configuración
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </main>

                <AdminBottomNav />

            </div>

            {/* User Details Modal */}
            {viewingUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0a0c14]/80 backdrop-blur-sm" onClick={() => setViewingUser(null)}></div>
                    <div className="relative w-full max-w-md bg-[#161b2a] rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-[#161b2a]/95 sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">badge</span>
                                </div>
                                <h3 className="text-lg font-bold text-white leading-none">Registro de Usuario</h3>
                            </div>
                            <button
                                onClick={() => setViewingUser(null)}
                                className="size-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto space-y-4">
                            <div className="bg-[#0a0c14] border border-slate-700/50 rounded-xl p-4 flex flex-col gap-1 items-center text-center shadow-inner">
                                <div className={`size-16 rounded-full flex items-center justify-center font-black text-2xl mb-2 ${viewingUser.role === 'admin' ? 'text-red-500 bg-red-500/10 border border-red-500/20' :
                                        viewingUser.role === 'mechanic' ? 'text-yellow-500 bg-yellow-500/10 border border-yellow-500/20' :
                                            'text-primary bg-primary/10 border border-primary/20'
                                    }`}>
                                    {(viewingUser.name || viewingUser.displayName || viewingUser.email || 'U').substring(0, 2).toUpperCase()}
                                </div>
                                <h4 className="font-bold text-white text-lg">{viewingUser.name || viewingUser.displayName || 'Sin Nombre'}</h4>
                                <p className="text-slate-400 text-sm">{viewingUser.email}</p>
                                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${viewingUser.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                        viewingUser.role === 'mechanic' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-primary/20 text-primary'
                                    }`}>
                                    {viewingUser.role || 'client'}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <h5 className="text-[10px] text-slate-500 uppercase tracking-widest font-bold ml-1">Información del Sistema</h5>

                                <div className="bg-[#0a0c14] border border-slate-700/50 rounded-xl p-3 space-y-3">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 font-medium">User ID (UID)</span>
                                        <span className="text-xs text-slate-300 font-mono break-all">{viewingUser.uid || viewingUser.id}</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 font-medium">Fecha de Creación</span>
                                        <span className="text-xs text-slate-300">
                                            {viewingUser.createdAt?.seconds
                                                ? new Date(viewingUser.createdAt.seconds * 1000).toLocaleString('es-AR')
                                                : viewingUser.createdAt || 'Desconocida'}
                                        </span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 font-medium">Último Acceso / Actualización</span>
                                        <span className="text-xs text-slate-300">
                                            {viewingUser.lastLogin?.seconds
                                                ? new Date(viewingUser.lastLogin.seconds * 1000).toLocaleString('es-AR')
                                                : viewingUser.updatedAt?.seconds
                                                    ? new Date(viewingUser.updatedAt.seconds * 1000).toLocaleString('es-AR')
                                                    : 'No registrado'}
                                        </span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 font-medium">Teléfono Asociado</span>
                                        <span className="text-xs text-slate-300">{viewingUser.phone || viewingUser.phoneNumber || 'No registrado'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-slate-700/50">
                                <button
                                    onClick={() => handleDeleteUser(viewingUser.id)}
                                    disabled={updating}
                                    className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 active:scale-95 text-red-500 border border-red-500/30 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {updating ? (
                                        <>
                                            <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[18px]">person_remove</span>
                                            Eliminar Usuario Permanentemente
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Purge Confirmation Modal */}
            {showPurgeConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0a0c14]/90 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="bg-[#161b2a] border border-red-500/50 rounded-2xl max-w-sm w-full p-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/50">
                                <span className="material-symbols-outlined text-3xl text-red-500">dangerous</span>
                            </div>
                        </div>
                        <h2 className="text-xl font-black text-white text-center mb-2">Peligro: Borrado Masivo</h2>
                        <p className="text-sm text-slate-300 text-center mb-6">
                            Estás a punto de vaciar <strong className="text-red-400">TODO el historial operativo</strong> (Citas, Presupuestos en curso, Pedidos a Proveedor y Notificaciones). <br /><br />
                            El inventario y tus cuentas administrativas quedarán intactas. Esta acción <strong>NO se puede deshacer</strong>.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handlePurgeTestData}
                                disabled={isPurging}
                                className="w-full py-3 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isPurging ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">refresh</span>
                                        Purgando Base de Datos...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">delete_forever</span>
                                        Sí, Borrar Todo el Historial
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setShowPurgeConfirm(false)}
                                disabled={isPurging}
                                className="w-full py-3 bg-transparent border border-slate-600 hover:bg-slate-800 active:scale-95 text-slate-300 font-bold rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemSettings;
