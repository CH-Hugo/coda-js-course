import type { Pokemon } from './types';

export let allPokemons: Pokemon[] = [];
export let filteredPokemons: Pokemon[] = [];
export let currentPage = 0;
export const itemsPerPage = 25;
export let gameStarted = false;
export let canInteractWithPC = false;

export let playerX = 200; 
export let playerY = 200; 
export const step = 8;    
export let walkFrame = 0; 

export const setGameStarted = (v: boolean) => { gameStarted = v; };
export const setCanInteract = (v: boolean) => { canInteractWithPC = v; };
export const setPlayerPos = (x: number, y: number) => { playerX = x; playerY = y; };
export const setWalkFrame = (f: number) => { walkFrame = f; };
export const setCurrentPage = (p: number) => { currentPage = p; };
export const setAllPokemons = (data: Pokemon[]) => { 
    allPokemons = data; 
    filteredPokemons = [...data]; 
};
export const setFilteredPokemons = (data: Pokemon[]) => { filteredPokemons = data; };