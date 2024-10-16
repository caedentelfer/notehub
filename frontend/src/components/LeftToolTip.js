import { useState } from "react";

function LeftTooltip({ message, children }) {
  const [visible, setVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{ display: 'inline-block', width: '100%' }} // Ensures input doesn't shrink
    >
      {children}
      {visible && (
        <div 
          className="absolute -left-[50%] ml-2 w-max bg-gray-700 text-white text-sm p-2 rounded shadow-lg"
          style={{ top: '50%', transform: 'translateY(-50%)', whiteSpace: 'nowrap' }} // Centers the tooltip vertically with the input
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default LeftTooltip;
