import React, { useState, useMemo } from 'react';
import { WorkOrder, Appointment, WorkOrderStatus, VehicleType, AppointmentType, Customer } from '../types';
import { STATUS_COLORS, VEHICLE_ICONS, STATUS_SEQUENCE, APPOINTMENT_COLORS, BUSINESS_HOURS } from '../constants';
import { Button } from './Button';
import { useApp } from '../context/AppContext';

export const CommandCenter: React.FC = () => {
  const {
    workOrders, appointments, setView, setSelectedOrder,
    handleAddAppointment, handleUpdateAppointment, handleConvertAppointmentToWorkOrder
  } = useApp();

  const onSelectOrder = (order: WorkOrder) => { setSelectedOrder(order); setView('DETAIL'); };
  const onCreateNewWO = () => setView('CREATE');
  const onOpenCalendar = () => setView('CALENDAR');

  const [currentDate] = useState(new Date());

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header & Main Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-5xl font-rugged text-orange-600 uppercase tracking-tighter">Command Center</h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em]">Shop Operations & Logistics Hub</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button size="lg" onClick={onCreateNewWO} className="transform -skew-x-6">
            <span className="transform skew-x-6">+ Intake Unit</span>
          </Button>
          <Button variant="secondary" size="lg" onClick={onOpenCalendar} className="transform -skew-x-6">
            <span className="transform skew-x-6">Service Schedule</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border-l-4 border-blue-600 p-6 rounded-sm shadow-xl">
          <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Incoming Today</div>
          <div className="text-5xl font-rugged text-zinc-100">{stats.arrivingToday}</div>
          <div className="text-[9px] text-zinc-600 font-bold mt-2 uppercase tracking-tighter">Units Scheduled for Drop-off</div>
        </div>
        <div className="bg-zinc-900 border-l-4 border-orange-600 p-6 rounded-sm shadow-xl">
          <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Critical Lead Time</div>
          <div className="text-5xl font-rugged text-zinc-100">{stats.highPriority}</div>
          <div className="text-[9px] text-zinc-600 font-bold mt-2 uppercase tracking-tighter">New or Diagnosing Status</div>
        </div>
        <div className="bg-zinc-900 border-l-4 border-emerald-600 p-6 rounded-sm shadow-xl">
          <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Ready for Delivery</div>
          <div className="text-5xl font-rugged text-zinc-100">{stats.readyForPickup}</div>
          <div className="text-[9px] text-zinc-600 font-bold mt-2 uppercase tracking-tighter">Verified & Final Polished</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Floor Map */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-4">
            <h2 className="text-2xl font-rugged uppercase text-zinc-100 tracking-wide">Bay Load</h2>
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Active Repair Floor</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeWorkOrders.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-sm">
                <p className="text-zinc-600 uppercase font-black tracking-widest text-sm italic">Bay floor is currently clear</p>
              </div>
            ) : (
              activeWorkOrders.map((wo) => (
                <div
                  key={wo.id}
                  onClick={() => onSelectOrder(wo)}
                  className="bg-zinc-900 border border-zinc-800 p-5 rounded-sm hover:border-orange-600 cursor-pointer transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
                    {VEHICLE_ICONS[wo.vehicleType]}
                  </div>
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-mono text-zinc-600 uppercase">#{wo.orderNumber}</span>
                      <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase ${STATUS_COLORS[wo.status]}`}>
                        {wo.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-rugged text-zinc-100 uppercase mb-1">{wo.year} {wo.make} {wo.model}</h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-tighter mb-4">{wo.customerName}</p>
                    <div className="mt-auto border-t border-zinc-800 pt-3 flex justify-between items-center">
                      <div className="flex gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${wo.partsReceived ? 'bg-emerald-500' : 'bg-zinc-700'}`} title="Parts Status"></div>
                        <div className={`w-1.5 h-1.5 rounded-full ${wo.laborEntries.length > 0 ? 'bg-orange-500' : 'bg-zinc-700'}`} title="Labor Applied"></div>
                      </div>
                      <span className="text-[10px] font-black text-zinc-700 uppercase group-hover:text-orange-500 transition-colors">Access Work Order →</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Weekly Logistics Agenda */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-4">
            <h2 className="text-2xl font-rugged uppercase text-zinc-100 tracking-wide">Shop Agenda</h2>
            <Button variant="ghost" size="sm" onClick={onOpenCalendar}>Full Log</Button>
          </div>

          <div className="space-y-3">
            {weekDays.map((day) => {
              const dayApts = appointments.filter(a => new Date(a.startTime).toDateString() === day.toDateString());
              const isToday = day.toDateString() === new Date().toDateString();

              return (
                <div key={day.toISOString()} className={`bg-zinc-900 border rounded-sm p-4 transition-colors ${isToday ? 'border-orange-600 bg-zinc-900/80 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-zinc-800'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-orange-500' : 'text-zinc-500'}`}>
                        {day.toLocaleDateString('en-US', { weekday: 'long' })}
                      </span>
                      {isToday && <span className="bg-orange-600 text-[8px] font-black uppercase text-white px-1.5 py-0.5 rounded-sm">Today</span>}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-700">{day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>

                  <div className="space-y-2">
                    {dayApts.length === 0 ? (
                      <div className="text-[10px] text-zinc-700 uppercase font-bold italic">No arrivals scheduled</div>
                    ) : (
                      dayApts.map(apt => (
                        <div key={apt.id} className="bg-zinc-950 p-2 border-l-2 border-zinc-800 flex justify-between items-center group hover:border-orange-500 transition-all">
                          <div>
                            <div className="text-[10px] font-bold text-zinc-300 uppercase leading-none mb-1">{apt.customerName}</div>
                            <div className="text-[8px] text-zinc-600 uppercase tracking-tighter">{apt.vehicleInfo}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[8px] font-mono text-zinc-500 uppercase">{new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            <div className={`text-[7px] font-black uppercase ${APPOINTMENT_COLORS[apt.type].split(' ')[0]} text-white px-1 rounded-sm mt-0.5`}>
                              {apt.type.split(' ')[1]}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-orange-600/5 border border-orange-600/20 p-6 rounded-sm text-center">
            <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Fleet Snapshot</div>
            <div className="flex justify-around items-center">
              <SnapshotMetric label="ATV" count={workOrders.filter(w => w.vehicleType === VehicleType.ATV).length} />
              <SnapshotMetric label="Bike" count={workOrders.filter(w => w.vehicleType === VehicleType.BIKE).length} />
              <SnapshotMetric label="Sled" count={workOrders.filter(w => w.vehicleType === VehicleType.SLED).length} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SnapshotMetric: React.FC<{ label: string; count: number }> = ({ label, count }) => (
  <div>
    <div className="text-2xl font-rugged text-zinc-100">{count}</div>
    <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">{label}</div>
  </div>
);
