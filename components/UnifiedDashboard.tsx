import React, { useState, useMemo } from 'react';
import { WorkOrder, WorkOrderStatus, VehicleType, Appointment, AppointmentType } from '../types';
import { STATUS_COLORS, VEHICLE_ICONS, STATUS_SEQUENCE, APPOINTMENT_COLORS } from '../constants';
import { Button } from './Button';
import { useApp } from '../context/AppContext';
import { ServiceSchedule } from './ServiceSchedule';

export const UnifiedDashboard: React.FC = () => {
    const {
        workOrders, appointments, setView, setSelectedOrder, setPrepopulatedOrder
    } = useApp();

    const [typeFilter, setTypeFilter] = useState<VehicleType | 'ALL'>('ALL');
    const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'ALL'>('ALL');
    const [currentDate] = useState(new Date());

    const onSelectOrder = (order: WorkOrder) => { setSelectedOrder(order); setView('DETAIL'); };
    const onCreateNewWO = () => { setPrepopulatedOrder(null); setView('CREATE'); };

    // Filtered orders for the grid
    const filteredOrders = useMemo(() => {
        return workOrders.filter(order => {
            const matchesType = typeFilter === 'ALL' || order.vehicleType === typeFilter;
            const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
            return matchesType && matchesStatus;
        });
    }, [workOrders, typeFilter, statusFilter]);

    // Active Floor Map (Bay Load)
    const activeWorkOrders = workOrders.filter(o =>
        o.status !== WorkOrderStatus.PICKED_UP && o.status !== WorkOrderStatus.READY
    );

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

    const selectClasses = "bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider py-2 px-3 rounded-sm focus:border-orange-500 outline-none transition-colors cursor-pointer";

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 overflow-y-auto h-full scrollbar-thin pr-2">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b-2 border-orange-600 pb-6">
                <div>
                    <h1 className="text-5xl font-rugged text-orange-600 uppercase tracking-tighter leading-none mb-1">Shop Overview</h1>
                    <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em]">Unified Command & Control Hub</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <Button size="lg" onClick={onCreateNewWO} className="transform -skew-x-6">
                        <span className="transform skew-x-6">+ Intake Unit</span>
                    </Button>
                </div>
            </div>

            <div className="space-y-8">
                {/* Unified Repair Floor & Unit List */}
                <div className="space-y-8">
                    {/* Unit Grid (Filterable Table) - Now the primary view */}
                    <section>
                        <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-4 mb-6">
                            <h2 className="text-2xl font-rugged uppercase text-zinc-100 tracking-wide">Active Repair Floor & Unit Registry</h2>
                            <div className="flex items-center gap-4">
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
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-950 text-zinc-500 uppercase text-[10px] tracking-widest font-bold">
                                            <th className="px-6 py-4">Unit / Customer</th>
                                            <th className="px-6 py-4">Serial / VIN</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800">
                                        {filteredOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-zinc-600 italic text-sm">No matching units found.</td>
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
                                                            <div className="p-2 bg-zinc-800 rounded-sm text-zinc-400 group-hover:text-orange-400 transition-colors hidden md:block">
                                                                {VEHICLE_ICONS[order.vehicleType]}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-zinc-100 text-sm">{order.year} {order.make} {order.model}</div>
                                                                <div className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter">{order.customerName}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-xs text-zinc-400 hidden sm:table-cell">
                                                        {order.vin.toUpperCase()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-tighter ${STATUS_COLORS[order.status]}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button variant="ghost" size="sm">Open Unit</Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Service Schedule Integration */}
                    <section className="bg-zinc-900/40 p-6 border border-zinc-800 rounded-sm">
                        <ServiceSchedule />
                    </section>
                </div>
            </div>
        </div>
    );
};
