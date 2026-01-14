
import React from 'react';
import { MarbleTask, TaskStatus } from '../types';

interface Props {
  tasks: MarbleTask[];
}

const DashboardStats: React.FC<Props> = ({ tasks }) => {
  const getCount = (status: TaskStatus) => tasks.filter(t => t.status === status).length;

  const stats = [
    { label: 'Urgentes', count: getCount(TaskStatus.URGENTE), color: 'bg-red-100 text-red-700', icon: 'fa-exclamation-triangle' },
    { label: 'Pendientes', count: getCount(TaskStatus.PENDIENTE), color: 'bg-gray-100 text-gray-700', icon: 'fa-clock' },
    { label: 'En Corte', count: getCount(TaskStatus.EN_CORTE), color: 'bg-amber-100 text-amber-700', icon: 'fa-cut' },
    { label: 'Acabados', count: getCount(TaskStatus.ACABADO), color: 'bg-emerald-100 text-emerald-700', icon: 'fa-check-circle' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} text-xl`}>
            <i className={`fas ${stat.icon}`}></i>
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900">{stat.count}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
