import React from 'react';

const DeathScreen: React.FC = () => {
    return (
        <div className="absolute inset-0 bg-black z-[9999] flex flex-col justify-center items-center text-[#333] text-4xl font-bold animate-[fadeIn_2s_ease-in]">
            <div className="tracking-widest text-red-900 animate-pulse">SIGNAL LOST</div>
            <div className="text-base mt-4 text-gray-900">User Terminated.</div>
        </div>
    );
};

export default DeathScreen;