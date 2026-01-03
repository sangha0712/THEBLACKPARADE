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
        location: "강원도 산악 거점 (섹터-09)",
        origin: "지하 400m 암반층 균열",
        damage: "제7 기갑사단 전원(400명) 사망, MBT 45대 완파",
        status: "접근 금지",
        description: "작전 개시 14분 만에 7기갑사단과의 통신이 두절됨. 드론 정찰 결과 생존자는 단 한 명도 발견되지 않음.\n\n[현장 분석]\nMBT-K2 전차 45대의 상부 장갑이 내부에서 외부 방향으로 뜯겨나간 흔적이 발견됨. 이는 전차 내부에서 폭발이나 물리적 타격이 있었음을 시사하나, 폭약 반응은 전무함. 사망한 승무원들의 신체는 외상이 없었으나, 부검 결과 뇌의 편도체가 극심한 공포로 인해 물리적으로 파열되어 있었음.\n\n[회수된 블랙박스]\n교전 직전 오디오 트랙에서 4Hz 미만의 초저주파 진동음 검출. 해당 소리는 하늘이 아닌 지하 4km 지점에서 발생하여 암반을 타고 올라온 것으로 추정됨. 유일한 목격자(통신병)는 구조 직후 자신의 혀를 절단하여 진술을 거부함."
    },
    {
        id: "CASE-114-VB",
        title: "심야 클럽 '네온' 연쇄 절단",
        location: "서울 지하 벙커 구역",
        origin: "클럽 내 VIP 룸 대형 거울",
        damage: "민간인 120명 사망, 현장 출동 경관 2명 정신 오염",
        status: "미해결",
        description: "금요일 밤 23:42, 클럽 내부의 모든 조명이 붉게 변한 직후 사건 발생. 120명의 인원이 30초 내에 신체 부위가 절단되어 사망함.\n\n[피해 상세]\n절단면은 섭씨 3000도 이상의 고열로 지진 듯 매끄러웠으며 출혈이 거의 발생하지 않음. 피해자들은 춤을 추거나 술을 마시는 자세 그대로 신체가 분리됨.\n\n[CCTV 분석]\n사건 발생 10분 전부터 VIP룸의 거울이 현실과 다른 장면(비명을 지르는 군중)을 비추고 있었음이 포착됨. 거울 속의 존재들이 거울 밖으로 손을 뻗는 순간 영상이 노이즈로 뒤덮임. 현장 벽면에 혈액으로 그려진 나선형 문양은 고대 수메르어와 유사하나 해독 불가."
    },
    {
        id: "CASE-666-RD",
        title: "연구소 델타: '그림자' 확산",
        location: "남태평양 해상 플랜트",
        origin: "심해 3,000m 해곡",
        damage: "연구 시설 완전 소멸, 연구원 54명 실종(사망 추정)",
        status: "데이터 말소",
        description: "해상 연구소와의 정기 통신 두절 48시간 후 정찰팀 투입.\n\n[내부 상황]\n시설 내부는 침수되지 않았으나, 모든 표면이 검은 타르 같은 점액질로 덮여 있었음. 연구원들의 시신은 발견되지 않았으나, 벽과 바닥에 남겨진 인간 형태의 그림자가 독자적으로 움직이는 현상 목격.\n\n[Dr. Hans의 음성 기록]\n'그림자가 빛을 먹어치우고 있어. 조명을 켜면 안 돼. 빛이 생기면 그림자도 생긴다. 내 그림자가... 내 목을 조르고 있다고!'\n\n현재 해당 시설은 오염 확산을 막기 위해 전술핵 타격 후 수장 처리됨."
    },
    {
        id: "CASE-000-NULL",
        title: "D 구역 아파트 집단 아사",
        location: "수도권 외곽 격리 단지",
        origin: "불명 (대기 중 미확인 포자 확산 추정)",
        damage: "주민 1,204명 전원 사망",
        status: "봉쇄됨",
        description: "외부와 완전히 격리된 아파트 단지에서 주민 전원이 아사(餓死)한 채 발견됨. 냉장고에는 음식이 가득 차 있었음.\n\n[부검 리포트]\n사망자 전원의 위장은 쌀, 생고기, 가구 파편, 심지어 플라스틱 등 섭취 가능한 모든 물질로 가득 차 있었으나, 혈중 영양소 수치는 0에 수렴함. 위장 내벽에서 미확인 검은 곰팡이 군락 발견. 이 곰팡이는 숙주가 섭취한 모든 영양분을 0.1초 내에 분해하여 가스로 배출함.\n\n[특이사항]\n현장 조사관 2명이 진입 1시간 만에 '무언가가 내 배를 안에서부터 갉아먹는다'며 착란 증세를 보인 후 자해 사망. 현재 반경 5km 내 접근 금지."
    },
    {
        id: "CASE-888-EYE",
        title: "지하철 4호선 '응시' 현상",
        location: "미개통 구간 (섹터 4-B)",
        origin: "터널 벽면 미세 균열",
        damage: "작업자 4명 실종, 구조대원 2명 영구적 시력 상실",
        status: "조사 중",
        description: "심야 선로 보수 작업 중 발생.\n\n[현상 기록]\n작업자들은 터널 벽면의 콘크리트 균열이 사람의 '눈꺼풀'처럼 벌어지며, 그 안에서 수천 개의 붉은 안광이 자신들을 응시했다고 보고함. 해당 시선에 10초 이상 노출된 2명은 즉시 망막 신경이 타버려 영구적으로 실명됨.\n\n[공간 왜곡]\n사건 당시 해당 터널 구간의 길이가 실제 설계도(1.2km)보다 4km 이상 무한히 늘어난 것으로 측정됨. 지하 깊은 곳에서 거대한 유기체가 숨 쉬는 듯한 바람 소리가 녹음됨. \n\n경고: 해당 구간 진입 시 절대 멈춰 서거나 벽면을 응시하지 말 것."
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
    
    // New State for Detail View in Anomaly List
    const [selectedReport, setSelectedReport] = useState<typeof INCIDENT_REPORTS[0] | null>(null);
    
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
            setSelectedReport(null); // Reset detail view on exit
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

                {selectedReport ? (
                    // --- DETAIL VIEW ---
                    <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
                        <div className="p-4 md:p-6 border-b border-red-800 bg-red-950/30 flex justify-between items-center shrink-0">
                            <h2 className="text-xl md:text-2xl text-red-500 font-bold tracking-widest drop-shadow-[0_0_10px_rgba(255,0,0,0.5)] truncate flex items-center gap-2">
                                <span className="text-sm text-red-800">{'>'}</span> {selectedReport.id}
                            </h2>
                            <button 
                                onClick={() => setSelectedReport(null)}
                                className="text-red-400 border border-red-800 px-3 py-1 hover:bg-red-900 hover:text-white transition-colors text-xs font-mono font-bold"
                            >
                                [ RETURN ]
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                            <div className="max-w-4xl mx-auto border border-red-900/40 bg-black p-6 md:p-8 relative">
                                {/* Top Secret Stamp */}
                                <div className="absolute top-4 right-4 border-2 border-red-800 text-red-800 px-2 py-1 text-xs font-black tracking-widest opacity-50 rotate-[-12deg] pointer-events-none">
                                    TOP SECRET
                                </div>

                                <div className="mb-8">
                                    <div className="text-xs text-red-700 tracking-[0.3em] mb-1">SUBJECT</div>
                                    <h1 className="text-2xl md:text-4xl text-white font-bold tracking-wider">{selectedReport.title}</h1>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-[#0a0505] border-l-2 border-red-800 p-3">
                                        <div className="text-xs text-gray-500 mb-1">LOCATION</div>
                                        <div className="text-red-400">{selectedReport.location}</div>
                                    </div>
                                    <div className="bg-[#0a0505] border-l-2 border-red-800 p-3">
                                        <div className="text-xs text-gray-500 mb-1">CURRENT STATUS</div>
                                        <div className="text-red-500 font-bold animate-pulse">{selectedReport.status}</div>
                                    </div>
                                    <div className="bg-[#0a0505] border-l-2 border-red-800 p-3">
                                        <div className="text-xs text-gray-500 mb-1">ORIGIN POINT</div>
                                        <div className="text-red-300 font-mono text-sm">{selectedReport.origin}</div>
                                    </div>
                                    <div className="bg-[#0a0505] border-l-2 border-red-800 p-3">
                                        <div className="text-xs text-gray-500 mb-1">DAMAGE REPORT</div>
                                        <div className="text-red-300 font-mono text-sm">{selectedReport.damage}</div>
                                    </div>
                                </div>

                                <div className="relative border-t border-red-900/30 pt-6">
                                    <div className="absolute -top-3 left-0 bg-black px-2 text-red-800 text-xs font-bold tracking-widest">INCIDENT DESCRIPTION</div>
                                    <p className="text-gray-300 leading-8 font-mono text-base md:text-lg whitespace-pre-wrap">
                                        {selectedReport.description}
                                    </p>
                                </div>

                                <div className="mt-12 text-center">
                                    <div className="inline-block border border-red-900 px-4 py-2 text-red-900 text-xs tracking-[0.5em] opacity-70">
                                        END OF FILE
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // --- LIST VIEW ---
                    <>
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
                                SCROLL TO VIEW RECORDED ANOMALIES // CLICK TO EXPAND
                            </div>
                            {INCIDENT_REPORTS.map((report, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => setSelectedReport(report)}
                                    className="border border-red-900/50 bg-[#0a0000] p-4 md:p-6 hover:border-red-600 hover:bg-red-950/10 transition-all cursor-pointer group active:scale-[0.99]"
                                >
                                    <div className="flex justify-between items-start mb-4 border-b border-red-900/30 pb-2">
                                        <div className="flex flex-col md:block">
                                            <span className="text-red-600 font-bold text-lg mr-4 group-hover:text-red-400 transition-colors">{report.id}</span>
                                            <span className="text-gray-400 text-xs md:text-sm tracking-widest block md:inline mt-1 md:mt-0">LOC: {report.location}</span>
                                        </div>
                                        <span className="bg-red-900 text-black px-2 py-1 text-xs font-bold whitespace-nowrap ml-2 group-hover:bg-red-600 transition-colors">{report.status}</span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl text-red-500 font-bold mb-3 group-hover:text-red-300 transition-colors">{report.title}</h3>
                                    <p className="text-gray-400 leading-relaxed font-mono text-sm border-l-2 border-red-900 pl-4 line-clamp-2">
                                        {report.description}
                                    </p>
                                    <div className="mt-4 text-right">
                                        <span className="text-xs text-red-800 group-hover:text-red-500 font-bold tracking-widest">
                                            [ READ FULL REPORT ]
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div className="h-20 text-center flex items-center justify-center text-red-900 italic text-sm">
                                -- END OF ACCESSIBLE RECORDS --
                            </div>
                        </div>
                    </>
                )}
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