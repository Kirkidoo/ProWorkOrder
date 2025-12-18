
import React, { useState, useEffect } from 'react';
import { WorkOrder, ViewState, VehicleType, WorkOrderStatus, InventoryItem, Customer, PartsOrder, OrderStatus, Vehicle, Appointment, AppointmentType, Vendor, ModelSchematic } from './types';
import { CommandCenter } from './components/CommandCenter';
import { Dashboard } from './components/Dashboard';
import { WorkOrderForm } from './components/WorkOrderForm';
import { WorkOrderDetail } from './components/WorkOrderDetail';
import { InventoryPage } from './components/InventoryPage';
import { CustomerPage } from './components/CustomerPage';
import { PartsOrderPage } from './components/PartsOrderPage';
import { VendorPage } from './components/VendorPage';
import { CalendarView } from './components/CalendarView';
import { ArchivePage } from './components/ArchivePage';
import { SchematicsLibrary } from './components/SchematicsLibrary';

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

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('COMMAND_CENTER');
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(MOCK_ORDERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS);
  const [schematics, setSchematics] = useState<ModelSchematic[]>(MOCK_SCHEMATICS);
  const [partsOrders, setPartsOrders] = useState<PartsOrder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [prepopulatedOrder, setPrepopulatedOrder] = useState<Partial<WorkOrder> | null>(null);

  const handleCreateOrder = (data: Partial<WorkOrder>) => {
    let targetCustomerId = data.customerId;
    const vehicle: Vehicle = {
      year: data.year || '',
      make: data.make || '',
      model: data.model || '',
      vin: data.vin || '',
      type: data.vehicleType || VehicleType.BIKE
    };

    const today = new Date().toLocaleDateString();

    if (!targetCustomerId) {
      // Create new customer if not selected
      const newCustomerId = 'c-' + Math.random().toString(36).substr(2, 9);
      const newCustomer: Customer = {
        id: newCustomerId,
        name: data.customerName || 'Unknown',
        phone: data.phone || '',
        email: '',
        address: '',
        preferredContact: 'Call',
        lastVisit: today,
        fleet: [vehicle]
      };
      setCustomers([...customers, newCustomer]);
      targetCustomerId = newCustomerId;
    } else {
      // Update existing customer profile
      setCustomers(prev => prev.map(c => {
        if (c.id === targetCustomerId) {
          // Check if vehicle already exists in fleet by VIN
          const vehicleExists = c.fleet.some(v => v.vin.toLowerCase() === vehicle.vin.toLowerCase());
          return {
            ...c,
            lastVisit: today,
            fleet: vehicleExists ? c.fleet : [...c.fleet, vehicle]
          };
        }
        return c;
      }));
    }

    const newOrder: WorkOrder = {
      ...data as any,
      id: Math.random().toString(36).substr(2, 9),
      orderNumber: `WO-${1000 + workOrders.length + 1}`,
      customerId: targetCustomerId,
      notes: [],
      parts: [],
      laborEntries: [],
      images: [],
      createdAt: new Date().toISOString(),
    };

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
    alert(`All items for ${vendorName} moved to PENDING status.`);
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-orange-500 selection:text-white flex flex-col overflow-hidden">
      <nav className="bg-zinc-900 border-b-2 border-orange-600 sticky top-0 z-50 px-6 py-4 shadow-2xl shrink-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('COMMAND_CENTER')}>
            <div className="bg-orange-600 p-2 transform -skew-x-12">
              <svg className="w-6 h-6 text-white transform skew-x-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-2xl font-rugged tracking-tighter uppercase">PowerLog <span className="text-orange-600">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center gap-4">
             <button onClick={() => setView('COMMAND_CENTER')} className={`font-bold uppercase text-[10px] tracking-widest transition-colors ${view === 'COMMAND_CENTER' ? 'text-orange-500 underline decoration-2 underline-offset-8' : 'text-zinc-400 hover:text-white'}`}>Command</button>
             <button onClick={() => setView('DASHBOARD')} className={`font-bold uppercase text-[10px] tracking-widest transition-colors ${view === 'DASHBOARD' ? 'text-orange-500 underline decoration-2 underline-offset-8' : 'text-zinc-400 hover:text-white'}`}>Grid</button>
             <button onClick={() => setView('INVENTORY')} className={`font-bold uppercase text-[10px] tracking-widest transition-colors ${view === 'INVENTORY' ? 'text-orange-500 underline decoration-2 underline-offset-8' : 'text-zinc-400 hover:text-white'}`}>Inventory</button>
             <button onClick={() => setView('ORDERS')} className={`font-bold uppercase text-[10px] tracking-widest transition-colors ${view === 'ORDERS' ? 'text-orange-500 underline decoration-2 underline-offset-8' : 'text-zinc-400 hover:text-white'}`}>Parts</button>
             <button onClick={() => setView('SCHEMATICS')} className={`font-bold uppercase text-[10px] tracking-widest transition-colors ${view === 'SCHEMATICS' ? 'text-orange-500 underline decoration-2 underline-offset-8' : 'text-zinc-400 hover:text-white'}`}>Library</button>
             <button onClick={() => setView('CUSTOMERS')} className={`font-bold uppercase text-[10px] tracking-widest transition-colors ${view === 'CUSTOMERS' ? 'text-orange-500 underline decoration-2 underline-offset-8' : 'text-zinc-400 hover:text-white'}`}>Clients</button>
             <button onClick={() => setView('ARCHIVE')} className={`font-bold uppercase text-[10px] tracking-widest transition-colors ${view === 'ARCHIVE' ? 'text-orange-500 underline decoration-2 underline-offset-8' : 'text-zinc-400 hover:text-white'}`}>History</button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-6 w-full overflow-hidden">
        {view === 'COMMAND_CENTER' && (
          <CommandCenter 
            workOrders={workOrders}
            appointments={appointments}
            customers={customers}
            onSelectOrder={(order) => { setSelectedOrder(order); setView('DETAIL'); }}
            onCreateNewWO={() => setView('CREATE')}
            onOpenCalendar={() => setView('CALENDAR')}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointment={handleUpdateAppointment}
            onConvertToWorkOrder={handleConvertAppointmentToWorkOrder}
          />
        )}

        {view === 'DASHBOARD' && (
          <Dashboard 
            workOrders={workOrders} 
            onSelectOrder={(order) => { setSelectedOrder(order); setView('DETAIL'); }}
            onCreateNew={() => setView('CREATE')}
          />
        )}

        {view === 'CALENDAR' && (
          <CalendarView 
            appointments={appointments}
            customers={customers}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointment={handleUpdateAppointment}
            onConvertToWorkOrder={handleConvertAppointmentToWorkOrder}
            onBack={() => setView('COMMAND_CENTER')}
          />
        )}

        {view === 'CREATE' && (
          <div className="overflow-y-auto h-full scrollbar-thin">
            <WorkOrderForm 
              onSubmit={handleCreateOrder} 
              onCancel={() => { setView('COMMAND_CENTER'); setPrepopulatedOrder(null); }} 
              initialData={prepopulatedOrder}
              customers={customers}
            />
          </div>
        )}

        {view === 'DETAIL' && selectedOrder && (
          <div className="overflow-y-auto h-full scrollbar-thin">
            <WorkOrderDetail 
              order={selectedOrder} 
              inventory={inventory}
              vendors={vendors}
              schematics={schematics}
              onUpdate={handleUpdateOrder} 
              onSpecialOrder={handleAddPartsOrder}
              onAddSchematic={handleAddSchematic}
              onBack={() => { setView('COMMAND_CENTER'); setSelectedOrder(null); }}
            />
          </div>
        )}

        {view === 'INVENTORY' && (
          <div className="overflow-y-auto h-full scrollbar-thin">
            <InventoryPage 
              inventory={inventory}
              onUpdateInventory={handleUpdateInventory}
              onAddInventory={handleAddInventory}
              onBack={() => setView('COMMAND_CENTER')}
            />
          </div>
        )}

        {view === 'SCHEMATICS' && (
          <div className="overflow-y-auto h-full scrollbar-thin">
            <SchematicsLibrary 
              schematics={schematics}
              onAddSchematic={handleAddSchematic}
              onBack={() => setView('COMMAND_CENTER')}
            />
          </div>
        )}

        {view === 'CUSTOMERS' && (
          <div className="overflow-y-auto h-full scrollbar-thin">
            <CustomerPage 
              customers={customers}
              workOrders={workOrders}
              onAddCustomer={handleAddCustomer}
              onStartWorkOrder={handleStartWorkOrderFromCustomer}
              onBack={() => setView('COMMAND_CENTER')}
            />
          </div>
        )}

        {view === 'ORDERS' && (
          <div className="overflow-y-auto h-full scrollbar-thin">
            <PartsOrderPage 
              orders={partsOrders}
              vendors={vendors}
              inventory={inventory}
              onUpdateOrder={handleUpdatePartsOrder}
              onAddOrder={handleAddPartsOrder}
              onBulkOrdered={handleBulkOrdered}
              onBack={() => setView('COMMAND_CENTER')}
            />
          </div>
        )}

        {view === 'VENDORS' && (
          <div className="overflow-y-auto h-full scrollbar-thin">
            <VendorPage 
              vendors={vendors}
              onAddVendor={handleAddVendor}
              onUpdateVendor={handleUpdateVendor}
              onBack={() => setView('COMMAND_CENTER')}
            />
          </div>
        )}

        {view === 'ARCHIVE' && (
          <div className="overflow-y-auto h-full scrollbar-thin">
            <ArchivePage 
              workOrders={workOrders}
              onBack={() => setView('COMMAND_CENTER')}
            />
          </div>
        )}
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t-2 border-orange-600 p-4 flex justify-around z-50">
          <button onClick={() => setView('COMMAND_CENTER')} className={`${view === 'COMMAND_CENTER' ? 'text-orange-500' : 'text-zinc-500'} flex flex-col items-center`}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span className="text-[10px] font-bold uppercase mt-1">Command</span>
          </button>
          <button onClick={() => setView('DASHBOARD')} className={`${view === 'DASHBOARD' ? 'text-orange-500' : 'text-zinc-500'} flex flex-col items-center`}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
            <span className="text-[10px] font-bold uppercase mt-1">Grid</span>
          </button>
          <button onClick={() => setView('ORDERS')} className={`${view === 'ORDERS' ? 'text-orange-500' : 'text-zinc-500'} flex flex-col items-center`}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            <span className="text-[10px] font-bold uppercase mt-1">Parts</span>
          </button>
          <button onClick={() => { setPrepopulatedOrder(null); setView('CREATE'); }} className="text-zinc-500 flex flex-col items-center">
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
            <span className="text-[10px] font-bold uppercase mt-1">Intake</span>
          </button>
      </div>
    </div>
  );
};

export default App;
