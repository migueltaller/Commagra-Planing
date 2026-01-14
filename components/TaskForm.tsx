
import React, { useState } from 'react';
import { TaskStatus, MarbleTask } from '../types';

interface Props {
  onClose: () => void;
  onSubmit: (task: Omit<MarbleTask, 'id' | 'createdAt'>) => void;
}

const TaskForm: React.FC<Props> = ({ onClose, onSubmit }) => {
  const montadoresDisponibles = ["Cesar", "Sergio", "Pol", "Arturo", "Raúl", "Fernando", "Paco", "Taller", "Otros"];
  
  const [selectedMontadores, setSelectedMontadores] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora: '',
    pedido: '',
    clientName: '',
    material: '',
    color: '',
    description: '',
    status: TaskStatus.PENDIENTE,
  });
  const [file, setFile] = useState<{ name: string; data: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMontador = (nombre: string) => {
    if (selectedMontadores.includes(nombre)) {
      setSelectedMontadores(prev => prev.filter(n => n !== nombre));
    } else {
      if (selectedMontadores.length < 2) {
        setSelectedMontadores(prev => [...prev, nombre]);
      } else {
        alert("Solo se pueden asignar hasta 2 operarios.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFile({
          name: selectedFile.name,
          data: event.target?.result as string,
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMontadores.length === 0) {
      alert("Por favor selecciona al menos un operario.");
      return;
    }
    if (!formData.clientName || !file) {
      alert("Por favor rellena el cliente y adjunta el plano.");
      return;
    }

    setIsSubmitting(true);
    onSubmit({
      ...formData,
      montador: selectedMontadores.join(' / '),
      fileName: file.name,
      fileData: file.data,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/20">
        <div className="bg-red-600 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3">
              <i className="fas fa-plus-circle"></i>
              Nuevo Trabajo Commagra
            </h2>
            <p className="text-red-100 text-[10px] font-bold uppercase tracking-widest mt-1">Ingreso de planos y detalles</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-black transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* SECCIÓN OPERARIOS */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex justify-between">
              <span>Operarios Asignados</span>
              <span className="text-red-600">{selectedMontadores.length}/2</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {montadoresDisponibles.map(nombre => (
                <button
                  key={nombre}
                  type="button"
                  onClick={() => toggleMontador(nombre)}
                  className={`py-3 rounded-2xl text-[11px] font-black uppercase transition-all border-2 ${
                    selectedMontadores.includes(nombre)
                      ? 'bg-red-600 border-red-600 text-white shadow-xl scale-[1.02]'
                      : 'bg-white border-gray-100 text-gray-400 hover:border-red-100 hover:text-red-600'
                  }`}
                >
                  {nombre}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nº Pedido / Referencia</label>
              <input
                type="text"
                placeholder="26xxx"
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-red-600 outline-none transition-all font-bold"
                value={formData.pedido}
                onChange={e => setFormData(prev => ({ ...prev, pedido: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente / Tienda</label>
              <input
                required
                type="text"
                placeholder="Nombre completo"
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-red-600 outline-none transition-all font-bold uppercase"
                value={formData.clientName}
                onChange={e => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción del Trabajo</label>
            <textarea
              rows={3}
              placeholder="Ej: Encimera Silestone + Copete + Hueco bajo encimera..."
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-red-600 outline-none transition-all font-medium uppercase resize-none"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Material</label>
              <input
                type="text"
                placeholder="DEKTON / MARMOL"
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-red-600 outline-none transition-all font-bold uppercase"
                value={formData.material}
                onChange={e => setFormData(prev => ({ ...prev, material: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Color / Espesor</label>
              <input
                type="text"
                placeholder="COLOR 2CM"
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-red-600 outline-none transition-all font-bold uppercase"
                value={formData.color}
                onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adjuntar Plano (PDF)</label>
            <div className="relative border-4 border-dashed border-gray-100 rounded-3xl p-8 hover:border-red-500/30 hover:bg-red-50 transition-all group text-center cursor-pointer">
              <input type="file" accept="application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
              <div className="flex flex-col items-center gap-2">
                <i className={`fas ${file ? 'fa-check-circle text-green-500' : 'fa-cloud-upload-alt text-gray-300'} text-4xl group-hover:scale-110 transition-transform`}></i>
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{file ? file.name : 'Seleccionar archivo del dispositivo'}</p>
                <p className="text-[9px] text-gray-300 font-bold uppercase">Solo archivos PDF</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-950 text-white py-6 rounded-3xl font-black text-xl hover:bg-black transition-all shadow-2xl active:scale-95 uppercase tracking-tighter"
          >
            {isSubmitting ? 'Procesando...' : 'Registrar en Taller'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
