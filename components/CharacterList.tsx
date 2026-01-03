import React, { useEffect, useState } from 'react';
import { Character } from '../types';
import { getCharacters } from '../api';

interface CharacterListProps {
    onBack: () => void;
}

interface CharacterCardProps {
    char: Character;
    isSpecial: boolean;
    onClick: () => void;
}

// Extracted CharacterCard to prevent re-creation on parent renders and ensure state stability
const CharacterCard: React.FC<CharacterCardProps> = ({ char, isSpecial, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="relative cursor-pointer h-full pt-2 pb-2" // Stable hit area with padding
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
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

// Detail View Component
const CharacterDetail: React.FC<{ char: Character; onClose: () => void }> = ({ char, onClose }) => {
    return (
        <div className="w-full h-full bg-[#0a0a0a] flex flex-col animate-[fadeIn_0.3s_ease-out]">
            {/* Header */}
            <div className="shrink-0 p-6 border-b border-[#333] flex justify-between items-center sticky top-0 bg-[#0a0a0a] z-20">
                <div className="flex flex-col">
                     <h2 className="text-white text-xl md:text-2xl tracking-[0.2em] truncate flex items-center gap-3">
                        <span className="text-red-600 font-bold">{">>"}</span>
                        {char.name}
                    </h2>
                     <span className="text-[10px] text-gray-500 tracking-widest font-mono">ID: {char.id.padStart(4, '0')} // SECURE_FILE</span>
                </div>
               
                <button 
                    onClick={onClose}
                    className="bg-[#0f0f0f] border border-red-800 text-red-600 px-4 py-1 md:px-6 md:py-2 hover:bg-red-600 hover:text-black transition-all duration-300 font-mono text-xs md:text-sm font-bold tracking-wider whitespace-nowrap shadow-[0_0_10px_rgba(255,0,0,0.2)]"
                >
                    [ CLOSE FILE ]
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
                    {/* Visual Data Block */}
                    <div className="w-full md:w-5/12 shrink-0">
                        <div className="relative border border-[#333] bg-black p-1 group">
                            {/* Scanning line effect */}
                            <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(transparent_0%,rgba(255,0,0,0.1)_50%,transparent_100%)] bg-[length:100%_4px] opacity-20"></div>
                            
                            <div className="relative overflow-hidden aspect-[3/4]">
                                {char.image ? (
                                    <img src={char.image} alt={char.name} className="w-full h-full object-cover contrast-110 transition-all duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#050505] text-[#333] font-mono text-6xl">
                                        ?
                                    </div>
                                )}
                                <div className="absolute inset-0 ring-1 ring-inset ring-red-900/30 pointer-events-none"></div>
                            </div>
                            
                            {/* Stats decoration */}
                            <div className="mt-2 flex justify-between text-[10px] font-mono text-gray-600">
                                <span>SYNC_RATE: 98.4%</span>
                                <span>STATUS: ACTIVE</span>
                            </div>
                        </div>
                    </div>

                    {/* Text Data Block */}
                    <div className="w-full md:w-7/12 flex flex-col">
                        <div className="mb-8 border-l-2 border-red-600 pl-4 py-1 bg-gradient-to-r from-red-900/10 to-transparent">
                            <h1 className="text-3xl md:text-4xl text-white font-bold tracking-wider mb-1">{char.name}</h1>
                            <div className="text-red-500 font-mono text-lg md:text-xl tracking-[0.2em] mt-2">
                                {['1','2','3'].includes(char.id) ? 'CLASSIFIED // S-CLASS' : 'STANDARD PERSONNEL'}
                            </div>
                        </div>

                        <div className="space-y-6 font-mono text-base md:text-lg text-gray-300 leading-relaxed">
                            <div className="bg-[#111] border border-[#333] p-4 md:p-6 relative">
                                <span className="absolute -top-3 left-4 bg-[#0a0a0a] px-2 text-sm md:text-base text-red-700 font-bold tracking-widest">
                                    DATA_LOG
                                </span>
                                <p className="whitespace-pre-wrap pt-2">
                                    {char.description || "NO ADDITIONAL DATA FOUND."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#111] border border-[#333] p-4">
                                    <div className="text-sm md:text-base text-[#666] mb-1 font-bold">AFFILIATION</div>
                                    <div className="text-gray-200 text-lg md:text-xl font-bold">BLACK PARADE</div>
                                </div>
                                <div className="bg-[#111] border border-[#333] p-4">
                                    <div className="text-sm md:text-base text-[#666] mb-1 font-bold">CLEARANCE</div>
                                    <div className="text-red-400 text-lg md:text-xl font-bold">LEVEL {['1','2','3'].includes(char.id) ? '5 (MAX)' : '3'}</div>
                                </div>
                            </div>
                        </div>

                         <div className="mt-auto pt-8">
                             <div className="h-px w-full bg-[#333] mb-2"></div>
                             <div className="flex justify-between text-[10px] text-[#444] font-mono">
                                 <span>ENCRYPTED CONNECTION</span>
                                 <span>PACKET_LOSS: 0.00%</span>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
            
            {/* Footer (Fixed for Detail View) */}
            <div className="shrink-0 p-3 border-t border-[#333] flex justify-between items-center text-[10px] md:text-xs text-[#555] font-mono bg-[#0a0a0a] z-20">
                <span>FILE ACCESS LOGGED</span>
                <span className="animate-pulse text-red-700">● READING</span>
            </div>
        </div>
    );
};

const CharacterList: React.FC<CharacterListProps> = ({ onBack }) => {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

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

    if (selectedCharacter) {
        return <CharacterDetail char={selectedCharacter} onClose={() => setSelectedCharacter(null)} />;
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
                                <CharacterCard 
                                    key={char.id} 
                                    char={char} 
                                    isSpecial={true} 
                                    onClick={() => setSelectedCharacter(char)}
                                />
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
                             <CharacterCard 
                                key={char.id} 
                                char={char} 
                                isSpecial={false} 
                                onClick={() => setSelectedCharacter(char)}
                             />
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