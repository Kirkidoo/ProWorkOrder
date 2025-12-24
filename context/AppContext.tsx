
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { WorkOrder, ViewState, VehicleType, WorkOrderStatus, InventoryItem, Customer, PartsOrder, OrderStatus, Vehicle, Appointment, Vendor, ModelSchematic } from '../types';
import { customerService } from '../services/customerService';
import { workOrderService } from '../services/workOrderService';

interface AppContextType {
  view: ViewState;
  setView: (view: ViewState) => void;
  workOrders: WorkOrder[];
  inventory: InventoryItem[];
  customers: Customer[];
  vendors: Vendor[];
  schematics: ModelSchematic[];
  partsOrders: PartsOrder[];
  appointments: Appointment[];
  selectedOrder: WorkOrder | null;
  setSelectedOrder: (order: WorkOrder | null) => void;
  prepopulatedOrder: Partial<WorkOrder> | null;
  setPrepopulatedOrder: (order: Partial<WorkOrder> | null) => void;

  handleCreateOrder: (data: Partial<WorkOrder>) => void;
  handleUpdateOrder: (updatedOrder: WorkOrder) => void;
  handleAddPartsOrder: (order: Omit<PartsOrder, 'id'>) => void;
  handleBulkOrdered: (vendorName: string) => void;
  handleUpdatePartsOrder: (updatedPartsOrder: PartsOrder) => void;
  handleAddAppointment: (data: Omit<Appointment, 'id'>) => void;
  handleUpdateAppointment: (apt: Appointment) => void;
  handleConvertAppointmentToWorkOrder: (apt: Appointment) => void;
  handleAddInventory: (data: Omit<InventoryItem, 'id'>) => void;
  handleUpdateInventory: (item: InventoryItem) => void;
  handleAddVendor: (data: Omit<Vendor, 'id'>) => void;
  handleUpdateVendor: (v: Vendor) => void;
  handleAddCustomer: (data: Omit<Customer, 'id'>) => void;
  handleStartWorkOrderFromCustomer: (customer: Customer) => void;
  handleAddSchematic: (data: Omit<ModelSchematic, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const MOCK_VENDORS: Vendor[] = [
  { id: 'v1', name: 'WPS', accountNumber: '12345', contactPerson: 'Gary @ WPS', freeShippingThreshold: 500 },
  { id: 'v2', name: 'Parts Unlimited', accountNumber: 'PU-998', contactPerson: 'Sarah S.', freeShippingThreshold: 750 },
  { id: 'v3', name: 'OEM Honda', accountNumber: 'HOND-001', contactPerson: 'Direct Rep', freeShippingThreshold: 250 },
];

const MOCK_SCHEMATICS: ModelSchematic[] = [
  { id: 's1', year: '2023', make: 'Honda', model: 'TRX450R', vehicleType: VehicleType.ATV, diagramUrl: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?auto=format&fit=crop&q=80&w=800' },
  { id: 's2', year: '2024', make: 'Yamaha', model: 'YZ250F', vehicleType: VehicleType.BIKE, diagramUrl: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800' },
];

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Brad Peterson',
    phone: '555-123-4567',
    email: 'brad.p@example.com',
    address: '123 Muddy Lane, Offroad City, CO 80111',
    preferredContact: 'Text',
    lastVisit: '2024-05-15',
    fleet: [
      { year: '2023', make: 'Honda', model: 'TRX450R', vin: '1HFSC57008A000001', type: VehicleType.ATV },
      { year: '2021', make: 'Polaris', model: 'RZR Turbo S', vin: 'PLRS9938221', type: VehicleType.ATV }
    ]
  },
  {
    id: 'c2',
    name: 'Sarah Miller',
    phone: '555-987-6543',
    email: 'smiller@fastbikes.com',
    address: '45 Apex Circle, Sportsville, CA 90210',
    preferredContact: 'Call',
    lastVisit: '2024-06-01',
    fleet: [
      { year: '2024', make: 'Yamaha', model: 'YZ250F', vin: 'YZ250-8839210', type: VehicleType.BIKE }
    ]
  }
];

const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'i1', partNumber: '15410-MFJ-D01', description: 'Oil Filter (Honda)', category: 'Fluids', brand: 'OEM', preferredVendor: 'OEM Honda', quantityOnHand: 15, minStock: 5, unitPrice: 14.95, binLocation: 'Shelf A-4' },
  { id: 'i2', partNumber: 'CPR8EA-9', description: 'NGK Spark Plug', category: 'Electrical', brand: 'OEM', preferredVendor: 'WPS', quantityOnHand: 2, minStock: 10, unitPrice: 8.50, binLocation: 'Shelf B-2' },
  { id: 'i3', partNumber: 'TY-120-17', description: 'Front Tire 120/70ZR17', category: 'Tires', brand: 'Aftermarket', preferredVendor: 'Parts Unlimited', quantityOnHand: 4, minStock: 2, unitPrice: 189.99, binLocation: 'Rack 1' },
  { id: 'i4', partNumber: 'YUAM3220LB', description: 'YTX20HL Battery', category: 'Electrical', brand: 'Aftermarket', preferredVendor: 'WPS', quantityOnHand: 0, minStock: 3, unitPrice: 145.00, binLocation: 'Shelf C-1' },
];

