import { 
    gameStarted, 
    setGameStarted, 
    canInteractWithPC, 
    playerY, 
    setPlayerPos, 
    allPokemons, 
    setFilteredPokemons, 
    currentPage, 
    setCurrentPage,
    loadTeam,
    setActiveTeamId} from './state';
import { movePlayer, updatePlayerPosition } from './gameLogic';
import { fetchAllPokemons, updateDisplay, updateTeamUI } from './pokedex';
import { pokemonTransition } from './utils';

const startSound = new Audio('/src/assets/pokemon-plink_.mp3');
const roomMusic = new Audio('/src/assets/theme.mp3');
const pokedexMusic = new Audio('/src/assets/pokedex.mp3');

roomMusic.loop = true;
roomMusic.volume = 0.4;
pokedexMusic.loop = true; 
pokedexMusic.volume = 0.4;
 
window.addEventListener('keydown', (e) => {
    if (!gameStarted) {
        setGameStarted(true);
        startSound.play().catch(() => {});
        
        pokemonTransition(() => {
            roomMusic.play().catch(() => {});
            document.getElementById('intro-screen')?.classList.add('hidden');
            document.getElementById('game-world')?.classList.remove('hidden');
            updatePlayerPosition();
        });
        
        return;
    }

    if (canInteractWithPC && e.key === 'Enter') {
        pokemonTransition(() => {
            roomMusic.pause();
            pokedexMusic.play().catch(() => {});
            startSound.play().catch(() => {});
            document.getElementById('game-world')?.classList.add('hidden');
            document.getElementById('pokedex-app')?.classList.remove('hidden');
            document.getElementById('ma-bulle-dialogue')?.classList.add('hidden');
        });
        return;
    }

    const isWorldVisible = !document.getElementById('game-world')?.classList.contains('hidden');
    if (isWorldVisible) {
        movePlayer(e.key);
    }
});

document.getElementById('search-input')?.addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value.toLowerCase();
    setFilteredPokemons(allPokemons.filter(p => p.name.includes(val)));
    setCurrentPage(0);
    updateDisplay();
});

document.getElementById('next-page')?.addEventListener('click', () => { 
    setCurrentPage(currentPage + 1); 
    updateDisplay(); 
    window.scrollTo(0, 0); 
});

document.getElementById('prev-page')?.addEventListener('click', () => { 
    if (currentPage > 0) { 
        setCurrentPage(currentPage - 1); 
        updateDisplay(); 
        window.scrollTo(0, 0); 
    } 
});

document.getElementById('close-modal')?.addEventListener('click', () => {
    document.getElementById('pokemon-modal')?.classList.add('hidden');
});

document.getElementById('back-to-room')?.addEventListener('click', () => {
    pokemonTransition(() => {
        pokedexMusic.pause();
        document.getElementById('pokedex-app')?.classList.add('hidden');
        document.getElementById('game-world')?.classList.remove('hidden');
        roomMusic.play().catch(() => {});
        startSound.play().catch(() => {});
        
        setPlayerPos(200, playerY + 20);
        updatePlayerPosition();
    });
});

document.getElementById('open-team')?.addEventListener('click', () => {
    const teamPanel = document.getElementById('team-panel');
    teamPanel?.classList.remove('hidden'); 
    updateTeamUI(); 
});

document.getElementById('close-team')?.addEventListener('click', () => {
    document.getElementById('team-panel')?.classList.add('hidden');
});

[1, 2, 3].forEach(id => {
    const tab = document.getElementById(`tab-${id}`);
    tab?.addEventListener('click', () => {
        setActiveTeamId(id);
        
        document.querySelectorAll('.team-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        updateTeamUI();
        startSound.play().catch(() => {});
    });
});

loadTeam();
fetchAllPokemons();
updateTeamUI();
