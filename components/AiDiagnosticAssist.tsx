import React from 'react';
import { Button } from './Button';

interface AiSuggestions {
    potentialCauses: string[];
    suggestedSteps: string[];
    missingInformation: string[];
}

interface AiDiagnosticAssistProps {
    loadingAi: boolean;
    aiSuggestions: AiSuggestions | null;
    onRequestDiagnostics: () => void;
    onCopyToNotes: (text: string, prefix: string) => void;
}

export const AiDiagnosticAssist: React.FC<AiDiagnosticAssistProps> = ({
    loadingAi,
    aiSuggestions,
    onRequestDiagnostics,
    onCopyToNotes
}) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-left-4 pb-12">
            <div className="bg-zinc-900 border-2 border-orange-600/30 p-8 rounded-sm text-center relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-3xl font-rugged uppercase text-zinc-100 mb-2">AI Diagnostic Assist</h3>
                    <p className="text-zinc-500 text-sm max-w-xl mx-auto mb-8 uppercase font-bold tracking-widest">
                        Consulting expert system based on unit specs and technician log.
                    </p>
                    <Button
                        size="xl"
                        onClick={onRequestDiagnostics}
                        disabled={loadingAi}
                        className="min-w-64"
                    >
                        {loadingAi ? 'CONSULTING EXPERT SYSTEM...' : 'ANALYZE SYMPTOMS'}
                    </Button>
                </div>
                <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
                    <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                </div>
            </div>

            {aiSuggestions && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-zinc-900 border-l-4 border-orange-500 p-6 shadow-xl">
                            <h4 className="text-orange-500 font-rugged text-xl uppercase mb-4">Potential Causes</h4>
                            <ul className="space-y-3">
                                {aiSuggestions.potentialCauses.map((cause, i) => (
                                    <li key={i} className="flex gap-3 text-zinc-300 text-sm">
                                        <span className="text-orange-600 font-bold">0{i + 1}</span>
                                        {cause}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-zinc-900 border-l-4 border-emerald-500 p-6 shadow-xl">
                            <h4 className="text-emerald-500 font-rugged text-xl uppercase mb-4">Suggested Steps</h4>
                            <ul className="space-y-3">
                                {aiSuggestions.suggestedSteps.map((step, i) => (
                                    <li key={i} className="flex flex-col gap-2">
                                        <div className="flex gap-3 text-zinc-300 text-sm">
                                            <span className="text-emerald-600 font-bold">0{i + 1}</span>
                                            {step}
                                        </div>
                                        <button
                                            onClick={() => onCopyToNotes(step, "DIAGNOSTIC STEP")}
                                            className="text-[9px] font-black uppercase text-zinc-600 hover:text-emerald-500 self-end transition-colors"
                                        >
                                            [Add to Work Log]
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-zinc-900 border-2 border-blue-600/30 p-6 shadow-2xl rounded-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h4 className="text-blue-500 font-rugged text-2xl uppercase tracking-wider">Recommended Follow-up</h4>
                        </div>
                        <div className="space-y-4">
                            {aiSuggestions.missingInformation.map((info, i) => (
                                <div key={i} className="flex items-center justify-between group bg-zinc-950/50 p-3 border border-zinc-900 rounded-sm hover:border-blue-900/50 transition-all">
                                    <div className="flex items-start gap-4 pr-4">
                                        <div className="w-5 h-5 rounded-full border-2 border-blue-600/30 flex items-center justify-center shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                        <p className="text-zinc-300 text-sm italic">"{info}"</p>
                                    </div>
                                    <button
                                        onClick={() => onCopyToNotes(info, "FOLLOW-UP CHECK")}
                                        className="bg-blue-600/10 border border-blue-600/30 text-blue-400 text-[10px] font-black uppercase px-3 py-1.5 rounded-sm hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap"
                                    >
                                        Copy to Notes
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