const MOCK_ORDERS: WorkOrder[] = [
  {
    id: '1',
    orderNumber: 'WO-1001',
    customerId: 'c1',
    customerName: 'Brad Peterson',
    phone: '555-123-4567',
    vin: '1HFSC57008A000001',
    year: '2023',
    make: 'Honda',
    model: 'TRX450R',
    vehicleType: VehicleType.ATV,
    customerConcern: 'Engine stutters at high RPM. Possible fuel filter issue.',
    status: WorkOrderStatus.DIAGNOSING,
    notes: [
      { id: 'n1', timestamp: '2024-05-15 10:30', author: 'Shop Mechanic', content: 'Verified hesitation. Spark plug looks fouled.' }
    ],
    parts: [
      { id: 'p1', partNumber: 'CPR8EA-9', description: 'NGK Spark Plug', price: 8.50, quantity: 1 }
    ],
    laborEntries: [
      { id: 'l1', technician: 'Brad', description: 'Diagnostic Test', hours: 0.5, rate: 125, timestamp: '2024-05-15' }
    ],
    images: ['https://picsum.photos/seed/atv/600/400'],
    createdAt: new Date().toISOString(),
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [view, setView] = useState<ViewState>('OVERVIEW');

  // Persistence helpers
  const getInitialState = <T,>(key: string, defaultValue: T): T => {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(`Error loading ${key} from storage`, e);
      return defaultValue;
    }
  };

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => getInitialState('workOrders', MOCK_ORDERS));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => getInitialState('inventory', MOCK_INVENTORY));
  const [customers, setCustomers] = useState<Customer[]>(() => getInitialState('customers', MOCK_CUSTOMERS));
  const [vendors, setVendors] = useState<Vendor[]>(() => getInitialState('vendors', MOCK_VENDORS));
  const [schematics, setSchematics] = useState<ModelSchematic[]>(() => getInitialState('schematics', MOCK_SCHEMATICS));
  const [partsOrders, setPartsOrders] = useState<PartsOrder[]>(() => getInitialState('partsOrders', []));
  const [appointments, setAppointments] = useState<Appointment[]>(() => getInitialState('appointments', []));
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [prepopulatedOrder, setPrepopulatedOrder] = useState<Partial<WorkOrder> | null>(null);

  // Persistence effects
  useEffect(() => { localStorage.setItem('workOrders', JSON.stringify(workOrders)); }, [workOrders]);
  useEffect(() => { localStorage.setItem('inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('vendors', JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem('schematics', JSON.stringify(schematics)); }, [schematics]);
  useEffect(() => { localStorage.setItem('partsOrders', JSON.stringify(partsOrders)); }, [partsOrders]);
  useEffect(() => { localStorage.setItem('appointments', JSON.stringify(appointments)); }, [appointments]);

  const handleCreateOrder = (data: Partial<WorkOrder>) => {
    const vehicle: Vehicle = {
      year: data.year || '',
      make: data.make || '',
      model: data.model || '',
      vin: data.vin || '',
      type: data.vehicleType || VehicleType.BIKE
    };

    const { targetCustomerId, updatedCustomers } = customerService.findOrCreateCustomer(
      customers,
      { customerId: data.customerId, customerName: data.customerName, phone: data.phone },
      vehicle
    );

    setCustomers(updatedCustomers);

    const orderNumber = workOrderService.generateWorkOrderNumber(workOrders.length);
    const newOrder = workOrderService.createWorkOrder(data, orderNumber, targetCustomerId);

    setWorkOrders([newOrder, ...workOrders]);
    setPrepopulatedOrder(null);
    setView('COMMAND_CENTER');
  };

  const handleUpdateOrder = (updatedOrder: WorkOrder) => {
    setWorkOrders(workOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setSelectedOrder(updatedOrder);
  };

  const handleAddPartsOrder = (order: Omit<PartsOrder, 'id'>) => {
    const newOrder: PartsOrder = { ...order, id: Math.random().toString(36).substr(2, 9) };
    setPartsOrders([newOrder, ...partsOrders]);
  };

  const handleBulkOrdered = (vendorName: string) => {
    const now = new Date().toLocaleDateString();
    setPartsOrders(prev => prev.map(o => {
      if (o.vendor === vendorName && o.status === OrderStatus.TO_ORDER) {
        return { ...o, status: OrderStatus.PENDING, dateOrdered: now };
      }
      return o;
    }));
  };

  const handleUpdatePartsOrder = (updatedPartsOrder: PartsOrder) => {
    setPartsOrders(partsOrders.map(o => o.id === updatedPartsOrder.id ? updatedPartsOrder : o));

    if (updatedPartsOrder.status === OrderStatus.RECEIVED && updatedPartsOrder.workOrderNumber) {
      setWorkOrders(prev => prev.map(wo => {
        if (wo.orderNumber === updatedPartsOrder.workOrderNumber) {
          return { ...wo, partsReceived: true };
        }
        return wo;
      }));
    }
  };

  const handleAddAppointment = (data: Omit<Appointment, 'id'>) => {
    const newApt: Appointment = { ...data, id: Math.random().toString(36).substr(2, 9) };
    setAppointments([...appointments, newApt]);
  };

  const handleUpdateAppointment = (apt: Appointment) => {
    setAppointments(appointments.map(a => a.id === apt.id ? apt : a));
  };

  const handleConvertAppointmentToWorkOrder = (apt: Appointment) => {
    setPrepopulatedOrder({
      customerName: apt.customerName,
      phone: apt.phone,
      customerConcern: apt.notes || `Scheduled as ${apt.type}`,
    });
    setAppointments(appointments.filter(a => a.id !== apt.id));
    setView('CREATE');
  };

  const handleAddInventory = (data: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = { ...data, id: Math.random().toString(36).substr(2, 9) };
    setInventory([...inventory, newItem]);
  };

  const handleUpdateInventory = (item: InventoryItem) => {
    setInventory(inventory.map(i => i.id === item.id ? item : i));
  };

  const handleAddVendor = (data: Omit<Vendor, 'id'>) => {
    const newVendor: Vendor = { ...data, id: Math.random().toString(36).substr(2, 9) };
    setVendors([...vendors, newVendor]);
  };

  const handleUpdateVendor = (v: Vendor) => {
    setVendors(vendors.map(old => old.id === v.id ? v : old));
  };

  const handleAddCustomer = (data: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      lastVisit: 'New',
      fleet: data.fleet || []
    };
    setCustomers([...customers, newCustomer]);
  };

  const handleStartWorkOrderFromCustomer = (customer: Customer) => {
    setPrepopulatedOrder({
      customerName: customer.name,
      phone: customer.phone,
      customerId: customer.id
    });
    setView('CREATE');
  };

  const handleAddSchematic = (data: Omit<ModelSchematic, 'id'>) => {
    const newSchem: ModelSchematic = { ...data, id: Math.random().toString(36).substr(2, 9) };
    setSchematics([...schematics, newSchem]);
  };

  return (
    <AppContext.Provider value={{
      view, setView, workOrders, inventory, customers, vendors, schematics, partsOrders, appointments,
      selectedOrder, setSelectedOrder, prepopulatedOrder, setPrepopulatedOrder,
      handleCreateOrder, handleUpdateOrder, handleAddPartsOrder, handleBulkOrdered, handleUpdatePartsOrder,
      handleAddAppointment, handleUpdateAppointment, handleConvertAppointmentToWorkOrder,
      handleAddInventory, handleUpdateInventory, handleAddVendor, handleUpdateVendor,
      handleAddCustomer, handleStartWorkOrderFromCustomer, handleAddSchematic
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
