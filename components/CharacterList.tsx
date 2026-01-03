import React, { useEffect, useState, useRef } from 'react';
import { Character } from '../types';
import { getCharacters } from '../api';

interface CharacterListProps {
    onBack: () => void;
}

// New Status Type
type CharacterStatus = 'ALIVE' | 'DELETED' | 'MISSING';

interface CharacterCardProps {
    char: Character;
    isSpecial: boolean;
    status: CharacterStatus;
    onClick: () => void;
}

// STORAGE KEY (Updated for new data structure)
const STATUS_STORAGE_KEY = 'BLACK_PARADE_CHARACTER_STATUS_V2';

// Visual Component for Deleted State (Noise + Staircase)
const DeletedVisuals = () => (
    <>
        {/* Staircase/Banding Effect */}
        <div className="absolute inset-0 z-20 pointer-events-none bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_4px,rgba(0,0,0,0.8)_4px,rgba(0,0,0,0.8)_8px)] mix-blend-hard-light"></div>
        {/* Noise Effect (using global noise-bg class) */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-50 mix-blend-overlay">
            <div className="noise-bg"></div>
        </div>
        {/* Desaturation/Darkening Overlay */}
        <div className="absolute inset-0 z-10 bg-black/40 pointer-events-none mix-blend-multiply"></div>
    </>
);

// --- HEARTBEAT MONITOR COMPONENT ---
const HeartbeatMonitor: React.FC<{ status: CharacterStatus }> = ({ status }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let x = 0;
        let lastY = 50; // Center (height/2)
        const speed = 2;
        
        // Setup logic to run after layout
        const init = () => {
            canvas.width = container.clientWidth;
            canvas.height = 100; // Fixed height
            
            // Clear initially
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw Grid (Static Background) - We will redraw grid lines in the loop slightly differently
            // or just let the black overwrite them. For simplicity in this style, we verify scan logic.
        };

        // Resize handling
        const resizeObserver = new ResizeObserver(() => {
             window.requestAnimationFrame(() => {
                if (canvas && container) {
                    init();
                    x = 0; // Reset position on resize
                }
            });
        });
        resizeObserver.observe(container);

        // EKG Pattern Logic
        // Sequence of Y offsets from center
        const normalPattern = [0, 0, 0, -5, 5, -20, 40, -10, 0, 0, 0, 0, 0, 0, 0];
        let patternIndex = 0;
        let frameCount = 0;

        const render = () => {
            if (!canvas || !ctx) return;

            // 1. "Eraser Bar" - Erase a small portion ahead of the current x
            // This prevents the "Flicker" of clearing the whole screen
            ctx.fillStyle = '#000000';
            const eraseWidth = 10;
            ctx.fillRect(x, 0, eraseWidth + speed, canvas.height);

            // 2. Draw Grid Lines (Only in the erased section to maintain background)
            ctx.strokeStyle = 'rgba(0, 50, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            // Vertical grid line check
            if (x % 20 < speed) { 
                ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); 
            }
            // Horizontal grid lines are tricky with partial erase, 
            // so we re-draw horizontal lines in the erased chunk
            for (let i = 0; i < canvas.height; i += 20) {
                ctx.moveTo(x, i); ctx.lineTo(x + eraseWidth, i);
            }
            ctx.stroke();

            // 3. Draw Heartbeat Line
            ctx.strokeStyle = status === 'DELETED' ? '#ff0000' : (status === 'MISSING' ? '#ffff00' : '#00ff00');
            ctx.lineWidth = 2;
            ctx.shadowBlur = status === 'DELETED' ? 2 : 5;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(x, lastY);

            // Calculate Next Point
            let nextY = 50; // Center default

            if (status === 'DELETED') {
                // Flatline - Fixed center
                nextY = 50;
            } else {
                // Alive or Missing (EKG Pattern)
                if (frameCount % 3 === 0) { // Update Y every few frames
                     const p = normalPattern[patternIndex % normalPattern.length];
                     nextY = 50 + p;
                     patternIndex++;
                } else {
                    nextY = lastY; // Hold position
                }
            }
            
            x += speed; // Move forward
            
            // Loop screen logic
            if (x > canvas.width) {
                x = 0;
                ctx.moveTo(0, nextY); // Move path start to beginning without drawing
                // Do NOT clearRect here. The "Eraser Bar" at the top of loop handles the clearing.
            }

            ctx.lineTo(x, nextY);
            ctx.stroke();

            lastY = nextY;
            frameCount++;
            animationFrameId = requestAnimationFrame(render);
        };

        // Start animation
        init();
        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
        };
    }, [status]);

    return (
        <div ref={containerRef} className="w-full bg-black border border-[#333] mt-2 relative h-[100px] overflow-hidden">
            <div className="absolute top-1 left-2 text-[10px] font-mono tracking-widest z-10 flex gap-2">
                <span className={`${status === 'DELETED' ? 'text-red-500' : (status === 'MISSING' ? 'text-yellow-500' : 'text-green-500')}`}>
                    BPM: {status === 'DELETED' ? '0' : (status === 'MISSING' ? 'ERR' : '72')}
                </span>
                <span className="text-gray-600">ECG_LEAD_II</span>
            </div>
            <canvas ref={canvasRef} className="block" />
        </div>
    );
};

