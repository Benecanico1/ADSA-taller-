import React, { useState, useRef, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

const VirtualMechanicChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: '¡Hola! Soy el Mecánico Virtual de adsa_taller. ¿En qué te puedo asesorar hoy con tu moto?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        
        // Format history for Gemini (excluding the new message)
        const history = messages.map(m => ({
            role: m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.text }]
        }));

        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const askMechanic = httpsCallable(functions, 'askVirtualMechanic');
            const result = await askMechanic({ message: userMsg, history });
            
            // Reemplazar saltos de linea y asteriscos por algo más limpio si es necesario,
            // pero standard whitespace-pre-wrap lo maneja bien.
            setMessages(prev => [...prev, { role: 'model', text: result.data.response }]);
        } catch (error) {
            console.error("Error calling virtual mechanic:", error);
            setMessages(prev => [...prev, { role: 'model', text: 'Lo siento, en este momento tengo las manos llenas de grasa y no pude procesar tu solicitud. Intenta más tarde.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-4 z-50 md:bottom-8 md:right-8">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-[350px] max-w-[85vw] h-[500px] max-h-[60vh] flex flex-col bg-[#0a0c14]/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-cyan-900/20 overflow-hidden mb-2 animate-in fadeIn slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#161b2a]/80">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 relative">
                                <span className="material-symbols-outlined text-primary shadow-none">smart_toy</span>
                                <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-[#161b2a]"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-100 text-sm">Mecánico Virtual</h3>
                                <p className="text-xs text-primary animate-pulse">En línea</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-transparent border-none">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-primary text-[#0a0c14] rounded-tr-sm font-medium' 
                                        : 'bg-slate-800/80 text-slate-200 rounded-tl-sm border border-slate-700/50'
                                }`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800/80 text-slate-400 p-3 rounded-2xl rounded-tl-sm border border-slate-700/50 text-sm flex gap-1.5 items-center">
                                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-[#161b2a]/80 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe el problema..."
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary/50 transition-colors"
                            disabled={isLoading}
                        />
                        <button 
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="bg-primary text-[#0a0c14] w-10 h-10 rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                            <span className="material-symbols-outlined text-lg">send</span>
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-[#0a0c14] shadow-[0_0_20px_rgba(13,204,242,0.3)] hover:scale-105 hover:bg-cyan-400 active:scale-95 transition-all outline-none"
                >
                    <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">smart_toy</span>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-100 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </button>
            )}
        </div>
    );
};

export default VirtualMechanicChat;
