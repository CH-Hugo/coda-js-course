import type { Pokemon } from './types';

// Données du Pokédex (Liste générale)
export let allPokemons: Pokemon[] = [];
export let filteredPokemons: Pokemon[] = [];
export let currentPage = 0;
export const itemsPerPage = 25;

// États du Jeu
export let gameStarted = false;
export let canInteractWithPC = false;

// Position du Joueur (Hugo)
export let playerX = 200; 
export let playerY = 200; 
export const step = 8;     
export let walkFrame = 0; 

/** --- SETTERS --- **/

export const setGameStarted = (v: boolean) => { gameStarted = v; };
export const setCanInteract = (v: boolean) => { canInteractWithPC = v; };
export const setPlayerPos = (x: number, y: number) => { playerX = x; playerY = y; };
export const setWalkFrame = (f: number) => { walkFrame = f; };
export const setCurrentPage = (p: number) => { currentPage = p; };

export const setAllPokemons = (data: Pokemon[]) => { 
    allPokemons = data; 
    filteredPokemons = [...data]; 
};

export const setFilteredPokemons = (data: Pokemon[]) => { 
    filteredPokemons = data; 
};

/** --- GESTION DE L'ÉQUIPE (TEAM) --- **/

// On utilise any[] pour accepter les données complètes de l'API (types, sprites, stats)
export let playerTeam: any[] = [];

export const setPlayerTeam = (newTeam: any[]) => {
    // On vide le tableau actuel et on injecte la nouvelle équipe
    playerTeam.length = 0;
    playerTeam.push(...newTeam);
};

// Sauvegarde l'équipe dans le stockage local du navigateur
export function saveTeam() {
    localStorage.setItem('pokemonTeam', JSON.stringify(playerTeam));
}

// Charge l'équipe au démarrage du jeu
export function loadTeam() {
    const saved = localStorage.getItem('pokemonTeam');
    if (saved) {
        try {
            const team = JSON.parse(saved);
            playerTeam.length = 0; 
            playerTeam.push(...team);
            console.log("Équipe chargée avec succès :", playerTeam);
        } catch (e) {
            console.error("Erreur lors du chargement de l'équipe :", e);
        }
    }
}