
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
  const [settings, setSettings] = useState<AppSettings>({
    whatsappNumber: '',
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

  const sendWhatsAppMessage = (task: MarbleTask, newStatus: TaskStatus) => {
    if (!settings.notificationsEnabled) return;
    const message = `*COMMAGRA - REPORTE TALLER* ⚒️%0A%0A` +
      `*Estado:* ${newStatus.toUpperCase()} 🚨%0A` +
      `*Cliente:* ${task.clientName}%0A` +
      `*Material:* ${task.material} (${task.color})%0A` +
      `*Montadores:* ${task.montador}%0A` +
      `*Entrega:* ${task.deliveryDate}%0A` +
      `*Pedido:* ${task.pedido || 'S/N'}%0A%0A` +
      `_Mensaje enviado desde la App Interna Commagra_`;
    const phone = settings.whatsappNumber.replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, '_blank');
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
      
      if (!response.ok) throw new Error("Error en la conexión con Google");
      
      const cloudTasks = await response.json();
      
      if (Array.isArray(cloudTasks)) {
        if (cloudTasks.length === 0) {
          alert("El Excel está vacío.");
          setIsSyncing(false);
          return;
        }

        const mappedTasks: MarbleTask[] = cloudTasks.map((t: any) => ({
          id: String(t.id),
          montador: String(t.montador),
          clientName: String(t.clientName),
          material: String(t.material),
          color: String(t.color || ''),
          status: (t.status) as TaskStatus,
          description: String(t.description),
          pedido: String(t.pedido || ''),
          fecha: String(t.fecha),
          deliveryDate: String(t.deliveryDate || ''),
          hora: String(t.hora || ''),
          fileName: String(t.fileName || ''),
          fileData: String(t.fileData || ''),
          dxfFileName: String(t.dxfFileName || ''),
          dxfFileData: String(t.dxfFileData || ''),
          syncedToSheet: true,
          createdAt: Number(t.createdAt || Date.now())
        }));
        
        setTasks(mappedTasks);
        alert(`Sincronización completa: ${mappedTasks.length} trabajos cargados.`);
      }
    } catch (error) {
      console.error(error);
      alert("Error al cargar datos de la nube.");
    } finally {
      setIsSyncing(false);
    }
  };

  const syncToGoogleSheet = async (task: MarbleTask, action: 'add' | 'update' | 'test') => {
    if (!settings.googleSheetEnabled && action !== 'test') return false;
    const url = (action === 'test' && (task as any).url) ? (task as any).url : settings.googleSheetWebhookUrl;
    if (!url || !url.includes('/exec')) return false;

    const payload = {
      action,
      id: task.id,
      montadores: task.montador,
      cliente: task.clientName,
      material: task.material,
      estado: task.status,
      descripcion: task.description,
      fecha: task.fecha,
      fechaEntrega: task.deliveryDate,
      pedido: task.pedido,
      color: task.color,
      archivoPDF: task.fileData || '',
      archivoDXF: task.dxfFileData || '',
      createdAt: task.createdAt
    };

    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
      });
      if (action !== 'test') {
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, syncedToSheet: true } : t));
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const addTask = (taskData: Omit<MarbleTask, 'id' | 'createdAt'>) => {
    const newTask: MarbleTask = {
      ...taskData,
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      createdAt: Date.now(),
      syncedToSheet: false,
    };
    setTasks(prev => [newTask, ...prev]);
    setIsFormOpen(false);
    setTimeout(() => syncToGoogleSheet(newTask, 'add'), 500);
  };

  const updateTaskStatus = (id: string, newStatus: TaskStatus) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === id) {
          const updatedTask = { ...t, status: newStatus, syncedToSheet: false };
          syncToGoogleSheet(updatedTask, 'update');
          if (confirm(`¿Notificar cambio a WhatsApp?`)) {
            sendWhatsAppMessage(updatedTask, newStatus);
          }
          return updatedTask;
        }
        return t;
      });
      return updated;
    });
  };

  const deleteTask = (id: string) => {
    if (window.confirm('¿Eliminar este trabajo?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} settings={settings} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-10 relative z-20">
        <DashboardStats tasks={tasks} />

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 bg-white p-4 rounded-[2rem] shadow-xl border border-gray-100">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              {(['TODAS', ...Object.values(TaskStatus)] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${
                    filter === s ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
             <button
              onClick={pullFromCloud}
              disabled={isSyncing}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isSyncing ? 'bg-gray-100 text-gray-400' : 'bg-green-600 text-white hover:bg-black active:scale-95'}`}
              title="Sincronizar de la Nube"
            >
              <i className={`fas fa-sync-alt ${isSyncing ? 'fa-spin' : ''}`}></i>
            </button>
             <button
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              className="bg-gray-200 text-gray-600 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center hover:bg-gray-300 transition-all shadow-sm"
            >
              <i className={`fas ${viewMode === 'table' ? 'fa-th-large' : 'fa-list'}`}></i>
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex-1 md:flex-none flex items-center gap-3 bg-red-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-black transition-all shadow-xl active:scale-95 justify-center uppercase italic text-xs md:text-sm tracking-tighter"
            >
              <i className="fas fa-plus"></i>
              NUEVO TRABAJO
            </button>
          </div>
        </div>

        <TaskList 
          tasks={filter === 'TODAS' ? tasks : tasks.filter(t => t.status === filter)} 
          onUpdateStatus={updateTaskStatus}
          onDelete={deleteTask}
          viewMode={viewMode}
          onSendWhatsApp={(task) => sendWhatsAppMessage(task, task.status)}
        />
      </main>

      {isFormOpen && <TaskForm onClose={() => setIsFormOpen(false)} onSubmit={addTask} />}
      {isSettingsOpen && (
        <SettingsModal 
          settings={settings}
          onClose={() => setIsSettingsOpen(false)}
          onSave={updateSettings}
          onTestConnection={(url) => syncToGoogleSheet({url} as any, 'test')}
        />
      )}
    </div>
  );
};

export default App;
