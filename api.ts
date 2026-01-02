import { Character } from './types';

// CONFIGURATION
// Set to false to connect to a real NestJS backend running on /api
const USE_MOCK = true; 
const API_BASE = '/api';

// --- MOCK DATA (Simulates Backend Database) ---
const MOCK_PASSWORD = "HAPPYORDEATH";
const MOCK_CHARACTERS: Character[] = [
    {
        id: '1',
        name: 'UNIT-704',
        description: '"명령을 대기 중입니다. 마스터."'
    },
    {
        id: '2',
        name: '닥터 K',
        description: '"실험체는 준비되었나? 시간이 없어."'
    },
    {
        id: '3',
        name: 'Unknown_X',
        description: '데이터 손상됨... 접근 불가 구역의 존재.'
    }
];

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
        // Increased delay to allow the "hacker log" animation to play out
        await delay(2500); 
        return password === MOCK_PASSWORD;
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