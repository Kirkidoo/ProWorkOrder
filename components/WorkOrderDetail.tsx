import React, { useState, useEffect, useRef } from 'react';
import { WorkOrderStatus, Part, ServiceNote, LaborEntry, InventoryItem } from '../types';
import { STATUS_COLORS, STATUS_SEQUENCE, DEFAULT_SHOP_RATE, COMMON_LABOR_TASKS } from '../constants';
import { Button } from './Button';
import { getDiagnosticSuggestions } from '../services/geminiService';
import { DiagramViewerModal } from './DiagramViewerModal';
import { useApp } from '../context/AppContext';
import { ServiceLog } from './ServiceLog';
import { LaborTracker } from './LaborTracker';
import { PartsLookup } from './PartsLookup';
import { AiDiagnosticAssist } from './AiDiagnosticAssist';
import { ErrorBoundary } from './ErrorBoundary';


interface AiSuggestions {
  potentialCauses: string[];
  suggestedSteps: string[];
  missingInformation: string[];
}

export const WorkOrderDetail: React.FC = () => {
  const {
    selectedOrder: order, inventory, vendors, schematics,
    handleUpdateOrder: onUpdate, handleAddPartsOrder: onSpecialOrder,
    handleAddSchematic: onAddSchematic, setView, setSelectedOrder
  } = useApp();

  const onBack = () => { setView('COMMAND_CENTER'); setSelectedOrder(null); };

  if (!order) return null;

  const [activeTab, setActiveTab] = useState<'LOG' | 'LABOR' | 'PARTS' | 'PHOTOS' | 'AI'>('LOG');
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

  const handleAddNote = (content: string) => {
    const note: ServiceNote = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString(),
      author: 'Current Tech',
      content: content
    };
    onUpdate({ ...order, notes: [note, ...order.notes] });
  };

  const handleDeleteNote = (noteId: string) => {
    if (!window.confirm("DELETE THIS NOTE?")) return;
    onUpdate({ ...order, notes: order.notes.filter(n => n.id !== noteId) });
  };

  const handleEditNote = (noteId: string, content: string) => {
    onUpdate({
      ...order,
      notes: order.notes.map(n => n.id === noteId ? { ...n, content } : n)
    });
  };

  const copyToNotes = (text: string, prefix: string) => {
    handleAddNote(`[AI ${prefix}]: ${text}`);
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
              <ServiceLog
                notes={order.notes}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
                onEditNote={handleEditNote}
              />
            )}

            {activeTab === 'LABOR' && (
              <LaborTracker
                laborEntries={order.laborEntries}
                isPunchedIn={isPunchedIn}
                elapsedSeconds={elapsedSeconds}
                onPunchIn={() => { setIsPunchedIn(true); setPunchInTime(Date.now()); }}
                onPunchOut={handlePunchOut}
                onAddLabor={handleAddLabor}
              />
            )}

            {activeTab === 'PARTS' && (
              <PartsLookup
                parts={order.parts}
                inventory={inventory}
                partSearch={partSearch}
                onPartSearchChange={setPartSearch}
                onAddPart={handleAddPart}
                onOpenSpecialOrder={() => setIsSpecialOrderModalOpen(true)}
              />
            )}

            {activeTab === 'AI' && (
              <ErrorBoundary>
                <AiDiagnosticAssist
                  loadingAi={loadingAi}
                  aiSuggestions={aiSuggestions}
                  onRequestDiagnostics={handleRequestAiDiagnostics}
                  onCopyToNotes={copyToNotes}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'PHOTOS' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-left-4">
                {order.images.map((img, i) => (
                  <div key={i} className="aspect-square bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden group relative">
                    <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={`Unit photo ${i + 1}`} />
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
