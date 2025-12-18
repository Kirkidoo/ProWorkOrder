import React, { useState } from 'react';
import { Vendor } from '../types';
import { Button } from './Button';
import { useApp } from '../context/AppContext';

export const VendorPage: React.FC = () => {
  const {
    vendors, handleAddVendor: onAddVendor,
    handleUpdateVendor: onUpdateVendor, setView
  } = useApp();

  const onBack = () => setView('COMMAND_CENTER');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const handleOpenEdit = (v: Vendor) => {
    setEditingVendor(v);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setEditingVendor(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-rugged text-orange-500 uppercase">Vendor Management</h1>
          <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Supplier Contracts & Freight Thresholds</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack}>Back</Button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add Vendor</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm hover:border-orange-500 transition-all cursor-pointer group"
            onClick={() => handleOpenEdit(vendor)}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-rugged uppercase text-zinc-100 group-hover:text-orange-500 transition-colors">{vendor.name}</h2>
              <div className="bg-zinc-800 px-2 py-1 rounded-sm text-[10px] font-black text-zinc-400">#{vendor.accountNumber}</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest block">Contact Person</label>
                <div className="text-sm font-bold text-zinc-300">{vendor.contactPerson}</div>
              </div>
              <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Free Ship Target</label>
                <div className="text-xl font-rugged text-emerald-500">${vendor.freeShippingThreshold.toFixed(0)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <VendorModal
          vendor={editingVendor}
          onSave={(data) => {
            if (editingVendor) onUpdateVendor({ ...editingVendor, ...data });
            else onAddVendor(data);
            handleClose();
          }}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

const VendorModal = ({ vendor, onSave, onClose }: { vendor: Vendor | null, onSave: (data: any) => void, onClose: () => void }) => {
  const [formData, setFormData] = useState({
    name: vendor?.name || '',
    accountNumber: vendor?.accountNumber || '',
    contactPerson: vendor?.contactPerson || '',
    freeShippingThreshold: vendor?.freeShippingThreshold || 500,
  });

  const inputClasses = "w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 focus:border-orange-500 outline-none rounded-sm uppercase font-bold text-sm";
  const labelClasses = "block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1";

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-zinc-900 border-2 border-orange-600 p-8 rounded-sm w-full max-w-md shadow-2xl animate-in zoom-in-95">
        <h2 className="text-3xl font-rugged uppercase text-zinc-100 mb-6">{vendor ? 'Edit Vendor' : 'New Vendor'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
          <div>
            <label className={labelClasses}>Company Name</label>
            <input required className={inputClasses} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <label className={labelClasses}>Account #</label>
            <input required className={inputClasses} value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} />
          </div>
          <div>
            <label className={labelClasses}>Primary Contact</label>
            <input required className={inputClasses} value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} />
          </div>
          <div>
            <label className={labelClasses}>Free Shipping Threshold ($)</label>
            <input required type="number" className={inputClasses + " text-emerald-500"} value={formData.freeShippingThreshold} onChange={e => setFormData({ ...formData, freeShippingThreshold: parseFloat(e.target.value) || 0 })} />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" fullWidth size="lg">Save Supplier</Button>
            <Button type="button" variant="secondary" fullWidth size="lg" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
