
import React, { useState, useMemo } from 'react';
import { WorkOrder, WorkOrderStatus, VehicleType } from '../types';
import { STATUS_COLORS, VEHICLE_ICONS, STATUS_SEQUENCE } from '../constants';
import { Button } from './Button';

interface DashboardProps {
  workOrders: WorkOrder[];
  onSelectOrder: (order: WorkOrder) => void;
  onCreateNew: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ workOrders, onSelectOrder, onCreateNew }) => {
  const [typeFilter, setTypeFilter] = useState<VehicleType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'ALL'>('ALL');

  const stats = {
    total: workOrders.length,
    active: workOrders.filter(o => o.status !== WorkOrderStatus.PICKED_UP).length,
    ready: workOrders.filter(o => o.status === WorkOrderStatus.READY).length,
  };

  const filteredOrders = useMemo(() => {
    return workOrders.filter(order => {
      const matchesType = typeFilter === 'ALL' || order.vehicleType === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      return matchesType && matchesStatus;
    });
  }, [workOrders, typeFilter, statusFilter]);

  const selectClasses = "bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider py-2 px-3 rounded-sm focus:border-orange-500 outline-none transition-colors cursor-pointer";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-rugged text-orange-500 uppercase">Shop Floor Control</h1>
          <p className="text-zinc-400">Manage active units and track maintenance flow.</p>
        </div>
        <Button size="xl" onClick={onCreateNew}>
          <span className="mr-2">+</span> New Work Order
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="In Shop" value={stats.active} color="border-blue-500" />
        <StatCard label="Ready for Pickup" value={stats.ready} color="border-emerald-500" />
        <StatCard label="Total Jobs (Life)" value={stats.total} color="border-zinc-700" />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-zinc-900/50 p-4 border border-zinc-800 rounded-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Type:</span>
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className={selectClasses}
          >
            <option value="ALL">All Types</option>
            {Object.values(VehicleType).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status:</span>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={selectClasses}
          >
            <option value="ALL">All Statuses</option>
            {STATUS_SEQUENCE.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {(typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <button 
            onClick={() => { setTypeFilter('ALL'); setStatusFilter('ALL'); }}
            className="text-[10px] font-bold uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors"
          >
            Reset Filters
          </button>
        )}

        <div className="ml-auto text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Showing {filteredOrders.length} of {workOrders.length} units
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <h2 className="font-rugged text-xl tracking-wide uppercase">Active Work Orders</h2>
          <div className="flex gap-2">
             <span className="flex items-center text-xs text-zinc-500"><div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div> New</span>
             <span className="flex items-center text-xs text-zinc-500"><div className="w-2 h-2 rounded-full bg-orange-500 mr-1"></div> Repair</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950 text-zinc-500 uppercase text-xs tracking-widest font-bold">
                <th className="px-6 py-4">Unit</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Serial / VIN</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-600 italic">No matching work orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                    onClick={() => onSelectOrder(order)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-sm text-zinc-400 group-hover:text-orange-400 transition-colors">
                          {VEHICLE_ICONS[order.vehicleType]}
                        </div>
                        <div>
                          <div className="font-bold text-zinc-100">{order.year} {order.make}</div>
                          <div className="text-sm text-zinc-500">{order.model}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-200">{order.customerName}</div>
                      <div className="text-sm text-zinc-500">{order.phone}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-zinc-400">
                      {order.vin.toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-tighter ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm">Open</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className={`bg-zinc-900 border-l-4 ${color} p-6 shadow-lg`}>
    <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</div>
    <div className="text-4xl font-rugged text-zinc-100">{value}</div>
  </div>
);
