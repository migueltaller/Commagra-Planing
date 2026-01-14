
import React, { useState } from 'react';
import { AppSettings } from '../types';

interface Props {
  onOpenSettings: () => void;
  settings: AppSettings;
}

const Header: React.FC<Props> = ({ onOpenSettings, settings }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Detectamos la URL real donde esté alojada la App
  const currentUrl = window.location.href;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="bg-white border-b-[8px] md:border-b-[20px] border-red-600 shadow-2xl relative overflow-hidden print:py-4 print:border-b-4">
      {/* Decoración de fondo marmolada */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none flex items-center justify-center select-none">
        <span className="text-[25vw] font-black italic tracking-tighter">MARMOL</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
        
        {/* BARRA DE HERRAMIENTAS SUPERIOR */}
        <div className="w-full flex justify-end items-center gap-2 md:gap-3 pt-4 md:pt-8 pb-4 md:pb-10 print:hidden">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Gestión de Producción</span>
            <span className="text-[10px] font-bold text-red-600 uppercase italic">Sistema en la Nube v2.0</span>
          </div>
          
          <button 
            onClick={() => setShowShareModal(true)}
            className="w-9 h-9 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-green-600 text-white flex items-center justify-center hover:bg-black transition-all shadow-xl border-2 border-white/20 active:scale-95"
            title="Compartir enlace de acceso"
          >
            <i className="fas fa-mobile-alt text-sm md:text-xl"></i>
          </button>
          
          <button 
            onClick={onOpenSettings}
            className="w-9 h-9 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gray-950 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-xl group border-2 border-white/20 active:scale-95"
            title="Configuración"
          >
            <i className="fas fa-cog text-sm md:text-xl group-hover:rotate-90 transition-transform"></i>
          </button>
        </div>
        
        {/* TÍTULO PRINCIPAL REDIMENSIONADO PARA MÓVIL */}
        <div className="pb-6 md:pb-24 text-center w-full overflow-hidden flex flex-col items-center">
          {/* 
            - Ajustado a text-[10vw] para que 8 letras quepan cómodamente (8x10 = 80% del ancho)
            - sm:text-[12vw] para tablets
            - md:text-[8rem] y superiores para pantallas grandes
          */}
          <h1 className="text-[10vw] sm:text-[12vw] md:text-[9rem] lg:text-[12rem] font-black text-red-600 tracking-tighter leading-none italic drop-shadow-[0_5px_5px_rgba(220,38,38,0.2)] md:drop-shadow-[0_25px_25px_rgba(220,38,38,0.2)] select-none transform -skew-x-6 whitespace-nowrap inline-block px-4">
            COMMAGRA
          </h1>
          
          <div className="flex flex-col items-center mt-2 md:mt-12">
            <div className="h-1 md:h-2 w-20 md:w-48 bg-gray-950 mb-3 md:mb-6 rounded-full"></div>
            <p className="text-gray-950 font-black tracking-[0.1em] md:tracking-[0.5em] uppercase text-[7px] sm:text-xs md:text-3xl italic px-4 text-center">
              Taller de Elaboración de Mármoles
            </p>
            
            <div className="flex items-center gap-4 mt-4 md:mt-10 print:hidden">
              <span className={`px-3 md:px-5 py-1 md:py-2 rounded-full text-[7px] md:text-[10px] font-black border-2 transition-all shadow-md flex items-center gap-2 ${settings.googleSheetEnabled ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                <div className={`w-1 h-1 md:w-2 md:h-2 rounded-full ${settings.googleSheetEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                {settings.googleSheetEnabled ? 'CONECTADO' : 'MODO LOCAL'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE ACCESO REMOTO */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] max-w-md w-full text-center relative shadow-2xl border border-white/20">
            <button 
              onClick={() => setShowShareModal(false)}
              className="absolute -top-4 -right-4 w-12 h-12 md:w-14 md:h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-20"
            >
              <i className="fas fa-times text-lg md:text-xl"></i>
            </button>
            
            <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter mb-2 text-gray-900 leading-none">Acceso Remoto</h3>
            <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 md:mb-10">Uso interno taller Commagra</p>
            
            <div className="bg-gray-50 p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border-2 border-gray-100 mb-6 md:mb-8 inline-block shadow-inner">
              <img src={qrUrl} alt="QR Code" className="w-48 h-48 md:w-64 md:h-64 mx-auto mix-blend-multiply" />
            </div>

            <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
              <button 
                onClick={copyToClipboard}
                className={`w-full py-4 md:py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 border-2 ${copied ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-950 border-gray-950 text-white hover:bg-red-600 hover:border-red-600'}`}
              >
                <i className={`fas ${copied ? 'fa-check' : 'fa-link'}`}></i>
                {copied ? '¡COPIADO!' : 'COPIAR ENLACE'}
              </button>
            </div>

            <div className="bg-blue-50 p-4 md:p-6 rounded-3xl border border-blue-100 text-left">
              <div className="flex gap-3 md:gap-4">
                <i className="fas fa-cloud-arrow-down text-blue-600 text-lg md:text-xl mt-1"></i>
                <div>
                  <p className="text-[10px] md:text-[11px] font-black text-blue-900 uppercase">Instalar en el móvil:</p>
                  <p className="text-[9px] md:text-[10px] font-bold text-blue-800 uppercase leading-tight mt-1 opacity-70">
                    Abre el enlace y selecciona <span className="underline">"Añadir a pantalla de inicio"</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
