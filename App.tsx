
import React, { useState, useEffect } from 'react';
import { TaskStatus, MarbleTask, AppSettings } from './types';
import Header from './components/Header';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import DashboardStats from './components/DashboardStats';
import SettingsModal from './components/SettingsModal';

const STORAGE_KEY = 'commagra_tasks_v1';
const SETTINGS_KEY = 'commagra_settings_v1';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<MarbleTask[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | 'TODAS'>('TODAS');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [activeTaskForWA, setActiveTaskForWA] = useState<MarbleTask | null>(null);
  
  const [settings, setSettings] = useState<AppSettings>({
    whatsappNumber: '',
    whatsappLabel1: 'Jefe',
    whatsappNumber2: '',
    whatsappLabel2: 'Oficina',
    whatsappManualEnabled: true,
    notificationsEnabled: true,
    sendToGroup: false,
    googleSheetEnabled: false,
    googleSheetWebhookUrl: '',
  });

  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  const executeWhatsAppSend = (task: MarbleTask, phone?: string) => {
    const message = `*COMMAGRA - REPORTE TALLER* ⚒️%0A%0A` +
      `*Estado:* ${task.status.toUpperCase()} 🚨%0A` +
      `*Cliente:* ${task.clientName}%0A` +
      `*Material:* ${task.material} (${task.color})%0A` +
      `*Montadores:* ${task.montador}%0A` +
      `*Entrega:* ${task.deliveryDate}%0A` +
      `*Pedido:* ${task.pedido || 'S/N'}%0A%0A` +
      `_Mensaje enviado desde la App Interna Commagra_`;
    
    let url = '';
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      url = `https://wa.me/${cleanPhone}?text=${message}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${message}`;
    }
    window.open(url, '_blank');
    setActiveTaskForWA(null);
  };

  const handleWhatsAppRequest = (task: MarbleTask) => {
    const hasNum1 = !!settings.whatsappNumber;
    const hasNum2 = !!settings.whatsappNumber2;
    const hasManual = settings.whatsappManualEnabled;

    if (hasNum1 && !hasNum2 && !hasManual) {
      executeWhatsAppSend(task, settings.whatsappNumber);
    } else if (!hasNum1 && !hasNum2 && hasManual) {
      executeWhatsAppSend(task);
    } else {
      setActiveTaskForWA(task);
    }
  };

  const pullFromCloud = async () => {
    if (!settings.googleSheetWebhookUrl) {
      alert("Configura la URL de Google Sheets primero.");
      return;
    }
    setIsSyncing(true);
    try {
      const url = `${settings.googleSheetWebhookUrl}?action=read`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error de red");
      const cloudTasks = await response.json();
      if (Array.isArray(cloudTasks)) {
        const mappedTasks: MarbleTask[] = cloudTasks.map((t: any) => ({
          ...t,
          id: String(t.id),
          clientName: t.cliente || t.clientName,
          deliveryDate: t.fechaEntrega || t.deliveryDate,
          montador: t.montadores || t.montador,
          status: t.estado || t.status,
          description: t.descripcion || t.description || '',
          fileName: t.planoPdf || t.fileName || '',
          fileData: t.planoPdfData || t.fileData || '',
          dxfFileName: t.planoDxf || t.dxfFileName || '',
          dxfFileData: t.planoDxfData || t.dxfFileData || '',
          syncedToSheet: true,
          createdAt: Number(t.createdAt || Date.now())
        }));
        setTasks(mappedTasks);
        alert("✅ Nube sincronizada: Todos los datos y planos actualizados.");
      }
    } catch (error) {
      alert("❌ Error al conectar con la nube. Verifica la URL del Script.");
    } finally {
      setIsSyncing(false);
    }
  };

  const syncToGoogleSheet = async (task: MarbleTask, action: 'add' | 'update' | 'test') => {
    if (!settings.googleSheetEnabled && action !== 'test') return false;
    const url = (action === 'test' && (task as any).url) ? (task as any).url : settings.googleSheetWebhookUrl;
    if (!url || !url.includes('/exec')) return false;
    
    // Enviamos el payload completo incluyendo los datos base64 para que el otro dispositivo los vea
    const payload = { 
      action, 
      id: task.id, 
      material: task.material, 
      color: task.color,
      estado: task.status, 
      cliente: task.clientName, 
      fechaEntrega: task.deliveryDate, 
      pedido: task.pedido, 
      montadores: task.montador,
      descripcion: task.description,
      planoPdf: task.fileName || '',
      planoPdfData: task.fileData || '', // Dato vital para ver planos en otros dispositivos
      planoDxf: task.dxfFileName || '',
      planoDxfData: task.dxfFileData || '' // Dato vital para ver planos en otros dispositivos
    };

    try {
      await fetch(url, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
      return true;
    } catch (e) { return false; }
  };

  const addTask = (taskData: Omit<MarbleTask, 'id' | 'createdAt'>) => {
    const newTask: MarbleTask = { 
      ...taskData, 
      id: Math.random().toString(36).substr(2, 6).toUpperCase(), 
      createdAt: Date.now(), 
      syncedToSheet: false 
    };
    setTasks(prev => [newTask, ...prev]);
    setIsFormOpen(false);
    
    // 1. Sincronizar con Google Sheets inmediatamente
    syncToGoogleSheet(newTask, 'add');
    
    // 2. Saltar menú de WhatsApp para esta tarea nueva
    setTimeout(() => {
      handleWhatsAppRequest(newTask);
    }, 400);
  };

  const updateTaskStatus = (id: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, status: newStatus, syncedToSheet: false };
        syncToGoogleSheet(updated, 'update');
        return updated;
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    if (window.confirm('¿Archivar faena?')) updateTaskStatus(id, TaskStatus.ARCHIVADO);
  };

  const visibleTasks = tasks.filter(t => t.status !== TaskStatus.ARCHIVADO);
  const filteredTasks = filter === 'TODAS' ? visibleTasks : visibleTasks.filter(t => t.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} settings={settings} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-10 relative z-20">
        <DashboardStats tasks={visibleTasks} />

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 bg-white p-4 rounded-[2rem] shadow-xl border border-gray-100">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            <div className="flex bg-gray-100 p-1 rounded-2xl min-w-max">
              {(['TODAS', TaskStatus.PENDIENTE, TaskStatus.EN_CORTE, TaskStatus.ACABADO, TaskStatus.URGENTE] as const).map((s) => (
                <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === s ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={pullFromCloud} disabled={isSyncing} className="w-12 h-12 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"><i className={`fas fa-sync-alt ${isSyncing ? 'fa-spin' : ''}`}></i></button>
            <button onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')} className="bg-gray-200 text-gray-600 w-12 h-12 rounded-2xl flex items-center justify-center"><i className={`fas ${viewMode === 'table' ? 'fa-th-large' : 'fa-list'}`}></i></button>
            <button onClick={() => setIsFormOpen(true)} className="flex-1 md:flex-none bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-lg active:scale-95 transition-all">NUEVO TRABAJO</button>
          </div>
        </div>

        <TaskList tasks={filteredTasks} onUpdateStatus={updateTaskStatus} onDelete={deleteTask} viewMode={viewMode} onSendWhatsApp={handleWhatsAppRequest} />
      </main>

      {/* MENÚ COMPARTIR WHATSAPP */}
      {activeTaskForWA && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden animate-in slide-in-from-bottom duration-300 shadow-2xl border border-gray-100">
            <div className="p-6 text-center border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-black uppercase italic text-gray-900 leading-none">Compartir con...</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 tracking-widest">{activeTaskForWA.clientName}</p>
            </div>
            <div className="p-4 space-y-2">
              {settings.whatsappNumber && (
                <button 
                  onClick={() => executeWhatsAppSend(activeTaskForWA, settings.whatsappNumber)}
                  className="w-full p-4 bg-gray-50 hover:bg-green-50 rounded-2xl flex items-center gap-4 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-gray-400 leading-none">Enviar a</p>
                    <p className="font-black text-gray-900 uppercase">{settings.whatsappLabel1 || 'Contacto 1'}</p>
                  </div>
                </button>
              )}
              {settings.whatsappNumber2 && (
                <button 
                  onClick={() => executeWhatsAppSend(activeTaskForWA, settings.whatsappNumber2)}
                  className="w-full p-4 bg-gray-50 hover:bg-green-50 rounded-2xl flex items-center gap-4 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">
                    <i className="fas fa-user-friends"></i>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-gray-400 leading-none">Enviar a</p>
                    <p className="font-black text-gray-900 uppercase">{settings.whatsappLabel2 || 'Contacto 2'}</p>
                  </div>
                </button>
              )}
              {settings.whatsappManualEnabled && (
                <button 
                  onClick={() => executeWhatsAppSend(activeTaskForWA)}
                  className="w-full p-4 bg-gray-900 text-white rounded-2xl flex items-center gap-4 hover:bg-black transition-colors shadow-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <i className="fas fa-share-alt"></i>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-gray-400 leading-none">Mi Agenda (Grupos)</p>
                    <p className="font-black uppercase">Elegir destino</p>
                  </div>
                </button>
              )}
              <button 
                onClick={() => setActiveTaskForWA(null)}
                className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 hover:text-red-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && <TaskForm onClose={() => setIsFormOpen(false)} onSubmit={addTask} />}
      {isSettingsOpen && <SettingsModal settings={settings} onClose={() => setIsSettingsOpen(false)} onSave={updateSettings} onTestConnection={(url) => syncToGoogleSheet({url} as any, 'test')} />}
    </div>
  );
};

export default App;
