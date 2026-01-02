import React, { useEffect, useState, useRef } from 'react';

interface TransitionScreenProps {
    onComplete: () => void;
}

const TransitionScreen: React.FC<TransitionScreenProps> = ({ onComplete }) => {
    const [lines, setLines] = useState<string[]>([]);
    const [showTitle, setShowTitle] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*[]{}<>/|\\';
        
        const interval = setInterval(() => {
            const randomStr = Array(Math.floor(Math.random() * 80) + 20)
                .fill(0)
                .map(() => chars[Math.floor(Math.random() * chars.length)])
                .join('');
            
            setLines(prev => {
                const newLines = [...prev, `> ${randomStr}`];
                return newLines.slice(-50); // Keep DOM light
            });
            
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 30);

        // Show "ACCESS COMPLETED" after 2.5s
        const timer1 = setTimeout(() => {
            setShowTitle(true);
        }, 2500);

        // Complete after 4s
        const timer2 = setTimeout(() => {
            onComplete();
        }, 4000);

        return () => {
            clearInterval(interval);
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center font-mono overflow-hidden">
             {/* Background Scrolling Text */}
            <div ref={scrollRef} className="absolute inset-0 p-4 text-[#00ff00] opacity-40 text-xs md:text-sm overflow-hidden leading-tight whitespace-nowrap font-bold">
                {lines.map((line, i) => (
                    <div key={i} style={{ textShadow: '0 0 5px #00ff00' }}>{line}</div>
                ))}
            </div>
            
            {/* Central Overlay Content */}
            <div className="relative z-10 flex flex-col items-center">
                {showTitle ? (
                    <div className="animate-[pulse_0.2s_ease-in-out_infinite] text-center">
                        <div className="text-5xl md:text-8xl font-black text-[#00ff00] tracking-tighter drop-shadow-[0_0_20px_rgba(0,255,0,1)] border-y-8 border-[#00ff00] py-6 bg-black">
                            ACCESS<br/>COMPLETED
                        </div>
                    </div>
                ) : (
                    <div className="text-[#00ff00] text-2xl md:text-3xl font-bold tracking-[0.2em] animate-pulse bg-black px-4 py-2 border border-[#00ff00]">
                        ESTABLISHING SECURE UPLINK...
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransitionScreen;