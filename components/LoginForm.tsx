import React, { useState, useEffect, useRef } from 'react';
import { login } from '../api';

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
        description: "금요일 밤, 클럽 내 120명의 인원이 30초 내에 신체 부위가 절단되어 사망. CCTV 확인 결과, 번쩍이는 섬광 외에 용의자 식별 불가. 현장의 혈액량이 인간 120명의 총량을 초과함(약 3배). 벽면에 혈액으로 그려진 알 수 없는 문양 발견."
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

type AnomalyState = 'NONE' | 'WARNING' | 'LOGS' | 'LIST';

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onLoginFail, currentAttempts, maxAttempts }) => {
    const [password, setPassword] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' | 'neutral' } | null>(null);
    
    // Anomaly State Management
    const [anomalyState, setAnomalyState] = useState<AnomalyState>('NONE');
    const [horrorLogs, setHorrorLogs] = useState<string[]>([]);
    
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

    const startAnomalySequence = () => {
        setAnomalyState('LOGS');
        
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

    // Render Logic based on State
    if (anomalyState === 'LOGS') {
        return (
            <div className="relative z-10 w-[95%] max-w-[900px] h-[600px] bg-black border-4 border-red-600 p-8 flex flex-col shadow-[0_0_50px_rgba(255,0,0,0.5)] animate-pulse">
                <h1 className="text-4xl text-red-600 font-bold mb-4 tracking-[0.2em] border-b-2 border-red-800 pb-2">
                    SYSTEM BREACH IN PROGRESS
                </h1>
                <div className="flex-1 overflow-hidden font-mono text-xl text-red-500 bg-red-950/20 p-4">
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
            <div className="relative z-10 w-[95%] max-w-[1000px] h-[80vh] bg-[#050000] border-2 border-red-900 flex flex-col shadow-[0_0_100px_rgba(255,0,0,0.2)]">
                <div className="p-6 border-b border-red-800 bg-red-950/30 flex justify-between items-center">
                    <h2 className="text-3xl text-red-600 font-bold tracking-widest drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
                        [RESTRICTED] INCIDENT ARCHIVE
                    </h2>
                    <button 
                        onClick={() => setAnomalyState('NONE')}
                        className="text-red-400 border border-red-800 px-4 py-2 hover:bg-red-900 hover:text-white transition-colors text-sm"
                    >
                        CLOSE ARCHIVE
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                    <div className="text-red-800/50 text-center mb-8 font-mono text-sm animate-pulse">
                        SCROLL TO VIEW RECORDED ANOMALIES // EYES ONLY
                    </div>
                    {INCIDENT_REPORTS.map((report, idx) => (
                        <div key={idx} className="border border-red-900/50 bg-[#0a0000] p-6 hover:border-red-600 transition-colors group">
                            <div className="flex justify-between items-start mb-4 border-b border-red-900/30 pb-2">
                                <div>
                                    <span className="text-red-600 font-bold text-lg mr-4">{report.id}</span>
                                    <span className="text-gray-400 text-sm tracking-widest">LOCATION: {report.location}</span>
                                </div>
                                <span className="bg-red-900 text-black px-2 py-1 text-xs font-bold">{report.status}</span>
                            </div>
                            <h3 className="text-2xl text-red-500 font-bold mb-3 group-hover:text-red-400">{report.title}</h3>
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
        <div className={`relative z-10 w-[90%] max-w-[800px] bg-[#0a0a0a] border border-[#333] p-16 text-center shadow-[0_0_20px_rgba(0,0,0,0.8)] transition-transform duration-100 ${isShaking ? 'animate-shake' : ''}`}>
            {anomalyState === 'WARNING' && (
                <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-8 z-50 border-2 border-red-600 animate-[fadeIn_0.2s_ease-out]">
                    <div className="text-red-600 text-6xl mb-6 animate-pulse">⚠️</div>
                    <div className="text-red-500 font-bold text-lg mb-8 leading-relaxed tracking-wider">
                        해당 접근은 사망,결손,중상 등<br/>
                        귀하의 신변에 위협이 될 수 있습니다.<br/><br/>
                        정말로 접근하시겠습니까?
                    </div>
                    <div className="flex gap-6">
                        <button
                            onClick={startAnomalySequence}
                            className="border border-red-600 text-red-600 px-8 py-3 hover:bg-red-600 hover:text-black transition-all duration-300 font-bold tracking-widest text-lg shadow-[0_0_10px_rgba(255,0,0,0.2)]"
                        >
                            접근
                        </button>
                        <button
                            onClick={() => setAnomalyState('NONE')}
                            className="border border-gray-600 text-gray-500 px-8 py-3 hover:bg-gray-800 hover:text-white transition-all duration-300 font-bold tracking-widest text-lg"
                        >
                            취소
                        </button>
                    </div>
                </div>
            )}

            <h1 className="text-6xl md:text-7xl text-white mb-6 tracking-[8px] drop-shadow-[2px_2px_0_rgba(255,0,0,1)] font-bold">
                BLACK PARADE
            </h1>
            
            <div className="text-base text-[#555] mb-10 py-4 border-y border-dashed border-[#333] leading-relaxed tracking-wider">
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
                <div className="w-full bg-black border border-[#00ff00] p-6 mb-8 text-left h-[200px] overflow-hidden flex flex-col justify-end shadow-[inset_0_0_10px_rgba(0,255,0,0.2)]">
                    {logs.map((log, i) => (
                        <div key={i} className="text-[#00ff00] font-mono text-lg leading-tight opacity-90 truncate">
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
                        className={`w-[80%] bg-[#111] border border-[#444] text-red-500 p-6 text-3xl font-mono outline-none mb-8 text-center transition-all duration-300 focus:border-red-500 focus:shadow-[0_0_10px_rgba(255,0,0,0.5)] placeholder-gray-700`}
                    />
                    
                    <br />
                    
                    <button 
                        onClick={handleAttempt}
                        className={`bg-[#222] text-white border border-white py-4 px-12 text-xl tracking-widest transition-all duration-300 hover:bg-red-500 hover:text-black hover:font-bold hover:border-red-500 cursor-pointer`}
                    >
                        접속
                    </button>
                    
                    <div className="mt-8">
                        <button
                            onClick={() => setAnomalyState('WARNING')}
                            className="text-[#333] text-sm hover:text-red-600 tracking-[0.3em] transition-all duration-300 font-bold border-b border-transparent hover:border-red-600 pb-1"
                        >
                            [ 이상현상 ]
                        </button>
                    </div>
                </>
            )}

            <div className={`mt-8 min-h-[40px] text-lg font-bold ${message?.type === 'success' ? 'text-[#00ff00]' : message?.type === 'neutral' ? 'text-yellow-500' : 'text-[#ff0000]'}`}>
                {message?.text && !isLoading && (
                    <span dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br/>') }}></span>
                )}
            </div>
        </div>
    );
};

export default LoginForm;