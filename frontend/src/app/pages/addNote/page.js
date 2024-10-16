"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // For navigating to notes page after adding

import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Tooltip from '../../../components/ToolTip';

export default function AddNote() {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const router = useRouter();  // Correct for App Router

    const handleAddNote = () => {
        if (title && category) {
            // Send new note to the backend
            fetch('http://localhost:3001/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title,
                    last_update: new Date().toISOString().split('T')[0],
                    category_name: category,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log('Note added:', data);
                    router.push('/pages/notes'); // Navigate back to notes page after adding
                })
                .catch((err) => console.error('Error adding note:', err));
        } else {
            alert("Please fill out both fields");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            <Header />
            <main className="flex-grow container mx-auto px-6 py-8">
                <h1 className="text-4xl font-extrabold text-blue-900 mb-6">Add a New Note</h1>
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-blue-900 mb-2">Note Title</label>
                        <Tooltip message = "Enter a brief and descriptive title for your note">   
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter note title"
                            />
                        </Tooltip>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-blue-900 mb-2">Category</label>
                        <Tooltip message = "Enter a category to organise your notes such as 'Work' or 'Personal'">
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter category"
                            />
                        </Tooltip>
                    </div>
                    <Tooltip message = "Click to add your note. Ensure both fields are filled out">
                        <button
                            onClick={handleAddNote}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg"
                        >
                            Add Note
                        </button>
                    </Tooltip>
                </div>
            </main>
            <Footer />
        </div>
    );
}