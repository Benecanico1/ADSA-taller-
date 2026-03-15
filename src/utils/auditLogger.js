import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Registra un evento de auditoría en la base de datos.
 * @param {string} action - Descripción de la acción (ej. "Inicio de sesión", "Creó Orden de Trabajo").
 * @param {string} type - Tipo de evento: 'auth', 'system', 'inventory', 'appointment', etc.
 * @param {string} user - Correo electrónico o identificador del usuario que realizó la acción.
 */
export const addAuditLog = async (action, type, user, empresaId = null, sucursalId = null) => {
    try {
        await addDoc(collection(db, 'AuditLogs'), {
            action,
            type,
            user,
            empresaId,
            sucursalId,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error al registrar evento de auditoría:", error);
    }
};
