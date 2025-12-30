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
                <div id="tech-sheet-content" className="p-8 md:p-12 overflow-y-auto print:overflow-visible bg-white text-zinc-900 font-sans leading-relaxed">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-4 border-zinc-900 pb-8 mb-8">
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 leading-none">PowerLog <span className="text-orange-600">Pro</span></h1>
                            <p className="text-xs font-bold text-zinc-500 uppercase mt-2">Technician Service Record</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-black uppercase text-zinc-200 leading-none tracking-tighter print:text-zinc-200">Work Sheet</h2>
                            <p className="text-sm font-bold mt-2 uppercase tracking-widest text-zinc-900">Order #{order.orderNumber}</p>
                            <p className="text-[10px] text-zinc-400 font-mono mt-1 uppercase">Date: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Customer & Unit Info */}
                    <div className="grid grid-cols-2 gap-12 mb-8 bg-zinc-50 p-6 rounded-sm border border-zinc-100">
                        <div>
                            <h3 className="text-[10px] font-black uppercase text-zinc-400 border-b border-zinc-200 pb-1 mb-3 tracking-widest">Customer</h3>
                            <p className="text-lg font-bold text-zinc-900">{order.customerName}</p>
                            <p className="text-sm text-zinc-600">{order.phone}</p>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black uppercase text-zinc-400 border-b border-zinc-200 pb-1 mb-3 tracking-widest">Vehicle</h3>
                            <p className="text-lg font-bold text-zinc-900">{order.year} {order.make} {order.model}</p>
                            <p className="text-xs text-zinc-500 font-mono truncate">VIN: {order.vin.toUpperCase()}</p>
                        </div>
                    </div>

                    {/* Customer Concern */}
                    <div className="mb-8 p-4 border-l-4 border-orange-500 bg-orange-50">
                        <h3 className="text-[10px] font-black uppercase text-orange-700 mb-1 tracking-widest">Customer Concern / Instructions</h3>
                        <p className="text-sm font-bold text-zinc-800">{order.customerConcern}</p>
                    </div>

                    {/* Labor / Time Tracking Section */}
                    <div className="mb-10">
                        <div className="flex justify-between items-end mb-4">
                            <h3 className="text-[10px] font-black uppercase text-white bg-zinc-900 px-3 py-1 tracking-widest inline-block skew-x-[-12deg]">Time & Labor Log</h3>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase italic">Write Tech Name / Date / Details / Elapsed Time</span>
                        </div>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2 border-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    <th className="py-2 text-left">Activity / Service Performed</th>
                                    <th className="py-2 text-right w-32">Hours / Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4].map(i => (
                                    <tr key={i} className="border-b border-zinc-100">
                                        <td className="py-6"></td>
                                        <td className="py-6 border-l border-zinc-100"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Parts Section */}
                    <div className="mb-12">
                        <div className="flex justify-between items-end mb-4">
                            <h3 className="text-[10px] font-black uppercase text-white bg-zinc-900 px-3 py-1 tracking-widest inline-block skew-x-[-12deg]">Parts & Materials Used</h3>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase italic">Record all parts pulled from stock or special ordered</span>
                        </div>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2 border-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    <th className="py-2 text-left">Part Number</th>
                                    <th className="py-2 text-left pl-4">Description</th>
                                    <th className="py-2 text-center w-20">Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(i => (
                                    <tr key={i} className="border-b border-zinc-100">
                                        <td className="py-5 w-48"></td>
                                        <td className="py-5 pl-4 border-l border-zinc-100"></td>
                                        <td className="py-5 border-l border-zinc-100"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Technician Notes */}
                    <div className="mb-12">
                        <h3 className="text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">Additional Technician Notes / Recommendations</h3>
                        <div className="min-h-[150px] border border-zinc-200 rounded-sm p-4 text-zinc-300 italic text-xs">
                            Field notes, future recommendations, or items requiring follow-up...
                        </div>
                    </div>

                    {/* Footer / Signatures */}
                    <div className="mt-auto pt-12 border-t border-zinc-200">
                        <div className="flex justify-between items-end">
                            <div className="space-y-8">
                                <div className="w-64 border-b border-zinc-400 pb-1">
                                    <span className="text-[10px] font-black uppercase text-zinc-300 tracking-widest">Technician Signature</span>
                                </div>
                                <div className="w-64 border-b border-zinc-400 pb-1">
                                    <span className="text-[10px] font-black uppercase text-zinc-300 tracking-widest">Date Completed</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase">PowerLog Pro Management System</p>
                                <p className="text-[9px] text-zinc-300 uppercase">Digital Duplicate Stored in System</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
