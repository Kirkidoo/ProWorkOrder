
import React from 'react';
import { WorkOrderStatus, VehicleType, AppointmentType } from './types';

export const DEFAULT_SHOP_RATE = 125;

export const STATUS_COLORS: Record<WorkOrderStatus, string> = {
  [WorkOrderStatus.NEW]: 'bg-blue-500 text-white',
  [WorkOrderStatus.DIAGNOSING]: 'bg-purple-500 text-white',
  [WorkOrderStatus.QUOTED]: 'bg-yellow-500 text-black',
  [WorkOrderStatus.PARTS_ORDERED]: 'bg-orange-600 text-white',
  [WorkOrderStatus.IN_PROGRESS]: 'bg-orange-500 text-white',
  [WorkOrderStatus.READY]: 'bg-emerald-500 text-white',
  [WorkOrderStatus.PICKED_UP]: 'bg-zinc-700 text-zinc-300',
};

export const APPOINTMENT_COLORS: Record<AppointmentType, string> = {
  [AppointmentType.STANDARD]: 'bg-blue-600 border-blue-400 text-white',
  [AppointmentType.EMERGENCY]: 'bg-red-600 border-red-400 text-white',
  [AppointmentType.PICKUP]: 'bg-emerald-600 border-emerald-400 text-white',
};

export const STATUS_SEQUENCE: WorkOrderStatus[] = [
  WorkOrderStatus.NEW,
  WorkOrderStatus.DIAGNOSING,
  WorkOrderStatus.QUOTED,
  WorkOrderStatus.PARTS_ORDERED,
  WorkOrderStatus.IN_PROGRESS,
  WorkOrderStatus.READY,
  WorkOrderStatus.PICKED_UP,
];

export const VEHICLE_ICONS: Record<VehicleType, React.ReactNode> = {
  [VehicleType.ATV]: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  [VehicleType.PWC]: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  [VehicleType.SLED]: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  [VehicleType.BIKE]: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

export const BUSINESS_HOURS = {
  start: 8,
  end: 17,
};
