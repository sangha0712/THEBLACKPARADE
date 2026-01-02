import React, { useState, useEffect } from 'react';
import { login } from '../api';

interface LoginFormProps {
    onLoginSuccess: () => void;
    onLoginFail: (attempts: number) => void;
    currentAttempts: number;
    maxAttempts: number;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onLoginFail, currentAttempts, maxAttempts }) => {
    const [password, setPassword] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' | 'neutral' } | null>(null);

    useEffect(() => {
        if (isShaking) {
            const timer = setTimeout(() => setIsShaking(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isShaking]);

    const handleAttempt = async () => {
        if (!password || isLoading) return;

        setIsLoading(true);
        setMessage({ text: "ESTABLISHING SECURE UPLINK...", type: 'neutral' });

        try {
            const isSuccess = await login(password);

            if (isSuccess) {
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
                STATUS: {isLoading ? <span className="text-yellow-500 animate-pulse">HANDSHAKING...</span> : 'WAITING FOR INPUT...'}
                {currentAttempts > 0 && !isLoading && (
                     <div className="text-red-500 font-bold mt-2 animate-pulse">
                        FAILED ATTEMPTS: {currentAttempts}
                     </div>
                )}
            </div>

            <input 
                type="password" 
                value={password}
                disabled={isLoading}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAttempt();
                }}
                placeholder={isLoading ? "PROCESSING..." : "PASSWORD"}
                className={`w-[80%] bg-[#111] border border-[#444] text-red-500 p-4 text-xl font-mono outline-none mb-5 text-center transition-all duration-300 focus:border-red-500 focus:shadow-[0_0_10px_rgba(255,0,0,0.5)] placeholder-gray-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            
            <br />
            
            <button 
                onClick={handleAttempt}
                disabled={isLoading}
                className={`bg-[#222] text-white border border-white py-2 px-8 text-base transition-all duration-300 ${isLoading ? 'opacity-50 cursor-wait' : 'hover:bg-red-500 hover:text-black hover:font-bold hover:border-red-500 cursor-pointer'}`}
            >
                {isLoading ? 'CONNECTING...' : '접속'}
            </button>

            <div className={`mt-5 min-h-[40px] text-sm font-bold ${message?.type === 'success' ? 'text-[#00ff00]' : message?.type === 'neutral' ? 'text-yellow-500' : 'text-[#ff0000]'}`}>
                {message?.text && (
                    <span dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br/>') }}></span>
                )}
            </div>
        </div>
    );
};

export default LoginForm;