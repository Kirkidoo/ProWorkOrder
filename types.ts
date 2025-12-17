
export enum VehicleType {
  ATV = 'ATV',
  PWC = 'PWC',
  SLED = 'Sled',
  BIKE = 'Bike'
}

export enum WorkOrderStatus {
  NEW = 'New',
  DIAGNOSING = 'Diagnosing',
  QUOTED = 'Quoted',
  PARTS_ORDERED = 'Parts Ordered',
  IN_PROGRESS = 'In Progress',
  READY = 'Ready',
  PICKED_UP = 'Picked Up'
}

export enum OrderStatus {
  TO_ORDER = 'To Order',
  PENDING = 'Pending',
  BACKORDERED = 'Backordered',
  RECEIVED = 'Received'
}

export enum AppointmentType {
  STANDARD = 'Standard Service',
  EMERGENCY = 'Emergency Repair',
  PICKUP = 'Unit Pickup'
}

export interface Part {
  id: string;
  partNumber: string;
  description: string;
  price: number;
  quantity: number;
}

export interface PartsOrder {
  id: string;
  partNumber: string;
  description: string;
  vendor: string;
  workOrderNumber?: string;
  quantity: number;
  dateOrdered?: string;
  status: OrderStatus;
  isHighPriority: boolean;
}

export interface Appointment {
  id: string;
  customerId?: string;
  customerName: string;
  phone: string;
  vehicleInfo: string;
  type: AppointmentType;
  startTime: string; // ISO string
  durationMinutes: number;
  notes: string;
}

export interface InventoryItem {
  id: string;
  partNumber: string;
  description: string;
  category: string;
  brand: string;
  quantityOnHand: number;
  minStock: number;
  unitPrice: number;
  binLocation: string;
}

export interface LaborEntry {
  id: string;
  technician: string;
  description: string;
  hours: number;
  rate: number;
  timestamp: string;
}

export interface ServiceNote {
  id: string;
  timestamp: string;
  author: string;
  content: string;
}

export interface Vehicle {
  year: string;
  make: string;
  model: string;
  vin: string;
  type: VehicleType;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  preferredContact: 'Call' | 'Text';
  fleet: Vehicle[];
  lastVisit: string;
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  phone: string;
  vin: string;
  year: string;
  make: string;
  model: string;
  vehicleType: VehicleType;
  customerConcern: string;
  status: WorkOrderStatus;
  notes: ServiceNote[];
  parts: Part[];
  laborEntries: LaborEntry[];
  images: string[];
  createdAt: string;
}

export type ViewState = 'COMMAND_CENTER' | 'DASHBOARD' | 'CREATE' | 'DETAIL' | 'INVENTORY' | 'CUSTOMERS' | 'ORDERS' | 'CALENDAR' | 'ARCHIVE';
