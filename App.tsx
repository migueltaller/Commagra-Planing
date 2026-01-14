
import React, { useState, useEffect } from 'react';
import { TaskStatus, MarbleTask, AppSettings } from './types';
import Header from './components/Header';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import DashboardStats from './components/DashboardStats';
import GeminiAssistant from './components/GeminiAssistant';
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
      `*Operario:* ${task.montador}%0A` +
      `*Pedido:* ${task.pedido || 'S/N'}%0A%0A` +
      `_Mensaje enviado desde la App Interna Commagra_`;

    const phone = settings.whatsappNumber.replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, '_blank');
  };

  // Función para traer datos de la nube
  const pullFromCloud = async () => {
    if (!settings.googleSheetWebhookUrl) {
      alert("Configura la URL de Google Sheets primero.");
      return;
    }

    setIsSyncing(true);
    try {
      // Para leer datos de Google Sheets necesitamos enviar una petición que el script entienda
      // Nota: El script de Google Apps debe devolver JSON
      const response = await fetch(`${settings.googleSheetWebhookUrl}?action=read`);
      const cloudTasks = await response.json();
      
      if (Array.isArray(cloudTasks)) {
        // Combinamos manteniendo los IDs únicos, priorizando lo que viene de la nube
        setTasks(cloudTasks.map(t => ({ ...t, syncedToSheet: true })));
        alert("¡Datos actualizados desde la nube!");
      }
    } catch (error) {
      console.error('Error al sincronizar:', error);
      alert("No se pudieron traer los datos. Asegúrate de que el Script de Google permite lecturas (GET).");
    } finally {
      setIsSyncing(false);
    }
  };

  const syncToGoogleSheet = async (task: any, action: 'add' | 'update' | 'test') => {
    if (!settings.googleSheetEnabled && action !== 'test') return false;
    
    const url = action === 'test' ? (task.url || settings.googleSheetWebhookUrl) : settings.googleSheetWebhookUrl;
    if (!url || !url.includes('/exec')) return false;

    const payload = {
      action,
      id: task.id || 'TEST-' + Date.now(),
      montador: task.montador || 'SISTEMA',
      cliente: task.clientName || task.cliente || 'PRUEBA',
      material: task.material || '-',
      estado: task.status || task.estado || 'PENDIENTE',
      descripcion: task.description || task.descripcion || 'Prueba',
      fecha: task.fecha || new Date().toISOString().split('T')[0],
      pedido: task.pedido || '',
      color: task.color || ''
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
      console.error('Error de red:', error);
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
          
          if (confirm(`¿Enviar notificación de WhatsApp para ${updatedTask.clientName}?`)) {
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
    if (window.confirm('¿Eliminar esta tarea definitivamente?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} settings={settings} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardStats tasks={tasks} />

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 bg-white p-4 rounded-3xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <div className="flex bg-gray-100 p-1.5 rounded-2xl">
              {(['TODAS', ...Object.values(TaskStatus)] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${
                    filter === s ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
             <button
              onClick={pullFromCloud}
              disabled={isSyncing}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isSyncing ? 'bg-gray-100 text-gray-400' : 'bg-green-600 text-white hover:bg-black active:scale-95'}`}
              title="Sincronizar con la Nube"
            >
              <i className={`fas fa-sync-alt ${isSyncing ? 'fa-spin' : ''}`}></i>
            </button>
             <button
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              className="bg-gray-100 text-gray-600 w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-all shadow-sm"
            >
              <i className={`fas ${viewMode === 'table' ? 'fa-th-large' : 'fa-list'}`}></i>
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex-1 md:flex-none flex items-center gap-3 bg-red-600 text-white px-10 py-5 rounded-[2rem] font-black hover:bg-black transition-all shadow-xl active:scale-95 justify-center uppercase italic text-lg tracking-tighter"
            >
              <i className="fas fa-plus"></i>
              Nuevo Trabajo
            </button>
          </div>
        </div>

        {isSyncing && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center gap-3 animate-pulse">
            <i className="fas fa-cloud-download-alt text-green-600"></i>
            <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Sincronizando datos de Commagra...</span>
          </div>
        )}

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
          onTestConnection={(url) => syncToGoogleSheet({url}, 'test')}
        />
      )}
      <GeminiAssistant />
    </div>
  );
};

export default App;
