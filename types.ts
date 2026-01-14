
export enum TaskStatus {
  PENDIENTE = 'Pendiente',
  EN_CORTE = 'En Corte',
  ACABADO = 'Acabado',
  URGENTE = 'Urgente'
}

export interface MarbleTask {
  id: string;
  montador: string;      
  fecha: string;        
  hora: string;         
  pedido: string;       
  clientName: string;   
  description: string;  
  material: string;     
  color: string;        
  status: TaskStatus;   
  fileName: string;
  fileData?: string; 
  createdAt: number;
  syncedToSheet?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AppSettings {
  whatsappNumber: string;
  notificationsEnabled: boolean;
  sendToGroup: boolean;
  googleSheetEnabled: boolean;
  googleSheetWebhookUrl: string;
}
