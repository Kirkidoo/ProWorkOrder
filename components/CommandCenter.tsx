
import React, { useState, useMemo } from 'react';
import { WorkOrder, Appointment, WorkOrderStatus, VehicleType, AppointmentType, Customer } from '../types';
import { STATUS_COLORS, VEHICLE_ICONS, STATUS_SEQUENCE, APPOINTMENT_COLORS, BUSINESS_HOURS } from '../constants';
import { Button } from './Button';

interface CommandCenterProps {
  workOrders: WorkOrder[];
  appointments: Appointment[];
  customers: Customer[];
  onSelectOrder: (order: WorkOrder) => void;
  onCreateNewWO: () => void;
  onOpenCalendar: () => void;
  onAddAppointment: (apt: Omit<Appointment, 'id'>) => void;
  onUpdateAppointment: (apt: Appointment) => void;
  onConvertToWorkOrder: (apt: Appointment) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  workOrders,
  appointments,
  customers,
  onSelectOrder,
  onCreateNewWO,
  onOpenCalendar,
  onAddAppointment,
  onUpdateAppointment,
  onConvertToWorkOrder,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);

  // Stats calculation
  const stats = {
    arrivingToday: appointments.filter(a => new Date(a.startTime).toDateString() === new Date().toDateString()).length,
    readyForPickup: workOrders.filter(o => o.status === WorkOrderStatus.READY).length,
    highPriority: workOrders.filter(o => o.status === WorkOrderStatus.NEW || o.status === WorkOrderStatus.DIAGNOSING).length,
  };

  // Weekly Agenda Days
  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); 
    start.setDate(diff);
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const activeWorkOrders = workOrders.filter(o => 
    o.status !== WorkOrderStatus.PICKED_UP && o.status !== WorkOrderStatus.READY
  );

  const hours = Array.from({ length: BUSINESS_HOURS.end - BUSINESS_HOURS.start + 1 }, (_, i) => i + BUSINESS_HOURS.start);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* SIDEBAR: Stats & Quick Actions */}
      <aside className="w-full lg:w-72 flex flex-col gap-6 shrink-0">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-sm shadow-xl space-y-4">
          <h3 className="font-rugged text-xl text-zinc-100 uppercase border-b border-zinc-800 pb-2">Quick Ops</h3>
          <Button fullWidth size="lg" onClick={onCreateNewWO}>+ New Work Order</Button>
          <Button fullWidth variant="secondary" size="lg" onClick={() => { setSelectedApt(null); setIsAptModalOpen(true); }}>+ New Appt</Button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-sm shadow-xl space-y-4 flex-1">
          <h3 className="font-rugged text-xl text-zinc-100 uppercase border-b border-zinc-800 pb-2">Day Pulse</h3>
          <StatMiniCard label="Arriving Today" value={stats.arrivingToday} color="text-blue-500" />
          <StatMiniCard label="Ready for Pickup" value={stats.readyForPickup} color="text-emerald-500" />
          <StatMiniCard label="Needs Triage" value={stats.highPriority} color="text-orange-500" />
          
          <div className="pt-4 border-t border-zinc-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Shop Capacity</p>
            <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
              <div 
                className="bg-orange-600 h-full transition-all" 
                style={{ width: `${Math.min((activeWorkOrders.length / 10) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 uppercase">{activeWorkOrders.length} active units / 10 max</p>
          </div>
        </div>
      </aside>

      {/* MAIN COMMAND AREA */}
      <main className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        {/* TOP: Weekly Agenda (Horizontal Scroll) */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-sm flex flex-col h-[300px] shrink-0 overflow-hidden shadow-inner">
          <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="font-rugged text-lg tracking-widest uppercase text-zinc-400">Weekly Arrival Queue</h2>
            <div className="flex gap-2">
              <button className="text-zinc-500 hover:text-white px-2" onClick={() => {
                const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d);
              }}>Prev</button>
              <button className="text-zinc-500 hover:text-white px-2" onClick={() => {
                const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d);
              }}>Next</button>
            </div>
          </div>
          <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin">
            <div className="flex divide-x divide-zinc-800 min-w-max">
              {weekDays.map(day => (
                <div key={day.toISOString()} className="w-64 p-3 space-y-3">
                  <div className={`text-center pb-2 border-b border-zinc-800 ${day.toDateString() === new Date().toDateString() ? 'bg-orange-600/5' : ''}`}>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="text-xl font-rugged text-zinc-100">{day.getDate()}</div>
                  </div>
                  <div className="space-y-2">
                    {appointments.filter(a => new Date(a.startTime).toDateString() === day.toDateString()).map(apt => (
                      <div 
                        key={apt.id} 
                        onClick={() => { setSelectedApt(apt); setIsAptModalOpen(true); }}
                        className={`p-2 border-l-4 rounded-sm cursor-pointer hover:scale-[1.02] transition-transform ${APPOINTMENT_COLORS[apt.type]}`}
                      >
                        <div className="font-bold text-[10px] truncate uppercase">{apt.customerName}</div>
                        <div className="text-[9px] opacity-80 truncate uppercase font-mono">{new Date(apt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>
                    ))}
                    {appointments.filter(a => new Date(a.startTime).toDateString() === day.toDateString()).length === 0 && (
                      <div className="text-center py-4 text-[10px] text-zinc-700 italic border border-dashed border-zinc-800">Clear</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM: Active Shop Floor (Grid of Cards) */}
        <section className="flex-1 flex flex-col bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden shadow-2xl">
          <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="font-rugged text-lg tracking-widest uppercase text-orange-500">Live Shop Floor</h2>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{activeWorkOrders.length} Units In Process</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {activeWorkOrders.length === 0 ? (
                <div className="col-span-full py-20 text-center text-zinc-600 font-rugged text-2xl uppercase border-2 border-dashed border-zinc-800">
                  Shop floor is empty. Triage units from intake.
                </div>
              ) : (
                activeWorkOrders.map(order => (
                  <WorkOrderMiniCard key={order.id} order={order} onClick={() => onSelectOrder(order)} />
                ))
              )}
            </div>
          </div>
        </section>

      </main>

      {/* Appointment Modal Overlay (Reusing AppointmentModal logic) */}
      {isAptModalOpen && (
        <CommandAptModal 
          appointment={selectedApt} 
          customers={customers}
          onSave={(data) => {
            if (selectedApt) onUpdateAppointment({ ...selectedApt, ...data });
            else onAddAppointment({ ...data, startTime: new Date().toISOString() });
            setIsAptModalOpen(false);
          }}
          onConvertToWorkOrder={(apt) => {
            onConvertToWorkOrder(apt);
            setIsAptModalOpen(false);
          }}
          onClose={() => setIsAptModalOpen(false)}
        />
      )}
    </div>
  );
};

const StatMiniCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="bg-zinc-950 p-3 rounded-sm border border-zinc-800 flex justify-between items-center group hover:border-zinc-700 transition-colors">
    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{label}</span>
    <span className={`text-2xl font-rugged ${color}`}>{value}</span>
  </div>
);

const WorkOrderMiniCard = ({ order, onClick }: { order: WorkOrder; onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="bg-zinc-950 border-l-4 border-zinc-800 p-4 rounded-sm shadow-lg hover:border-orange-500 hover:bg-zinc-900 transition-all cursor-pointer group"
  >
    <div className="flex justify-between items-start mb-3">
      <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-tighter ${STATUS_COLORS[order.status]}`}>
        {order.status}
      </span>
      <span className="font-mono text-[10px] text-zinc-600">#{order.orderNumber}</span>
    </div>
    
    <div className="flex gap-3 mb-3">
      <div className="p-2 bg-zinc-800 rounded-sm text-zinc-500 group-hover:text-orange-500">
        {VEHICLE_ICONS[order.vehicleType]}
      </div>
      <div>
        <div className="font-bold text-zinc-100 uppercase text-sm leading-none">{order.year} {order.make}</div>
        <div className="text-xs text-zinc-500 uppercase">{order.model}</div>
      </div>
    </div>

    <div className="text-[11px] text-zinc-300 italic mb-3 line-clamp-2 border-t border-zinc-900 pt-2">
      "{order.customerConcern}"
    </div>

    <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-900">
      <div className="text-[9px] font-bold uppercase text-zinc-500">{order.customerName}</div>
      <div className="text-[10px] font-mono text-orange-600 font-bold">
        ${(order.parts.reduce((s,p) => s + p.price * p.quantity, 0) + order.laborEntries.reduce((s,l) => s + l.hours * l.rate, 0)).toFixed(0)}
      </div>
    </div>
  </div>
);

