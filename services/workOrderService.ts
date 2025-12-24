
import { WorkOrder, VehicleType, WorkOrderStatus } from '../types';

export const workOrderService = {
    generateWorkOrderNumber: (currentCount: number): string => {
        return `WO-${1000 + currentCount + 1}`;
    },

    createWorkOrder: (
        data: Partial<WorkOrder>,
        orderNumber: string,
        targetCustomerId: string
    ): WorkOrder => {
        return {
            customerName: '',
            phone: '',
            vin: '',
            year: '',
            make: '',
            model: '',
            vehicleType: VehicleType.BIKE,
            customerConcern: '',
            status: WorkOrderStatus.NEW,
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            orderNumber,
            customerId: targetCustomerId,
            notes: data.notes || [],
            parts: data.parts || [],
            laborEntries: data.laborEntries || [],
            images: data.images || [],
            createdAt: new Date().toISOString(),
        };
    }
};
