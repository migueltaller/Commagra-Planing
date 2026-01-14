
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from '../types';

const GeminiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '¡Hola! Soy el asistente de Commagra. ¿Tienes alguna duda técnica sobre mármoles o cortes?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Acceso ultra-seguro a la API KEY
    let apiKey = '';
    try {
      apiKey = process.env.API_KEY || '';
    } catch (e) {
      console.warn("No se pudo acceder a process.env");
    }
    
    if (!apiKey) {
      setMessages(prev => [
        ...prev, 
        { role: 'user', text: input.trim() },
        { role: 'model', text: '⚠️ La IA no está configurada. Por favor, añade la API_KEY en Vercel.' }
      ]);
      setInput('');
      return;
    }

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      if (!chatRef.current) {
        chatRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: 'Eres un experto maestro marmolista de Commagra. Ayuda con dudas técnicas sobre piedra natural y porcelánicos.',
          },
        });
      }

      const response = await chatRef.current.sendMessage({ message: userMsg });
      const text = response.text || 'Sin respuesta.';
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Error al conectar con la IA.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen ? (
        <div className="bg-white w-[calc(100vw-3rem)] md:w-96 h-[500px] max-h-[60vh] rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in">
          <div className="bg-red-600 p-5 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <i className="fas fa-robot"></i>
              <span className="font-black text-xs uppercase tracking-widest">Asistente</span>
            </div>
            <button onClick={() => setIsOpen(false)}><i className="fas fa-times"></i></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${
                  m.role === 'user' ? 'bg-gray-950 text-white rounded-tr-none' : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-[10px] font-black text-gray-400 animate-pulse ml-2 uppercase">Pensando...</div>}
          </div>

          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Pregunta algo..."
                className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm outline-none"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend} className="bg-red-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-600 text-white w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center hover:scale-105 transition-all border-2 border-white/20"
        >
          <i className="fas fa-robot text-xl"></i>
        </button>
      )}
    </div>
  );
};

export default GeminiAssistant;
