
import { WorkOrder, VehicleType } from '../types';

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
            ...data as any,
            id: Math.random().toString(36).substr(2, 9),
            orderNumber,
            customerId: targetCustomerId,
            notes: [],
            parts: [],
            laborEntries: [],
            images: [],
            createdAt: new Date().toISOString(),
        };
    }
};
