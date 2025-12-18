import React, { useState, useMemo } from 'react';
import { PartsOrder, OrderStatus, Vendor, InventoryItem } from '../types';
import { Button } from './Button';
import { useApp } from '../context/AppContext';

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.TO_ORDER]: 'bg-zinc-700 text-zinc-300',
  [OrderStatus.PENDING]: 'bg-yellow-500 text-black',
  [OrderStatus.BACKORDERED]: 'bg-red-600 text-white',
  [OrderStatus.RECEIVED]: 'bg-emerald-600 text-white',
};

export const PartsOrderPage: React.FC = () => {
  const {
    partsOrders: orders, vendors, inventory,
    handleUpdatePartsOrder: onUpdateOrder, handleAddPartsOrder: onAddOrder,
    handleBulkOrdered, setView
  } = useApp();

  const onBack = () => setView('COMMAND_CENTER');
  const onBulkOrdered = (vendorName: string) => handleBulkOrdered(vendorName);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [notificationTarget, setNotificationTarget] = useState<PartsOrder | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const s = search.toLowerCase();
      return o.partNumber.toLowerCase().includes(s) ||
        (o.customerName || '').toLowerCase().includes(s) ||
        (o.vendor || '').toLowerCase().includes(s) ||
        (o.workOrderNumber || '').toLowerCase().includes(s);
    });
  }, [orders, search]);

  const vendorGroups = useMemo(() => {
    const toOrder = orders.filter(o => o.status === OrderStatus.TO_ORDER);
    const groups: Record<string, { total: number; orders: PartsOrder[] }> = {};

    toOrder.forEach(o => {
      if (!groups[o.vendor]) groups[o.vendor] = { total: 0, orders: [] };
      // Estimate cost from inventory if possible, otherwise just use a dummy for calculation or we might need cost in PartsOrder
      // For this app, let's look up inventory price
      const inv = inventory.find(i => i.partNumber === o.partNumber);
      const cost = inv ? inv.unitPrice * o.quantity : 0;
      groups[o.vendor].total += cost;
      groups[o.vendor].orders.push(o);
    });

    return groups;
  }, [orders, inventory]);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
    backordered: orders.filter(o => o.status === OrderStatus.BACKORDERED).length,
    toOrder: orders.filter(o => o.status === OrderStatus.TO_ORDER).length,
  };

  const handleReceive = (order: PartsOrder) => {
    onUpdateOrder({ ...order, status: OrderStatus.RECEIVED });
    setNotificationTarget(order);
  };

  const handleNotifyCustomer = (order: PartsOrder) => {
    const msg = `Hi ${order.customerName}, your parts (${order.partNumber}) have arrived at PowerLog Shop. You can pick them up anytime!`;
    window.open(`sms:${order.customerPhone}?body=${encodeURIComponent(msg)}`, '_blank');
    setNotificationTarget(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 pb-20">
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

      {/* FREIGHT METERS */}
      {Object.keys(vendorGroups).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 border-b border-zinc-800 pb-2">Active Procurement Batches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Fix: Explicitly cast Object.entries to solve 'unknown' type inference on group object properties */}
            {(Object.entries(vendorGroups) as [string, { total: number; orders: PartsOrder[] }][]).map(([vendorName, group]) => {
              const vendorData = vendors.find(v => v.name === vendorName);
              const threshold = vendorData?.freeShippingThreshold || 0;
              const progress = Math.min((group.total / (threshold || 1)) * 100, 100);
              const remaining = Math.max(threshold - group.total, 0);
              const isEligible = threshold > 0 && group.total >= threshold;

              return (
                <div key={vendorName} className="bg-zinc-900 border-t-4 border-orange-600 p-5 rounded-sm shadow-xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-rugged text-white uppercase">{vendorName}</h3>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase">Target: ${threshold}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-rugged text-zinc-100">${group.total.toFixed(2)}</div>
                      <div className="text-[9px] font-bold text-zinc-600 uppercase">Current Value</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-4 bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-1000 ${isEligible ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-orange-600'}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className={`text-[10px] font-black uppercase ${isEligible ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isEligible ? '✓ FREE SHIPPING ELIGIBLE' : `Needs $${remaining.toFixed(2)} for Free Ship`}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-600">{progress.toFixed(0)}%</div>
                    </div>
                  </div>

                  <Button
                    fullWidth
                    size="sm"
                    variant={isEligible ? 'primary' : 'secondary'}
                    onClick={() => onBulkOrdered(vendorName)}
                  >
                    Bulk Mark Ordered ({group.orders.length} Items)
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <StatCard label="To Order" value={stats.toOrder} color="border-zinc-500" />
        <StatCard label="Pending" value={stats.pending} color="border-yellow-500" />
        <StatCard label="Backordered" value={stats.backordered} color="border-red-600" />
        <StatCard label="Received" value={orders.filter(o => o.status === OrderStatus.RECEIVED).length} color="border-emerald-600" />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-sm shadow-xl">
        <div className="relative">
          <input
            className="w-full bg-zinc-950 border border-zinc-800 p-4 text-zinc-100 outline-none focus:border-orange-500 uppercase font-bold text-sm rounded-sm"
            placeholder="Search by Part #, Vendor, or Customer Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950 text-zinc-500 uppercase text-[10px] tracking-widest font-bold border-b border-zinc-800">
                <th className="px-6 py-4">Part / Vendor</th>
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Qty / Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-600 italic">No parts in the filtered queue.</td>
                </tr>
              ) : (
                filteredOrders.sort((a, b) => (a.status === OrderStatus.RECEIVED ? 1 : -1)).map((order) => (
                  <tr key={order.id} className={`hover:bg-zinc-800/30 transition-colors ${order.status === OrderStatus.RECEIVED ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-mono text-orange-500 font-bold">{order.partNumber}</div>
                      <div className="text-sm text-zinc-300">{order.description}</div>
                      <div className="text-[10px] uppercase font-bold text-zinc-500 mt-1">Vendor: {order.vendor}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        {order.workOrderNumber ? (
                          <span className="text-xs font-bold text-zinc-200 uppercase">Machine: {order.workOrderNumber}</span>
                        ) : (
                          <span className="text-xs font-black text-blue-500 uppercase border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 rounded-sm self-start">RETAIL / COUNTER</span>
                        )}
                        <span className="text-[10px] text-zinc-400 font-bold uppercase mt-1">{order.customerName}</span>
                        <span className="text-[10px] text-zinc-600">{order.dateOrdered || 'N/A'}</span>
                      </div>
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
                          onChange={(e) => onUpdateOrder({ ...order, status: e.target.value as OrderStatus })}
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
                      {order.status === OrderStatus.RECEIVED && (
                        <button
                          onClick={() => setNotificationTarget(order)}
                          className="text-[10px] font-bold text-zinc-500 hover:text-orange-500 uppercase flex items-center gap-1 ml-auto"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                          Re-notify
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {notificationTarget && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <div className="bg-zinc-900 border-4 border-emerald-600 p-8 rounded-sm w-full max-md shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-in zoom-in-95">
            <h2 className="text-3xl font-rugged uppercase text-white mb-2">Part Received!</h2>
            <p className="text-zinc-400 text-sm mb-6 uppercase font-bold tracking-widest">Notification Workflow Required</p>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-sm mb-8 space-y-4">
              <div>
                <label className="text-[10px] font-black text-zinc-600 uppercase">Customer Contact</label>
                <div className="text-xl font-bold text-emerald-400 uppercase">{notificationTarget.customerName}</div>
                <div className="text-lg font-mono text-zinc-100">{notificationTarget.customerPhone}</div>
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-600 uppercase">Order Details</label>
                <div className="text-sm text-zinc-300 font-bold uppercase">{notificationTarget.partNumber}</div>
                <div className="text-xs text-zinc-500">{notificationTarget.description}</div>
              </div>
            </div>

            <div className="space-y-3">
              <Button fullWidth size="lg" onClick={() => handleNotifyCustomer(notificationTarget)}>Send Pickup Text</Button>
              <Button fullWidth variant="secondary" size="lg" onClick={() => {
                if (notificationTarget.customerPhone) {
                  window.location.href = `tel:${notificationTarget.customerPhone}`;
                }
              }}>Call Customer</Button>
              <button
                className="w-full text-[10px] font-bold text-zinc-600 uppercase pt-4 hover:text-white transition-colors"
                onClick={() => setNotificationTarget(null)}
              >
                Done / I've already notified them
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <OrderModal
          vendors={vendors}
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

const OrderModal = ({ vendors, onSave, onClose }: { vendors: Vendor[], onSave: (data: any) => void, onClose: () => void }) => {
  const [formData, setFormData] = useState({
    partNumber: '',
    description: '',
    vendor: vendors[0]?.name || 'WPS',
    workOrderNumber: '',
    customerName: '',
    customerPhone: '',
    quantity: 1,
    status: OrderStatus.TO_ORDER,
    isHighPriority: false,
    dateOrdered: new Date().toLocaleDateString()
  });

  const inputClasses = "w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 focus:border-orange-500 outline-none rounded-sm uppercase font-bold text-sm";
  const labelClasses = "block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1";

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-zinc-900 border-2 border-orange-600 p-8 rounded-sm w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-3xl font-rugged uppercase text-zinc-100 mb-8">New Part Request</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="grid grid-cols-2 gap-6">
          <div className="col-span-1">
            <label className={labelClasses}>Part Number</label>
            <input required className={inputClasses} value={formData.partNumber} onChange={e => setFormData({ ...formData, partNumber: e.target.value })} />
          </div>
          <div className="col-span-1">
            <label className={labelClasses}>Vendor</label>
            <select className={inputClasses} value={formData.vendor} onChange={e => setFormData({ ...formData, vendor: e.target.value })}>
              {vendors.map(v => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
              {vendors.length === 0 && <option value="WPS">WPS</option>}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClasses}>Description</label>
            <input required className={inputClasses} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="col-span-2 bg-zinc-950 p-4 border border-zinc-800 rounded-sm">
            <label className="block text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Customer Linkage</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className={labelClasses}>Work Order # (Optional)</label>
                <input className={inputClasses} placeholder="WO-1234" value={formData.workOrderNumber} onChange={e => setFormData({ ...formData, workOrderNumber: e.target.value })} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className={labelClasses}>Quantity</label>
                <input required type="number" min="1" className={inputClasses} value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} />
              </div>
              <div className="col-span-1">
                <label className={labelClasses}>Customer Name</label>
                <input required className={inputClasses} value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} />
              </div>
              <div className="col-span-1">
                <label className={labelClasses}>Customer Phone</label>
                <input required className={inputClasses} value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="col-span-2 flex items-center gap-4 bg-zinc-950 p-4 rounded-sm border border-zinc-800">
            <input
              type="checkbox"
              id="priority"
              className="w-6 h-6 accent-orange-500"
              checked={formData.isHighPriority}
              onChange={e => setFormData({ ...formData, isHighPriority: e.target.checked })}
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
