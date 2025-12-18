
import { Customer, Vehicle, VehicleType } from '../types';

export const customerService = {
    findOrCreateCustomer: (
        customers: Customer[],
        data: { customerId?: string; customerName?: string; phone?: string },
        vehicle: Vehicle
    ): { targetCustomerId: string; updatedCustomers: Customer[] } => {
        let targetCustomerId = data.customerId;
        const today = new Date().toLocaleDateString();

        if (!targetCustomerId) {
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
            return {
                targetCustomerId: newCustomerId,
                updatedCustomers: [...customers, newCustomer]
            };
        } else {
            const updatedCustomers = customers.map(c => {
                if (c.id === targetCustomerId) {
                    const vehicleExists = c.fleet.some(v => v.vin.toLowerCase() === vehicle.vin.toLowerCase());
                    return {
                        ...c,
                        lastVisit: today,
                        fleet: vehicleExists ? c.fleet : [...c.fleet, vehicle]
                    };
                }
                return c;
            });
            return {
                targetCustomerId,
                updatedCustomers
            };
        }
    }
};
