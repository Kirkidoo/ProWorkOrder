
import React, { useState } from 'react';
import { PartsOrder, OrderStatus } from '../types';
import { Button } from './Button';

interface PartsOrderPageProps {
  orders: PartsOrder[];
  onUpdateOrder: (order: PartsOrder) => void;
  onAddOrder: (order: Omit<PartsOrder, 'id'>) => void;
  onBack: () => void;
}

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.TO_ORDER]: 'bg-zinc-700 text-zinc-300',
  [OrderStatus.PENDING]: 'bg-yellow-500 text-black',
  [OrderStatus.BACKORDERED]: 'bg-red-600 text-white',
  [OrderStatus.RECEIVED]: 'bg-emerald-600 text-white',
};

export const PartsOrderPage: React.FC<PartsOrderPageProps> = ({ orders, onUpdateOrder, onAddOrder, onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
    backordered: orders.filter(o => o.status === OrderStatus.BACKORDERED).length,
    toOrder: orders.filter(o => o.status === OrderStatus.TO_ORDER).length,
  };

  const handleReceive = (order: PartsOrder) => {
    onUpdateOrder({ ...order, status: OrderStatus.RECEIVED });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-rugged text-orange-500 uppercase">Vendor Parts Queue</h1>
          <p className="text-zinc-400">Track special orders and backordered components.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack}>Dashboard</Button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Create Part Request</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <StatCard label="To Order" value={stats.toOrder} color="border-zinc-500" />
        <StatCard label="Pending" value={stats.pending} color="border-yellow-500" />
        <StatCard label="Backordered" value={stats.backordered} color="border-red-600" />
        <StatCard label="Received" value={orders.filter(o => o.status === OrderStatus.RECEIVED).length} color="border-emerald-600" />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950 text-zinc-500 uppercase text-[10px] tracking-widest font-bold border-b border-zinc-800">
                <th className="px-6 py-4">Part / Vendor</th>
                <th className="px-6 py-4">Job Info</th>
                <th className="px-6 py-4">Qty / Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-600 italic">No parts in the order queue.</td>
                </tr>
              ) : (
                orders.sort((a,b) => (a.status === OrderStatus.RECEIVED ? 1 : -1)).map((order) => (
                  <tr key={order.id} className={`hover:bg-zinc-800/30 transition-colors ${order.status === OrderStatus.RECEIVED ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-mono text-orange-500 font-bold">{order.partNumber}</div>
                      <div className="text-sm text-zinc-300">{order.description}</div>
                      <div className="text-[10px] uppercase font-bold text-zinc-500 mt-1">Vendor: {order.vendor}</div>
                    </td>
                    <td className="px-6 py-4">
                      {order.workOrderNumber ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-200">WO: {order.workOrderNumber}</span>
                          <span className="text-[10px] text-zinc-500">Ordered: {order.dateOrdered || 'N/A'}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-600 text-xs italic">Stock Order</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-rugged text-zinc-100">{order.quantity}</span>
                        {order.isHighPriority && (
                          <span className="bg-red-600/20 text-red-500 border border-red-600/50 text-[10px] font-black uppercase px-2 py-0.5 rounded-sm animate-pulse">
                            RUSH
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <select 
                          className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-sm border-none outline-none cursor-pointer ${ORDER_STATUS_COLORS[order.status]}`}
                          value={order.status}
                          onChange={(e) => onUpdateOrder({...order, status: e.target.value as OrderStatus})}
                        >
                          {Object.values(OrderStatus).map(s => (
                            <option key={s} value={s} className="bg-zinc-900 text-white font-sans">{s}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.status !== OrderStatus.RECEIVED && (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => handleReceive(order)}
                        >
                          Mark Received
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <OrderModal 
          onSave={(data) => { onAddOrder(data); setIsModalOpen(false); }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className={`bg-zinc-900 border-l-4 ${color} p-6 rounded-sm`}>
    <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</div>
    <div className="text-3xl font-rugged text-zinc-100">{value}</div>
  </div>
);

const OrderModal = ({ onSave, onClose }: { onSave: (data: any) => void, onClose: () => void }) => {
  const [formData, setFormData] = useState({
    partNumber: '',
    description: '',
    vendor: 'WPS',
    workOrderNumber: '',
    quantity: 1,
    status: OrderStatus.TO_ORDER,
    isHighPriority: false,
    dateOrdered: new Date().toLocaleDateString()
  });

  const inputClasses = "w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 focus:border-orange-500 outline-none rounded-sm uppercase font-bold";
  const labelClasses = "block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1";

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-zinc-900 border-2 border-orange-600 p-8 rounded-sm w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-3xl font-rugged uppercase text-zinc-100 mb-8">New Part Request</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="grid grid-cols-2 gap-6">
          <div className="col-span-1">
            <label className={labelClasses}>Part Number</label>
            <input required className={inputClasses} value={formData.partNumber} onChange={e => setFormData({...formData, partNumber: e.target.value})} />
          </div>
          <div className="col-span-1">
            <label className={labelClasses}>Vendor</label>
            <select className={inputClasses} value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})}>
              <option value="WPS">WPS</option>
              <option value="Tucker">Tucker</option>
              <option value="Partzilla">Partzilla</option>
              <option value="OEM Honda">OEM Honda</option>
              <option value="OEM Yamaha">OEM Yamaha</option>
              <option value="Parts Unlimited">Parts Unlimited</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClasses}>Description</label>
            <input required className={inputClasses} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="col-span-1">
            <label className={labelClasses}>Work Order # (Optional)</label>
            <input className={inputClasses} placeholder="WO-1234" value={formData.workOrderNumber} onChange={e => setFormData({...formData, workOrderNumber: e.target.value})} />
          </div>
          <div className="col-span-1">
            <label className={labelClasses}>Quantity</label>
            <input required type="number" min="1" className={inputClasses} value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})} />
          </div>
          
          <div className="col-span-2 flex items-center gap-4 bg-zinc-950 p-4 rounded-sm border border-zinc-800">
            <input 
              type="checkbox" 
              id="priority"
              className="w-6 h-6 accent-orange-500"
              checked={formData.isHighPriority}
              onChange={e => setFormData({...formData, isHighPriority: e.target.checked})}
            />
            <label htmlFor="priority" className="font-bold uppercase tracking-wider text-sm cursor-pointer select-none">
              High Priority / Next Day Air
            </label>
          </div>

          <div className="col-span-2 flex gap-4 mt-6">
            <Button type="submit" fullWidth size="xl">Submit Order</Button>
            <Button type="button" variant="secondary" fullWidth size="xl" onClick={onClose}>Discard</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
