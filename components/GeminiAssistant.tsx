
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      // Fix: Strictly follow initialization guidelines for GoogleGenAI by using process.env.API_KEY directly
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: 'Eres un experto asistente para un taller de marmolería llamado Commagra. Ayudas a los operarios con dudas sobre tipos de mármol (Carrara, Macael, etc), técnicas de corte, pegamentos epoxi, pulido y mantenimiento de máquinas. Responde de forma concisa y profesional en español.',
        }
      });

      const text = response.text || 'Lo siento, no he podido procesar eso.';
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Error de conexión con el asistente AI.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen ? (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gray-900 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                <i className="fas fa-robot text-xs"></i>
              </div>
              <span className="font-bold">Asistente Commagra</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-300">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-red-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 shadow-sm border border-gray-200 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 rounded-tl-none flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Pregunta algo..."
                className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                className="bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-900 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group"
        >
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full animate-ping"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full"></div>
          <i className="fas fa-robot text-xl group-hover:rotate-12 transition-transform"></i>
        </button>
      )}
    </div>
  );
};

export default GeminiAssistant;
