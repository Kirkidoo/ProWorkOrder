import React from 'react';
import { LaborEntry } from '../types';
import { COMMON_LABOR_TASKS } from '../constants';
import { Button } from './Button';

interface LaborTrackerProps {
    laborEntries: LaborEntry[];
    isPunchedIn: boolean;
    elapsedSeconds: number;
    onPunchIn: () => void;
    onPunchOut: () => void;
    onAddLabor: (description: string, hours: number) => void;
}

export const LaborTracker: React.FC<LaborTrackerProps> = ({
    laborEntries,
    isPunchedIn,
    elapsedSeconds,
    onPunchIn,
    onPunchOut,
    onAddLabor
}) => {
    return (
        <div className="space-y-8 animate-in slide-in-from-left-4">
            {/* Punch Clock */}
            <div className="bg-zinc-900 border-2 border-zinc-800 p-8 rounded-sm text-center shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Technician Time Tracking</div>
                    <div className={`text-7xl font-rugged mb-6 transition-colors ${isPunchedIn ? 'text-emerald-500 animate-pulse' : 'text-zinc-100'}`}>
                        {new Date(elapsedSeconds * 1000).toISOString().substr(11, 8)}
                    </div>
                    <div className="flex justify-center gap-4">
                        {!isPunchedIn ? (
                            <Button size="xl" onClick={onPunchIn} className="w-48 bg-emerald-600 border-emerald-600">PUNCH IN</Button>
                        ) : (
                            <Button size="xl" variant="danger" onClick={onPunchOut} className="w-48">PUNCH OUT</Button>
                        )}
                    </div>
                </div>
                {isPunchedIn && <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>}
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-rugged uppercase text-zinc-100 border-b border-zinc-800 pb-2">Applied Labor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {COMMON_LABOR_TASKS.map(task => (
                        <button
                            key={task}
                            onClick={() => onAddLabor(task, 0.5)}
                            className="p-4 bg-zinc-950 border border-zinc-900 hover:border-orange-500 text-left transition-all group"
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-300 font-bold uppercase text-xs">{task}</span>
                                <span className="text-orange-500 font-black text-[10px] opacity-0 group-hover:opacity-100">+ Add 0.5h</span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden mt-6">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-950 text-zinc-600 font-black uppercase text-[10px]">
                            <tr>
                                <th className="px-4 py-3">Task</th>
                                <th className="px-4 py-3">Tech</th>
                                <th className="px-4 py-3">Hours</th>
                                <th className="px-4 py-3 text-right">Ext.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {laborEntries.map(entry => (
                                <tr key={entry.id}>
                                    <td className="px-4 py-3 text-zinc-300 uppercase font-bold text-xs">{entry.description}</td>
                                    <td className="px-4 py-3 text-zinc-500">{entry.technician}</td>
                                    <td className="px-4 py-3 font-mono">{entry.hours}</td>
                                    <td className="px-4 py-3 text-right font-mono">${(entry.hours * entry.rate).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
