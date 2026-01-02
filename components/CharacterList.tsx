import React, { useEffect, useState } from 'react';
import { Character } from '../types';
import { getCharacters } from '../api';

interface CharacterListProps {
    onBack: () => void;
}

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {characters.map((char: Character) => (
                        <div 
                            key={char.id} 
                            className="group bg-[#0f0f0f] border border-[#333] hover:border-red-500 transition-all duration-300 flex flex-col items-center overflow-hidden hover:shadow-[0_0_15px_rgba(255,0,0,0.3)] hover:-translate-y-1 rounded-sm"
                        >
                            {/* Profile Image Section */}
                            <div className="w-full h-48 bg-black overflow-hidden relative border-b border-[#222] group-hover:border-red-500/50 transition-colors">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)] z-10 opacity-50 pointer-events-none"></div>
                                {char.image ? (
                                    <img 
                                        src={char.image} 
                                        alt={char.name} 
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 grayscale group-hover:grayscale-0"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#333] font-mono text-4xl tracking-widest">
                                        SEC-{char.id}
                                    </div>
                                )}
                                {/* Tech overlay lines */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>
                            </div>

                            {/* Text Content */}
                            <div className="p-4 text-center w-full relative flex-1 flex flex-col justify-center">
                                 {/* Decorative corners */}
                                 <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#555] group-hover:border-red-500 transition-colors"></div>
                                 <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#555] group-hover:border-red-500 transition-colors"></div>
                                 <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#555] group-hover:border-red-500 transition-colors"></div>
                                 <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#555] group-hover:border-red-500 transition-colors"></div>

                                <div className="text-xl font-bold text-white mb-2 tracking-wider group-hover:text-red-500 transition-colors">
                                    {char.name}
                                </div>
                                <div className="h-[1px] w-12 bg-gray-700 mx-auto mb-3 group-hover:bg-red-500 transition-colors"></div>
                                <div className="text-xs text-[#888] italic leading-relaxed px-2 line-clamp-3">
                                    {char.description}
                                </div>
                            </div>
                        </div>
                    ))}
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