// Extracted CharacterCard
const CharacterCard: React.FC<CharacterCardProps> = ({ char, isSpecial, status, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Badge styling based on status
    const getBadgeStyle = () => {
        switch (status) {
            case 'DELETED': return 'bg-red-600 text-black';
            case 'MISSING': return 'bg-yellow-500 text-black'; // DISAPPEARED
            case 'ALIVE': return 'bg-[#00ff00] text-black';
            default: return 'bg-[#00ff00] text-black';
        }
    };

    const getBadgeText = () => {
        switch (status) {
            case 'DELETED': return 'DELETED';
            case 'MISSING': return 'DISAPPEARED';
            case 'ALIVE': return 'ALIVE';
        }
    };

    return (
        <div 
            className="relative cursor-pointer h-full pt-2 pb-2" 
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
                {/* Status Badge (Replacing Priority) */}
                {isSpecial && (
                    <div className={`absolute top-2 right-2 z-30 text-[10px] font-black px-2 py-0.5 tracking-widest animate-pulse pointer-events-none ${getBadgeStyle()}`}>
                        {getBadgeText()}
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
                            ${status === 'DELETED' ? 'grayscale contrast-125 brightness-50' : (isHovered ? 'opacity-100 scale-110 grayscale-0' : 'opacity-80 scale-100 grayscale')}`}
                        />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center font-mono text-4xl tracking-widest
                            ${isSpecial ? 'text-red-900' : 'text-[#333]'}`}>
                            SEC-{char.id}
                        </div>
                    )}

                    {/* DELETED VISUAL EFFECTS */}
                    {status === 'DELETED' && <DeletedVisuals />}

                    {/* Tech overlay lines */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>
                </div>

                {/* Text Content */}
                <div className="p-4 text-center w-full relative flex-1 flex flex-col justify-center">
                     {/* Decorative corners */}
                     <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l transition-colors duration-300 ${isHovered ? 'border-red-500' : 'border-[#555]'}`}></div>
                     <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r transition-colors duration-300 ${isHovered ? 'border-red-500' : 'border-[#555]'}`}></div>
                     <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l transition-colors duration-300 ${isHovered ? 'border-red-500' : 'border-[#555]'}`}></div>
                     <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-colors duration-300 ${isHovered ? 'border-red-500' : 'border-[#555]'}`}></div>

                    <div className={`text-xl font-bold mb-2 tracking-wider transition-colors duration-300
                        ${isSpecial 
                            ? (isHovered ? 'text-red-400' : 'text-red-500') 
                            : (isHovered ? 'text-red-500' : 'text-white')
                        } ${status === 'DELETED' ? 'line-through decoration-red-600 decoration-2 opacity-50' : ''}`}>
                        {char.name}
                    </div>
                    <div className={`h-[1px] w-12 mx-auto mb-3 transition-colors duration-300
                        ${isSpecial 
                            ? (isHovered ? 'bg-red-500' : 'bg-red-800') 
                            : (isHovered ? 'bg-red-500' : 'bg-gray-700')
                        }`}></div>
                    <div className="text-xs text-[#888] italic leading-relaxed px-2 line-clamp-3">
                        {status === 'DELETED' ? 'FILE CORRUPTED // DELETED' : (status === 'MISSING' ? 'LOCATION UNKNOWN // MISSING' : char.description)}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Detail View Component
const CharacterDetail: React.FC<{ 
    char: Character; 
    status: CharacterStatus; 
    onChangeStatus: (s: CharacterStatus) => void; 
    onClose: () => void 
}> = ({ char, status, onChangeStatus, onClose }) => {
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
                                    <img 
                                        src={char.image} 
                                        alt={char.name} 
                                        className={`w-full h-full object-cover transition-all duration-500 ${status === 'DELETED' ? 'grayscale contrast-125 brightness-50' : 'contrast-110'}`} 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#050505] text-[#333] font-mono text-6xl">
                                        ?
                                    </div>
                                )}
                                <div className="absolute inset-0 ring-1 ring-inset ring-red-900/30 pointer-events-none"></div>
                                
                                {/* DELETED VISUAL EFFECTS */}
                                {status === 'DELETED' && <DeletedVisuals />}
                            </div>
                            
                            {/* Stats decoration */}
                            <div className="mt-2 flex justify-between text-[10px] font-mono text-gray-600">
                                <span>SYNC_RATE: {status === 'DELETED' ? '0.0%' : (status === 'MISSING' ? '12.4%' : '98.4%')}</span>
                                <span className={status === 'DELETED' ? 'text-red-700 font-bold' : (status === 'MISSING' ? 'text-yellow-600 font-bold' : '')}>
                                    STATUS: {status === 'DELETED' ? 'TERMINATED' : (status === 'MISSING' ? 'UNKNOWN' : 'ACTIVE')}
                                </span>
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
                                    <div className="text-gray-200 text-lg md:text-xl font-bold">
                                        {['1', '2', '3'].includes(char.id) ? 'ZERO HOUR' : 'BLACK PARADE'}
                                    </div>
                                </div>
                                <div className="bg-[#111] border border-[#333] p-4">
                                    <div className="text-sm md:text-base text-[#666] mb-1 font-bold">CLEARANCE</div>
                                    <div className="text-red-400 text-lg md:text-xl font-bold">LEVEL {['1','2','3'].includes(char.id) ? '5 (MAX)' : '3'}</div>
                                </div>
                            </div>

                            {/* Status Control Panel (3 Buttons) */}
                            <div className="w-full grid grid-cols-3 gap-0 border border-[#333] mt-2">
                                {/* Button 1: MISSING (실종) - Yellow */}
                                <button
                                    onClick={() => onChangeStatus('MISSING')}
                                    className={`py-3 font-mono font-bold tracking-wider text-sm md:text-base transition-all duration-300 border-r border-[#333] relative group overflow-hidden
                                        ${status === 'MISSING' 
                                            ? 'bg-yellow-900/30 text-yellow-500 shadow-[inset_0_0_20px_rgba(255,200,0,0.2)] border-b-2 border-yellow-500' 
                                            : 'bg-[#0a0a0a] text-gray-600 hover:text-yellow-500 hover:bg-[#111]'}`}
                                >
                                    실종
                                </button>
                                
                                {/* Button 2: DELETED - Red */}
                                <button
                                    onClick={() => onChangeStatus('DELETED')}
                                    className={`py-3 font-mono font-bold tracking-wider text-sm md:text-base transition-all duration-300 border-r border-[#333] relative group overflow-hidden
                                        ${status === 'DELETED' 
                                            ? 'bg-red-900/30 text-red-600 shadow-[inset_0_0_20px_rgba(255,0,0,0.2)] border-b-2 border-red-600' 
                                            : 'bg-[#0a0a0a] text-gray-600 hover:text-red-500 hover:bg-[#111]'}`}
                                >
                                    DELETED
                                </button>
                                
                                {/* Button 3: ALIVE - Green */}
                                <button
                                    onClick={() => onChangeStatus('ALIVE')}
                                    className={`py-3 font-mono font-bold tracking-wider text-sm md:text-base transition-all duration-300 relative group overflow-hidden
                                        ${status === 'ALIVE' 
                                            ? 'bg-green-900/30 text-[#00ff00] shadow-[inset_0_0_20px_rgba(0,255,0,0.2)] border-b-2 border-[#00ff00]' 
                                            : 'bg-[#0a0a0a] text-gray-600 hover:text-[#00ff00] hover:bg-[#111]'}`}
                                >
                                    ALIVE
                                </button>
                            </div>
                            
                            {/* Heartbeat Monitor Graph */}
                            <HeartbeatMonitor status={status} />

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
    
    // Store status as a map: ID -> Status
    const [charStatuses, setCharStatuses] = useState<Record<string, CharacterStatus>>({});

    useEffect(() => {
        const fetchData = async () => {
            const data = await getCharacters();
            setCharacters(data);
            setLoading(false);
        };
        fetchData();

        // Load status from localStorage
        try {
            const stored = localStorage.getItem(STATUS_STORAGE_KEY);
            if (stored) {
                setCharStatuses(JSON.parse(stored));
            } else {
                // Fallback: check for old key version and migrate if necessary
                const oldDeleted = localStorage.getItem('BLACK_PARADE_DELETED_RECORDS');
                if (oldDeleted) {
                    const deletedList: string[] = JSON.parse(oldDeleted);
                    const newStatusMap: Record<string, CharacterStatus> = {};
                    deletedList.forEach(id => { newStatusMap[id] = 'DELETED'; });
                    setCharStatuses(newStatusMap);
                }
            }
        } catch (e) {
            console.error("Failed to load status records", e);
        }
    }, []);

    const handleStatusChange = (id: string, newStatus: CharacterStatus) => {
        const updated = { ...charStatuses, [id]: newStatus };
        setCharStatuses(updated);
        localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(updated));
    };

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
        const currentStatus = charStatuses[selectedCharacter.id] || 'ALIVE';
        return (
            <CharacterDetail 
                char={selectedCharacter} 
                status={currentStatus}
                onChangeStatus={(s) => handleStatusChange(selectedCharacter.id, s)}
                onClose={() => setSelectedCharacter(null)} 
            />
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
                                <CharacterCard 
                                    key={char.id} 
                                    char={char} 
                                    isSpecial={true} 
                                    status={charStatuses[char.id] || 'ALIVE'}
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
                                status={charStatuses[char.id] || 'ALIVE'}
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