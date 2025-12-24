import React from 'react';
import { Part, InventoryItem } from '../types';

interface PartsLookupProps {
    parts: Part[];
    inventory: InventoryItem[];
    partSearch: string;
    onPartSearchChange: (value: string) => void;
    onAddPart: (item: InventoryItem) => void;
    onOpenSpecialOrder: () => void;
}

export const PartsLookup: React.FC<PartsLookupProps> = ({
    parts,
    inventory,
    partSearch,
    onPartSearchChange,
    onAddPart,
    onOpenSpecialOrder
}) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-left-4">
            <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2 block">Stock Lookup</label>
                <input
                    className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 rounded-sm outline-none focus:border-orange-500 uppercase font-bold text-zinc-100"
                    placeholder="Search inventory by Part # or Description..."
                    value={partSearch}
                    onChange={e => onPartSearchChange(e.target.value)}
                />
                {partSearch && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-zinc-900 border-2 border-orange-500 mt-1 shadow-2xl">
                        {inventory
                            .filter(i =>
                                i.partNumber.toLowerCase().includes(partSearch.toLowerCase()) ||
                                i.description.toLowerCase().includes(partSearch.toLowerCase())
                            )
                            .slice(0, 5)
                            .map(item => (
                                <div
                                    key={item.id}
                                    className="p-4 border-b border-zinc-800 hover:bg-zinc-800 cursor-pointer flex justify-between items-center"
                                    onClick={() => onAddPart(item)}
                                >
                                    <div>
                                        <div className="font-mono text-orange-500 font-bold">{item.partNumber}</div>
                                        <div className="text-xs text-zinc-400">{item.description}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-emerald-500 uppercase">
                                            {item.quantityOnHand > 0 ? `Stock: ${item.quantityOnHand}` : 'OUT OF STOCK'}
                                        </div>
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase">Loc: {item.binLocation}</div>
                                    </div>
                                </div>
                            ))}
                        <div
                            className="p-4 bg-zinc-950 text-center cursor-pointer hover:bg-zinc-800 border-t border-zinc-800"
                            onClick={onOpenSpecialOrder}
                        >
                            <span className="text-[10px] font-black uppercase text-orange-600">+ Special Order Item</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-950 text-zinc-600 font-black uppercase text-[10px]">
                        <tr>
                            <th className="px-4 py-3">Part #</th>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3">Qty</th>
                            <th className="px-4 py-3 text-right">Ext.</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {parts.map(part => (
                            <tr key={part.id}>
                                <td className="px-4 py-3 font-mono text-orange-500 font-bold">{part.partNumber}</td>
                                <td className="px-4 py-3 text-zinc-300 text-xs">{part.description}</td>
                                <td className="px-4 py-3 font-mono">{part.quantity}</td>
                                <td className="px-4 py-3 text-right font-mono">${(part.price * part.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                        {parts.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-zinc-700 uppercase font-black italic">
                                    No parts applied.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
