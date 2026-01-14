
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from '../types';

const GeminiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '¡Hola! Soy el asistente inteligente de Commagra. ¿En qué puedo ayudarte hoy con el taller?' }
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

    // Verificar si la API_KEY existe para evitar el error cdg1 (crash de proceso)
    const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : null;
    
    if (!apiKey) {
      setMessages(prev => [
        ...prev, 
        { role: 'user', text: input.trim() },
        { role: 'model', text: '⚠️ Error de Configuración: No se ha detectado la clave API en Vercel. Por favor, añádela en las variables de entorno como API_KEY.' }
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
            systemInstruction: 'Eres un experto maestro marmolista y asistente técnico del taller Commagra. Tu objetivo es ayudar a los operarios con dudas técnicas reales sobre mármol, granito, cuarcita, porcelánicos (Dekton/Neolith), técnicas de corte, adhesivos y pulido. Responde de forma directa y profesional.',
          },
        });
      }

      const response = await chatRef.current.sendMessage({ message: userMsg });
      const text = response.text || 'No he podido procesar la consulta.';
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error('Error en Gemini:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Ha ocurrido un error al conectar con el cerebro de la IA. Revisa la conexión.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen ? (
        <div className="bg-white w-[calc(100vw-3rem)] md:w-96 h-[500px] max-h-[70vh] rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-red-600 p-5 text-white flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <i className="fas fa-robot text-xl"></i>
              <div>
                <span className="font-black text-xs uppercase tracking-widest block">Asistente Commagra</span>
                <span className="text-[10px] font-bold opacity-80">EXPERTO TALLER</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-black/20 flex items-center justify-center">
              <i className="fas fa-times"></i>
            </button>
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
            {isTyping && <div className="text-xs text-gray-400 font-bold animate-pulse ml-2 italic">Escribiendo...</div>}
          </div>

          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escribe tu duda..."
                className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-red-600 focus:bg-white transition-all"
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

     
