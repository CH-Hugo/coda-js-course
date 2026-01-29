import type { Pokemon } from './types';

// Données du Pokédex (Liste générale)
export let allPokemons: Pokemon[] = [];
export let filteredPokemons: Pokemon[] = [];
export let currentPage = 0;
export const itemsPerPage = 25;

// États du Jeu
export let gameStarted = false;
export let canInteractWithPC = false;

// Position du Joueur
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
export const setFilteredPokemons = (data: Pokemon[]) => { filteredPokemons = data; };

// Définition de l'objet de filtre
export let activeFilters = {
    name: '',
    type: '',
    gen: 0,
    ability: ''
};

/**
 * Met à jour un critère de recherche spécifique
 */
export const updateFilters = (key: keyof typeof activeFilters, value: string | number) => {
    // On met à jour la valeur. Le "as any" aide TS à accepter le mélange string/number ici.
    (activeFilters as any)[key] = value;

    // TRÈS IMPORTANT : Quand on filtre, on revient toujours à la première page
    setCurrentPage(0);
};

/**
 * Réinitialise tous les filtres à zéro
 */
export const resetFilters = () => {
    activeFilters = {
        name: '',
        type: '',
        gen: 0,
        ability: ''
    };

    // On remet la liste filtrée à la liste complète
    setFilteredPokemons([...allPokemons]);
    setCurrentPage(0);
};

/** --- GESTION DES 3 ÉQUIPES --- **/

export let teams: { [key: number]: any[] } = {
    1: [],
    2: [],
    3: []
};

export let activeTeamId = 1;

export const setActiveTeamId = (id: number) => {
    if (id >= 1 && id <= 3) activeTeamId = id;
};

export const getActiveTeam = () => teams[activeTeamId];

export const setPlayerTeam = (newTeam: any[]) => {
    teams[activeTeamId] = [...newTeam];
};

export function saveTeam() {
    localStorage.setItem('pokemonTeams', JSON.stringify(teams));
    localStorage.setItem('activeTeamId', activeTeamId.toString());
}

export function loadTeam() {
    const savedTeams = localStorage.getItem('pokemonTeams');
    const savedActiveId = localStorage.getItem('activeTeamId');

    if (savedTeams) {
        try {
            teams = JSON.parse(savedTeams);
        } catch (e) {
            console.error("Erreur chargement équipes:", e);
        }
    }
    if (savedActiveId) {
        activeTeamId = parseInt(savedActiveId);
    }
}