// Simplified Appointment Modal for Command Center
const CommandAptModal = ({ 
  appointment, 
  customers, 
  onSave, 
  onConvertToWorkOrder,
  onClose 
}: { 
  appointment: Appointment | null; 
  customers: Customer[];
  onSave: (data: any) => void;
  onConvertToWorkOrder: (apt: Appointment) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    customerName: appointment?.customerName || '',
    phone: appointment?.phone || '',
    vehicleInfo: appointment?.vehicleInfo || '',
    type: appointment?.type || AppointmentType.STANDARD,
    startTime: appointment?.startTime || new Date().toISOString(),
    durationMinutes: appointment?.durationMinutes || 60,
    notes: appointment?.notes || '',
  });

  const inputClasses = "w-full bg-zinc-950 border border-zinc-800 p-2 text-zinc-100 focus:border-orange-500 outline-none rounded-sm uppercase font-bold text-xs";
  const labelClasses = "block text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1";

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-zinc-900 border-2 border-orange-600 p-6 rounded-sm w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-rugged uppercase text-zinc-100">{appointment ? 'Appt Details' : 'New Arrival'}</h2>
          {appointment && (
            <Button variant="primary" size="sm" onClick={() => onConvertToWorkOrder(appointment)}>
              Triage to WO
            </Button>
          )}
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClasses}>Customer</label>
              <input required className={inputClasses} value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
            </div>
            <div>
              <label className={labelClasses}>Phone</label>
              <input required className={inputClasses} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>
          <div>
            <label className={labelClasses}>Unit Details</label>
            <input required className={inputClasses} value={formData.vehicleInfo} onChange={e => setFormData({...formData, vehicleInfo: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClasses}>Type</label>
              <select className={inputClasses} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as AppointmentType})}>
                {Object.values(AppointmentType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClasses}>Duration</label>
              <input type="number" className={inputClasses} value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value) || 60})} />
            </div>
          </div>
          <div>
            <label className={labelClasses}>Notes</label>
            <textarea className={inputClasses + " normal-case font-normal h-20"} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" fullWidth size="lg">{appointment ? 'Update' : 'Schedule'}</Button>
            <Button type="button" variant="secondary" fullWidth size="lg" onClick={onClose}>Back</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
