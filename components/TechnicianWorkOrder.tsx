import React from 'react';
import { WorkOrder } from '../types';
import { Button } from './Button';

interface TechnicianWorkOrderProps {
    order: WorkOrder;
    onClose: () => void;
}

export const TechnicianWorkOrder: React.FC<TechnicianWorkOrderProps> = ({ order, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[300] flex items-center justify-center p-4 md:p-8 backdrop-blur-sm overflow-y-auto print:bg-white print:p-0 print:block print:static">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0.5in; size: 8.5in 11in; }
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .print-compact { padding: 0 !important; margin: 0 !important; }
                }
            `}} />
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-sm shadow-2xl flex flex-col max-h-full print:border-none print:shadow-none print:bg-white print:text-black print:max-h-none">
                {/* Header (Hidden on print) */}
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center shrink-0 print:hidden bg-zinc-950">
                    <h2 className="font-rugged text-2xl uppercase text-orange-500 tracking-wider">Technician Work Sheet</h2>
                    <div className="flex gap-4">
                        <Button variant="primary" onClick={handlePrint}>Print Sheet</Button>
                        <Button variant="secondary" onClick={onClose}>Close</Button>
                    </div>
                </div>

                {/* Document Content */}
                <div id="tech-sheet-content" className="p-6 md:p-10 overflow-y-auto print:overflow-visible print:p-0 bg-white text-zinc-900 font-sans leading-relaxed">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-3 mb-4">
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 leading-none">PowerLog <span className="text-orange-600">Pro</span></h1>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">Technician Service Record</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-black uppercase text-zinc-200 leading-none tracking-tighter print:text-zinc-200">Work Sheet</h2>
                            <p className="text-xs font-bold mt-1 uppercase tracking-widest text-zinc-900">Order #{order.orderNumber}</p>
                            <p className="text-[9px] text-zinc-400 font-mono mt-0.5 uppercase">Date: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Customer & Unit Info */}
                    <div className="grid grid-cols-2 gap-8 mb-4 bg-zinc-50 p-3 rounded-sm border border-zinc-100">
                        <div>
                            <h3 className="text-[9px] font-black uppercase text-zinc-400 border-b border-zinc-200 pb-0.5 mb-1.5 tracking-widest">Customer</h3>
                            <p className="text-base font-bold text-zinc-900 leading-tight">{order.customerName}</p>
                            <p className="text-xs text-zinc-600">{order.phone}</p>
                        </div>
                        <div>
                            <h3 className="text-[9px] font-black uppercase text-zinc-400 border-b border-zinc-200 pb-0.5 mb-1.5 tracking-widest">Vehicle</h3>
                            <p className="text-base font-bold text-zinc-900 leading-tight">{order.year} {order.make} {order.model}</p>
                            <p className="text-[10px] text-zinc-500 font-mono truncate">VIN: {order.vin.toUpperCase()}</p>
                        </div>
                    </div>

                    {/* Customer Concern */}
                    <div className="mb-4 p-2 border-l-4 border-orange-500 bg-orange-50">
                        <h3 className="text-[9px] font-black uppercase text-orange-700 mb-0.5 tracking-widest">Customer Concern / Instructions</h3>
                        <p className="text-xs font-bold text-zinc-800 leading-tight">{order.customerConcern}</p>
                    </div>

                    {/* Labor / Time Tracking Section */}
                    <div className="mb-6">
                        <div className="flex justify-between items-end mb-2">
                            <h3 className="text-[9px] font-black uppercase text-white bg-zinc-900 px-2 py-0.5 tracking-widest inline-block skew-x-[-12deg]">Time & Labor Log</h3>
                            <span className="text-[8px] font-bold text-zinc-400 uppercase italic">Tech / Date / Details / Time</span>
                        </div>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-900 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                    <th className="py-1 text-left">Activity / Service Performed</th>
                                    <th className="py-1 text-right w-28">Hours / Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4].map(i => (
                                    <tr key={i} className="border-b border-zinc-100">
                                        <td className="py-3"></td>
                                        <td className="py-3 border-l border-zinc-100"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Parts Section */}
                    <div className="mb-6">
                        <div className="flex justify-between items-end mb-2">
                            <h3 className="text-[9px] font-black uppercase text-white bg-zinc-900 px-2 py-0.5 tracking-widest inline-block skew-x-[-12deg]">Parts Used</h3>
                            <span className="text-[8px] font-bold text-zinc-400 uppercase italic">Pull Item # / Description / Qty</span>
                        </div>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-900 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                    <th className="py-1 text-left">Part Number</th>
                                    <th className="py-1 text-left pl-3">Description</th>
                                    <th className="py-1 text-center w-16">Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(i => (
                                    <tr key={i} className="border-b border-zinc-100">
                                        <td className="py-1.5 w-40"></td>
                                        <td className="py-1.5 pl-3 border-l border-zinc-100"></td>
                                        <td className="py-1.5 border-l border-zinc-100"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Technician Notes */}
                    <div className="mb-6">
                        <h3 className="text-[9px] font-black uppercase text-zinc-400 mb-1 tracking-widest">Additional Notes / Recommendations</h3>
                        <div className="min-h-[80px] border border-zinc-200 rounded-sm p-3 text-zinc-300 italic text-[10px]">
                            Field notes, future recommendations...
                        </div>
                    </div>

                    {/* Footer / Signatures */}
                    <div className="mt-auto pt-4 border-t border-zinc-200">
                        <div className="flex justify-between items-end">
                            <div className="flex gap-10">
                                <div className="w-48 border-b border-zinc-400 pb-0.5">
                                    <span className="text-[9px] font-black uppercase text-zinc-300 tracking-widest">Tech Signature</span>
                                </div>
                                <div className="w-40 border-b border-zinc-400 pb-0.5">
                                    <span className="text-[9px] font-black uppercase text-zinc-300 tracking-widest">Date Completed</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-bold text-zinc-400 uppercase">PowerLog Pro Management System</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
