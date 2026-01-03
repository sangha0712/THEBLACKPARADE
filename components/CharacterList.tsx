import React, { useEffect, useState } from 'react';
import { Character } from '../types';
import { getCharacters } from '../api';

interface CharacterListProps {
    onBack: () => void;
}

// Extracted CharacterCard to prevent re-creation on parent renders and ensure state stability
const CharacterCard: React.FC<{ char: Character; isSpecial: boolean }> = ({ char, isSpecial }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="relative cursor-pointer h-full pt-2 pb-2" // Stable hit area with padding
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* INNER VISUAL CARD */}
            <div 
                className={`flex flex-col items-center overflow-hidden transition-all duration-300 ease-out rounded-sm relative h-full
                ${isHovered ? '-translate-y-2' : 'translate-y-0'} 
                ${isSpecial 
                    ? `bg-[#150505] border ${isHovered ? 'border-red-500 shadow-[0_10px_25px_rgba(255,0,0,0.5)]' : 'border-red-900/60'}` 
                    : `bg-[#0f0f0f] border ${isHovered ? 'border-red-500 shadow-[0_10px_20px_rgba(255,0,0,0.3)]' : 'border-[#333]'}`
                }`}
            >
                {/* Special Priority Badge */}
                {isSpecial && (
                    <div className="absolute top-2 right-2 z-30 bg-red-600 text-black text-[10px] font-black px-2 py-0.5 tracking-widest animate-pulse pointer-events-none">
                        PRIORITY
                    </div>
                )}

                {/* Profile Image Section */}
                <div className={`w-full h-48 bg-black overflow-hidden relative border-b transition-colors duration-300
                    ${isSpecial 
                        ? (isHovered ? 'border-red-500' : 'border-red-900/30') 
                        : (isHovered ? 'border-red-500/50' : 'border-[#222]')
                    }`}>
                    
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)] z-10 opacity-50 pointer-events-none"></div>
                    
                    {char.image ? (
                        <img 
                            src={char.image} 
                            alt={char.name} 
                            className={`w-full h-full object-cover transition-all duration-500 
                            ${isHovered ? 'opacity-100 scale-110 grayscale-0' : 'opacity-80 scale-100 grayscale'}`}
                        />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center font-mono text-4xl tracking-widest
                            ${isSpecial ? 'text-red-900' : 'text-[#333]'}`}>
                            SEC-{char.id}
                        </div>
                    )}
                    {/* Tech overlay lines */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>
                </div>

                {/* Text Content */}
                <div className="p-4 text-center w-full relative flex-1 flex flex-col justify-center">
                     {/* Decorative corners - color transition */}
                     <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l transition-colors duration-300 ${isHovered ? 'border-red-500' : 'border-[#555]'}`}></div>
                     <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r transition-colors duration-300 ${isHovered ? 'border-red-500' : 'border-[#555]'}`}></div>
                     <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l transition-colors duration-300 ${isHovered ? 'border-red-500' : 'border-[#555]'}`}></div>
                     <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-colors duration-300 ${isHovered ? 'border-red-500' : 'border-[#555]'}`}></div>

                    <div className={`text-xl font-bold mb-2 tracking-wider transition-colors duration-300
                        ${isSpecial 
                            ? (isHovered ? 'text-red-400' : 'text-red-500') 
                            : (isHovered ? 'text-red-500' : 'text-white')
                        }`}>
                        {char.name}
                    </div>
                    <div className={`h-[1px] w-12 mx-auto mb-3 transition-colors duration-300
                        ${isSpecial 
                            ? (isHovered ? 'bg-red-500' : 'bg-red-800') 
                            : (isHovered ? 'bg-red-500' : 'bg-gray-700')
                        }`}></div>
                    <div className="text-xs text-[#888] italic leading-relaxed px-2 line-clamp-3">
                        {char.description}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CharacterList: React.FC<CharacterListProps> = ({ onBack }) => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getCharacters();
            setCharacters(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    // Filter characters into Special (1,2,3) and Regular groups
    const specialIds = ['1', '2', '3'];
    const specialChars = characters.filter(c => specialIds.includes(c.id));
    const regularChars = characters.filter(c => !specialIds.includes(c.id));

    if (loading) {
        return (
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-10 text-center">
                <div className="text-red-500 text-xl font-mono tracking-widest animate-pulse">
                    {'>'} DECRYPTING ARCHIVES...
                    <br/>
                    <span className="text-xs text-gray-500 mt-2 block">FETCHING FROM /api/characters</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative z-10 w-full h-full bg-[#0a0a0a] flex flex-col animate-[fadeIn_0.5s_forwards]">
            
            {/* Header */}
            <div className="shrink-0 p-6 border-b border-[#333] flex flex-row justify-between items-center bg-[#0a0a0a] z-20 sticky top-0">
                <h2 className="text-white text-xl md:text-2xl tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,0,0,0.5)] truncate">
                    PERSONNEL FILES
                </h2>
                <button 
                    onClick={onBack}
                    className="bg-[#0f0f0f] border border-red-800 text-red-600 px-4 py-1 md:px-6 md:py-2 hover:bg-red-600 hover:text-black transition-all duration-300 font-mono text-xs md:text-sm font-bold tracking-wider shadow-[0_0_10px_rgba(255,0,0,0.2)] hover:shadow-[0_0_20px_rgba(255,0,0,0.6)] whitespace-nowrap"
                >
                    [ LOGOUT ]
                </button>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#050505] [&::-webkit-scrollbar-thumb]:bg-[#333] [&::-webkit-scrollbar-thumb]:hover:bg-red-600 transition-colors">
                
                {/* Special Priority Section (ID 1-3) */}
                {specialChars.length > 0 && (
                    <div className="mb-12 animate-[fadeIn_0.5s_ease-out]">
                        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-red-900/30">
                            <div className="w-2 h-2 bg-red-600 animate-pulse"></div>
                            <h3 className="text-red-500 font-mono text-lg tracking-[0.2em] font-bold">
                                ELITE SQUAD // CLASS-S
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {specialChars.map(char => (
                                <CharacterCard key={char.id} char={char} isSpecial={true} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Regular Personnel Section */}
                <div className="animate-[fadeIn_0.7s_ease-out]">
                     <div className="flex items-center gap-3 mb-6 pb-2 border-b border-[#333]">
                        <div className="w-2 h-2 bg-gray-600"></div>
                        <h3 className="text-gray-500 font-mono text-lg tracking-[0.2em] font-bold">
                            STANDARD UNITS
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {regularChars.map(char => (
                             <CharacterCard key={char.id} char={char} isSpecial={false} />
                        ))}
                    </div>
                </div>

            </div>

            {/* Footer (Fixed) */}
            <div className="shrink-0 p-3 border-t border-[#333] flex justify-between items-center text-[10px] md:text-xs text-[#555] font-mono bg-[#0a0a0a] z-20">
                <span>SECURE CONNECTION ESTABLISHED</span>
                <span className="animate-pulse text-green-700">● LIVE</span>
            </div>
        </div>
    );
};

export default CharacterList;