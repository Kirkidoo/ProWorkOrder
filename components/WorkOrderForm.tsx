import React, { useState, useEffect, useMemo } from 'react';
import { WorkOrder, VehicleType, WorkOrderStatus, Customer, InspectionChecklist, Vehicle } from '../types';
import { Button } from './Button';
import { VEHICLE_ICONS } from '../constants';
import { useApp } from '../context/AppContext';

export const WorkOrderForm: React.FC = () => {
  const {
    handleCreateOrder: onSubmit, setView, prepopulatedOrder: initialData, customers
  } = useApp();

  const onCancel = () => setView('COMMAND_CENTER');
  const [formData, setFormData] = useState<Partial<WorkOrder>>({
    customerName: '',
    phone: '',
    customerId: '',
    vin: '',
    year: '',
    make: '',
    model: '',
    vehicleType: VehicleType.BIKE,
    customerConcern: '',
    status: WorkOrderStatus.NEW,
    inspection: {
      tires: false,
      fluids: false,
      battery: false,
      brakes: false,
      lights: false
    }
  });

  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [isAddingNewUnit, setIsAddingNewUnit] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return [];
    return customers.filter(c =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
    ).slice(0, 5);
  }, [customers, customerSearch]);

  const currentCustomer = useMemo(() => {
    return customers.find(c => c.id === formData.customerId);
  }, [customers, formData.customerId]);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
      // If we are prepopulating with data that includes a customerId, but no VIN,
      // it means we probably want to see the fleet.
      if (initialData.customerId && !initialData.vin) {
        setIsAddingNewUnit(false);
      }
    }
  }, [initialData]);

  // VIN Auto-fill logic
  useEffect(() => {
    if (currentCustomer && formData.vin && !formData.year) {
      const match = currentCustomer.fleet.find(v => v.vin.toLowerCase() === formData.vin?.toLowerCase());
      if (match) {
        setFormData(prev => ({
          ...prev,
          year: match.year,
          make: match.make,
          model: match.model,
          vehicleType: match.type
        }));
      }
    }
  }, [formData.vin, currentCustomer]);

  const handleSelectCustomer = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      customerName: customer.name,
      phone: customer.phone,
      customerId: customer.id,
      // Clear unit fields when changing customer
      vin: '',
      year: '',
      make: '',
      model: '',
      vehicleType: VehicleType.BIKE
    }));
    setCustomerSearch('');
    setShowCustomerResults(false);
    setIsAddingNewUnit(false);
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setFormData(prev => ({
      ...prev,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      vin: vehicle.vin,
      vehicleType: vehicle.type
    }));
    setIsAddingNewUnit(false);
  };

  const handleClearCustomer = () => {
    setFormData(prev => ({
      ...prev,
      customerName: '',
      phone: '',
      customerId: '',
      vin: '',
      year: '',
      make: '',
      model: '',
      vehicleType: VehicleType.BIKE
    }));
    setIsAddingNewUnit(false);
  };

  const toggleInspection = (key: keyof InspectionChecklist) => {
    setFormData(prev => ({
      ...prev,
      inspection: {
        ...prev.inspection!,
        [key]: !prev.inspection![key]
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClasses = "w-full bg-zinc-950 border-2 border-zinc-800 p-4 text-zinc-100 focus:border-orange-500 focus:ring-0 transition-colors outline-none rounded-sm placeholder:text-zinc-700 uppercase font-bold text-lg";
  const labelClasses = "block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b-2 border-orange-500 pb-4">
        <h2 className="text-3xl font-rugged uppercase text-zinc-100">Intake New Unit</h2>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
        {/* Customer Info */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="text-orange-500 font-rugged text-xl uppercase tracking-wider">Customer Info</h3>
            {formData.customerId && (
              <button
                type="button"
                onClick={handleClearCustomer}
                className="text-[10px] font-bold text-zinc-500 uppercase hover:text-red-500 transition-colors"
              >
                [Change Customer]
              </button>
            )}
          </div>

          {!formData.customerId ? (
            <div className="relative">
              <label className={labelClasses}>Lookup Existing Customer</label>
              <div className="relative">
                <input
                  className={inputClasses}
                  placeholder="Search Name or Phone..."
                  value={customerSearch}
                  onChange={e => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerResults(true);
                  }}
                  onFocus={() => setShowCustomerResults(true)}
                />
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {showCustomerResults && customerSearch && (
                <div className="absolute top-full left-0 right-0 z-50 bg-zinc-900 border-2 border-orange-600 mt-1 shadow-2xl rounded-sm max-h-60 overflow-y-auto">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map(c => (
                      <div
                        key={c.id}
                        className="p-4 border-b border-zinc-800 hover:bg-zinc-800 cursor-pointer flex justify-between items-center group"
                        onClick={() => handleSelectCustomer(c)}
                      >
                        <div>
                          <div className="font-bold text-zinc-100 group-hover:text-orange-500 uppercase">{c.name}</div>
                          <div className="text-xs text-zinc-500 font-mono">{c.phone}</div>
                        </div>
                        <div className="text-[10px] font-bold text-zinc-700 uppercase">Select</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-zinc-500 text-sm italic">
                      No matches. Continue typing to create a new profile.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-zinc-900/50 border-2 border-orange-500/20 p-4 rounded-sm">
              <div className="text-[10px] font-bold text-orange-500 uppercase mb-1">Linked Profile</div>
              <div className="text-xl font-rugged text-zinc-100 uppercase">{formData.customerName}</div>
              <div className="text-sm font-mono text-zinc-400">{formData.phone}</div>
            </div>
          )}

          {!formData.customerId && (
            <>
              <div>
                <label className={labelClasses}>New Customer Name</label>
                <input
                  required
                  className={inputClasses}
                  placeholder="e.g. John Smith"
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClasses}>Contact Phone</label>
                <input
                  required
                  type="tel"
                  className={inputClasses}
                  placeholder="(555) 000-0000"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </>
          )}
        </section>

        {/* Unit Info */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="text-orange-500 font-rugged text-xl uppercase tracking-wider">Unit Specs</h3>
            {formData.customerId && !isAddingNewUnit && (
              <button
                type="button"
                onClick={() => setIsAddingNewUnit(true)}
                className="text-[10px] font-bold text-emerald-500 uppercase hover:text-emerald-400 transition-colors"
              >
                [+ Add New Vehicle]
              </button>
            )}
          </div>

          {currentCustomer && !isAddingNewUnit && (
            <div className="space-y-4">
              <label className={labelClasses}>Select from Saved Vehicles</label>
              <div className="grid grid-cols-1 gap-3">
                {currentCustomer.fleet.map((v, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectVehicle(v)}
                    className={`bg-zinc-900 border-2 p-4 rounded-sm flex items-center gap-4 transition-all cursor-pointer group ${formData.vin === v.vin ? 'border-orange-500' : 'border-zinc-800 hover:border-zinc-700'}`}
                  >
                    <div className={`p-3 bg-zinc-950 rounded-sm ${formData.vin === v.vin ? 'text-orange-500' : 'text-zinc-500 group-hover:text-orange-400'}`}>
                      {VEHICLE_ICONS[v.type]}
                    </div>
                    <div>
                      <div className="font-bold text-zinc-100 uppercase">{v.year} {v.make}</div>
                      <div className="text-sm text-zinc-400 uppercase">{v.model}</div>
                      <div className="text-[10px] font-mono text-zinc-600 mt-1">VIN: {v.vin}</div>
                    </div>
                  </div>
                ))}
                {currentCustomer.fleet.length === 0 && (
                  <div className="p-4 bg-zinc-900/40 border border-zinc-800 border-dashed text-center text-zinc-600 text-[10px] font-bold uppercase">No vehicles in fleet. Add one below.</div>
                )}
              </div>
            </div>
          )}

          {(isAddingNewUnit || !formData.customerId) && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <label className={labelClasses}>VIN / Serial Number</label>
                <input
                  required
                  className={inputClasses + " font-mono"}
                  placeholder="1HFSC..."
                  value={formData.vin}
                  onChange={e => setFormData({ ...formData, vin: e.target.value })}
                />
                {currentCustomer && (
                  <p className="text-[9px] text-zinc-600 font-bold mt-1 uppercase">Typing an existing VIN will auto-fill unit specs</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Year</label>
                  <input
                    required
                    className={inputClasses}
                    placeholder="2024"
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Make</label>
                  <input
                    required
                    className={inputClasses}
                    placeholder="Honda"
                    value={formData.make}
                    onChange={e => setFormData({ ...formData, make: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className={labelClasses}>Model</label>
                <input
                  required
                  className={inputClasses}
                  placeholder="CBR 1000RR"
                  value={formData.model}
                  onChange={e => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClasses}>Unit Type</label>
                <select
                  className={inputClasses}
                  value={formData.vehicleType}
                  onChange={e => setFormData({ ...formData, vehicleType: e.target.value as VehicleType })}
                >
                  {Object.values(VehicleType).map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              {formData.customerId && (
                <Button variant="ghost" size="sm" onClick={() => setIsAddingNewUnit(false)} fullWidth>Cancel New Vehicle Entry</Button>
              )}
            </div>
          )}
        </section>

        {/* Quick Inspection */}
        <section className="md:col-span-2 bg-zinc-900/40 p-6 border-2 border-zinc-800 rounded-sm">
          <h3 className="text-emerald-500 font-rugged text-xl uppercase tracking-wider mb-6">Quick Safety Inspection</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(Object.keys(formData.inspection!) as Array<keyof InspectionChecklist>).map((key) => (
              <label key={key} className={`flex flex-col items-center justify-center p-4 border-2 transition-all cursor-pointer rounded-sm ${formData.inspection![key] ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={formData.inspection![key]}
                  onChange={() => toggleInspection(key)}
                />
                <span className="text-[10px] font-black uppercase tracking-widest">{key}</span>
                <span className="mt-2 text-xl font-bold">{formData.inspection![key] ? 'PASS' : '---'}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Concern */}
        <section className="md:col-span-2 space-y-6">
          <h3 className="text-orange-500 font-rugged text-xl uppercase tracking-wider">Reason for Visit</h3>
          <div>
            <label className={labelClasses}>Customer Concern / Symptoms</label>
            <textarea
              required
              rows={4}
              className={inputClasses + " normal-case font-normal text-base"}
              placeholder="Describe the issue in detail..."
              value={formData.customerConcern}
              onChange={e => setFormData({ ...formData, customerConcern: e.target.value })}
            />
          </div>
        </section>

        <div className="md:col-span-2 flex gap-4 pt-8">
          <Button type="submit" size="xl" fullWidth>Complete Intake</Button>
          <Button type="button" variant="secondary" size="xl" fullWidth onClick={onCancel}>Discard</Button>
        </div>
      </form>
    </div>
  );
};
