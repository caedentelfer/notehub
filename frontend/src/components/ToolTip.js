import { useState } from 'react';

function Tooltip({ message, children }) {
    const [visible, setVisible] = useState(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}
            {visible && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-2 w-max bg-gray-700 text-white text-sm p-2 rounded shadow-lg z-50">
                    {message}
                </div>
            )}
        </div>
    );
}

export default Tooltip;
