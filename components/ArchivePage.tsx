
import React, { useState, useMemo } from 'react';
import { WorkOrder, WorkOrderStatus } from '../types';
import { Button } from './Button';

interface ArchivePageProps {
  workOrders: WorkOrder[];
  onBack: () => void;
}

export const ArchivePage: React.FC<ArchivePageProps> = ({ workOrders, onBack }) => {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  const archivedOrders = useMemo(() => {
    return workOrders.filter(wo => 
      wo.status === WorkOrderStatus.PICKED_UP || 
      wo.status === WorkOrderStatus.READY
    );
  }, [workOrders]);

  const filteredOrders = useMemo(() => {
    return archivedOrders.filter(wo => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        wo.customerName.toLowerCase().includes(searchLower) ||
        wo.vin.toLowerCase().includes(searchLower) ||
        wo.orderNumber.toLowerCase().includes(searchLower) ||
        wo.model.toLowerCase().includes(searchLower);

      const orderDate = new Date(wo.createdAt);
      const matchesFrom = !dateFrom || orderDate >= new Date(dateFrom);
      const matchesTo = !dateTo || orderDate <= new Date(dateTo);

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [archivedOrders, search, dateFrom, dateTo]);

  const handleExportCSV = () => {
    const headers = ['Order #', 'Date', 'Customer', 'Vehicle', 'VIN', 'Total Amount'];
    const rows = filteredOrders.map(wo => {
      const partsTotal = wo.parts.reduce((s, p) => s + (p.price * p.quantity), 0);
      const laborTotal = wo.laborEntries.reduce((s, l) => s + (l.hours * l.rate), 0);
      return [
        wo.orderNumber,
        new Date(wo.createdAt).toLocaleDateString(),
        wo.customerName,
        `${wo.year} ${wo.make} ${wo.model}`,
        wo.vin,
        (partsTotal + laborTotal).toFixed(2)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Service_Archive_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const calculateTotal = (wo: WorkOrder) => {
    const partsTotal = wo.parts.reduce((s, p) => s + (p.price * p.quantity), 0);
    const laborTotal = wo.laborEntries.reduce((s, l) => s + (l.hours * l.rate), 0);
    return (partsTotal + laborTotal).toFixed(2);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-rugged text-orange-500 uppercase">Service Archive</h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Historical Work Records & Invoicing</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack}>Back to Dashboard</Button>
          <Button variant="primary" onClick={handleExportCSV}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export to CSV
          </Button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Advanced Lookup</label>
            <input 
              className="w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 outline-none focus:border-orange-500 uppercase font-bold text-sm rounded-sm"
              placeholder="Search Name, VIN, WO#, or Model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">From</label>
            <input 
              type="date"
              className="w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 outline-none focus:border-orange-500 text-sm rounded-sm"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">To</label>
            <input 
              type="date"
              className="w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 outline-none focus:border-orange-500 text-sm rounded-sm"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-sm border border-zinc-800">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-950 text-zinc-500 uppercase text-[10px] tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4">Order #</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-600 italic">No archived records found.</td>
                </tr>
              ) : (
                filteredOrders.map((wo) => (
                  <tr 
                    key={wo.id} 
                    className="hover:bg-zinc-800/30 transition-colors cursor-pointer group opacity-75 hover:opacity-100"
                    onClick={() => setSelectedOrder(wo)}
                  >
                    <td className="px-6 py-4 font-mono font-bold text-orange-500">{wo.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{new Date(wo.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-200 uppercase">{wo.customerName}</div>
                      <div className="text-[10px] text-zinc-600 font-mono uppercase">VIN: {wo.vin}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      {wo.year} {wo.make} {wo.model}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-white">
                      ${calculateTotal(wo)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/90 z-[100] p-4 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-zinc-900 border-2 border-orange-600 max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-sm p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-6 mb-6">
              <div>
                <h2 className="text-4xl font-rugged text-orange-500 uppercase mb-2">Record: {selectedOrder.orderNumber}</h2>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Completed on {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedOrder(null)}>Close</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <section className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Unit Info</h3>
                <div className="bg-zinc-950 p-4 border border-zinc-800">
                  <div className="text-xl font-bold uppercase text-zinc-100">{selectedOrder.year} {selectedOrder.make} {selectedOrder.model}</div>
                  <div className="font-mono text-zinc-500 text-xs mt-1">VIN: {selectedOrder.vin.toUpperCase()}</div>
                </div>
              </section>
              <section className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Customer</h3>
                <div className="bg-zinc-950 p-4 border border-zinc-800">
                  <div className="text-xl font-bold uppercase text-zinc-100">{selectedOrder.customerName}</div>
                  <div className="text-zinc-500 text-xs mt-1">{selectedOrder.phone}</div>
                </div>
              </section>
            </div>

            <section className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Original Concern</h3>
              <div className="bg-zinc-950 p-4 border border-zinc-800 text-zinc-300 italic">
                "{selectedOrder.customerConcern}"
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Parts Billed</h3>
                <div className="bg-zinc-950 border border-zinc-800 divide-y divide-zinc-900">
                  {selectedOrder.parts.map((p, i) => (
                    <div key={i} className="p-3 flex justify-between text-sm">
                      <span className="text-zinc-300"><span className="font-mono text-orange-500">{p.quantity}x</span> {p.description}</span>
                      <span className="font-mono text-zinc-500">${(p.price * p.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {selectedOrder.parts.length === 0 && <div className="p-4 text-zinc-600 text-xs italic">No parts recorded.</div>}
                </div>
              </section>
              <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Labor Applied</h3>
                <div className="bg-zinc-950 border border-zinc-800 divide-y divide-zinc-900">
                  {selectedOrder.laborEntries.map((l, i) => (
                    <div key={i} className="p-3 flex justify-between text-sm">
                      <span className="text-zinc-300"><span className="font-mono text-orange-500">{l.hours}h</span> {l.description}</span>
                      <span className="font-mono text-zinc-500">${(l.hours * l.rate).toFixed(2)}</span>
                    </div>
                  ))}
                  {selectedOrder.laborEntries.length === 0 && <div className="p-4 text-zinc-600 text-xs italic">No labor recorded.</div>}
                </div>
              </section>
            </div>

            <div className="mt-12 flex justify-between items-end border-t border-zinc-800 pt-6">
              <div className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Technician Notes Attached: {selectedOrder.notes.length}</div>
              <div className="text-right">
                <div className="text-xs font-bold uppercase text-zinc-500">Historical Total</div>
                <div className="text-5xl font-rugged text-white">${calculateTotal(selectedOrder)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
