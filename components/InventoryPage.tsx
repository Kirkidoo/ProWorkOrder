
import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../types';
import { Button } from './Button';

interface InventoryPageProps {
  inventory: InventoryItem[];
  onUpdateInventory: (item: InventoryItem) => void;
  onAddInventory: (item: Omit<InventoryItem, 'id'>) => void;
  onBack: () => void;
}

const CATEGORIES = ['Engine', 'Tires', 'Electrical', 'Suspension', 'Fluids', 'Body', 'Misc'];
const BRANDS = ['OEM', 'Aftermarket'];
const VENDORS = ['WPS', 'Parts Unlimited', 'Tucker', 'OEM Honda', 'OEM Yamaha', 'OEM Kawasaki', 'Parts Unlimited', 'Specialty'];

export const InventoryPage: React.FC<InventoryPageProps> = ({ inventory, onUpdateInventory, onAddInventory, onBack }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.partNumber.toLowerCase().includes(search.toLowerCase()) || 
                           item.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, search, categoryFilter]);

  const stats = {
    totalValue: inventory.reduce((acc, curr) => acc + (curr.quantityOnHand * curr.unitPrice), 0),
    lowStock: inventory.filter(item => item.quantityOnHand <= item.minStock).length,
    outOfStock: inventory.filter(item => item.quantityOnHand === 0).length,
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-rugged text-orange-500 uppercase">Parts Inventory</h1>
          <p className="text-zinc-400">Track stock levels, bin locations, and unit pricing.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack}>Back to Dashboard</Button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add New Part</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm">
          <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Stock Value</div>
          <div className="text-3xl font-rugged text-zinc-100">${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className={`bg-zinc-900 border-l-4 ${stats.lowStock > 0 ? 'border-red-600' : 'border-zinc-800'} p-6 rounded-sm`}>
          <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Low Stock Alerts</div>
          <div className={`text-3xl font-rugged ${stats.lowStock > 0 ? 'text-red-500' : 'text-zinc-100'}`}>{stats.lowStock} Items</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm">
          <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Out of Stock</div>
          <div className="text-3xl font-rugged text-orange-500">{stats.outOfStock} Items</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-zinc-900/50 p-4 border border-zinc-800 rounded-sm">
        <div className="flex-1 min-w-[300px]">
          <input 
            type="text"
            placeholder="Search Part # or Description..."
            className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc-100 outline-none focus:border-orange-500 transition-colors uppercase font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Category:</span>
          <select 
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider py-3 px-3 rounded-sm focus:border-orange-500 outline-none transition-colors"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950 text-zinc-500 uppercase text-[10px] tracking-widest font-bold border-b border-zinc-800">
                <th className="px-6 py-4">Part Details</th>
                <th className="px-6 py-4">Preferred Vendor</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Qty on Hand</th>
                <th className="px-6 py-4 text-right">Unit Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-600 italic">No inventory records match your search.</td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.quantityOnHand <= item.minStock;
                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-zinc-800/50 transition-colors cursor-pointer group ${isLow ? 'bg-red-950/20' : ''}`}
                      onClick={() => handleOpenEdit(item)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-mono text-orange-500 font-bold">{item.partNumber}</div>
                        <div className="text-sm text-zinc-300 font-medium">{item.description}</div>
                        <div className="text-[10px] uppercase text-zinc-500 tracking-widest">{item.category} • {item.brand}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold uppercase text-zinc-400 bg-zinc-800 px-2 py-1 rounded-sm">{item.preferredVendor}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-zinc-800/50 px-2 py-1 rounded text-[10px] font-bold text-zinc-500 border border-zinc-800">{item.binLocation}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-rugged ${isLow ? 'text-red-500' : 'text-zinc-100'}`}>
                            {item.quantityOnHand}
                          </span>
                          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">/ min {item.minStock}</span>
                        </div>
                        {isLow && <div className="text-[10px] text-red-600 font-black uppercase tracking-widest animate-pulse">REORDER SOON</div>}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-zinc-100">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <InventoryModal 
          item={editingItem} 
          onSave={(data) => {
            if (editingItem) onUpdateInventory({ ...editingItem, ...data });
            else onAddInventory(data);
            handleCloseModal();
          }} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};

const InventoryModal = ({ item, onSave, onClose }: { item: InventoryItem | null, onSave: (data: any) => void, onClose: () => void }) => {
  const [formData, setFormData] = useState({
    partNumber: item?.partNumber || '',
    description: item?.description || '',
    category: item?.category || CATEGORIES[0],
    brand: item?.brand || BRANDS[0],
    preferredVendor: item?.preferredVendor || VENDORS[0],
    quantityOnHand: item?.quantityOnHand || 0,
    minStock: item?.minStock || 5,
    unitPrice: item?.unitPrice || 0,
    binLocation: item?.binLocation || 'A-1',
  });

  const inputClasses = "w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 focus:border-orange-500 outline-none rounded-sm uppercase font-bold";
  const labelClasses = "block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1";

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-zinc-900 border-2 border-orange-600 p-8 rounded-sm w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-3xl font-rugged uppercase text-zinc-100 mb-8">{item ? 'Edit Part' : 'Add New Inventory'}</h2>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="grid grid-cols-2 gap-6">
          <div className="col-span-1">
            <label className={labelClasses}>Part Number</label>
            <input required className={inputClasses} value={formData.partNumber} onChange={e => setFormData({...formData, partNumber: e.target.value})} />
          </div>
          <div className="col-span-1">
            <label className={labelClasses}>Preferred Vendor</label>
            <select className={inputClasses} value={formData.preferredVendor} onChange={e => setFormData({...formData, preferredVendor: e.target.value})}>
              {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClasses}>Description</label>
            <input required className={inputClasses} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div>
            <label className={labelClasses}>Category</label>
            <select className={inputClasses} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClasses}>Brand</label>
            <select className={inputClasses} value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}>
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClasses}>Quantity On Hand</label>
            <input required type="number" className={inputClasses} value={formData.quantityOnHand} onChange={e => setFormData({...formData, quantityOnHand: parseInt(e.target.value) || 0})} />
          </div>
          <div>
            <label className={labelClasses}>Min Stock</label>
            <input required type="number" className={inputClasses} value={formData.minStock} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})} />
          </div>
          <div className="col-span-1">
            <label className={labelClasses}>Bin Location</label>
            <input required className={inputClasses} value={formData.binLocation} onChange={e => setFormData({...formData, binLocation: e.target.value})} />
          </div>
          <div className="col-span-1">
            <label className={labelClasses}>Unit Price ($)</label>
            <input required type="number" step="0.01" className={inputClasses + " text-orange-500 text-2xl"} value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: parseFloat(e.target.value) || 0})} />
          </div>

          <div className="col-span-2 flex gap-4 mt-4">
            <Button type="submit" fullWidth size="xl">{item ? 'Save Changes' : 'Add to Inventory'}</Button>
            <Button type="button" variant="secondary" fullWidth size="xl" onClick={onClose}>Discard</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
