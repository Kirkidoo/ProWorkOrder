import React from 'react';
import { WorkOrder } from '../types';
import { Button } from './Button';

interface InvoicePreviewProps {
    order: WorkOrder;
    onClose: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ order, onClose }) => {
    const partsTotal = order.parts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const laborTotal = order.laborEntries.reduce((sum, l) => sum + (l.hours * l.rate), 0);
    const grandTotal = partsTotal + laborTotal;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[300] flex items-center justify-center p-4 md:p-8 backdrop-blur-sm overflow-y-auto print:bg-white print:p-0 print:block print:static">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-sm shadow-2xl flex flex-col max-h-full print:border-none print:shadow-none print:bg-white print:text-black print:max-h-none">
                {/* Header (Hidden on print) */}
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center shrink-0 print:hidden bg-zinc-950">
                    <h2 className="font-rugged text-2xl uppercase text-orange-500 tracking-wider">Document Preview</h2>
                    <div className="flex gap-4">
                        <Button variant="primary" onClick={handlePrint}>Print / Export PDF</Button>
                        <Button variant="secondary" onClick={onClose}>Close</Button>
                    </div>
                </div>

                {/* Document Content */}
                <div id="invoice-content" className="p-8 md:p-12 overflow-y-auto print:overflow-visible bg-white text-zinc-900 font-sans leading-relaxed">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start border-b-4 border-zinc-900 pb-8 mb-8">
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 leading-none">PowerLog <span className="text-orange-600">Pro</span></h1>
                            <p className="text-xs font-bold text-zinc-500 uppercase mt-2">Premium Powersports Service & Diagnostics</p>
                            <p className="text-[10px] text-zinc-400 mt-1">123 Service Road, Performance City, CO 80001</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-5xl font-black uppercase text-zinc-200 leading-none tracking-tighter print:text-zinc-200">Invoice</h2>
                            <p className="text-sm font-bold mt-2 uppercase tracking-widest text-zinc-900">Order #{order.orderNumber}</p>
                            <p className="text-[10px] text-zinc-400 font-mono mt-1 uppercase">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Customer & Unit Info */}
                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div>
                            <h3 className="text-[10px] font-black uppercase text-zinc-400 border-b border-zinc-100 pb-1 mb-3 tracking-widest">Client Details</h3>
                            <p className="text-lg font-bold text-zinc-900">{order.customerName}</p>
                            <p className="text-sm text-zinc-600">{order.phone}</p>
                            <p className="text-sm text-zinc-600">VIN: {order.vin.toUpperCase()}</p>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black uppercase text-zinc-400 border-b border-zinc-100 pb-1 mb-3 tracking-widest">Unit Information</h3>
                            <p className="text-lg font-bold text-zinc-900">{order.year} {order.make} {order.model}</p>
                            <p className="text-xs text-zinc-500 uppercase font-bold italic mt-1">Concern: {order.customerConcern}</p>
                        </div>
                    </div>

                    {/* Labor Section */}
                    <div className="mb-10">
                        <h3 className="text-[10px] font-black uppercase text-white bg-zinc-900 px-3 py-1 mb-4 tracking-widest inline-block skew-x-[-12deg]">Technical Labor</h3>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    <th className="py-2">Description</th>
                                    <th className="py-2 text-center w-24">Hours</th>
                                    <th className="py-2 text-right w-32">Rate</th>
                                    <th className="py-2 text-right w-32">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {order.laborEntries.map(entry => (
                                    <tr key={entry.id} className="text-sm">
                                        <td className="py-3 font-medium">{entry.description}</td>
                                        <td className="py-3 text-center font-mono">{entry.hours.toFixed(2)}</td>
                                        <td className="py-3 text-right font-mono">${entry.rate.toFixed(2)}</td>
                                        <td className="py-3 text-right font-bold font-mono">${(entry.hours * entry.rate).toFixed(2)}</td>
                                    </tr>
                                ))}
                                {order.laborEntries.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-4 text-center text-zinc-400 italic text-sm">No labor entries recorded</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Parts Section */}
                    <div className="mb-12">
                        <h3 className="text-[10px] font-black uppercase text-white bg-zinc-900 px-3 py-1 mb-4 tracking-widest inline-block skew-x-[-12deg]">Parts & Materials</h3>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    <th className="py-2">Part Number / Description</th>
                                    <th className="py-2 text-center w-24">Qty</th>
                                    <th className="py-2 text-right w-32">Unit Price</th>
                                    <th className="py-2 text-right w-32">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {order.parts.map(part => (
                                    <tr key={part.id} className="text-sm">
                                        <td className="py-3 font-medium">
                                            <div className="font-bold text-zinc-900">{part.partNumber}</div>
                                            <div className="text-xs text-zinc-500">{part.description}</div>
                                        </td>
                                        <td className="py-3 text-center font-mono">{part.quantity}</td>
                                        <td className="py-3 text-right font-mono">${part.price.toFixed(2)}</td>
                                        <td className="py-3 text-right font-bold font-mono">${(part.price * part.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                                {order.parts.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-4 text-center text-zinc-400 italic text-sm">No parts applied to this order</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end pt-8 border-t-4 border-zinc-900">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-xs font-bold uppercase text-zinc-400">
                                <span>Labor Subtotal</span>
                                <span className="font-mono text-zinc-900">${laborTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold uppercase text-zinc-400">
                                <span>Parts Subtotal</span>
                                <span className="font-mono text-zinc-900">${partsTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-black uppercase text-zinc-900 pt-3 border-t-2 border-zinc-900">
                                <span className="tracking-tighter">Grand Total</span>
                                <span className="font-mono text-orange-600">${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-20 pt-8 border-t border-zinc-100 text-[10px] text-zinc-400 leading-relaxed">
                        <p className="font-bold uppercase text-zinc-900 mb-2">Terms & Conditions</p>
                        <p>All service work is guaranteed for 30 days or 500 miles. Special order parts are non-returnable. Units left over 48 hours after completion are subject to storage fees. PowerLog Pro is not responsible for loss due to fire, theft, or damage beyond our control.</p>
                        <div className="mt-8 flex justify-between">
                            <div className="w-48 border-t border-zinc-300 pt-2 text-center uppercase font-bold tracking-widest text-zinc-300">Customer Signature</div>
                            <div className="w-48 border-t border-zinc-300 pt-2 text-center uppercase font-bold tracking-widest text-zinc-300">Technician Signature</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
