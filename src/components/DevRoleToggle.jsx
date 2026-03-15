import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const DevRoleToggle = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);

    if (process.env.NODE_ENV !== 'development' || !currentUser) return null;

    const toggleRole = async () => {
        setLoading(true);
        try {
            const userRef = doc(db, 'Users', currentUser.uid);
            const newRole = currentUser.role === 'admin' ? 'client' : 'admin';
            await updateDoc(userRef, { role: newRole });

            alert(`Rol actualizado a: ${newRole}. Por favor recarga la página.`);
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Error cambiando rol.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed top-20 right-4 z-50">
            <button
                onClick={toggleRole}
                disabled={loading}
                className="bg-red-500 text-white text-[10px] px-2 py-1 rounded shadow-lg font-bold"
            >
                {loading ? '...' : `[DEV] Cambiar a ${currentUser.role === 'admin' ? 'Client' : 'Admin'}`}
            </button>
        </div>
    );
};

export default DevRoleToggle;
