
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
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const runTest = async () => {
    if (!formData.googleSheetWebhookUrl) {
      alert("Pega la URL primero.");
      return;
    }
    setTestStatus('loading');
    const success = await onTestConnection(formData.googleSheetWebhookUrl);
    setTestStatus(success ? 'success' : 'error');
    if (success) {
      alert("¡Conexión establecida!");
    }
  };

  const scriptCode = `function doPost(e) { /* ... código anterior ... */ }`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-y-auto border border-gray-200 animate-in zoom-in duration-300">
        <div className="bg-red-600 p-8 text-white sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase">Configuración Commagra</h2>
            <p className="text-red-100 text-[10px] font-black uppercase tracking-widest">Sincro y Notificaciones</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-black transition-all">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* SECCIÓN WHATSAPP */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] italic">Notificaciones WhatsApp</h3>
            <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Nº de Teléfono (con prefijo 34)</label>
                <input
                  type="text"
                  placeholder="34600000000"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-white text-sm font-bold focus:border-green-500 outline-none transition-all shadow-sm"
                  value={formData.whatsappNumber}
                  onChange={e => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                />
              </div>
              <div className="flex items-center justify-between px-2">
                <span className="text-[11px] font-black text-gray-700 uppercase">¿Activar avisos automáticos?</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.notificationsEnabled}
                    onChange={e => setFormData(prev => ({ ...prev, notificationsEnabled: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
          </section>

          {/* SECCIÓN EXCEL */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] italic">Google Sheets (Excel)</h3>
            <div className="space-y-4 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
               <input
                type="url"
                placeholder="URL del Script de Google"
                className="w-full px-6 py-4 rounded-2xl border-2 border-white text-sm font-bold focus:border-red-600 outline-none transition-all shadow-sm"
                value={formData.googleSheetWebhookUrl}
                onChange={e => setFormData(prev => ({ ...prev, googleSheetWebhookUrl: e.target.value }))}
              />
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={runTest}
                  className="flex-1 py-4 bg-white border-2 border-gray-200 rounded-2xl font-black text-[10px] uppercase hover:border-red-600 transition-all shadow-sm"
                >
                  Probar Conexión
                </button>
                <div className="flex items-center gap-3 bg-white px-6 rounded-2xl border-2 border-gray-200">
                  <span className="text-[10px] font-black text-gray-400 uppercase">SINCRO:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
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
