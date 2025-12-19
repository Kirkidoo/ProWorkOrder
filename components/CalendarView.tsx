import React, { useState, useMemo, useEffect } from 'react';
import {
  format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
  addWeeks, subWeeks, setHours, setMinutes, parseISO, isToday
} from 'date-fns';
import { Appointment, AppointmentType, Customer, WorkOrder, WorkOrderStatus, VehicleType } from '../types';
import { Button } from './Button';
import { APPOINTMENT_COLORS, BUSINESS_HOURS, STATUS_COLORS, VEHICLE_ICONS, STATUS_SEQUENCE } from '../constants';
import { useApp } from '../context/AppContext';

type CalendarViewMode = 'MONTH' | 'WEEK';

export const CalendarView: React.FC = () => {
  const {
    appointments, workOrders, customers, setSelectedOrder,
    handleAddAppointment: onAddAppointment, handleUpdateAppointment: onUpdateAppointment,
    handleConvertAppointmentToWorkOrder: onConvertToWorkOrder, setView
  } = useApp();

  const onSelectOrder = (order: WorkOrder) => { setSelectedOrder(order); setView('DETAIL'); };
  const onCreateNewWO = () => setView('CREATE');

  // Calendar State
  const [viewMode, setViewMode] = useState<CalendarViewMode>('WEEK');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; hour?: number } | null>(null);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [draggedAptId, setDraggedAptId] = useState<string | null>(null);

  // Grid/Dashboard State
  const [typeFilter, setTypeFilter] = useState<VehicleType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'ALL'>('ALL');

  // Time slots
  const hours = Array.from({ length: BUSINESS_HOURS.end - BUSINESS_HOURS.start + 1 }, (_, i) => i + BUSINESS_HOURS.start);

  // --- CALENDAR LOGIC ---
  const calendarDays = useMemo(() => {
    if (viewMode === 'MONTH') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const startDate = startOfWeek(monthStart);
      const endDate = endOfWeek(monthEnd);
      return eachDayOfInterval({ start: startDate, end: endDate });
    } else {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      return Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));
    }
  }, [currentDate, viewMode]);

  const handleDragStart = (e: React.DragEvent, aptId: string) => {
    setDraggedAptId(aptId);
    e.dataTransfer.setData('text/plain', aptId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date, targetHour?: number) => {
    e.preventDefault();
    const aptId = e.dataTransfer.getData('text/plain');
    const apt = appointments.find(a => a.id === aptId);

    if (apt) {
      const newStart = new Date(targetDate);
      if (targetHour !== undefined) {
        newStart.setHours(targetHour, 0, 0, 0);
      } else {
        const original = new Date(apt.startTime);
        newStart.setHours(original.getHours(), original.getMinutes(), 0, 0);
      }
      onUpdateAppointment({ ...apt, startTime: newStart.toISOString() });
    }
    setDraggedAptId(null);
  };

  // --- GRID/DASHBOARD LOGIC ---
  const stats = {
    total: workOrders.length,
    active: workOrders.filter(o => o.status !== WorkOrderStatus.PICKED_UP).length,
    ready: workOrders.filter(o => o.status === WorkOrderStatus.READY).length,
  };

  const filteredOrders = useMemo(() => {
    return workOrders.filter(order => {
      const matchesType = typeFilter === 'ALL' || order.vehicleType === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      return matchesType && matchesStatus;
    });
  }, [workOrders, typeFilter, statusFilter]);

  const selectClasses = "bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider py-2 px-3 rounded-sm focus:border-orange-500 outline-none transition-colors cursor-pointer";


  // --- RENDER HELPERS ---
  const renderMonthCell = (day: Date) => {
    const dayApts = appointments.filter(a => isSameDay(new Date(a.startTime), day));
    const dayWOs = workOrders.filter(w => isSameDay(new Date(w.createdAt), day));

    return (
      <div
        key={day.toISOString()}
        className={`min-h-[120px] p-2 border-r border-b border-zinc-800 transition-colors relative
          ${!isSameMonth(day, currentDate) ? 'bg-zinc-950/50 text-zinc-600' : 'bg-zinc-900'}
          ${isToday(day) ? 'bg-zinc-900/80 shadow-[inset_0_0_0_2px_rgba(249,115,22,0.5)]' : 'hover:bg-zinc-800/30'}
        `}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, day)}
        onClick={() => { setSelectedSlot({ date: day }); setIsModalOpen(true); }}
      >
        <div className="flex justify-between items-start mb-2">
          <span className={`text-sm font-bold ${isSameMonth(day, currentDate) ? 'text-zinc-300' : 'text-zinc-700'}`}>
            {format(day, 'd')}
          </span>
          {dayApts.length > 0 && <span className="text-[10px] bg-orange-600 text-white px-1.5 rounded-full">{dayApts.length}</span>}
        </div>

        <div className="space-y-1">
          {dayApts.slice(0, 3).map(apt => (
            <div
              key={apt.id}
              draggable
              onDragStart={(e) => handleDragStart(e, apt.id)}
              onClick={(e) => { e.stopPropagation(); setSelectedApt(apt); setIsModalOpen(true); }}
              className={`text-[9px] px-1 py-0.5 rounded-sm truncate cursor-grab active:cursor-grabbing border-l-2 ${APPOINTMENT_COLORS[apt.type]} bg-zinc-800 mb-0.5`}
            >
              {format(parseISO(apt.startTime), 'HH:mm')} {apt.customerName}
            </div>
          ))}
          {dayWOs.length > 0 && (
            <div className="text-[9px] px-1 py-0.5 rounded-sm text-zinc-500 italic">
              + {dayWOs.length} Work Orders
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWeekCell = (day: Date, hour: number) => {
    const slotDate = setMinutes(setHours(day, hour), 0);
    const cellApts = appointments.filter(a => {
      const aDate = new Date(a.startTime);
      return isSameDay(aDate, day) && aDate.getHours() === hour;
    });

    return (
      <div
        key={`${day.toISOString()}-${hour}`}
        className="border-r border-b border-zinc-800/50 relative h-20 group hover:bg-zinc-800/20 transition-colors"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, day, hour)}
        onClick={() => { setSelectedSlot({ date: day, hour }); setIsModalOpen(true); }}
      >
        {cellApts.map(apt => (
          <div
            key={apt.id}
            draggable
            onDragStart={(e) => handleDragStart(e, apt.id)}
            onClick={(e) => { e.stopPropagation(); setSelectedApt(apt); setIsModalOpen(true); }}
            className={`absolute inset-x-1 top-1 p-1.5 rounded-sm cursor-grab active:cursor-grabbing shadow-sm z-10 border-l-4 ${APPOINTMENT_COLORS[apt.type]}`}
          >
            <div className="flex justify-between items-start leading-none">
              <span className="font-bold text-[10px] uppercase truncate">{apt.customerName}</span>
              <span className="text-[8px] font-mono opacity-75">{apt.vehicleInfo}</span>
            </div>
          </div>
        ))}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
          <span className="text-[10px] font-black uppercase text-zinc-700">+ Add</span>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-500 h-full overflow-y-auto space-y-12 pr-2 pb-20 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">

      {/* === CALENDAR SECTION === */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-4xl font-rugged text-orange-500 uppercase flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Service Schedule
            </h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest pl-11">Shop Capacity & Logistics</p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded-md">
            <button onClick={() => setViewMode('WEEK')} className={`px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors ${viewMode === 'WEEK' ? 'bg-orange-600 text-white' : 'text-zinc-500 hover:text-white'}`}>Week</button>
            <button onClick={() => setViewMode('MONTH')} className={`px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors ${viewMode === 'MONTH' ? 'bg-orange-600 text-white' : 'text-zinc-500 hover:text-white'}`}>Month</button>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-3 rounded-sm shrink-0 shadow-lg">
          <button
            className="p-2 hover:bg-zinc-800 rounded-sm text-zinc-400 hover:text-white transition-colors"
            onClick={() => setCurrentDate(prev => viewMode === 'MONTH' ? subMonths(prev, 1) : subWeeks(prev, 1))}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-rugged uppercase text-zinc-100">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            {viewMode === 'WEEK' && (
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Week of {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM do')}
              </div>
            )}
          </div>
          <button className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-sm text-[10px] font-bold uppercase tracking-widest text-zinc-300 mr-2" onClick={() => setCurrentDate(new Date())}>Today</button>
          <button
            className="p-2 hover:bg-zinc-800 rounded-sm text-zinc-400 hover:text-white transition-colors"
            onClick={() => setCurrentDate(prev => viewMode === 'MONTH' ? addMonths(prev, 1) : addWeeks(prev, 1))}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Calendar Grid Container */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden shadow-2xl flex flex-col h-[600px]">
          {/* Week Days Header */}
          <div className={`grid ${viewMode === 'MONTH' ? 'grid-cols-7' : 'grid-cols-[60px_repeat(5,1fr)]'} border-b border-zinc-800 bg-zinc-950 shrink-0`}>
            {viewMode === 'WEEK' && <div className="border-r border-zinc-800 p-2"></div>}
            {calendarDays.slice(0, viewMode === 'MONTH' ? 7 : 5).map(day => (
              <div key={day.toString()} className={`py-3 text-center border-r border-zinc-800/50 ${isToday(day) ? 'text-orange-500' : 'text-zinc-500'}`}>
                <div className="text-[10px] font-black uppercase tracking-widest">{format(day, 'EEE')}</div>
                {viewMode === 'WEEK' && <div className="text-xl font-rugged mt-1">{format(day, 'd')}</div>}
              </div>
            ))}
          </div>

          {/* Scrollable Grid Area */}
          <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            {viewMode === 'MONTH' ? (
              <div className="grid grid-cols-7 auto-rows-fr h-full min-h-[600px]">
                {calendarDays.map(day => renderMonthCell(day))}
              </div>
            ) : (
              <div className="grid grid-cols-[60px_repeat(5,1fr)]">
                {hours.map(hour => (
                  <React.Fragment key={hour}>
                    <div className="h-20 border-b border-r border-zinc-800 bg-zinc-950 flex items-start justify-center pt-2">
                      <span className="text-[10px] font-mono text-zinc-600">{hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}</span>
                    </div>
                    {calendarDays.map(day => renderWeekCell(day, hour))}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <hr className="border-t-2 border-dashed border-zinc-800" />

      {/* === GRID / DASHBOARD SECTION === */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-rugged text-orange-500 uppercase">Shop Floor Control</h1>
            <p className="text-zinc-400">Manage active units and track maintenance flow.</p>
          </div>
          <Button size="xl" onClick={onCreateNewWO}>
            <span className="mr-2">+</span> New Work Order
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard label="In Shop" value={stats.active} color="border-blue-500" />
          <StatCard label="Ready for Pickup" value={stats.ready} color="border-emerald-500" />
          <StatCard label="Total Jobs (Life)" value={stats.total} color="border-zinc-700" />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 bg-zinc-900/50 p-4 border border-zinc-800 rounded-sm">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className={selectClasses}
            >
              <option value="ALL">All Types</option>
              {Object.values(VehicleType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={selectClasses}
            >
              <option value="ALL">All Statuses</option>
              {STATUS_SEQUENCE.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {(typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => { setTypeFilter('ALL'); setStatusFilter('ALL'); }}
              className="text-[10px] font-bold uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Showing {filteredOrders.length} of {workOrders.length} units
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
            <h2 className="font-rugged text-xl tracking-wide uppercase">Active Work Orders</h2>
            <div className="flex gap-2">
              <span className="flex items-center text-xs text-zinc-500"><div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div> New</span>
              <span className="flex items-center text-xs text-zinc-500"><div className="w-2 h-2 rounded-full bg-orange-500 mr-1"></div> Repair</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 text-zinc-500 uppercase text-xs tracking-widest font-bold">
                  <th className="px-6 py-4">Unit</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Serial / VIN</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-600 italic">No matching work orders found.</td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                      onClick={() => onSelectOrder(order)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-800 rounded-sm text-zinc-400 group-hover:text-orange-400 transition-colors">
                            {VEHICLE_ICONS[order.vehicleType]}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-100">{order.year} {order.make}</div>
                            <div className="text-sm text-zinc-500">{order.model}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-zinc-200">{order.customerName}</div>
                        <div className="text-sm text-zinc-500">{order.phone}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-zinc-400">
                        {order.vin.toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-tighter ${STATUS_COLORS[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm">Open</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className={`bg-zinc-900 border-l-4 ${color} p-6 shadow-lg`}>
    <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</div>
    <div className="text-4xl font-rugged text-zinc-100">{value}</div>
  </div>
);

const AppointmentModal = ({
  appointment,
  slot,
  customers,
  onSave,
  onConvertToWorkOrder,
  onClose
}: {
  appointment: Appointment | null;
  slot: { date: Date; hour?: number } | null;
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
    startTime: appointment?.startTime || (slot?.date ? (() => {
      const d = new Date(slot.date);
      if (slot.hour !== undefined) d.setHours(slot.hour, 0, 0, 0);
      else d.setHours(9, 0, 0, 0); // Default to 9AM if click on month day
      return d.toISOString();
    })() : new Date().toISOString()),
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
                        setFormData({ ...formData, customerName: c.name, phone: c.phone });
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
              <input required className={inputClasses} value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} />
            </div>
            <div>
              <label className={labelClasses}>Phone</label>
              <input required className={inputClasses} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Vehicle / Unit Info</label>
            <input required className={inputClasses} placeholder="e.g. 2022 Polaris RZR" value={formData.vehicleInfo} onChange={e => setFormData({ ...formData, vehicleInfo: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Service Type</label>
              <select className={inputClasses} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as AppointmentType })}>
                {Object.values(AppointmentType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClasses}>Duration (Mins)</label>
              <input type="number" step="30" className={inputClasses} value={formData.durationMinutes} onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })} />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Service Notes</label>
            <textarea className={inputClasses + " normal-case font-normal h-24"} placeholder="Any special requests or known issues..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
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
