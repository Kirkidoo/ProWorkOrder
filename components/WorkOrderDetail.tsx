
import React, { useState, useEffect, useRef } from 'react';
import { WorkOrder, WorkOrderStatus, Part, ServiceNote, LaborEntry, InventoryItem, PartsOrder, OrderStatus, Vendor, ModelSchematic } from '../types';
import { STATUS_COLORS, STATUS_SEQUENCE, VEHICLE_ICONS, DEFAULT_SHOP_RATE, SHOP_NAME, COMMON_LABOR_TASKS } from '../constants';
import { Button } from './Button';
import { getDiagnosticSuggestions } from '../services/geminiService';
import { DiagramViewerModal } from './DiagramViewerModal';

interface WorkOrderDetailProps {
  order: WorkOrder;
  inventory: InventoryItem[];
  vendors: Vendor[];
  schematics: ModelSchematic[];
  onUpdate: (updatedOrder: WorkOrder) => void;
  onSpecialOrder: (part: Omit<PartsOrder, 'id'>) => void;
  onAddSchematic: (schematic: Omit<ModelSchematic, 'id'>) => void;
  onBack: () => void;
}

interface AiSuggestions {
  potentialCauses: string[];
  suggestedSteps: string[];
  missingInformation: string[];
}

export const WorkOrderDetail: React.FC<WorkOrderDetailProps> = ({ order, inventory, vendors, schematics, onUpdate, onSpecialOrder, onAddSchematic, onBack }) => {
  const [activeTab, setActiveTab] = useState<'LOG' | 'LABOR' | 'PARTS' | 'PHOTOS' | 'AI'>('LOG');
  const [newNote, setNewNote] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestions | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [partSearch, setPartSearch] = useState('');
  const [isSpecialOrderModalOpen, setIsSpecialOrderModalOpen] = useState(false);
  const [isDiagramOpen, setIsDiagramOpen] = useState(false);
  const [isAttachDiagramOpen, setIsAttachDiagramOpen] = useState(false);

  // Timer State
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  const matchedSchematic = schematics.find(s => 
    s.year === order.year && 
    s.make.toLowerCase() === order.make.toLowerCase() && 
    s.model.toLowerCase() === order.model.toLowerCase()
  );

  useEffect(() => {
    if (isPunchedIn) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsedSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPunchedIn]);

  const updateStatus = (newStatus: WorkOrderStatus) => {
    if (newStatus === WorkOrderStatus.PICKED_UP) {
      if (!window.confirm("ARE YOU SURE? THIS ARCHIVES THE JOB.")) return;
    }
    onUpdate({ ...order, status: newStatus });
  };

  const handleAddNote = (e?: React.FormEvent, manualContent?: string) => {
    if (e) e.preventDefault();
    const content = manualContent || newNote;
    if (!content.trim()) return;
    
    const note: ServiceNote = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString(),
      author: 'Current Tech',
      content: content
    };
    onUpdate({ ...order, notes: [note, ...order.notes] });
    if (!manualContent) setNewNote('');
  };

  const copyToNotes = (text: string, prefix: string = "FOLLOW-UP CHECK") => {
    handleAddNote(undefined, `[AI ${prefix}]: ${text}`);
    alert(`${prefix} added to Service Log`);
  };

  const handleAddLabor = (description: string, hours: number) => {
    const entry: LaborEntry = {
      id: Math.random().toString(36).substr(2, 9),
      technician: 'Current Tech',
      description,
      hours,
      rate: DEFAULT_SHOP_RATE,
      timestamp: new Date().toISOString()
    };
    onUpdate({ ...order, laborEntries: [...order.laborEntries, entry] });
  };

  const handlePunchOut = () => {
    if (!punchInTime) return;
    const hours = elapsedSeconds / 3600;
    handleAddLabor('Timed Labor Session', Number(hours.toFixed(2)));
    setIsPunchedIn(false);
    setPunchInTime(null);
  };

  const handleAddPart = (item: InventoryItem) => {
    const existing = order.parts.find(p => p.partNumber === item.partNumber);
    if (existing) {
      onUpdate({
        ...order,
        parts: order.parts.map(p => p.partNumber === item.partNumber ? { ...p, quantity: p.quantity + 1 } : p)
      });
    } else {
      const part: Part = {
        id: Math.random().toString(36).substr(2, 9),
        partNumber: item.partNumber,
        description: item.description,
        price: item.unitPrice,
        quantity: 1
      };
      onUpdate({ ...order, parts: [...order.parts, part] });
    }
    setPartSearch('');
  };

  const handleRequestAiDiagnostics = async () => {
    setLoadingAi(true);
    const unitDetails = `${order.year} ${order.make} ${order.model}`;
    const result = await getDiagnosticSuggestions(order.customerConcern, unitDetails, order.notes);
    setAiSuggestions(result);
    setLoadingAi(false);
  };

  const calculateTotals = () => {
    const partsTotal = order.parts.reduce((s, p) => s + (p.price * p.quantity), 0);
    const laborTotal = order.laborEntries.reduce((s, l) => s + (l.hours * l.rate), 0);
    return { partsTotal, laborTotal, total: partsTotal + laborTotal };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Detail Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b-2 border-zinc-800 pb-6">
        <div className="flex items-center gap-6">
          <Button variant="ghost" onClick={onBack} size="sm">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{order.orderNumber}</span>
              <span className="text-[10px] font-mono text-zinc-500">VIN: {order.vin}</span>
            </div>
            <h1 className="text-4xl font-rugged text-zinc-100 uppercase leading-none">{order.year} {order.make} {order.model}</h1>
            <p className="text-zinc-500 font-bold uppercase text-xs mt-1 tracking-tighter">Owner: {order.customerName} • {order.phone}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
           <div className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Flow Status</div>
           <select 
            value={order.status}
            onChange={(e) => updateStatus(e.target.value as WorkOrderStatus)}
            className={`font-rugged text-xl px-4 py-2 uppercase tracking-wide rounded-sm outline-none cursor-pointer border-2 transition-all ${STATUS_COLORS[order.status]}`}
           >
             {STATUS_SEQUENCE.map(s => <option key={s} value={s} className="bg-zinc-900 text-white font-sans">{s}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Tabs Area */}
        <div className="xl:col-span-3 space-y-6">
          <div className="flex border-b border-zinc-800 overflow-x-auto no-scrollbar">
            {(['LOG', 'LABOR', 'PARTS', 'PHOTOS', 'AI'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 font-rugged text-xl uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-orange-500' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600"></div>}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'LOG' && (
              <div className="space-y-6 animate-in slide-in-from-left-4">
                <form onSubmit={handleAddNote} className="space-y-3">
                  <textarea 
                    className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 rounded-sm outline-none focus:border-orange-500 text-zinc-100"
                    placeholder="Add service update or internal note..."
                    rows={3}
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button type="submit">Post Update</Button>
                  </div>
                </form>

                <div className="space-y-4">
                  {order.notes.map(note => (
                    <div key={note.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-sm relative group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">{note.author}</span>
                        <span className="text-[10px] font-mono text-zinc-600">{note.timestamp}</span>
                      </div>
                      <p className="text-zinc-300 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                  {order.notes.length === 0 && <p className="text-center py-10 text-zinc-700 uppercase font-black tracking-widest italic">No service updates logged yet.</p>}
                </div>
              </div>
            )}

            {activeTab === 'LABOR' && (
              <div className="space-y-8 animate-in slide-in-from-left-4">
                {/* Punch Clock */}
                <div className="bg-zinc-900 border-2 border-zinc-800 p-8 rounded-sm text-center shadow-2xl relative overflow-hidden">
                   <div className="relative z-10">
                      <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Technician Time Tracking</div>
                      <div className={`text-7xl font-rugged mb-6 transition-colors ${isPunchedIn ? 'text-emerald-500 animate-pulse' : 'text-zinc-100'}`}>
                        {new Date(elapsedSeconds * 1000).toISOString().substr(11, 8)}
                      </div>
                      <div className="flex justify-center gap-4">
                        {!isPunchedIn ? (
                          <Button size="xl" onClick={() => { setIsPunchedIn(true); setPunchInTime(Date.now()); }} className="w-48 bg-emerald-600 border-emerald-600">PUNCH IN</Button>
                        ) : (
                          <Button size="xl" variant="danger" onClick={handlePunchOut} className="w-48">PUNCH OUT</Button>
                        )}
                      </div>
                   </div>
                   {isPunchedIn && <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>}
                </div>

                <div className="space-y-4">
                   <h3 className="text-xl font-rugged uppercase text-zinc-100 border-b border-zinc-800 pb-2">Applied Labor</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {COMMON_LABOR_TASKS.map(task => (
                        <button 
                          key={task}
                          onClick={() => handleAddLabor(task, 0.5)}
                          className="p-4 bg-zinc-950 border border-zinc-900 hover:border-orange-500 text-left transition-all group"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-300 font-bold uppercase text-xs">{task}</span>
                            <span className="text-orange-500 font-black text-[10px] opacity-0 group-hover:opacity-100">+ Add 0.5h</span>
                          </div>
                        </button>
                      ))}
                   </div>
                   
                   <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden mt-6">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-950 text-zinc-600 font-black uppercase text-[10px]">
                          <tr>
                            <th className="px-4 py-3">Task</th>
                            <th className="px-4 py-3">Tech</th>
                            <th className="px-4 py-3">Hours</th>
                            <th className="px-4 py-3 text-right">Ext.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                          {order.laborEntries.map(entry => (
                            <tr key={entry.id}>
                              <td className="px-4 py-3 text-zinc-300 uppercase font-bold text-xs">{entry.description}</td>
                              <td className="px-4 py-3 text-zinc-500">{entry.technician}</td>
                              <td className="px-4 py-3 font-mono">{entry.hours}</td>
                              <td className="px-4 py-3 text-right font-mono">${(entry.hours * entry.rate).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'PARTS' && (
              <div className="space-y-6 animate-in slide-in-from-left-4">
                 <div className="relative">
                   <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2 block">Stock Lookup</label>
                   <input 
                    className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 rounded-sm outline-none focus:border-orange-500 uppercase font-bold"
                    placeholder="Search inventory by Part # or Description..."
                    value={partSearch}
                    onChange={e => setPartSearch(e.target.value)}
                   />
                   {partSearch && (
                     <div className="absolute top-full left-0 right-0 z-50 bg-zinc-900 border-2 border-orange-500 mt-1 shadow-2xl">
                       {inventory.filter(i => i.partNumber.toLowerCase().includes(partSearch.toLowerCase()) || i.description.toLowerCase().includes(partSearch.toLowerCase())).slice(0, 5).map(item => (
                         <div key={item.id} className="p-4 border-b border-zinc-800 hover:bg-zinc-800 cursor-pointer flex justify-between items-center" onClick={() => handleAddPart(item)}>
                           <div>
                             <div className="font-mono text-orange-500 font-bold">{item.partNumber}</div>
                             <div className="text-xs text-zinc-400">{item.description}</div>
                           </div>
                           <div className="text-right">
                              <div className="text-[10px] font-black text-emerald-500 uppercase">{item.quantityOnHand > 0 ? `Stock: ${item.quantityOnHand}` : 'OUT OF STOCK'}</div>
                              <div className="text-[10px] font-bold text-zinc-500 uppercase">Loc: {item.binLocation}</div>
                           </div>
                         </div>
                       ))}
                       <div 
                        className="p-4 bg-zinc-950 text-center cursor-pointer hover:bg-zinc-800 border-t border-zinc-800"
                        onClick={() => { setIsSpecialOrderModalOpen(true); }}
                       >
                         <span className="text-[10px] font-black uppercase text-orange-600">+ Special Order Item</span>
                       </div>
                     </div>
                   )}
                 </div>

                 <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-950 text-zinc-600 font-black uppercase text-[10px]">
                          <tr>
                            <th className="px-4 py-3">Part #</th>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3">Qty</th>
                            <th className="px-4 py-3 text-right">Ext.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                          {order.parts.map(part => (
                            <tr key={part.id}>
                              <td className="px-4 py-3 font-mono text-orange-500 font-bold">{part.partNumber}</td>
                              <td className="px-4 py-3 text-zinc-300 text-xs">{part.description}</td>
                              <td className="px-4 py-3 font-mono">{part.quantity}</td>
                              <td className="px-4 py-3 text-right font-mono">${(part.price * part.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                          {order.parts.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-zinc-700 uppercase font-black italic">No parts applied.</td></tr>}
                        </tbody>
                    </table>
                 </div>
              </div>
            )}

            {activeTab === 'AI' && (
              <div className="space-y-6 animate-in slide-in-from-left-4 pb-12">
                <div className="bg-zinc-900 border-2 border-orange-600/30 p-8 rounded-sm text-center relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-3xl font-rugged uppercase text-zinc-100 mb-2">AI Diagnostic Assist</h3>
                    <p className="text-zinc-500 text-sm max-w-xl mx-auto mb-8 uppercase font-bold tracking-widest">Consulting expert system based on unit specs and technician log.</p>
                    <Button 
                      size="xl" 
                      onClick={handleRequestAiDiagnostics} 
                      disabled={loadingAi}
                      className="min-w-64"
                    >
                      {loadingAi ? 'CONSULTING EXPERT SYSTEM...' : 'ANALYZE SYMPTOMS'}
                    </Button>
                  </div>
                  <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
                    <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                  </div>
                </div>

                {aiSuggestions && (
                  <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-zinc-900 border-l-4 border-orange-500 p-6 shadow-xl">
                        <h4 className="text-orange-500 font-rugged text-xl uppercase mb-4">Potential Causes</h4>
                        <ul className="space-y-3">
                          {aiSuggestions.potentialCauses.map((cause, i) => (
                            <li key={i} className="flex gap-3 text-zinc-300 text-sm">
                              <span className="text-orange-600 font-bold">0{i+1}</span>
                              {cause}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-zinc-900 border-l-4 border-emerald-500 p-6 shadow-xl">
                        <h4 className="text-emerald-500 font-rugged text-xl uppercase mb-4">Suggested Steps</h4>
                        <ul className="space-y-3">
                          {aiSuggestions.suggestedSteps.map((step, i) => (
                            <li key={i} className="flex flex-col gap-2">
                              <div className="flex gap-3 text-zinc-300 text-sm">
                                <span className="text-emerald-600 font-bold">0{i+1}</span>
                                {step}
                              </div>
                              <button 
                                onClick={() => copyToNotes(step, "DIAGNOSTIC STEP")}
                                className="text-[9px] font-black uppercase text-zinc-600 hover:text-emerald-500 self-end transition-colors"
                              >
                                [Add to Work Log]
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* NEW: Recommended Follow-up Section */}
                    <div className="bg-zinc-900 border-2 border-blue-600/30 p-6 shadow-2xl rounded-sm">
                       <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-2">
                          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <h4 className="text-blue-500 font-rugged text-2xl uppercase tracking-wider">Recommended Follow-up Questions</h4>
                       </div>
                       <div className="space-y-4">
                          {aiSuggestions.missingInformation.map((info, i) => (
                            <div key={i} className="flex items-center justify-between group bg-zinc-950/50 p-3 border border-zinc-900 rounded-sm hover:border-blue-900/50 transition-all">
                               <div className="flex items-start gap-4 pr-4">
                                  <div className="w-5 h-5 rounded-full border-2 border-blue-600/30 flex items-center justify-center shrink-0 mt-0.5">
                                     <div className="w-2 h-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  </div>
                                  <p className="text-zinc-300 text-sm italic">"{info}"</p>
                               </div>
                               <button 
                                onClick={() => copyToNotes(info, "FOLLOW-UP CHECK")}
                                className="bg-blue-600/10 border border-blue-600/30 text-blue-400 text-[10px] font-black uppercase px-3 py-1.5 rounded-sm hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap"
                               >
                                 Copy to Notes
                               </button>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'PHOTOS' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-left-4">
                {order.images.map((img, i) => (
                  <div key={i} className="aspect-square bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden group relative">
                    <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={`Unit photo ${i+1}`} />
                  </div>
                ))}
                <div className="aspect-square bg-zinc-950 border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors group">
                  <svg className="w-12 h-12 text-zinc-800 group-hover:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-[10px] font-black uppercase text-zinc-700 mt-2 group-hover:text-orange-500">Capture Shot</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           {/* Schematic Card */}
           <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm shadow-xl space-y-4">
              <h3 className="font-rugged text-xl uppercase text-orange-500 border-b border-zinc-800 pb-2">Unit Schematic</h3>
              {matchedSchematic ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-sm overflow-hidden relative group cursor-pointer" onClick={() => setIsDiagramOpen(true)}>
                    <img src={matchedSchematic.diagramUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="Microfiche" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <span className="bg-white text-black text-[10px] font-black px-2 py-1 rounded-sm uppercase">Launch Viewer</span>
                    </div>
                  </div>
                  <Button variant="secondary" fullWidth size="sm" onClick={() => setIsDiagramOpen(true)}>Open Digital Parts Book</Button>
                </div>
              ) : (
                <div className="bg-zinc-950 p-6 border border-zinc-800 border-dashed text-center">
                   <p className="text-[10px] font-bold text-zinc-600 uppercase mb-4">No schematic indexed for this model</p>
                   <Button variant="ghost" size="sm" onClick={() => setIsAttachDiagramOpen(true)}>Find or Upload Diagram</Button>
                </div>
              )}
           </div>

           {/* Inspection Card */}
           <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm shadow-xl">
              <h3 className="font-rugged text-xl uppercase text-zinc-100 border-b border-zinc-800 pb-2 mb-4">Intake Inspection</h3>
              <div className="space-y-2">
                 {order.inspection && (Object.entries(order.inspection) as [string, boolean][]).map(([key, val]) => (
                   <div key={key} className="flex justify-between items-center bg-zinc-950 p-2 rounded-sm">
                      <span className="text-[10px] font-black uppercase text-zinc-500">{key}</span>
                      <span className={`text-[10px] font-black uppercase ${val ? 'text-emerald-500' : 'text-red-500'}`}>
                        {val ? 'PASS' : 'FAIL'}
                      </span>
                   </div>
                 ))}
              </div>
           </div>

           {/* Totals Card */}
           <div className="bg-zinc-900 border-t-4 border-orange-600 p-6 rounded-sm shadow-2xl">
              <h3 className="font-rugged text-xl uppercase text-zinc-100 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                 <div className="flex justify-between text-sm">
                    <span className="text-zinc-500 uppercase font-bold text-[10px]">Parts Billed</span>
                    <span className="font-mono text-zinc-300">${totals.partsTotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-zinc-500 uppercase font-bold text-[10px]">Labor Subtotal</span>
                    <span className="font-mono text-zinc-300">${totals.laborTotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between pt-2 border-t border-zinc-800">
                    <span className="text-zinc-100 uppercase font-black text-xs">Total Estimate</span>
                    <span className="font-rugged text-2xl text-orange-500">${totals.total.toFixed(2)}</span>
                 </div>
              </div>
              <Button fullWidth variant="primary" size="lg">Generate Invoice</Button>
           </div>
        </div>
      </div>

      {isDiagramOpen && matchedSchematic && (
        <DiagramViewerModal 
          url={matchedSchematic.diagramUrl}
          title={`${matchedSchematic.year} ${matchedSchematic.make} ${matchedSchematic.model}`}
          inventory={inventory}
          onClose={() => setIsDiagramOpen(false)}
        />
      )}

      {isSpecialOrderModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[200] backdrop-blur-md">
          <div className="bg-zinc-900 border-2 border-orange-600 p-8 rounded-sm w-full max-w-xl shadow-2xl">
             <h2 className="text-3xl font-rugged uppercase text-white mb-8">Special Order Entry</h2>
             <div className="space-y-4">
                <input className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-sm uppercase font-bold text-zinc-100 outline-none focus:border-orange-500" placeholder="Part Number" />
                <input className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-sm uppercase font-bold text-zinc-100 outline-none focus:border-orange-500" placeholder="Part Description" />
                <select className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-sm uppercase font-bold text-zinc-100 outline-none focus:border-orange-500">
                  {vendors.map(v => <option key={v.id}>{v.name}</option>)}
                </select>
                <div className="flex gap-4 pt-6">
                  <Button fullWidth size="lg" onClick={() => setIsSpecialOrderModalOpen(false)}>Add to WO</Button>
                  <Button variant="secondary" fullWidth size="lg" onClick={() => setIsSpecialOrderModalOpen(false)}>Discard</Button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
