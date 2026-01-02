export interface Character {
    id: string;
    name: string;
    description: string;
    image?: string;
}

export enum AppState {
    LOGIN = 'LOGIN',
    CHARACTERS = 'CHARACTERS',
    DEATH = 'DEATH'
}

export interface LoginResponse {
    success: boolean;
    token?: string;
    message?: string;
}