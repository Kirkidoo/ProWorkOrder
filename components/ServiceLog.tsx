import React, { useState } from 'react';
import { ServiceNote } from '../types';
import { Button } from './Button';

interface ServiceLogProps {
    notes: ServiceNote[];
    onAddNote: (content: string) => void;
    onDeleteNote: (id: string) => void;
    onEditNote: (id: string, content: string) => void;
}

export const ServiceLog: React.FC<ServiceLogProps> = ({ notes, onAddNote, onDeleteNote, onEditNote }) => {
    const [newNote, setNewNote] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        onAddNote(newNote);
        setNewNote('');
    };

    const startEditing = (note: ServiceNote) => {
        setEditingId(note.id);
        setEditContent(note.content);
    };

    const handleSaveEdit = (id: string) => {
        if (!editContent.trim()) return;
        onEditNote(id, editContent);
        setEditingId(null);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-left-4">
            <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                    className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 rounded-sm outline-none focus:border-orange-500 text-zinc-100"
                    placeholder="Add service update or internal note..."
                    rows={3}
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                />
                <div className="flex justify-end">
                    <Button type="submit">Post Update</Button>
                </div>
            </form>

            <div className="space-y-4">
                {notes.map(note => (
                    <div key={note.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-sm relative group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">{note.author}</span>
                            <span className="text-[10px] font-mono text-zinc-600">{note.timestamp}</span>
                        </div>

                        {editingId === note.id ? (
                            <div className="space-y-3">
                                <textarea
                                    className="w-full bg-zinc-950 border border-zinc-700 p-3 rounded-sm outline-none focus:border-orange-500 text-zinc-100 text-sm"
                                    rows={3}
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                                    <Button size="sm" onClick={() => handleSaveEdit(note.id)}>Save Changes</Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="text-zinc-300 whitespace-pre-wrap">{note.content}</p>
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => startEditing(note)}
                                        className="text-[10px] font-black uppercase text-zinc-500 hover:text-orange-500 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDeleteNote(note.id)}
                                        className="text-[10px] font-black uppercase text-zinc-500 hover:text-red-500 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {notes.length === 0 && (
                    <p className="text-center py-10 text-zinc-700 uppercase font-black tracking-widest italic">
                        No service updates logged yet.
                    </p>
                )}
            </div>
        </div>
    );
};
