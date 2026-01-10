import { Character } from './types';

// CONFIGURATION
// Set to false to connect to a real NestJS backend running on /api
const USE_MOCK = true; 
const API_BASE = '/api';

// --- MOCK DATA (Simulates Backend Database) ---
const MOCK_PASSWORD = "HAPPYORDEATH";

// Updated mock characters: Generated 24 items to demonstrate scrolling
const MOCK_CHARACTERS: Character[] = Array.from({ length: 24 }, (_, i) => {
    const id = (i + 1).toString();
    
    // ID 1 Custom Data
    if (id === '1') {
        return {
            id: '1',
            name: '상중하',
            description: '능력: 리플렉트 | 클래스: A',
            image: 'https://igx.kr/r/2C/0/0'
        };
    }

    // ID 2 Custom Data
    if (id === '2') {
        return {
            id: '2',
            name: '비네트',
            description: '능력:영력 흡수/클래스:S',
            image: 'https://igx.kr/r/2C/1/0'
        };
    }

    // ID 3 Custom Data
    if (id === '3') {
        return {
            id: '3',
            name: '챠린',
            description: '능력:X/클래스 S',
            image: 'https://igx.kr/r/2C/2/0'
        };
    }

    // ID 4 Custom Data
    if (id === '4') {
        return {
            id: '4',
            name: '미야',
            description: '능력:포켓 디멘션/클래스 A',
            image: 'https://igx.kr/r/2C/3/0'
        };
    }

    // ID 5
    if (id === '5') {
        return {
            id: '5',
            name: '강진혁',
            description: '능력:사일런스/클래스 S',
            image: 'https://igx.kr/r/2C/5/0'
        };
    }

    // ID 6
    if (id === '6') {
        return {
            id: '6',
            name: '유나',
            description: '능력:데이터 링크/클래스 B',
            image: 'https://igx.kr/r/2C/4/0'
        };
    }

    // ID 7
    if (id === '7') {
        return {
            id: '7',
            name: '박준수',
            description: '능력:그래비티 필드/클래스 C',
            image: 'https://igx.kr/r/2C/6/0'
        };
    }

    // ID 8
    if (id === '8') {
        return {
            id: '8',
            name: '윤세아',
            description: '능력:마리오네트/클래스 B',
            image: 'https://igx.kr/r/2C/7/0'
        };
    }

    // ID 9
    if (id === '9') {
        return {
            id: '9',
            name: '레이븐',
            description: '능력:헤마토맨시/클래스 S',
            image: 'https://igx.kr/r/2C/8/0'
        };
    }

    // ID 10
    if (id === '10') {
        return {
            id: '10',
            name: '바이퍼',
            description: '능력:톡신 스킨/클래스 A',
            image: 'https://igx.kr/r/2C/14/0'
        };
    }

    // ID 11
    if (id === '11') {
        return {
            id: '11',
            name: '조커',
            description: '능력:미러 이미지/클래스 A',
            image: 'https://igx.kr/r/2C/10/0'
        };
    }

    // ID 12
    if (id === '12') {
        return {
            id: '12',
            name: '그레이',
            description: '능력:오염 동화/클래스 A',
            image: 'https://igx.kr/r/2C/11/0'
        };
    }

    // ID 13
    if (id === '13') {
        return {
            id: '13',
            name: '제트',
            description: '능력:에어로 로드/클래스 B',
            image: 'https://igx.kr/r/2C/13/0'
        };
    }

    // ID 14
    if (id === '14') {
        return {
            id: '14',
            name: '이수연',
            description: '능력:퓨리파이/클래스 S',
            image: 'https://igx.kr/r/2C/12/0'
        };
    }

    return {
        id: id,
        name: `SEC-${id}`, // Changed from NAME to SEC- for generic units
        description: 'UNKNOWN',
        image: ''
    };
});

// --- UTILS ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API METHODS ---

/**
 * Authenticate with the NestJS backend.
 * Endpoint: POST /api/auth/login
 */
export const login = async (password: string): Promise<boolean> => {
    if (USE_MOCK) {
        // Simulate network latency typical of a server handshake
        await delay(2500); 
        
        // Allow case-insensitive and space-insensitive password matching
        // e.g., "happy or death", "HAPPY OR DEATH", "happyordeath" -> "HAPPYORDEATH"
        const normalizedInput = password.replace(/\s+/g, '').toUpperCase();
        const normalizedTarget = MOCK_PASSWORD.replace(/\s+/g, '').toUpperCase();
        
        return normalizedInput === normalizedTarget;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        
        if (response.status === 201 || response.status === 200) {
            return true;
        }
        return false;
    } catch (error) {
        console.error("UPLINK ERROR:", error);
        return false;
    }
};

/**
 * Fetch character data from the NestJS backend.
 * Endpoint: GET /api/characters
 */
export const getCharacters = async (): Promise<Character[]> => {
    if (USE_MOCK) {
        await delay(1500); // Simulate data decryption/download
        return MOCK_CHARACTERS;
    }

    try {
        const response = await fetch(`${API_BASE}/characters`);
        if (!response.ok) throw new Error("Failed to fetch data");
        return await response.json();
    } catch (error) {
        console.error("DOWNLOAD ERROR:", error);
        return [];
    }
};