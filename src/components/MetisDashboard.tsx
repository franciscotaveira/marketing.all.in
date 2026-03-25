import React from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Activity, X } from 'lucide-react';

const mockData = {
  performance: [
    { name: 'Jan', roi: 2.5, leads: 400 },
    { name: 'Fev', roi: 3.1, leads: 600 },
    { name: 'Mar', roi: 2.8, leads: 500 },
    { name: 'Abr', roi: 4.2, leads: 900 },
    { name: 'Mai', roi: 3.9, leads: 800 },
  ],
  channels: [
    { name: 'Google Ads', value: 4000 },
    { name: 'Meta Ads', value: 3000 },
    { name: 'SEO', value: 2000 },
    { name: 'E-mail', value: 2780 },
  ]
};

export const MetisDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A] text-white rounded-2xl border border-white/10 relative">
      <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full">
        <X className="w-5 h-5 text-white/50" />
      </button>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black uppercase tracking-widest italic">Metis Analytics</h2>
        <Activity className="text-blue-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <h3 className="text-xs font-bold uppercase text-white/50 mb-4">ROI & Leads</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData.performance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333' }} />
                <Legend />
                <Line type="monotone" dataKey="roi" stroke="#3b82f6" name="ROI" />
                <Line type="monotone" dataKey="leads" stroke="#10b981" name="Leads" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <h3 className="text-xs font-bold uppercase text-white/50 mb-4">Performance por Canal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData.channels}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333' }} />
                <Bar dataKey="value" fill="#8b5cf6" name="Conversões" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
