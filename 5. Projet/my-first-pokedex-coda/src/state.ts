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

export let activeFilters = {
    name: '',
    type: '',
    gen: 0,
    ability: ''
};

export const updateFilters = (
    key: keyof typeof activeFilters,
    value: string | number
) => {
    (activeFilters as any)[key] = value;
    setCurrentPage(0);
};

export const resetFilters = () => {
    activeFilters = {
        name: '',
        type: '',
        gen: 0,
        ability: ''
    };

    setFilteredPokemons([...allPokemons]);
    setCurrentPage(0);
};

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
