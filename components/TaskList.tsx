
import React from 'react';
import { MarbleTask, TaskStatus } from '../types';

interface Props {
  tasks: MarbleTask[];
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onSendWhatsApp: (task: MarbleTask) => void;
  viewMode: 'cards' | 'table';
}

const TaskList: React.FC<Props> = ({ tasks, onUpdateStatus, onDelete, onSendWhatsApp, viewMode }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
        <i className="fas fa-industry text-gray-200 text-6xl mb-4"></i>
        <p className="text-gray-400 font-black uppercase text-xs tracking-[0.2em]">No hay trabajos en el sistema.</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    return days[date.getDay()];
  };

  if (viewMode === 'table') {
    return (
      <div className="space-y-4">
        <div className="flex justify-end print:hidden">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg"
          >
            <i className="fas fa-print"></i>
            Imprimir Planning Taller
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-200 overflow-hidden print:border-none print:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px] print:min-w-full">
              <thead>
                <tr className="bg-gray-950 text-white border-b border-gray-800">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest w-32">Operario</th>
                  <th className="px-2 py-5 text-[10px] font-black uppercase tracking-widest text-center w-40 print:hidden">Control</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest w-40">Día / Fecha</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest w-24">Pedido</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">Cliente / Tienda</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">Material y Trabajo</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-right print:hidden">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map(task => (
                  <tr key={task.id} className={`hover:bg-gray-50 transition-colors ${task.status === TaskStatus.URGENTE ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-lg font-black text-[10px] uppercase border-2 ${task.status === TaskStatus.URGENTE ? 'border-red-600 text-red-600' : 'border-gray-950 text-gray-950'}`}>
                        {task.montador}
                      </span>
                    </td>
                    <td className="px-2 py-4 print:hidden">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex justify-center gap-1">
                          {Object.values(TaskStatus).map(s => (
                            <button
                              key={s}
                              onClick={() => onUpdateStatus(task.id, s)}
                              className={`w-7 h-7 rounded-lg border-2 transition-all transform active:scale-90 ${task.status === s ? getStatusBg(s) : 'bg-white hover:bg-gray-100 border-gray-100'}`}
                              title={s}
                            />
                          ))}
                        </div>
                        <div className={`text-[8px] font-black flex items-center gap-1 ${task.syncedToSheet ? 'text-green-600' : 'text-amber-500'}`}>
                          <i className={`fas ${task.syncedToSheet ? 'fa-check-double' : 'fa-sync fa-spin'}`}></i>
                          {task.syncedToSheet ? 'EXCEL ACTUALIZADO' : 'SUBIENDO...'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-black text-[11px] text-gray-950 tracking-tighter">{getDayName(task.fecha)}</span>
                        <span className="text-[10px] text-gray-400 font-bold">{new Date(task.fecha).toLocaleDateString('es-ES')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-red-600 font-black tracking-tighter">{task.pedido || 'S/N'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-black text-[12px] text-gray-900 uppercase leading-none">{task.clientName}</span>
                        <span className={`text-[9px] font-bold uppercase mt-1 ${getStatusText(task.status)}`}>{task.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-black text-[10px] text-red-600 uppercase tracking-tight">{task.material} · {task.color}</span>
                        <span className="text-[10px] text-gray-500 uppercase leading-tight italic line-clamp-1">{task.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right print:hidden">
                      <div className="flex items-center justify-end gap-2">
                         <button 
                            onClick={() => onSendWhatsApp(task)}
                            className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm"
                            title="Reportar WhatsApp"
                          >
                            <i className="fab fa-whatsapp"></i>
                          </button>
                         {task.fileData && (
                          <button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = task.fileData!;
                              link.download = task.fileName;
                              link.click();
                            }}
                            className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            title="Ver Plano"
                          >
                            <i className="fas fa-file-pdf"></i>
                          </button>
                        )}
                        <button onClick={() => onDelete(task.id)} className="w-10 h-10 rounded-xl text-gray-200 hover:text-red-600 hover:bg-red-50 transition-all">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {tasks.map(task => (
        <div key={task.id} className={`bg-white rounded-[2.5rem] shadow-xl border-t-[12px] ${getStatusBorder(task.status)} overflow-hidden hover:shadow-2xl transition-all relative group`}>
          <div className={`absolute top-4 right-6 text-[8px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 ${task.syncedToSheet ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            <i className={`fas ${task.syncedToSheet ? 'fa-cloud-check' : 'fa-cloud-arrow-up animate-pulse'}`}></i>
            {task.syncedToSheet ? 'NUBE OK' : 'SINCRO'}
          </div>

          <div className="p-8">
            <div className="mb-6">
              <span className="text-[10px] font-black bg-gray-950 text-white px-4 py-1.5 rounded-xl uppercase tracking-widest">{task.montador}</span>
            </div>
            
            <h3 className="text-2xl font-black text-gray-950 leading-none uppercase mb-2 tracking-tighter">{task.clientName}</h3>
            <p className="text-xs font-black text-red-600 uppercase mb-6 tracking-wide">{task.material} <span className="text-gray-300 mx-1">/</span> {task.color}</p>
            
            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 mb-6 min-h-[80px]">
              <p className="text-[11px] text-gray-600 font-bold uppercase leading-relaxed italic">{task.description}</p>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-950 uppercase">{getDayName(task.fecha)}</span>
                <span className="text-[10px] font-bold text-gray-400">{new Date(task.fecha).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex gap-3">
                 <button 
                    onClick={() => onSendWhatsApp(task)}
                    className="w-12 h-12 rounded-2xl bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-all shadow-lg"
                  >
                    <i className="fab fa-whatsapp text-xl"></i>
                  </button>
                 {task.fileData && (
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = task.fileData!;
                      link.download = task.fileName;
                      link.click();
                    }}
                    className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center hover:bg-black transition-all shadow-lg"
                  >
                    <i className="fas fa-file-pdf text-xl"></i>
                  </button>
                )}
                <button onClick={() => onDelete(task.id)} className="text-gray-200 hover:text-red-600 transition-colors">
                  <i className="fas fa-trash-alt text-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

function getStatusBg(status: TaskStatus) {
  switch (status) {
    case TaskStatus.ACABADO: return 'bg-green-500 border-green-600';
    case TaskStatus.EN_CORTE: return 'bg-amber-400 border-amber-500';
    case TaskStatus.URGENTE: return 'bg-red-600 border-red-700 shadow-[0_0_15px_rgba(220,38,38,0.4)]';
    case TaskStatus.PENDIENTE: return 'bg-gray-400 border-gray-500';
    default: return 'bg-gray-100 border-gray-200';
  }
}

function getStatusText(status: TaskStatus) {
  switch (status) {
    case TaskStatus.ACABADO: return 'text-green-600';
    case TaskStatus.EN_CORTE: return 'text-amber-500';
    case TaskStatus.URGENTE: return 'text-red-600';
    default: return 'text-gray-400';
  }
}

function getStatusBorder(status: TaskStatus) {
  switch (status) {
    case TaskStatus.ACABADO: return 'border-green-500';
    case TaskStatus.EN_CORTE: return 'border-amber-400';
    case TaskStatus.URGENTE: return 'border-red-600';
    case TaskStatus.PENDIENTE: return 'border-gray-400';
    default: return 'border-gray-200';
  }
}

export default TaskList;
