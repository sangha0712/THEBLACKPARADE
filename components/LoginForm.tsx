import React, { useState, useEffect, useRef } from 'react';
import { login } from '../api';
import { playErrorSound, playAccessDeniedBeep, initAudio } from '../utils/sound';

interface LoginFormProps {
    onLoginSuccess: () => void;
    onLoginFail: (attempts: number) => void;
    currentAttempts: number;
    maxAttempts: number;
}

// Standard hacker logs
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

// Horror/Anomaly logs (Red logs)
const HORROR_LOGS = [
    "WARNING: BIOLOGICAL HAZARD DETECTED",
    "CRITICAL ALERT: UNKNOWN ENTITY APPROACHING",
    "ERROR: SOUL SIGNATURE NOT FOUND",
    "SYSTEM FAILURE: BLOOD SATURATION 98%",
    "DETECTED: NON-EUCLIDEAN GEOMETRY",
    "ALERT: CONTAINMENT BREACH IN SECTOR 7",
    "FATAL ERROR: REALITY ANCHOR SEVERED",
    "TRYING TO SCREAM... AUDIO DEVICE NOT FOUND",
    "THEY ARE WATCHING YOU",
    "DO NOT LOOK BEHIND YOU",
    "DATA CORRUPTION: VISUAL CORTEX MELTDOWN",
    "SUBJECT STATUS: DECEASED/MISSING",
    "OVERWRITE: HUMANITY_PROTOCOL.EXE [FAILED]",
    "CONNECTION LOST... WITH GOD"
];

// Incident Reports Data
const INCIDENT_REPORTS = [
    {
        id: "CASE-092-AX",
        title: "제7 기갑사단 전멸 사건",
        location: "강원도 산악 거점",
        status: "접근 금지",
        description: "사단 병력 400명 전원 사망. 시신에서 탄흔 발견되지 않음. 대다수의 기갑 차량이 마치 종잇장처럼 구겨지거나 거대한 '손톱' 자국에 의해 절단됨. 생존자 무전 기록: '그것은 하늘에서 내려온 게 아니다. 땅에서 솟았다.'"
    },
    {
        id: "CASE-114-VB",
        title: "심야 클럽 '네온' 연쇄 절단",
        location: "서울 지하 벙커 구역",
        status: "미해결",
        description: "금요일 밤, 클럽 내 120명의 인원이 30초 내에 신체 부위가 절단됨. CCTV 확인 결과, 번쩍이는 섬광 외에 용의자 식별 불가. 현장의 혈액량이 인간 120명의 총량을 초과함(약 3배). 벽면에 혈액으로 그려진 알 수 없는 문양 발견."
    },
    {
        id: "CASE-666-RD",
        title: "연구소 델타: '그림자' 확산",
        location: "남태평양 해상 플랜트",
        status: "데이터 말소",
        description: "연구원 전원이 벽과 바닥의 그림자와 융합되어 실종됨. 구조대가 도착했을 때 시설 내부는 깨끗했으나, 조명을 켜자 수백 개의 비명을 지르는 그림자들이 관측됨. 현재 해당 시설 폭격 후 수장 처리."
    },
    {
        id: "CASE-000-NULL",
        title: "D 구역 아파트 집단 아사",
        location: "수도권 외곽",
        status: "봉쇄됨",
        description: "아파트 1개 동 주민 전원이 아사한 채 발견. 부검 결과 위장에 음식물이 가득 차 있었으나 영양분이 흡수되지 않음. 현장 조사관 2명이 '무언가가 내 배를 갉아먹는다'며 착란 증세를 보인 후 자해 사망."
    },
    {
        id: "CASE-888-EYE",
        title: "지하철 4호선 '응시' 현상",
        location: "미개통 구간",
        status: "조사 중",
        description: "선로 보수 작업자 4명 실종. 그들의 헬멧 카메라에는 터널 끝 어둠 속에서 수천 개의 붉은 눈이 동시에 눈을 뜨는 장면이 녹화됨. 이후 오디오 트랙에서 인간의 성대가 아닌 소리로 '오지 마'라는 경고음 검출."
    }
];

