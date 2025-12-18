
import React, { useState, useMemo } from 'react';
import { ModelSchematic, VehicleType } from '../types';
import { Button } from './Button';

interface SchematicsLibraryProps {
  schematics: ModelSchematic[];
  onAddSchematic: (schematic: Omit<ModelSchematic, 'id'>) => void;
  onBack: () => void;
}

export const SchematicsLibrary: React.FC<SchematicsLibraryProps> = ({ schematics, onAddSchematic, onBack }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return schematics.filter(s => 
      `${s.year} ${s.make} ${s.model}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [schematics, search]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-rugged text-orange-500 uppercase tracking-tighter">Schematics Library</h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Digital Parts Books & Microfiche Repository</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack}>Dashboard</Button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Upload Diagram</Button>
        </div>
      </div>

      <div className="relative">
        <input 
          className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 text-zinc-100 outline-none focus:border-orange-500 uppercase font-bold text-lg rounded-sm shadow-xl"
          placeholder="Search by Model Name or Year..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-sm">
             <p className="text-zinc-600 uppercase font-black tracking-widest text-sm italic">No schematics match your search</p>
          </div>
        ) : (
          filtered.map(s => (
            <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden group hover:border-orange-600 transition-all hover:-translate-y-1 shadow-2xl">
              <div className="aspect-video relative overflow-hidden bg-black">
                <img src={s.diagramUrl} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" alt={s.model} />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent p-4 flex flex-col justify-end">
                  <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">{s.vehicleType}</div>
                  <h3 className="text-2xl font-rugged text-white uppercase leading-none">{s.year} {s.make}</h3>
                  <p className="text-zinc-400 font-bold uppercase text-sm">{s.model}</p>
                </div>
              </div>
              <div className="p-4 bg-zinc-900 flex gap-2">
                 <Button variant="secondary" fullWidth size="sm">View Diagram</Button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <UploadModal 
          onSave={(data) => { onAddSchematic(data); setIsModalOpen(false); }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

const UploadModal = ({ onSave, onClose }: { onSave: (data: any) => void; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    year: '2024',
    make: '',
    model: '',
    vehicleType: VehicleType.BIKE,
    diagramUrl: ''
  });

  const inputClasses = "w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 focus:border-orange-500 outline-none rounded-sm uppercase font-bold text-sm";
  const labelClasses = "block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1";

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-zinc-900 border-2 border-orange-600 p-8 rounded-sm w-full max-w-xl shadow-2xl animate-in zoom-in-95">
        <h2 className="text-3xl font-rugged uppercase text-zinc-100 mb-8">Add Part Diagram</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="grid grid-cols-2 gap-6">
          <div>
            <label className={labelClasses}>Year</label>
            <input required className={inputClasses} value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
          </div>
          <div>
            <label className={labelClasses}>Type</label>
            <select className={inputClasses} value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value as any})}>
              {Object.values(VehicleType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClasses}>Make</label>
            <input required className={inputClasses} placeholder="Honda, Polaris, etc." value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} />
          </div>
          <div className="col-span-2">
            <label className={labelClasses}>Model Name</label>
            <input required className={inputClasses} placeholder="CBR 1000RR SP" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
          </div>
          <div className="col-span-2">
            <label className={labelClasses}>Diagram Image URL</label>
            <input required className={inputClasses + " normal-case font-normal"} placeholder="https://path-to-diagram.jpg" value={formData.diagramUrl} onChange={e => setFormData({...formData, diagramUrl: e.target.value})} />
            <p className="text-[9px] text-zinc-600 font-bold mt-2 uppercase">Ensure URL points to a high-resolution JPG or PNG file</p>
          </div>

          <div className="col-span-2 flex gap-4 mt-6">
            <Button type="submit" fullWidth size="xl">Index Schematic</Button>
            <Button type="button" variant="secondary" fullWidth size="xl" onClick={onClose}>Discard</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
