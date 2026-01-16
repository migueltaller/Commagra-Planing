
export enum TaskStatus {
  PENDIENTE = 'Pendiente',
  EN_CORTE = 'En Corte',
  ACABADO = 'Acabado',
  URGENTE = 'Urgente',
  ARCHIVADO = 'Archivado'
}

export interface MarbleTask {
  id: string;
  montador: string;      
  fecha: string;        
  deliveryDate: string; 
  hora: string;         
  pedido: string;       
  clientName: string;   
  description: string;  
  material: string;     
  color: string;        
  status: TaskStatus;   
  fileName: string;     
  fileData?: string;    
  dxfFileName?: string; 
  dxfFileData?: string; 
  createdAt: number;
  syncedToSheet?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AppSettings {
  whatsappNumber: string;
  whatsappLabel1: string;
  whatsappNumber2: string;
  whatsappLabel2: string;
  whatsappManualEnabled: boolean;
  notificationsEnabled: boolean;
  sendToGroup: boolean;
  googleSheetEnabled: boolean;
  googleSheetWebhookUrl: string;
}
