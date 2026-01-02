import React, { useEffect, useState } from 'react';
import { Character } from '../types';
import { getCharacters } from '../api';

const CharacterList: React.FC = () => {
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
            <div className="relative z-10 w-[90%] max-w-[500px] p-10 text-center">
                <div className="text-red-500 text-xl font-mono tracking-widest animate-pulse">
                    {'>'} DECRYPTING ARCHIVES...
                    <br/>
                    <span className="text-xs text-gray-500 mt-2 block">FETCHING FROM /api/characters</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative z-10 w-[90%] max-w-[500px] bg-[#0a0a0a] border border-[#333] p-10 text-left shadow-[0_0_20px_rgba(0,0,0,0.8)] animate-[fadeIn_1s_forwards]">
            <h2 className="text-center text-white text-2xl mb-5 pb-2 border-b-2 border-red-500 tracking-widest">
                ACCESS GRANTED
            </h2>
            
            <div className="space-y-4">
                {characters.map((char: Character) => (
                    <div 
                        key={char.id} 
                        className="bg-[#111] border-l-[3px] border-red-500 p-4 transition-all duration-300 cursor-pointer hover:bg-[#222] hover:pl-6 group"
                    >
                        <div className="text-xl font-bold text-white group-hover:text-red-500 transition-colors">{char.name}</div>
                        <div className="text-sm text-[#888] mt-1 italic">{char.description}</div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-6 text-xs text-[#444]">
                CONNECTED TO BLACK PARADE SERVER
            </div>
        </div>
    );
};

export default CharacterList;