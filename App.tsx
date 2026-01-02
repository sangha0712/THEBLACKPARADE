import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import CharacterList from './components/CharacterList';
import DeathScreen from './components/DeathScreen';
import { AppState } from './types';
import { MAX_ATTEMPTS } from './constants';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.LOGIN);
    const [failCount, setFailCount] = useState(0);
    const [isGlitching, setIsGlitching] = useState(false);
    const [fadeOutLogin, setFadeOutLogin] = useState(false);

    const handleLoginSuccess = () => {
        // Start fade out animation
        setFadeOutLogin(true);
        setTimeout(() => {
            setAppState(AppState.CHARACTERS);
        }, 1000); // Wait for fade out
    };

    const handleLoginFail = (newAttemptCount: number) => {
        setFailCount(newAttemptCount);
        
        if (newAttemptCount >= MAX_ATTEMPTS) {
            // Trigger death sequence
            setIsGlitching(true);
            
            // Wait 1.5s then show death screen
            setTimeout(() => {
                setIsGlitching(false);
                setAppState(AppState.DEATH);
                document.title = "DISCONNECTED";
            }, 1500);
        }
    };

    return (
        <div className={`flex justify-center items-center h-screen w-full transition-filter duration-200 ${isGlitching ? 'animate-glitch' : ''}`}>
            {isGlitching && (
                <div className="noise-bg opacity-50 mix-blend-hard-light"></div>
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
                <CharacterList />
            )}

            {appState === AppState.DEATH && (
                <DeathScreen />
            )}
        </div>
    );
};

export default App;