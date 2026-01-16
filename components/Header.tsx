
import React, { useState } from 'react';
import { AppSettings } from '../types';

interface Props {
  onOpenSettings: () => void;
  settings: AppSettings;
}

const Header: React.FC<Props> = ({ onOpenSettings, settings }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUrl = window.location.href;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="bg-white border-b-[6px] md:border-b-[16px] border-red-600 shadow-2xl relative overflow-hidden print:py-4 print:border-b-4">
      {/* Fondo decorativo */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.01] pointer-events-none flex items-center justify-center select-none">
        <span className="text-[25vw] font-black italic tracking-tighter">COMMAGRA</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center">
        
        {/* Botones de acción rápidos */}
        <div className="w-full flex justify-end items-center gap-2 pt-4 pb-2 md:pb-6 print:hidden">
          <button 
            onClick={() => setShowShareModal(true)}
            className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-green-600 text-white flex items-center justify-center hover:bg-black transition-all shadow-lg active:scale-95"
            title="Compartir App"
          >
            <i className="fas fa-mobile-alt"></i>
          </button>
          
          <button 
            onClick={onOpenSettings}
            className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-gray-900 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg group active:scale-95"
            title="Configurar Sincro"
          >
            <i className="fas fa-cog group-hover:rotate-90 transition-transform"></i>
          </button>
        </div>
        
        {/* Título Principal */}
        <div className="pb-14 md:pb-20 text-center w-full max-w-full px-2 overflow-hidden">
          <h1 
            style={{ fontSize: 'clamp(2.2rem, 11vw, 12rem)' }}
            className="font-black text-red-600 tracking-tighter leading-none italic drop-shadow-[0_4px_4px_rgba(220,38,38,0.15)] select-none transform -skew-x-6 whitespace-nowrap inline-block px-2"
          >
            COMMAGRA
          </h1>
          
          <div className="flex flex-col items-center mt-2 md:mt-6">
            <div className="h-1 w-12 md:w-32 bg-gray-900 mb-3 rounded-full"></div>
            <p className="text-gray-900 font-black tracking-[0.1em] md:tracking-[0.4em] uppercase text-[7px] sm:text-[10px] md:text-2xl italic leading-none">
              Taller de Elaboración de Mármoles
            </p>
            
            {/* Indicador de Estado - Corregido para móviles */}
            <div className="mt-6 print:hidden">
              <span className={`px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black border-2 transition-all flex items-center gap-2 ${settings.googleSheetEnabled ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${settings.googleSheetEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                {settings.googleSheetEnabled ? 'CONEXIÓN NUBE ACTIVA' : 'MODO LOCAL'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal QR */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2.5rem] max-w-sm w-full text-center relative shadow-2xl animate-in zoom-in duration-200">
            <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-600">
              <i className="fas fa-times text-xl"></i>
            </button>
            <h3 className="text-xl font-black uppercase italic mb-2">Acceso Taller</h3>
            <p className="text-[10px] font-bold text-gray-400 mb-6 uppercase tracking-widest">Escanea para abrir en el móvil</p>
            <div className="p-4 bg-gray-50 rounded-3xl border-2 border-gray-100 mb-6">
              <img src={qrUrl} alt="QR" className="w-full aspect-square mix-blend-multiply" />
            </div>
            <button 
              onClick={copyToClipboard}
              className={`w-full py-4 rounded-2xl font-black text-xs tracking-widest transition-all ${copied ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-red-600'}`}
            >
              {copied ? '¡ENLACE COPIADO!' : 'COPIAR URL DE LA APP'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