type AnomalyState = 'NONE' | 'WARNING' | 'INPUT' | 'LOGS' | 'LIST';
type TerminationStage = 'NONE' | 'BLACKOUT' | 'TURN_AROUND' | 'DO_NOT_TURN_AROUND' | 'FINAL_BLACKOUT';
type NotificationStage = 'NONE' | 'SHOW' | 'CORRUPT' | 'SHUTDOWN';

const TUTORIAL_TEXTS = [
    "환영합니다.",
    "해당 프로그램은 인도자분들께 기본 제공되는 프로그램입니다.",
    "지급받으신 비밀번호를 입력하시고 접속버튼을 눌러 변이체,사망자를 확인하세요.",
    "이상 현상 접근은 일부 인도자를 제외하고는 접근이 허용되지 않습니다.",
    "귀하가 정신 강화 계열 및 회복 관련 계열 각성자가 아니라면 접근을 금합니다.",
    "인도자가 되신 것을 환영합니다. 행운을 빕니다."
];

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onLoginFail, currentAttempts, maxAttempts }) => {
    const [password, setPassword] = useState('');
    const [anomalyPassword, setAnomalyPassword] = useState(''); // Separate state for anomaly password
    const [isShaking, setIsShaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' | 'neutral' } | null>(null);
    const [anomalyError, setAnomalyError] = useState<string | null>(null);
    
    // Anomaly State Management
    const [anomalyState, setAnomalyState] = useState<AnomalyState>('NONE');
    const [horrorLogs, setHorrorLogs] = useState<string[]>([]);
    
    // Watcher Effect State (triggered after time in list)
    const [watcherTriggered, setWatcherTriggered] = useState(false);
    const [notificationStage, setNotificationStage] = useState<NotificationStage>('NONE');

    // Termination Sequence State
    const [anomalyFailCount, setAnomalyFailCount] = useState(0);
    const [terminationStage, setTerminationStage] = useState<TerminationStage>('NONE');
    
    // Tutorial State
    // Check localStorage to determine if tutorial should be shown
    const [showTutorial, setShowTutorial] = useState(() => {
        // If data exists ('true'), we hide tutorial (return false). 
        // If data does not exist (null), we show tutorial (return true).
        return !localStorage.getItem('TUTORIAL_SEEN');
    });
    const [tutorialStep, setTutorialStep] = useState(0);
    
    // Standard logs state
    const [logs, setLogs] = useState<string[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);
    const horrorLogsEndRef = useRef<HTMLDivElement>(null);

    // Shake effect timer
    useEffect(() => {
        if (isShaking) {
            const timer = setTimeout(() => setIsShaking(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isShaking]);

    // Auto-scroll logs
    useEffect(() => {
        if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        if (horrorLogsEndRef.current) horrorLogsEndRef.current.scrollIntoView({ behavior: 'auto' });
    }, [logs, horrorLogs]);

    // Watcher Effect & Shutdown Sequence (starts at 90s)
    useEffect(() => {
        let watcherTimer: ReturnType<typeof setTimeout>;
        let notifTimer: ReturnType<typeof setTimeout>;
        let corruptTimer: ReturnType<typeof setTimeout>;
        let shutdownTimer: ReturnType<typeof setTimeout>;

        if (anomalyState === 'LIST') {
            setWatcherTriggered(false); // Reset on entry
            setNotificationStage('NONE');

            // 1. Trigger Watcher at 90s (90000ms)
            watcherTimer = setTimeout(() => {
                setWatcherTriggered(true);
                
                // 2. Trigger Notification 3s after Watcher
                notifTimer = setTimeout(() => {
                    setNotificationStage('SHOW');

                    // 3. Corrupt text 0.5s after Notification
                    corruptTimer = setTimeout(() => {
                        setNotificationStage('CORRUPT');
                    }, 500);

                    // 4. Shutdown 2s after Notification
                    shutdownTimer = setTimeout(() => {
                        setNotificationStage('SHUTDOWN');
                        // Attempt to close the window, though browsers may block it
                        try { window.close(); } catch(e) {}
                    }, 2000);

                }, 3000);

            }, 90000); 
        } else {
            setWatcherTriggered(false);
            setNotificationStage('NONE');
        }

        return () => {
            clearTimeout(watcherTimer);
            clearTimeout(notifTimer);
            clearTimeout(corruptTimer);
            clearTimeout(shutdownTimer);
        };
    }, [anomalyState]);

    // Termination sequence timer
    useEffect(() => {
        if (terminationStage === 'BLACKOUT') {
            const timer = setTimeout(() => setTerminationStage('TURN_AROUND'), 2000);
            return () => clearTimeout(timer);
        }
        if (terminationStage === 'TURN_AROUND') {
            const timer = setTimeout(() => setTerminationStage('DO_NOT_TURN_AROUND'), 500);
            return () => clearTimeout(timer);
        }
        if (terminationStage === 'DO_NOT_TURN_AROUND') {
            const timer = setTimeout(() => setTerminationStage('FINAL_BLACKOUT'), 5000);
            return () => clearTimeout(timer);
        }
    }, [terminationStage]);

    // Standard Login Log generation
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isLoading && anomalyState === 'NONE') {
            setLogs(["> SYSTEM UPLINK STARTED..."]);
            interval = setInterval(() => {
                setLogs(prev => {
                    const randomLog = HACKER_LOGS[Math.floor(Math.random() * HACKER_LOGS.length)];
                    const hexPrefix = `0x${Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0')}`;
                    return [...prev, `[${hexPrefix}] ${randomLog}`].slice(-8); 
                });
            }, 150);
        } else {
            setLogs([]);
        }
        return () => clearInterval(interval);
    }, [isLoading, anomalyState]);

    const handleAttempt = async () => {
        // [Autoplay Policy Fix]
        // Must init AudioContext immediately within the user event handler.
        // If we wait until after login() resolves (2.5s later), the browser will block the sound.
        await initAudio();
        
        if (!password || isLoading) return;
        setIsLoading(true);
        setMessage(null); 

        try {
            const isSuccess = await login(password);
            if (isSuccess) {
                setLogs(prev => [...prev, ">> ACCESS GRANTED <<"]);
                await new Promise(r => setTimeout(r, 500));
                setMessage({ text: "IDENTITY VERIFIED. ACCESS GRANTED.", type: 'success' });
                onLoginSuccess();
            } else {
                playErrorSound();
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

    const handleAnomalyAttempt = async () => {
        // [Autoplay Policy Fix] Initialize audio immediately on user interaction
        await initAudio();
        
        const normalizedInput = anomalyPassword.replace(/\s+/g, '').toUpperCase();
        if (normalizedInput === 'DONOTTURNAROUND') {
            startAnomalySequence();
            setAnomalyFailCount(0);
        } else {
            const newCount = anomalyFailCount + 1;
            setAnomalyFailCount(newCount);
            
            if (newCount >= 5) {
                setTerminationStage('BLACKOUT');
            } else {
                playAccessDeniedBeep();
                setAnomalyError('ACCESS DENIED. INCORRECT SECURITY CODE.');
                setIsShaking(true);
                setAnomalyPassword('');
            }
        }
    };

    const startAnomalySequence = () => {
        setAnomalyState('LOGS');
        setAnomalyError(null);
        
        let interval: ReturnType<typeof setInterval>;
        let counter = 0;

        // Generate rapid red logs for 8.5 seconds
        interval = setInterval(() => {
            setHorrorLogs(prev => {
                const randomLog = HORROR_LOGS[Math.floor(Math.random() * HORROR_LOGS.length)];
                const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
                return [...prev, `[${timestamp}] FATAL: ${randomLog}`].slice(-15);
            });
            counter += 100;
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            setAnomalyState('LIST');
        }, 8500); 
    };

    const handleTutorialClick = () => {
        if (tutorialStep < TUTORIAL_TEXTS.length - 1) {
            setTutorialStep(prev => prev + 1);
        } else {
            setShowTutorial(false);
            // Save to localStorage so tutorial doesn't show again
            localStorage.setItem('TUTORIAL_SEEN', 'true');
        }
    };

    // 0. Forced Shutdown State (Black Screen)
    if (notificationStage === 'SHUTDOWN') {
        return <div className="fixed inset-0 bg-black z-[99999] cursor-none" />;
    }

    // 1. Check Termination Stage first (Highest priority override)
    if (terminationStage !== 'NONE') {
        return (
             <div className="absolute inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden">
                {terminationStage === 'TURN_AROUND' && (
                    <div className="text-gray-400 text-3xl md:text-5xl font-mono tracking-[0.5em] animate-pulse font-bold">
                        TURN AROUND
                    </div>
                )}
                {terminationStage === 'DO_NOT_TURN_AROUND' && (
                    <div className="relative">
                        <div className="text-[#ff0000] text-5xl md:text-8xl font-black font-mono tracking-tighter animate-glitch drop-shadow-[0_0_20px_rgba(255,0,0,1)] text-center leading-none scale-150">
                            DO NOT<br/>TURN AROUND
                        </div>
                        {/* Extra noise/glitch layers for intensity */}
                        <div className="absolute inset-0 text-[#ff0000] opacity-50 blur-[2px] animate-pulse scale-150 text-5xl md:text-8xl font-black font-mono tracking-tighter text-center leading-none pointer-events-none">
                             DO NOT<br/>TURN AROUND
                        </div>
                    </div>
                )}
                {/* FINAL_BLACKOUT renders just the black container */}
            </div>
        );
    }

    // Render Logic based on State
    if (anomalyState === 'LOGS') {
        return (
            <div className="relative w-full h-full bg-black border-none p-4 md:p-8 flex flex-col animate-pulse">
                <h1 className="text-2xl md:text-4xl text-red-600 font-bold mb-4 tracking-[0.2em] border-b-2 border-red-800 pb-2">
                    SYSTEM BREACH IN PROGRESS
                </h1>
                <div className="flex-1 overflow-hidden font-mono text-lg md:text-xl text-red-500 bg-red-950/20 p-2 md:p-4 border border-red-900/50">
                    {horrorLogs.map((log, i) => (
                        <div key={i} className="mb-1 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                            {log}
                        </div>
                    ))}
                    <div ref={horrorLogsEndRef} />
                </div>
            </div>
        );
    }

    if (anomalyState === 'LIST') {
        return (
            <div className={`relative w-full h-full bg-[#050000] flex flex-col ${watcherTriggered ? 'animate-glitch' : ''}`}>
                {/* Watcher Effect Overlay */}
                {watcherTriggered && (
                    <div className="absolute inset-0 z-[100] bg-black/90 flex items-center justify-center flex-col overflow-hidden animate-[pulse_0.1s_ease-in-out_infinite]">
                        <div className="absolute inset-0 noise-bg opacity-50 mix-blend-overlay"></div>
                        <div className="text-red-600 font-mono font-black text-5xl md:text-8xl text-center tracking-tighter animate-glitch drop-shadow-[0_0_30px_rgba(255,0,0,0.8)] leading-none">
                            SOMEONE IS<br/>WATCHING YOU
                        </div>
                        <div className="mt-8 text-red-800 font-mono animate-pulse tracking-widest text-xl">
                            CONNECTION UNSTABLE...
                        </div>
                    </div>
                )}

                {/* System Notification Overlay */}
                {(notificationStage === 'SHOW' || notificationStage === 'CORRUPT') && (
                    <div className="absolute inset-0 z-[200] flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease-out]">
                        <div className="bg-[#f0f0f0] text-black w-full max-w-[320px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden font-sans border border-gray-300 transform scale-100">
                             <div className="p-5 text-center">
                                <h3 className="text-lg font-bold mb-2">시스템 경고</h3>
                                <p className="text-sm text-gray-800 mb-4 leading-relaxed">
                                    디바이스의 온도가 높아 사용 중인 앱을 강제종료 합니다.
                                </p>
                                <p className={`text-xs transition-all duration-100 ${notificationStage === 'CORRUPT' ? 'text-red-600 font-bold scale-105' : 'text-gray-500'}`}>
                                    {notificationStage === 'SHOW' ? '저장되지 않은 데이터는 자동으로 저장됩니다.' : '저장되지 않은 데이터는 삭제됩니다.'}
                                </p>
                             </div>
                             <div className="border-t border-gray-300 p-3 text-center text-blue-600 font-bold text-base cursor-not-allowed bg-gray-50">
                                확인
                             </div>
                        </div>
                    </div>
                )}

                <div className="p-4 md:p-6 border-b border-red-800 bg-red-950/30 flex justify-between items-center shrink-0">
                    <h2 className="text-xl md:text-3xl text-red-600 font-bold tracking-widest drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] truncate">
                        [RESTRICTED] ARCHIVE
                    </h2>
                    <button 
                        onClick={() => setAnomalyState('NONE')}
                        className="text-red-400 border border-red-800 px-3 py-1 md:px-4 md:py-2 hover:bg-red-900 hover:text-white transition-colors text-xs md:text-sm whitespace-nowrap"
                    >
                        CLOSE
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar space-y-8">
                    <div className="text-red-800/50 text-center mb-8 font-mono text-sm animate-pulse">
                        SCROLL TO VIEW RECORDED ANOMALIES // EYES ONLY
                    </div>
                    {INCIDENT_REPORTS.map((report, idx) => (
                        <div key={idx} className="border border-red-900/50 bg-[#0a0000] p-4 md:p-6 hover:border-red-600 transition-colors group">
                            <div className="flex justify-between items-start mb-4 border-b border-red-900/30 pb-2">
                                <div className="flex flex-col md:block">
                                    <span className="text-red-600 font-bold text-lg mr-4">{report.id}</span>
                                    <span className="text-gray-400 text-xs md:text-sm tracking-widest block md:inline mt-1 md:mt-0">LOC: {report.location}</span>
                                </div>
                                <span className="bg-red-900 text-black px-2 py-1 text-xs font-bold whitespace-nowrap ml-2">{report.status}</span>
                            </div>
                            <h3 className="text-xl md:text-2xl text-red-500 font-bold mb-3 group-hover:text-red-400">{report.title}</h3>
                            <p className="text-gray-400 leading-relaxed font-mono text-sm border-l-2 border-red-900 pl-4">
                                {report.description}
                            </p>
                        </div>
                    ))}
                    <div className="h-20 text-center flex items-center justify-center text-red-900 italic text-sm">
                        -- END OF ACCESSIBLE RECORDS --
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative z-10 w-full h-full bg-[#0a0a0a] border-none p-6 md:p-16 flex flex-col justify-center items-center text-center transition-transform duration-100 ${isShaking ? 'animate-shake' : ''}`}>
            {/* Tutorial Overlay */}
            {showTutorial && (
                <>
                    {/* Background Dimmer - behind zoomed elements (z-200) */}
                    <div className="fixed inset-0 bg-black/80 z-[200] transition-opacity duration-500" />
                    
                    {/* Content Overlay - in front of everything (z-300) */}
                    <div 
                        onClick={handleTutorialClick}
                        className="fixed inset-0 z-[300] flex flex-col items-center justify-center p-4 md:p-8 cursor-pointer"
                    >
                        <div className={`
                            bg-[#111] border border-green-500/50 p-6 md:p-10 w-full text-center relative shadow-[0_0_30px_rgba(0,255,0,0.1)] rounded-sm transition-all duration-700 ease-in-out
                            ${tutorialStep === 2 
                                ? 'max-w-sm md:translate-x-[320px] translate-y-[180px] md:translate-y-0' 
                                : 'max-w-2xl translate-x-0 translate-y-0'
                            }
                        `}>
                            <p key={tutorialStep} className="text-green-500 font-mono text-lg md:text-2xl leading-relaxed animate-[fadeIn_0.5s_ease-in-out]">
                               {TUTORIAL_TEXTS[tutorialStep]}
                            </p>
                            <div className="mt-8 text-xs text-gray-500 animate-pulse tracking-widest">
                                [ CLICK TO CONTINUE ]
                            </div>
                        </div>
                    </div>
                </>
            )}

            {anomalyState === 'WARNING' && (
                <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-4 md:p-8 z-50 border-2 border-red-600 animate-[fadeIn_0.2s_ease-out]">
                    <div className="text-red-600 text-5xl md:text-6xl mb-4 md:mb-6 animate-pulse">⚠️</div>
                    <div className="text-red-500 font-bold text-base md:text-lg mb-6 md:mb-8 leading-relaxed tracking-wider break-keep">
                        해당 접근은 사망,결손,중상 등<br/>
                        귀하의 신변에 위협이 될 수 있습니다.<br/><br/>
                        정말로 접근하시겠습니까?
                        <br/><br/>
                        <span className="text-red-700 text-sm opacity-80">[해당 페이지는 보안 시스템에 의해 보호받지 못합니다.]</span>
                    </div>
                    <div className="flex gap-4 md:gap-6 flex-col md:flex-row w-full md:w-auto">
                        <button
                            onClick={() => setAnomalyState('INPUT')}
                            className="border border-red-600 text-red-600 px-6 py-3 md:px-8 hover:bg-red-600 hover:text-black transition-all duration-300 font-bold tracking-widest text-lg shadow-[0_0_10px_rgba(255,0,0,0.2)]"
                        >
                            접근
                        </button>
                        <button
                            onClick={() => setAnomalyState('NONE')}
                            className="border border-gray-600 text-gray-500 px-6 py-3 md:px-8 hover:bg-gray-800 hover:text-white transition-all duration-300 font-bold tracking-widest text-lg"
                        >
                            취소
                        </button>
                    </div>
                </div>
            )}

            {anomalyState === 'INPUT' && (
                <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-4 md:p-8 z-50 border-2 border-red-900 animate-[fadeIn_0.2s_ease-out]">
                    <h2 className="text-red-600 text-2xl md:text-3xl font-bold mb-6 md:mb-8 tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
                        SECURITY CLEARANCE
                    </h2>
                    <input 
                        type="password" 
                        value={anomalyPassword}
                        onChange={(e) => setAnomalyPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAnomalyAttempt();
                        }}
                        placeholder="ACCESS CODE"
                        className="w-[90%] md:w-[80%] max-w-[500px] bg-[#1a0000] border border-red-800 text-red-500 p-3 md:p-4 text-xl md:text-2xl font-mono outline-none mb-6 md:mb-8 text-center transition-all duration-300 focus:border-red-500 focus:shadow-[0_0_20px_rgba(255,0,0,0.3)] placeholder-red-900/50 tracking-widest"
                        autoFocus
                    />
                    <div className="flex gap-4 md:gap-6 flex-col md:flex-row w-full md:w-auto">
                        <button
                            onClick={handleAnomalyAttempt}
                            className="border border-red-600 bg-red-950/20 text-red-500 px-8 py-3 md:px-10 hover:bg-red-600 hover:text-black transition-all duration-300 font-bold tracking-widest text-lg shadow-[0_0_15px_rgba(255,0,0,0.1)]"
                        >
                            VERIFY
                        </button>
                        <button
                            onClick={() => {
                                setAnomalyState('NONE');
                                setAnomalyPassword('');
                                setAnomalyError(null);
                            }}
                            className="border border-gray-800 text-gray-600 px-8 py-3 md:px-10 hover:bg-gray-900 hover:text-gray-400 transition-all duration-300 font-bold tracking-widest text-lg"
                        >
                            ABORT
                        </button>
                    </div>
                    {anomalyError && (
                        <div className="mt-6 md:mt-8 text-red-500 font-bold tracking-widest animate-pulse border-t border-red-900 pt-2 text-sm md:text-base">
                            {anomalyError}
                        </div>
                    )}
                </div>
            )}

            <h1 className="text-4xl md:text-7xl text-white mb-4 md:mb-6 tracking-[4px] md:tracking-[8px] drop-shadow-[2px_2px_0_rgba(0,255,0,1)] font-bold">
                BLACK PARADE
            </h1>
            
            <div className="text-xs md:text-base text-[#555] mb-6 md:mb-10 py-3 md:py-4 border-y border-dashed border-[#333] leading-relaxed tracking-wider">
                SYSTEM: SECURE // SERVER: NESTJS-CORE-V9<br/>
                STATUS: {isLoading ? <span className="text-[#00ff00] animate-pulse">INTRUSION IN PROGRESS...</span> : 'WAITING FOR INPUT...'}
                {currentAttempts > 0 && !isLoading && (
                     <div className="text-red-500 font-bold mt-2 animate-pulse">
                        FAILED ATTEMPTS: {currentAttempts}
                     </div>
                )}
            </div>

            {isLoading ? (
                // Hacker Log View
                <div className="w-full bg-black border border-[#00ff00] p-4 md:p-6 mb-6 md:mb-8 text-left h-[150px] md:h-[200px] overflow-hidden flex flex-col justify-end shadow-[inset_0_0_10px_rgba(0,255,0,0.2)]">
                    {logs.map((log, i) => (
                        <div key={i} className="text-[#00ff00] font-mono text-sm md:text-lg leading-tight opacity-90 truncate">
                            {log}
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            ) : (
                // Normal Input View
                <div className={`w-full flex flex-col items-center transition-all duration-700 ease-in-out ${showTutorial && tutorialStep === 2 ? 'scale-110 md:scale-125 z-[201] relative pointer-events-none' : ''}`}>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAttempt();
                        }}
                        placeholder="PASSWORD"
                        className={`w-full md:w-[80%] bg-[#111] border border-[#444] text-red-500 p-4 md:p-6 text-2xl md:text-3xl font-mono outline-none mb-6 md:mb-8 text-center transition-all duration-300 focus:border-red-500 focus:shadow-[0_0_10px_rgba(255,0,0,0.5)] placeholder-gray-700 rounded-none`}
                    />
                    
                    <button 
                        onClick={handleAttempt}
                        className={`w-full md:w-auto bg-[#222] text-white border border-white py-3 px-8 md:py-4 md:px-12 text-lg md:text-xl tracking-widest transition-all duration-300 hover:bg-red-500 hover:text-black hover:font-bold hover:border-red-500 cursor-pointer`}
                    >
                        접속
                    </button>
                    
                    <div className="mt-6 md:mt-8 pointer-events-auto">
                        <button
                            onClick={() => !showTutorial && setAnomalyState('WARNING')}
                            className="w-full md:w-auto bg-[#222] text-white border border-white py-3 px-8 md:py-4 md:px-12 text-lg md:text-xl tracking-widest transition-all duration-300 hover:bg-red-500 hover:text-black hover:font-bold hover:border-red-500 cursor-pointer"
                        >
                            [ 이상현상 ]
                        </button>
                    </div>
                </div>
            )}

            <div className={`mt-6 md:mt-8 min-h-[40px] text-base md:text-lg font-bold ${message?.type === 'success' ? 'text-[#00ff00]' : message?.type === 'neutral' ? 'text-yellow-500' : 'text-[#ff0000]'}`}>
                {message?.text && !isLoading && (
                    <span dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br/>') }}></span>
                )}
            </div>
        </div>
    );
};

export default LoginForm;