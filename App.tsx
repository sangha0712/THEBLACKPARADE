import React, { useState, useEffect, useCallback } from 'react';
import LoginForm from './components/LoginForm';
import CharacterList from './components/CharacterList';
import DeathScreen from './components/DeathScreen';
import TransitionScreen from './components/TransitionScreen';
import { AppState } from './types';
import { MAX_ATTEMPTS } from './constants';
import { playDeathNoise, initAudio, startAmbience } from './utils/sound';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.LOGIN);
    const [failCount, setFailCount] = useState(0);
    const [isGlitching, setIsGlitching] = useState(false);
    const [fadeOutLogin, setFadeOutLogin] = useState(false);
    const [showTransition, setShowTransition] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Setup Audio Context on first interaction to allow ambient sound
    useEffect(() => {
        const handleInteraction = async () => {
            await initAudio();
            startAmbience();
            // Remove listeners once activated
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, []);

    const handleLoginSuccess = useCallback(() => {
        // Start fade out animation for login form
        setFadeOutLogin(true);
        // Start full screen transition immediately
        setShowTransition(true);
    }, []);
    
    const handleTransitionComplete = useCallback(() => {
        setShowTransition(false);
        setAppState(AppState.CHARACTERS);
    }, []);

    const handleLogout = useCallback(() => {
        setFadeOutLogin(false);
        setAppState(AppState.LOGIN);
    }, []);

    const handleLoginFail = useCallback((newAttemptCount: number) => {
        setFailCount(newAttemptCount);
        
        if (newAttemptCount >= MAX_ATTEMPTS) {
            // Trigger death sequence
            setIsGlitching(true);
            playDeathNoise();
            
            // Wait 1.5s then show death screen
            setTimeout(() => {
                setIsGlitching(false);
                setAppState(AppState.DEATH);
                document.title = "DISCONNECTED";
            }, 1500);
        }
    }, []);

    return (
        <div className="min-h-screen w-full bg-[#111] flex items-center justify-center p-0 md:p-8 font-sans">
            {/* Tablet Frame (Desktop) / Full Screen (Mobile) */}
            <div className="relative w-full md:max-w-[1200px] h-[100dvh] md:h-[90vh] bg-black md:bg-[#222] md:rounded-[40px] p-0 md:p-[20px] md:shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_10px_rgba(255,255,255,0.05)] md:border border-[#333]">
                
                {/* Physical Buttons (Decoration - Desktop Only) */}
                <div className="hidden md:block absolute -right-[2px] top-32 w-[3px] h-12 bg-[#333] rounded-r shadow-lg"></div>
                <div className="hidden md:block absolute -right-[2px] top-48 w-[3px] h-20 bg-[#333] rounded-r shadow-lg"></div>

                {/* Inner Screen Container */}
                <div className="relative w-full h-full bg-black md:rounded-[25px] overflow-hidden md:ring-4 ring-black shadow-inner flex flex-col">
                    
                    {/* Tablet Status Bar */}
                    <div className="h-8 bg-black/90 backdrop-blur-md z-50 flex justify-between items-center px-4 md:px-6 text-[10px] md:text-xs text-gray-500 font-mono select-none border-b border-[#222] shrink-0">
                        <div className="flex gap-2 md:gap-4">
                            <span className="text-emerald-700">● SECURE NET</span>
                            <span className="hidden sm:inline">VPN: <span className="text-gray-300">ENCRYPTED</span></span>
                        </div>
                        <div className="flex gap-3 md:gap-4 items-center">
                             <span>{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             <span>BAT: 98%</span>
                             <div className="w-4 h-2 border border-gray-600 rounded-sm relative">
                                <div className="absolute left-[1px] top-[1px] bottom-[1px] w-[80%] bg-gray-400"></div>
                             </div>
                        </div>
                    </div>

                    {/* Main Screen Content */}
                    <div className={`relative flex-1 w-full bg-[#050505] overflow-hidden transition-filter duration-200 ${isGlitching ? 'death-glitch' : ''}`}>
                        
                        {/* Scanlines applied to screen only */}
                        <div className="pointer-events-none absolute inset-0 z-[60] scanlines opacity-40"></div>
                        
                        {isGlitching && (
                            <div className="noise-bg opacity-50 mix-blend-hard-light absolute inset-0 z-[70]"></div>
                        )}
                        
                        {showTransition && (
                            <TransitionScreen onComplete={handleTransitionComplete} />
                        )}
                        
                        {appState === AppState.LOGIN && (
                            <div className={`w-full h-full flex justify-center items-center transition-opacity duration-1000 ${fadeOutLogin ? 'opacity-0' : 'opacity-100'}`}>
                                <LoginForm 
                                    onLoginSuccess={handleLoginSuccess}
                                    onLoginFail={handleLoginFail}
                                    currentAttempts={failCount}
                                    maxAttempts={MAX_ATTEMPTS}
                                />
                            </div>
                        )}

                        {appState === AppState.CHARACTERS && (
                            <CharacterList onBack={handleLogout} />
                        )}

                        {appState === AppState.DEATH && (
                            <DeathScreen />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;