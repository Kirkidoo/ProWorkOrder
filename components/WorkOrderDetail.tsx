
import React, { useState, useEffect, useRef } from 'react';
import { WorkOrder, WorkOrderStatus, Part, ServiceNote, LaborEntry, InventoryItem } from '../types';
import { STATUS_COLORS, STATUS_SEQUENCE, VEHICLE_ICONS, DEFAULT_SHOP_RATE } from '../constants';
import { Button } from './Button';
import { getDiagnosticSuggestions } from '../services/geminiService';

interface WorkOrderDetailProps {
  order: WorkOrder;
  inventory: InventoryItem[];
  onUpdate: (updatedOrder: WorkOrder) => void;
  onBack: () => void;
}

export const WorkOrderDetail: React.FC<WorkOrderDetailProps> = ({ order, inventory, onUpdate, onBack }) => {
  const [activeTab, setActiveTab] = useState<'LOG' | 'LABOR' | 'PARTS' | 'PHOTOS' | 'AI'>('LOG');
  const [newNote, setNewNote] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<{ potentialCauses: string[], suggestedSteps: string[] } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [partSearch, setPartSearch] = useState('');

  // Timer State
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

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
    onUpdate({ ...order, status: newStatus });
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const note: ServiceNote = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString(),
      author: 'Shop Mechanic',
      content: newNote
    };
    onUpdate({ ...order, notes: [note, ...order.notes] });
    setNewNote('');
  };

  const addPartFromInventory = (item: InventoryItem) => {
    const part: Part = {
      id: Math.random().toString(36).substr(2, 9),
      partNumber: item.partNumber,
      description: item.description,
      price: item.unitPrice,
      quantity: 1
    };
    onUpdate({ ...order, parts: [...order.parts, part] });
    setPartSearch('');
  };

  const addPartManual = () => {
    const part: Part = {
      id: Math.random().toString(36).substr(2, 9),
      partNumber: 'NEW-PART',
      description: 'Generic Part',
      price: 0,
      quantity: 1
    };
    onUpdate({ ...order, parts: [...order.parts, part] });
  };

  const handlePunchToggle = () => {
    if (!isPunchedIn) {
      setPunchInTime(Date.now());
      setIsPunchedIn(true);
    } else {
      const stopTime = Date.now();
      const diffMs = stopTime - (punchInTime || stopTime);
      const hours = parseFloat((diffMs / 3600000).toFixed(2));
      
      const newEntry: LaborEntry = {
        id: Math.random().toString(36).substr(2, 9),
        technician: 'Shop Mechanic',
        description: 'Timed Labor Session',
        hours: hours > 0.01 ? hours : 0.01,
        rate: DEFAULT_SHOP_RATE,
        timestamp: new Date().toLocaleString()
      };
      
      onUpdate({ ...order, laborEntries: [...order.laborEntries, newEntry] });
      setIsPunchedIn(false);
      setPunchInTime(null);
    }
  };

  const addManualLabor = () => {
    const newEntry: LaborEntry = {
      id: Math.random().toString(36).substr(2, 9),
      technician: 'Shop Mechanic',
      description: 'Manual Entry',
      hours: 1.0,
      rate: DEFAULT_SHOP_RATE,
      timestamp: new Date().toLocaleString()
    };
    onUpdate({ ...order, laborEntries: [...order.laborEntries, newEntry] });
  };

  const updateLaborEntry = (id: string, field: keyof LaborEntry, value: any) => {
    const updatedEntries = order.laborEntries.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    );
    onUpdate({ ...order, laborEntries: updatedEntries });
  };

  const handleAiConsult = async () => {
    setLoadingAi(true);
    setActiveTab('AI');
    const result = await getDiagnosticSuggestions(order.customerConcern, `${order.year} ${order.make} ${order.model}`);
    setAiSuggestions(result);
    setLoadingAi(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const partsTotal = order.parts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const laborTotal = order.laborEntries.reduce((sum, l) => sum + (l.hours * l.rate), 0);
  const grandTotal = partsTotal + laborTotal;

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map(v => v < 10 ? '0' + v : v).join(':');
  };

  const filteredInventory = inventory.filter(i => 
    i.partNumber.toLowerCase().includes(partSearch.toLowerCase()) || 
    i.description.toLowerCase().includes(partSearch.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-32">
      {/* Printer Template (Hidden on Screen) */}
      <div className="print-template p-8 font-serif">
        <div className="flex justify-between items-start border-b-4 border-black pb-4 mb-6">
          <div>
            <h1 className="text-5xl font-rugged uppercase tracking-tighter">Shop Copy</h1>
            <p className="text-xl font-bold uppercase mt-2">PowerLog Pro Service System</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-rugged text-black">#{order.orderNumber}</div>
            <div className="text-sm font-bold mt-1">Date: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="print-border p-4">
            <h2 className="text-xs font-black uppercase tracking-widest border-b border-black mb-2">Customer Info</h2>
            <div className="text-2xl font-bold uppercase">{order.customerName}</div>
            <div className="text-lg">{order.phone}</div>
          </div>
          <div className="print-border p-4">
            <h2 className="text-xs font-black uppercase tracking-widest border-b border-black mb-2">Unit Details</h2>
            <div className="text-2xl font-bold uppercase">{order.year} {order.make} {order.model}</div>
            <div className="font-mono text-sm mt-1 uppercase">VIN: {order.vin}</div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xs font-black uppercase tracking-widest border-b border-black mb-2">Customer Concern</h2>
          <div className="text-xl p-4 print-border min-h-[100px] italic">
            "{order.customerConcern}"
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest border-b border-black mb-2">Parts Used / Needed</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-xs uppercase font-bold">
                  <th className="print-border p-2 w-1/4">Part #</th>
                  <th className="print-border p-2 w-2/4">Description</th>
                  <th className="print-border p-2 w-1/4">Qty</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 12 }).map((_, i) => (
                  <tr key={i} className="h-10">
                    <td className="print-border p-2"></td>
                    <td className="print-border p-2"></td>
                    <td className="print-border p-2"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-widest border-b border-black mb-2">Labor Log</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-xs uppercase font-bold">
                  <th className="print-border p-2 w-1/5">Date</th>
                  <th className="print-border p-2 w-3/5">Work Performed</th>
                  <th className="print-border p-2 w-1/5">Time</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="h-10">
                    <td className="print-border p-2"></td>
                    <td className="print-border p-2"></td>
                    <td className="print-border p-2"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <h2 className="text-xs font-black uppercase tracking-widest border-b border-black mb-2">Diagnostic Findings / Recommendations</h2>
            <div className="print-border p-4 min-h-[300px] print-lined">
              {/* Technician handwriting area */}
            </div>
          </div>
        </div>
      </div>

      {/* Screen View */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} size="sm">
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Dashboard
          </Button>
          <div className="h-10 w-[2px] bg-zinc-800 hidden md:block"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-sm">#{order.orderNumber}</span>
              <h1 className="text-2xl font-rugged uppercase">{order.year} {order.make} {order.model}</h1>
            </div>
            <p className="text-zinc-400 text-sm">{order.customerName} • {order.phone}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={handlePrint} className="mr-2">
             <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
             Print Shop Copy
          </Button>
          {STATUS_SEQUENCE.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              className={`px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-tighter transition-all ${
                order.status === s ? STATUS_COLORS[s] : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm">
            <h3 className="font-rugged text-xl uppercase text-orange-500 mb-4 flex items-center gap-2">
              {VEHICLE_ICONS[order.vehicleType]}
              Intake Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">VIN / Serial</label>
                <p className="font-mono text-zinc-100">{order.vin.toUpperCase()}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Customer Concern</label>
                <p className="text-zinc-300 italic">"{order.customerConcern}"</p>
              </div>
              <Button variant="secondary" fullWidth className="mt-4" onClick={handleAiConsult} disabled={loadingAi}>
                {loadingAi ? 'Analyzing...' : 'AI Mechanic Consultation'}
              </Button>
            </div>
          </div>

          {/* Punch Clock Widget */}
          <div className={`bg-zinc-900 border-2 rounded-sm p-6 transition-colors ${isPunchedIn ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'border-zinc-800'}`}>
            <h3 className="font-rugged text-xl uppercase mb-2">Punch Clock</h3>
            <div className="text-4xl font-mono text-center mb-6 py-4 bg-zinc-950 rounded-sm">
              {formatTime(elapsedSeconds)}
            </div>
            <Button 
              variant={isPunchedIn ? 'danger' : 'primary'} 
              fullWidth 
              size="xl" 
              onClick={handlePunchToggle}
            >
              {isPunchedIn ? 'Punch Out & Log' : 'Punch In'}
            </Button>
            <p className="text-[10px] text-zinc-500 text-center mt-4 uppercase tracking-widest">
              Live timer logs directly to labor entries
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b-2 border-zinc-800 overflow-x-auto whitespace-nowrap">
            {['LOG', 'LABOR', 'PARTS', 'PHOTOS', 'AI'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-8 py-4 font-rugged text-lg uppercase tracking-widest transition-colors ${
                  activeTab === tab ? 'text-orange-500 border-b-2 border-orange-500 mb-[-2px]' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'LOG' && (
              <div className="space-y-6">
                <div className="flex gap-4">
                  <textarea
                    className="flex-1 bg-zinc-950 border border-zinc-800 p-4 rounded-sm outline-none focus:border-orange-500"
                    placeholder="Type mechanic notes here..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <Button size="lg" onClick={addNote}>Post Note</Button>
                </div>
                <div className="space-y-4">
                  {order.notes.map((note) => (
                    <div key={note.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-orange-500">{note.author}</span>
                        <span className="text-xs text-zinc-600 font-mono">{note.timestamp}</span>
                      </div>
                      <p className="text-zinc-300">{note.content}</p>
                    </div>
                  ))}
                  {order.notes.length === 0 && <p className="text-zinc-600 italic">No notes recorded yet.</p>}
                </div>
              </div>
            )}

            {activeTab === 'LABOR' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-rugged text-xl uppercase">Labor Line Items</h3>
                  <Button variant="secondary" size="md" onClick={addManualLabor}>+ Add Labor</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-950 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                      <tr>
                        <th className="px-4 py-4">Technician</th>
                        <th className="px-4 py-4">Work Performed</th>
                        <th className="px-4 py-4 w-24">Hours</th>
                        <th className="px-4 py-4 w-24">Rate</th>
                        <th className="px-4 py-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {order.laborEntries.map((l) => (
                        <tr key={l.id} className="bg-zinc-900/50">
                          <td className="px-4 py-4">
                            <input 
                              className="bg-transparent border-none focus:ring-1 focus:ring-orange-500 rounded-sm w-full text-zinc-200"
                              value={l.technician}
                              onChange={(e) => updateLaborEntry(l.id, 'technician', e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-4">
                            <input 
                              className="bg-transparent border-none focus:ring-1 focus:ring-orange-500 rounded-sm w-full text-zinc-300"
                              value={l.description}
                              placeholder="e.g. Engine Diagnostic"
                              onChange={(e) => updateLaborEntry(l.id, 'description', e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-4">
                            <input 
                              type="number"
                              step="0.1"
                              className="bg-transparent border-none focus:ring-1 focus:ring-orange-500 rounded-sm w-full font-mono text-orange-500"
                              value={l.hours}
                              onChange={(e) => updateLaborEntry(l.id, 'hours', parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-4 py-4">
                            <input 
                              type="number"
                              className="bg-transparent border-none focus:ring-1 focus:ring-orange-500 rounded-sm w-full font-mono text-zinc-400"
                              value={l.rate}
                              onChange={(e) => updateLaborEntry(l.id, 'rate', parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-4 py-4 text-right font-mono font-bold text-white">
                            ${(l.hours * l.rate).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {order.laborEntries.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-zinc-600 italic">No labor entries recorded. Punch in or add manually.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'PARTS' && (
              <div className="space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-sm">
                  <h3 className="font-rugged text-xl uppercase mb-4 text-zinc-100">Add Parts from Inventory</h3>
                  <div className="relative">
                    <input 
                      type="text"
                      className="w-full bg-zinc-950 border border-zinc-800 p-4 text-zinc-100 outline-none focus:border-orange-500 uppercase font-bold"
                      placeholder="Start typing Part Number or Description..."
                      value={partSearch}
                      onChange={(e) => setPartSearch(e.target.value)}
                    />
                    {partSearch && (
                      <div className="absolute top-full left-0 right-0 bg-zinc-900 border-2 border-orange-500 mt-1 shadow-2xl z-50 rounded-sm overflow-hidden">
                        {filteredInventory.length > 0 ? (
                          filteredInventory.map(item => (
                            <div 
                              key={item.id} 
                              className="p-4 border-b border-zinc-800 hover:bg-zinc-800 cursor-pointer flex justify-between items-center group"
                              onClick={() => addPartFromInventory(item)}
                            >
                              <div>
                                <div className="font-mono text-orange-500 font-bold group-hover:text-white">{item.partNumber}</div>
                                <div className="text-xs text-zinc-400">{item.description} • Bin: {item.binLocation}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-zinc-100">${item.unitPrice.toFixed(2)}</div>
                                <div className={`text-[10px] font-bold ${item.quantityOnHand > 0 ? 'text-zinc-500' : 'text-red-500 uppercase'}`}>
                                  {item.quantityOnHand > 0 ? `In Stock: ${item.quantityOnHand}` : 'OUT OF STOCK'}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-zinc-500 text-sm italic flex justify-between items-center">
                            No parts found. 
                            <Button variant="ghost" size="sm" onClick={addPartManual}>Add Manual Row</Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-950 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      <tr>
                        <th className="px-4 py-2">Part #</th>
                        <th className="px-4 py-2">Description</th>
                        <th className="px-4 py-2">Qty</th>
                        <th className="px-4 py-2">Price</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {order.parts.map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 py-4 font-mono text-zinc-300">
                            <input 
                              className="bg-transparent border-none focus:ring-1 focus:ring-orange-500 rounded-sm w-full font-mono uppercase"
                              value={p.partNumber}
                              onChange={(e) => {
                                const newParts = order.parts.map(pt => pt.id === p.id ? { ...pt, partNumber: e.target.value } : pt);
                                onUpdate({ ...order, parts: newParts });
                              }}
                            />
                          </td>
                          <td className="px-4 py-4 text-zinc-300">
                            <input 
                              className="bg-transparent border-none focus:ring-1 focus:ring-orange-500 rounded-sm w-full"
                              value={p.description}
                              onChange={(e) => {
                                const newParts = order.parts.map(pt => pt.id === p.id ? { ...pt, description: e.target.value } : pt);
                                onUpdate({ ...order, parts: newParts });
                              }}
                            />
                          </td>
                          <td className="px-4 py-4 text-zinc-300 w-20">
                            <input 
                              type="number"
                              className="bg-transparent border-none focus:ring-1 focus:ring-orange-500 rounded-sm w-full font-mono"
                              value={p.quantity}
                              onChange={(e) => {
                                const newParts = order.parts.map(pt => pt.id === p.id ? { ...pt, quantity: parseInt(e.target.value) || 0 } : pt);
                                onUpdate({ ...order, parts: newParts });
                              }}
                            />
                          </td>
                          <td className="px-4 py-4 text-zinc-300 w-24">
                            <input 
                              type="number"
                              className="bg-transparent border-none focus:ring-1 focus:ring-orange-500 rounded-sm w-full font-mono"
                              value={p.price}
                              onChange={(e) => {
                                const newParts = order.parts.map(pt => pt.id === p.id ? { ...pt, price: parseFloat(e.target.value) || 0 } : pt);
                                onUpdate({ ...order, parts: newParts });
                              }}
                            />
                          </td>
                          <td className="px-4 py-4 text-right text-orange-500 font-bold font-mono">${(p.price * p.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'PHOTOS' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="aspect-video bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                  <svg className="w-8 h-8 text-zinc-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span className="text-xs font-bold uppercase text-zinc-600">Upload Image</span>
                </div>
                {order.images.map((img, i) => (
                  <img key={i} src={img} className="aspect-video object-cover border border-zinc-800 rounded-sm" />
                ))}
                {order.images.length === 0 && (
                  <div className="col-span-full py-12 text-center text-zinc-600 italic">No job photos attached.</div>
                )}
              </div>
            )}

            {activeTab === 'AI' && (
              <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-sm space-y-8">
                {loadingAi ? (
                  <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-orange-500 font-rugged text-xl">Consulting Service Intelligence...</p>
                  </div>
                ) : aiSuggestions ? (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-orange-500 font-rugged text-2xl uppercase">Potential Causes</h3>
                      <ul className="space-y-2">
                        {aiSuggestions.potentialCauses.map((c, i) => (
                          <li key={i} className="flex gap-3 items-start text-zinc-300">
                            <span className="text-orange-500 font-bold">[{i+1}]</span> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-emerald-500 font-rugged text-2xl uppercase">Suggested Diagnostics</h3>
                      <ul className="space-y-2">
                        {aiSuggestions.suggestedSteps.map((s, i) => (
                          <li key={i} className="flex gap-3 items-start text-zinc-300">
                            <span className="text-emerald-500 font-bold">▶</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                     <p className="text-zinc-600">Run the AI Consultation to generate diagnostic leads.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Box Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t-2 border-orange-600 py-4 px-6 md:px-12 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-8">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Parts Subtotal</div>
              <div className="text-xl font-mono text-zinc-100">${partsTotal.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Labor Subtotal</div>
              <div className="text-xl font-mono text-zinc-100">${laborTotal.toFixed(2)}</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs font-bold uppercase tracking-tighter text-orange-500">Work Order Grand Total</div>
              <div className="text-4xl font-rugged text-white">${grandTotal.toFixed(2)}</div>
            </div>
            <Button size="lg" className="hidden md:flex">Post Final Quote</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
