import React, { useState, useMemo } from 'react';
// Fix: BUSINESS_HOURS is exported from ../constants, not ../types
import { Appointment, AppointmentType, Customer } from '../types';
import { Button } from './Button';
import { APPOINTMENT_COLORS, BUSINESS_HOURS } from '../constants';

interface CalendarViewProps {
  appointments: Appointment[];
  customers: Customer[];
  onAddAppointment: (apt: Omit<Appointment, 'id'>) => void;
  onUpdateAppointment: (apt: Appointment) => void;
  onConvertToWorkOrder: (apt: Appointment) => void;
  onBack: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  appointments, 
  customers, 
  onAddAppointment, 
  onUpdateAppointment,
  onConvertToWorkOrder,
  onBack 
}) => {
  const [viewMode, setViewMode] = useState<'WEEK' | 'MONTH'>('WEEK');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; hour: number } | null>(null);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);

  const hours = Array.from({ length: BUSINESS_HOURS.end - BUSINESS_HOURS.start + 1 }, (_, i) => i + BUSINESS_HOURS.start);

  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Start Monday
    start.setDate(diff);
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const handleSlotClick = (date: Date, hour: number) => {
    const slotDate = new Date(date);
    slotDate.setHours(hour, 0, 0, 0);
    setSelectedSlot({ date: slotDate, hour });
    setSelectedApt(null);
    setIsModalOpen(true);
  };

  const handleAptClick = (e: React.MouseEvent, apt: Appointment) => {
    e.stopPropagation();
    setSelectedApt(apt);
    setSelectedSlot(null);
    setIsModalOpen(true);
  };

  const getAptsForDayAndHour = (date: Date, hour: number) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate.toDateString() === date.toDateString() && aptDate.getHours() === hour;
    });
  };

  const formatHour = (h: number) => `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-rugged text-orange-500 uppercase">Service Schedule</h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Shop Capacity Planning</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setViewMode(viewMode === 'WEEK' ? 'MONTH' : 'WEEK')}>
            {viewMode === 'WEEK' ? 'Monthly View' : 'Weekly View'}
          </Button>
          <Button variant="ghost" onClick={onBack}>Dashboard</Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-sm">
        <button className="p-2 hover:bg-zinc-800 rounded-sm text-zinc-400" onClick={() => {
          const d = new Date(currentDate);
          d.setDate(d.getDate() - 7);
          setCurrentDate(d);
        }}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-rugged uppercase text-zinc-100 flex-1 text-center">
          {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[4].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </h2>
        <button className="p-2 hover:bg-zinc-800 rounded-sm text-zinc-400" onClick={() => {
          const d = new Date(currentDate);
          d.setDate(d.getDate() + 7);
          setCurrentDate(d);
        }}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Calendar Grid */}
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden shadow-2xl">
          <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-zinc-800 bg-zinc-950">
            <div className="p-4"></div>
            {weekDays.map(day => (
              <div key={day.toISOString()} className={`p-4 text-center border-l border-zinc-800 ${day.toDateString() === new Date().toDateString() ? 'bg-orange-600/10' : ''}`}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className={`text-2xl font-rugged ${day.toDateString() === new Date().toDateString() ? 'text-orange-500' : 'text-zinc-100'}`}>{day.getDate()}</div>
              </div>
            ))}
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-[80px_repeat(5,1fr)] min-h-[80px] border-b border-zinc-800/50">
                <div className="p-2 text-[10px] font-mono text-zinc-600 border-r border-zinc-800 bg-zinc-950 flex items-center justify-center">
                  {formatHour(hour)}
                </div>
                {weekDays.map(day => {
                  const dayApts = getAptsForDayAndHour(day, hour);
                  return (
                    <div 
                      key={day.toISOString()} 
                      className="p-1 border-l border-zinc-800/50 relative hover:bg-zinc-800/20 transition-colors cursor-crosshair group"
                      onClick={() => handleSlotClick(day, hour)}
                    >
                      {dayApts.map(apt => (
                        <div 
                          key={apt.id} 
                          onClick={(e) => handleAptClick(e, apt)}
                          className={`p-2 rounded-sm border-l-4 shadow-lg text-[10px] cursor-pointer mb-1 ${APPOINTMENT_COLORS[apt.type]} hover:scale-[1.02] transition-transform`}
                        >
                          <div className="font-bold uppercase leading-tight truncate">{apt.customerName}</div>
                          <div className="font-medium opacity-80 truncate">{apt.vehicleInfo}</div>
                          <div className="font-black mt-1 uppercase tracking-tighter">{apt.type}</div>
                        </div>
                      ))}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                        <span className="text-[8px] font-black uppercase text-zinc-700">+ Add</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Agenda Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm shadow-xl">
            <h3 className="font-rugged text-2xl uppercase text-zinc-100 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Today's Arrivals
            </h3>
            <div className="space-y-4">
              {appointments.filter(a => new Date(a.startTime).toDateString() === new Date().toDateString()).length === 0 ? (
                <p className="text-zinc-600 italic text-sm">No arrivals scheduled for today.</p>
              ) : (
                appointments
                  .filter(a => new Date(a.startTime).toDateString() === new Date().toDateString())
                  .sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .map(apt => (
                    <div key={apt.id} className="p-3 bg-zinc-950 border-l-2 border-orange-600 rounded-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-mono text-zinc-500">{new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm ${APPOINTMENT_COLORS[apt.type]}`}>{apt.type.split(' ')[1]}</span>
                      </div>
                      <div className="font-bold text-zinc-100 uppercase text-sm">{apt.customerName}</div>
                      <div className="text-xs text-zinc-500">{apt.vehicleInfo}</div>
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-sm border-dashed text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Drag To Reschedule</div>
            <p className="text-xs text-zinc-500 italic">Drag appointments across slots to update shop flow automatically.</p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AppointmentModal 
          appointment={selectedApt} 
          slot={selectedSlot}
          customers={customers}
          onSave={(data) => {
            if (selectedApt) onUpdateAppointment({ ...selectedApt, ...data });
            else onAddAppointment(data);
            setIsModalOpen(false);
          }}
          onConvertToWorkOrder={(apt) => {
            onConvertToWorkOrder(apt);
            setIsModalOpen(false);
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

const AppointmentModal = ({ 
  appointment, 
  slot, 
  customers, 
  onSave, 
  onConvertToWorkOrder,
  onClose 
}: { 
  appointment: Appointment | null; 
  slot: { date: Date; hour: number } | null;
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
    startTime: appointment?.startTime || slot?.date.toISOString() || new Date().toISOString(),
    durationMinutes: appointment?.durationMinutes || 60,
    notes: appointment?.notes || '',
  });

  const [customerSearch, setCustomerSearch] = useState('');

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return [];
    return customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).slice(0, 5);
  }, [customers, customerSearch]);

  const inputClasses = "w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-100 focus:border-orange-500 outline-none rounded-sm uppercase font-bold text-sm";
  const labelClasses = "block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1";

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-zinc-900 border-2 border-orange-600 p-8 rounded-sm w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start mb-8">
          <h2 className="text-3xl font-rugged uppercase text-zinc-100">
            {appointment ? 'View Appointment' : 'Schedule Unit'}
          </h2>
          {appointment && (
            <Button variant="primary" size="sm" onClick={() => onConvertToWorkOrder(appointment)}>
              Convert to Work Order
            </Button>
          )}
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
          {!appointment && (
            <div className="relative">
              <label className={labelClasses}>Find Customer</label>
              <input 
                className={inputClasses}
                placeholder="Type to search..."
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
              />
              {customerSearch && (
                <div className="absolute top-full left-0 right-0 z-50 bg-zinc-900 border border-orange-500 mt-1 shadow-2xl">
                  {filteredCustomers.map(c => (
                    <div 
                      key={c.id} 
                      className="p-3 border-b border-zinc-800 hover:bg-zinc-800 cursor-pointer"
                      onClick={() => {
                        setFormData({...formData, customerName: c.name, phone: c.phone});
                        setCustomerSearch('');
                      }}
                    >
                      <div className="font-bold uppercase text-zinc-100">{c.name}</div>
                      <div className="text-[10px] font-mono text-zinc-500">{c.phone}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Customer Name</label>
              <input required className={inputClasses} value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
            </div>
            <div>
              <label className={labelClasses}>Phone</label>
              <input required className={inputClasses} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Vehicle / Unit Info</label>
            <input required className={inputClasses} placeholder="e.g. 2022 Polaris RZR" value={formData.vehicleInfo} onChange={e => setFormData({...formData, vehicleInfo: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Service Type</label>
              <select className={inputClasses} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as AppointmentType})}>
                {Object.values(AppointmentType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClasses}>Duration (Mins)</label>
              <input type="number" step="30" className={inputClasses} value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value) || 60})} />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Service Notes</label>
            <textarea className={inputClasses + " normal-case font-normal h-24"} placeholder="Any special requests or known issues..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" fullWidth size="xl">{appointment ? 'Update Schedule' : 'Book Appointment'}</Button>
            <Button type="button" variant="secondary" fullWidth size="xl" onClick={onClose}>Discard</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
