// frontend/src/components/CustomEditor.js

import React, { useRef, useEffect } from 'react';

const CustomEditor = ({ value, onChange, onCursorChange }) => {
    const editorRef = useRef(null);

    // Update the contenteditable div when `value` changes externally
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerText !== value) {
            editorRef.current.innerText = value;
        }
    }, [value]);

    // Handle input events
    const handleInput = (e) => {
        const text = e.target.innerText;
        onChange(text);
    };

    // Handle cursor position changes
    const handleSelectionChange = () => {
        if (!editorRef.current) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editorRef.current);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const caretPosition = preCaretRange.toString().split('\n').length;

        onCursorChange(caretPosition);
    };

    useEffect(() => {
        document.addEventListener('selectionchange', handleSelectionChange);
        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
        };
    }, []);

    return (
        <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            className="w-full h-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ whiteSpace: 'pre-wrap', minHeight: '400px', backgroundColor: '#f3f4f6' }}
        ></div>
    );
};

export default CustomEditor;
