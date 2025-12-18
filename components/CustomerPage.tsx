import React, { useState, useMemo } from 'react';
import { Customer, WorkOrder } from '../types';
import { Button } from './Button';
import { VEHICLE_ICONS } from '../constants';
import { useApp } from '../context/AppContext';

export const CustomerPage: React.FC = () => {
  const {
    customers, workOrders, handleAddCustomer: onAddCustomer,
    handleStartWorkOrderFromCustomer: onStartWorkOrder, setView
  } = useApp();

  const onBack = () => setView('COMMAND_CENTER');
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    );
  }, [customers, search]);

  const handleCloseModal = () => setIsModalOpen(false);

  if (selectedCustomer) {
    const history = workOrders.filter(wo => wo.phone === selectedCustomer.phone);

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedCustomer(null)} size="sm">
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to List
          </Button>
          <h1 className="text-3xl font-rugged uppercase text-zinc-100">{selectedCustomer.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm shadow-xl">
              <h3 className="font-rugged text-xl uppercase text-orange-500 mb-4">Contact Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Phone</label>
                  <a href={`tel:${selectedCustomer.phone}`} className="text-xl font-bold text-zinc-100 hover:text-orange-500 transition-colors underline decoration-zinc-700">
                    {selectedCustomer.phone}
                  </a>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Email</label>
                  <p className="text-zinc-300">{selectedCustomer.email}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Address</label>
                  <p className="text-zinc-300 text-sm leading-relaxed">{selectedCustomer.address}</p>
                </div>
                <div className="pt-2">
                  <span className="bg-zinc-800 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm text-zinc-400">
                    Prefers: {selectedCustomer.preferredContact}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm shadow-xl space-y-3">
              <h3 className="font-rugged text-xl uppercase text-zinc-100 mb-1">Quick Actions</h3>
              <Button variant="primary" fullWidth size="lg" onClick={() => onStartWorkOrder(selectedCustomer)}>Start New Job</Button>
              <a href={`tel:${selectedCustomer.phone}`} className="block w-full">
                <Button variant="secondary" fullWidth size="lg">Call Customer</Button>
              </a>
              <a href={`sms:${selectedCustomer.phone}`} className="block w-full">
                <Button variant="secondary" fullWidth size="lg">Text Update</Button>
              </a>
            </div>
          </div>

          {/* Fleet and History */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <h3 className="font-rugged text-2xl uppercase text-zinc-100 border-b-2 border-orange-600 pb-2">The Fleet</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCustomer.fleet.map((v, i) => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-sm flex items-center gap-4 hover:border-orange-500/50 transition-colors group">
                    <div className="p-3 bg-zinc-950 rounded-sm text-zinc-500 group-hover:text-orange-500">
                      {VEHICLE_ICONS[v.type]}
                    </div>
                    <div>
                      <div className="font-bold text-zinc-100">{v.year} {v.make}</div>
                      <div className="text-sm text-zinc-400">{v.model}</div>
                      <div className="text-[10px] font-mono text-zinc-600 mt-1">{v.vin}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-rugged text-2xl uppercase text-zinc-100 border-b-2 border-zinc-800 pb-2">Service History</h3>
              <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-zinc-950 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Job #</th>
                      <th className="px-6 py-4">Vehicle</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {history.length > 0 ? history.map(wo => (
                      <tr key={wo.id} className="hover:bg-zinc-800/50 transition-colors cursor-pointer">
                        <td className="px-6 py-4 text-sm text-zinc-400 font-mono">
                          {new Date(wo.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-orange-500">
                          {wo.orderNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-300">
                          {wo.year} {wo.make} {wo.model}
                        </td>
                        <td className="px-6 py-4 text-xs font-black uppercase tracking-tighter text-zinc-500">
                          {wo.status}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-600 italic">No previous work orders found for this customer.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-rugged text-orange-500 uppercase">Customer Directory</h1>
          <p className="text-zinc-400">Manage owner records, fleets, and historical data.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack}>Back to Dashboard</Button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add New Customer</Button>
        </div>
      </div>

      <div className="flex-1 min-w-[300px]">
        <input
          type="text"
          placeholder="Search by name or phone number..."
          className="w-full bg-zinc-950 border border-zinc-800 p-4 text-lg text-zinc-100 outline-none focus:border-orange-500 transition-colors uppercase font-bold rounded-sm shadow-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-zinc-600 italic">No customers found matching your search.</div>
        ) : (
          filteredCustomers.map(c => (
            <div
              key={c.id}
              onClick={() => setSelectedCustomer(c)}
              className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm hover:border-orange-600 cursor-pointer transition-all hover:translate-y-[-4px] shadow-lg group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-zinc-800 border-2 border-zinc-700 rounded-sm flex items-center justify-center font-rugged text-2xl text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  {c.name.charAt(0)}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Last: {c.lastVisit}</span>
              </div>
              <h3 className="text-2xl font-rugged uppercase text-zinc-100 group-hover:text-orange-500 transition-colors">{c.name}</h3>
              <p className="font-mono text-zinc-500 mt-1">{c.phone}</p>
              <div className="mt-4 flex gap-2">
                {c.fleet.slice(0, 3).map((v, i) => (
                  <div key={i} title={`${v.year} ${v.make}`} className="p-1.5 bg-zinc-950 rounded-sm text-zinc-600">
                    {VEHICLE_ICONS[v.type]}
                  </div>
                ))}
                {c.fleet.length > 3 && <div className="text-[10px] font-bold text-zinc-700 flex items-center">+{c.fleet.length - 3}</div>}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <CustomerModal
          onSave={(data) => { onAddCustomer(data); handleCloseModal(); }}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

const CustomerModal = ({ onSave, onClose }: { onSave: (data: any) => void, onClose: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    preferredContact: 'Call',
    fleet: []
  });

  const inputClasses = "w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 focus:border-orange-500 outline-none rounded-sm uppercase font-bold";
  const labelClasses = "block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1";

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-zinc-900 border-2 border-orange-600 p-8 rounded-sm w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-3xl font-rugged uppercase text-zinc-100 mb-8">Add New Customer</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className={labelClasses}>Full Name</label>
            <input required className={inputClasses} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <label className={labelClasses}>Phone Number</label>
            <input required type="tel" className={inputClasses} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div>
            <label className={labelClasses}>Email Address</label>
            <input required type="email" className={inputClasses + " lowercase font-normal"} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className={labelClasses}>Mailing Address</label>
            <input required className={inputClasses} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <div>
            <label className={labelClasses}>Preferred Contact</label>
            <select className={inputClasses} value={formData.preferredContact} onChange={e => setFormData({ ...formData, preferredContact: e.target.value as any })}>
              <option value="Call">Call</option>
              <option value="Text">Text</option>
            </select>
          </div>

          <div className="col-span-2 flex gap-4 mt-6">
            <Button type="submit" fullWidth size="xl">Save Record</Button>
            <Button type="button" variant="secondary" fullWidth size="xl" onClick={onClose}>Discard</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
