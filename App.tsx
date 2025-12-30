
import React from 'react';
import { useApp } from './context/AppContext';
import { UnifiedDashboard } from './components/UnifiedDashboard';
import { WorkOrderForm } from './components/WorkOrderForm';
import { WorkOrderDetail } from './components/WorkOrderDetail';
import { InventoryPage } from './components/InventoryPage';
import { CustomerPage } from './components/CustomerPage';
import { PartsOrderPage } from './components/PartsOrderPage';
import { VendorPage } from './components/VendorPage';
import { ArchivePage } from './components/ArchivePage';
import { SchematicsLibrary } from './components/SchematicsLibrary';

const App: React.FC = () => {
  const { view, setView, selectedOrder, setPrepopulatedOrder } = useApp();

  // Set default view to CALENDAR if not already set (conceptually, though state is in context)
  // Ideally this change should happen in Context, but for now we set the "Home" buttons to CALENDAR.

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-orange-500 selection:text-white flex flex-col overflow-hidden">
      <nav className="bg-zinc-900 border-b-2 border-orange-600 sticky top-0 z-50 px-6 py-4 shadow-2xl shrink-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('OVERVIEW')}>
            <div className="bg-orange-600 p-2 transform -skew-x-12">
              <svg className="w-6 h-6 text-white transform skew-x-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-2xl font-rugged tracking-tighter uppercase">PowerLog <span className="text-orange-600">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => setView('OVERVIEW')} className={`font-bold uppercase text-[10px] tracking-widest transition-colors ${view === 'OVERVIEW' ? 'text-orange-500 underline decoration-2 underline-offset-8' : 'text-zinc-400 hover:text-white'}`}>Overview</button>
            <button onClick={() => setView('INVENTORY')} className={`font-bold uppercase text-[10px] tracking-widest transition-colors ${view === 'INVENTORY' ? 'text-orange-500 underline decoration-2 underline-offset-8' : 'text-zinc-400 hover:text-white'}`}>Inventory</button>
            <button onClick={() => setView('ORDERS')} className={`font-bold uppercase text-[10px] tracking-widest transition-colors ${view === 'ORDERS' ? 'text-orange-500 underline decoration-2 underline-offset-8' : 'text-zinc-400 hover:text-white'}`}>Parts</button>
            <button onClick={() => setView('SCHEMATICS')} className={`font-bold uppercase text-[10px] tracking-widest transition-colors ${view === 'SCHEMATICS' ? 'text-orange-500 underline decoration-2 underline-offset-8' : 'text-zinc-400 hover:text-white'}`}>Library</button>
            <button onClick={() => setView('CUSTOMERS')} className={`font-bold uppercase text-[10px] tracking-widest transition-colors ${view === 'CUSTOMERS' ? 'text-orange-500 underline decoration-2 underline-offset-8' : 'text-zinc-400 hover:text-white'}`}>Clients</button>
            <button onClick={() => setView('ARCHIVE')} className={`font-bold uppercase text-[10px] tracking-widest transition-colors ${view === 'ARCHIVE' ? 'text-orange-500 underline decoration-2 underline-offset-8' : 'text-zinc-400 hover:text-white'}`}>History</button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-6 w-full overflow-hidden">
        {view === 'OVERVIEW' && <UnifiedDashboard />}
        {view === 'CREATE' && (
          <div className="overflow-y-auto h-full scrollbar-thin">
            <WorkOrderForm />
          </div>
        )}
        {view === 'DETAIL' && selectedOrder && (
          <div className="overflow-y-auto h-full scrollbar-thin">
            <WorkOrderDetail />
          </div>
        )}
        {view === 'INVENTORY' && (
          <div className="overflow-y-auto h-full scrollbar-thin">
            <InventoryPage />
          </div>
        )}
        {view === 'SCHEMATICS' && (
          <div className="overflow-y-auto h-full scrollbar-thin">
            <SchematicsLibrary />
          </div>
        )}
        {view === 'CUSTOMERS' && (
          <div className="overflow-y-auto h-full scrollbar-thin">
            <CustomerPage />
          </div>
        )}
        {view === 'ORDERS' && (
          <div className="overflow-y-auto h-full scrollbar-thin">
            <PartsOrderPage />
          </div>
        )}
        {view === 'VENDORS' && (
          <div className="overflow-y-auto h-full scrollbar-thin">
            <VendorPage />
          </div>
        )}
        {view === 'ARCHIVE' && (
          <div className="overflow-y-auto h-full scrollbar-thin">
            <ArchivePage />
          </div>
        )}
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t-2 border-orange-600 p-4 flex justify-around z-50">
        <button onClick={() => setView('OVERVIEW')} className={`${view === 'OVERVIEW' ? 'text-orange-500' : 'text-zinc-500'} flex flex-col items-center`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
          <span className="text-[10px] font-bold uppercase mt-1">Home</span>
        </button>
        <button onClick={() => setView('ORDERS')} className={`${view === 'ORDERS' ? 'text-orange-500' : 'text-zinc-500'} flex flex-col items-center`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
          <span className="text-[10px] font-bold uppercase mt-1">Parts</span>
        </button>
        <button onClick={() => { setPrepopulatedOrder(null); setView('CREATE'); }} className="text-zinc-500 flex flex-col items-center">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" /></svg>
          <span className="text-[10px] font-bold uppercase mt-1">Intake</span>
        </button>
      </div>
    </div>
  );
};

export default App;
