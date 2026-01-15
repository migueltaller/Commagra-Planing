
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
    deliveryDate: '',
    hora: '',
    pedido: '',
    clientName: '',
    material: '',
    color: '',
    description: '',
    status: TaskStatus.PENDIENTE,
  });
  
  const [pdfFile, setPdfFile] = useState<{ name: string; data: string } | null>(null);
  const [dxfFile, setDxfFile] = useState<{ name: string; data: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMontador = (nombre: string) => {
    if (selectedMontadores.includes(nombre)) {
      setSelectedMontadores(prev => prev.filter(n => n !== nombre));
    } else {
      if (selectedMontadores.length < 2) {
        setSelectedMontadores(prev => [...prev, nombre]);
      } else {
        alert("Solo se pueden asignar hasta 2 montadores.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'dxf') => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileObj = {
          name: selectedFile.name,
          data: event.target?.result as string,
        };
        if (type === 'pdf') setPdfFile(fileObj);
        else setDxfFile(fileObj);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMontadores.length === 0) {
      alert("Selecciona al menos un montador.");
      return;
    }
    if (!formData.clientName || !formData.deliveryDate) {
      alert("Rellena el cliente y la fecha de entrega.");
      return;
    }

    setIsSubmitting(true);
    onSubmit({
      ...formData,
      montador: selectedMontadores.join(' / '),
      fileName: pdfFile?.name || '',
      fileData: pdfFile?.data || '',
      dxfFileName: dxfFile?.name || '',
      dxfFileData: dxfFile?.data || '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/20">
        <div className="bg-red-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black flex items-center gap-3">
              <i className="fas fa-hammer"></i>
              Registro de Trabajo Commagra
            </h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-black transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* MONTADORES */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex justify-between">
              <span>Montadores Asignados</span>
              <span className="text-red-600">{selectedMontadores.length}/2</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {montadoresDisponibles.map(nombre => (
                <button
                  key={nombre}
                  type="button"
                  onClick={() => toggleMontador(nombre)}
                  className={`py-3 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${
                    selectedMontadores.includes(nombre)
                      ? 'bg-red-600 border-red-600 text-white shadow-lg'
                      : 'bg-white border-gray-100 text-gray-400 hover:text-red-600'
                  }`}
                >
                  {nombre}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pedido</label>
              <input
                type="text"
                placeholder="26xxx"
                className="w-full px-5 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-red-600 outline-none transition-all font-bold"
                value={formData.pedido}
                onChange={e => setFormData(prev => ({ ...prev, pedido: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha Entrega</label>
              <input
                required
                type="date"
                className="w-full px-5 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-red-600 outline-none transition-all font-bold"
                value={formData.deliveryDate}
                onChange={e => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente / Tienda</label>
            <input
              required
              type="text"
              placeholder="Nombre del Cliente"
              className="w-full px-5 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-red-600 outline-none transition-all font-bold uppercase"
              value={formData.clientName}
              onChange={e => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Material</label>
              <input
                type="text"
                placeholder="DEKTON / MARMOL"
                className="w-full px-5 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-red-600 outline-none transition-all font-bold uppercase"
                value={formData.material}
                onChange={e => setFormData(prev => ({ ...prev, material: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Color / Espesor</label>
              <input
                type="text"
                placeholder="COLOR 2CM"
                className="w-full px-5 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-red-600 outline-none transition-all font-bold uppercase"
                value={formData.color}
                onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción</label>
            <textarea
              rows={2}
              className="w-full px-5 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-red-600 outline-none transition-all font-medium uppercase resize-none"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {/* ADJUNTOS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:bg-red-50 cursor-pointer">
              <input type="file" accept="application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileChange(e, 'pdf')} />
              <i className={`fas ${pdfFile ? 'fa-check text-green-500' : 'fa-file-pdf text-gray-300'} mb-1`}></i>
              <p className="text-[9px] font-black text-gray-500 uppercase">{pdfFile ? 'PDF LISTO' : 'SUBIR PDF'}</p>
            </div>
            <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:bg-blue-50 cursor-pointer">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileChange(e, 'dxf')} />
              <i className={`fas ${dxfFile ? 'fa-check text-green-500' : 'fa-file-code text-gray-300'} mb-1`}></i>
              <p className="text-[9px] font-black text-gray-500 uppercase">{dxfFile ? 'DXF LISTO' : 'SUBIR DXF'}</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl active:scale-95 uppercase"
          >
            {isSubmitting ? 'REGISTRANDO...' : 'REGISTRAR TRABAJO'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
