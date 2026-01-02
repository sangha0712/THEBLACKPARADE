import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import CharacterList from './components/CharacterList';
import DeathScreen from './components/DeathScreen';
import TransitionScreen from './components/TransitionScreen';
import { AppState } from './types';
import { MAX_ATTEMPTS } from './constants';
import { playDeathNoise } from './utils/sound';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.LOGIN);
    const [failCount, setFailCount] = useState(0);
    const [isGlitching, setIsGlitching] = useState(false);
    const [fadeOutLogin, setFadeOutLogin] = useState(false);
    const [showTransition, setShowTransition] = useState(false);

    const handleLoginSuccess = () => {
        // Start fade out animation for login form
        setFadeOutLogin(true);
        // Start full screen transition immediately
        setShowTransition(true);
    };
    
    const handleTransitionComplete = () => {
        setShowTransition(false);
        setAppState(AppState.CHARACTERS);
    };

    const handleLogout = () => {
        setFadeOutLogin(false);
        setAppState(AppState.LOGIN);
    };

    const handleLoginFail = (newAttemptCount: number) => {
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
    };

    return (
        <div className={`flex justify-center items-center h-screen w-full transition-filter duration-200 ${isGlitching ? 'death-glitch' : ''}`}>
            {isGlitching && (
                <div className="noise-bg opacity-50 mix-blend-hard-light"></div>
            )}
            
            {showTransition && (
                <TransitionScreen onComplete={handleTransitionComplete} />
            )}
            
            {appState === AppState.LOGIN && (
                <div className={`transition-opacity duration-1000 ${fadeOutLogin ? 'opacity-0' : 'opacity-100'}`}>
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
    );
};

export default App;