
import React, { useState } from 'react';
import { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
  onTestConnection: (url: string) => Promise<boolean>;
}

const SettingsModal: React.FC<Props> = ({ settings, onClose, onSave, onTestConnection }) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-y-auto border border-gray-200 animate-in zoom-in duration-300">
        <div className="bg-red-600 p-8 text-white sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Configuración</h2>
            <p className="text-red-100 text-[10px] font-black uppercase tracking-widest mt-1">Sincro y Notificaciones</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-black transition-all">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* SECCIÓN WHATSAPP */}
          <section className="space-y-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] italic border-b pb-2">Destinatarios WhatsApp</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CONTACTO 1 */}
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Contacto 1</p>
                <input
                  type="text"
                  placeholder="Nombre (Ej: Jefe)"
                  className="w-full px-5 py-3 rounded-xl border-2 border-white text-xs font-bold focus:border-red-600 outline-none shadow-sm"
                  value={formData.whatsappLabel1}
                  onChange={e => setFormData(prev => ({ ...prev, whatsappLabel1: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="34600000000"
                  className="w-full px-5 py-3 rounded-xl border-2 border-white text-xs font-bold focus:border-red-600 outline-none shadow-sm"
                  value={formData.whatsappNumber}
                  onChange={e => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                />
              </div>

              {/* CONTACTO 2 */}
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Contacto 2</p>
                <input
                  type="text"
                  placeholder="Nombre (Ej: Oficina)"
                  className="w-full px-5 py-3 rounded-xl border-2 border-white text-xs font-bold focus:border-red-600 outline-none shadow-sm"
                  value={formData.whatsappLabel2}
                  onChange={e => setFormData(prev => ({ ...prev, whatsappLabel2: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="34600000000"
                  className="w-full px-5 py-3 rounded-xl border-2 border-white text-xs font-bold focus:border-red-600 outline-none shadow-sm"
                  value={formData.whatsappNumber2}
                  onChange={e => setFormData(prev => ({ ...prev, whatsappNumber2: e.target.value }))}
                />
              </div>
            </div>

            {/* OPCIÓN MANUAL */}
            <div className="bg-gray-900 p-6 rounded-3xl flex items-center justify-between text-white">
              <div>
                <p className="font-black text-sm uppercase leading-none">Envío Libre (Grupos)</p>
                <p className="text-[9px] text-gray-400 mt-1 uppercase">Permite elegir contacto o grupo manualmente</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={formData.whatsappManualEnabled}
                  onChange={e => setFormData(prev => ({ ...prev, whatsappManualEnabled: e.target.checked }))}
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </section>

          {/* SECCIÓN EXCEL */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] italic border-b pb-2">Google Sheets (Excel)</h3>
            <div className="space-y-4 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
               <input
                type="url"
                placeholder="URL del Script de Google"
                className="w-full px-6 py-4 rounded-2xl border-2 border-white text-sm font-bold focus:border-red-600 outline-none transition-all shadow-sm"
                value={formData.googleSheetWebhookUrl}
                onChange={e => setFormData(prev => ({ ...prev, googleSheetWebhookUrl: e.target.value }))}
              />
              <div className="flex gap-4">
                <div className="flex-1 flex items-center gap-3 bg-white px-6 py-4 rounded-2xl border-2 border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase">SINCRO NUBE:</span>
                  <label className="relative inline-flex items-center cursor-pointer ml-auto">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.googleSheetEnabled}
                      onChange={e => setFormData(prev => ({ ...prev, googleSheetEnabled: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </section>

          <button
            onClick={handleSave}
            className="w-full bg-gray-950 text-white py-6 rounded-3xl font-black text-xl hover:bg-black transition-all shadow-2xl active:scale-95 uppercase italic"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
