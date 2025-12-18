
import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Button } from './Button';

interface DiagramViewerModalProps {
  url: string;
  title: string;
  inventory: InventoryItem[];
  onClose: () => void;
}

export const DiagramViewerModal: React.FC<DiagramViewerModalProps> = ({ url, title, inventory, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [search, setSearch] = useState('');

  const filteredInventory = inventory.filter(i => 
    search && (i.partNumber.toLowerCase().includes(search.toLowerCase()) || 
    i.description.toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 3);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="fixed inset-0 bg-black z-[150] flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-zinc-900 border-b-2 border-orange-600 p-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <h2 className="text-2xl font-rugged uppercase text-zinc-100">{title} Schematic</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleZoomOut}>-</Button>
          <span className="text-xs font-mono text-zinc-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="secondary" size="sm" onClick={handleZoomIn}>+</Button>
          <Button variant="ghost" size="sm" onClick={handleResetZoom}>Reset</Button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 overflow-auto bg-zinc-950 flex items-center justify-center p-8 cursor-move relative">
        <img 
          src={url} 
          alt={title} 
          className="transition-transform duration-200 origin-center max-w-none shadow-[0_0_100px_rgba(0,0,0,1)]"
          style={{ transform: `scale(${zoom})` }}
        />
        
        {/* Floating Instruction */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md p-2 rounded-sm text-[8px] font-black uppercase text-zinc-500 tracking-widest pointer-events-none border border-zinc-800">
          Scroll to zoom • Drag to pan
        </div>
      </div>

      {/* Quick Search Footer */}
      <div className="bg-zinc-900 border-t-2 border-orange-600 p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Quick Inventory Check</label>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <input 
                  className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 text-zinc-100 focus:border-orange-500 outline-none rounded-sm uppercase font-bold text-lg"
                  placeholder="Enter part # from diagram..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>

            {search && (
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-zinc-900 border-2 border-orange-500 rounded-sm shadow-2xl overflow-hidden">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map(item => (
                    <div key={item.id} className="p-4 border-b border-zinc-800 last:border-0 flex justify-between items-center hover:bg-zinc-800">
                      <div>
                        <div className="font-mono text-orange-500 font-bold">{item.partNumber}</div>
                        <div className="text-xs text-zinc-400">{item.description}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${item.quantityOnHand > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {item.quantityOnHand > 0 ? `IN STOCK: ${item.quantityOnHand}` : 'OUT OF STOCK'}
                        </div>
                        <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Bin: {item.binLocation}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-zinc-600 text-sm italic">No matching inventory records found.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
