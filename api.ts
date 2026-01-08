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
            description: '능력: 신속 | 클래스: A',
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