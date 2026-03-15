import React, { createContext, useContext, useState } from 'react';
import NotificationPanel from '../components/ui/NotificationPanel';

const NotificationContext = createContext();

export const useNotifications = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const togglePanel = () => setIsPanelOpen(prev => !prev);
    const openPanel = () => setIsPanelOpen(true);
    const closePanel = () => setIsPanelOpen(false);

    return (
        <NotificationContext.Provider value={{ isPanelOpen, togglePanel, openPanel, closePanel }}>
            {children}
            <NotificationPanel isOpen={isPanelOpen} onClose={closePanel} />
        </NotificationContext.Provider>
    );
};
