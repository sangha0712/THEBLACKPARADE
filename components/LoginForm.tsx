import React, { useState, useEffect, useRef } from 'react';
import { login } from '../api';

interface LoginFormProps {
    onLoginSuccess: () => void;
    onLoginFail: (attempts: number) => void;
    currentAttempts: number;
    maxAttempts: number;
}

const HACKER_LOGS = [
    "INITIALIZING HANDSHAKE PROTOCOL...",
    "BYPASSING FIREWALL (PORT 443)...",
    "DECRYPTING SHA-256 HASH...",
    "INJECTING SQL PAYLOAD...",
    "ACCESSING MAINFRAME ROOT...",
    "OVERRIDING SECURITY NODES...",
    "SEARCHING FOR BACKDOOR...",
    "TOKEN EXCHANGE INITIATED...",
    "VERIFYING BIOMETRIC DATA...",
    "UPLOADING VIRAL SIGNATURE...",
    "CLEARING SYSTEM LOGS...",
    "ESTABLISHING SECURE TUNNEL...",
    "DOWNLOADING ENCRYPTED PACKETS...",
    "BRUTE-FORCING HEX KEYS..."
];

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onLoginFail, currentAttempts, maxAttempts }) => {
    const [password, setPassword] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' | 'neutral' } | null>(null);
    
    // Hacker logs state
    const [logs, setLogs] = useState<string[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Shake effect timer
    useEffect(() => {
        if (isShaking) {
            const timer = setTimeout(() => setIsShaking(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isShaking]);

    // Auto-scroll logs
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    // Log generation effect
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isLoading) {
            setLogs(["> SYSTEM UPLINK STARTED..."]);
            interval = setInterval(() => {
                setLogs(prev => {
                    const randomLog = HACKER_LOGS[Math.floor(Math.random() * HACKER_LOGS.length)];
                    const hexPrefix = `0x${Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0')}`;
                    return [...prev, `[${hexPrefix}] ${randomLog}`].slice(-8); // Keep last 8 lines
                });
            }, 150);
        } else {
            setLogs([]);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleAttempt = async () => {
        if (!password || isLoading) return;

        setIsLoading(true);
        // Message is hidden during loading in favor of logs, but we keep the state ready
        setMessage(null); 

        try {
            const isSuccess = await login(password);

            if (isSuccess) {
                // Final success log
                setLogs(prev => [...prev, ">> ACCESS GRANTED <<"]);
                await new Promise(r => setTimeout(r, 500)); // Brief pause to see success
                
                setMessage({ text: "IDENTITY VERIFIED. ACCESS GRANTED.", type: 'success' });
                onLoginSuccess();
            } else {
                const newCount = currentAttempts + 1;
                setIsShaking(true);
                setPassword('');
                
                if (newCount >= maxAttempts) {
                    setMessage({ text: "CRITICAL ERROR. SYSTEM LOCKDOWN INITIATED.", type: 'error' });
                } else {
                    setMessage({ text: "ACCESS DENIED. INVALID CREDENTIALS.", type: 'error' });
                }
                
                onLoginFail(newCount);
            }
        } catch (e) {
            setMessage({ text: "NETWORK ERROR. RETRY REQUIRED.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`relative z-10 w-[90%] max-w-[500px] bg-[#0a0a0a] border border-[#333] p-10 text-center shadow-[0_0_20px_rgba(0,0,0,0.8)] transition-transform duration-100 ${isShaking ? 'animate-shake' : ''}`}>
            <h1 className="text-4xl text-white mb-2 tracking-[5px] drop-shadow-[2px_2px_0_rgba(255,0,0,1)]">
                BLACK PARADE
            </h1>
            
            <div className="text-sm text-[#555] mb-8 py-2 border-y border-dashed border-[#333] leading-relaxed">
                SYSTEM: SECURE<br/>
                SERVER: NESTJS-CORE-V9<br/>
                STATUS: {isLoading ? <span className="text-[#00ff00] animate-pulse">INTRUSION IN PROGRESS...</span> : 'WAITING FOR INPUT...'}
                {currentAttempts > 0 && !isLoading && (
                     <div className="text-red-500 font-bold mt-2 animate-pulse">
                        FAILED ATTEMPTS: {currentAttempts}
                     </div>
                )}
            </div>

            {isLoading ? (
                // Hacker Log View
                <div className="w-full bg-black border border-[#00ff00] p-4 mb-5 text-left h-[160px] overflow-hidden flex flex-col justify-end shadow-[inset_0_0_10px_rgba(0,255,0,0.2)]">
                    {logs.map((log, i) => (
                        <div key={i} className="text-[#00ff00] font-mono text-xs leading-tight opacity-90 truncate">
                            {log}
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            ) : (
                // Normal Input View
                <>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAttempt();
                        }}
                        placeholder="PASSWORD"
                        className={`w-[80%] bg-[#111] border border-[#444] text-red-500 p-4 text-xl font-mono outline-none mb-5 text-center transition-all duration-300 focus:border-red-500 focus:shadow-[0_0_10px_rgba(255,0,0,0.5)] placeholder-gray-700`}
                    />
                    
                    <br />
                    
                    <button 
                        onClick={handleAttempt}
                        className={`bg-[#222] text-white border border-white py-2 px-8 text-base transition-all duration-300 hover:bg-red-500 hover:text-black hover:font-bold hover:border-red-500 cursor-pointer`}
                    >
                        접속
                    </button>
                </>
            )}

            <div className={`mt-5 min-h-[40px] text-sm font-bold ${message?.type === 'success' ? 'text-[#00ff00]' : message?.type === 'neutral' ? 'text-yellow-500' : 'text-[#ff0000]'}`}>
                {message?.text && !isLoading && (
                    <span dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br/>') }}></span>
                )}
            </div>
        </div>
    );
};

export default LoginForm;