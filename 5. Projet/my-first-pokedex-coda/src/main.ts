import { gameStarted, setGameStarted, canInteractWithPC, playerY, setPlayerPos, allPokemons, setFilteredPokemons, currentPage, setCurrentPage } from './state';
import { movePlayer, updatePlayerPosition } from './gameLogic';
import { fetchAllPokemons, updateDisplay } from './pokedex';

const startSound = new Audio('/src/assets/pokemon-plink_.mp3');
const roomMusic = new Audio('/src/assets/theme.mp3');
const pokedexMusic = new Audio('/src/assets/pokedex.mp3');

roomMusic.loop = true; roomMusic.volume = 0.4;
pokedexMusic.loop = true; pokedexMusic.volume = 0.4;

window.addEventListener('keydown', (e) => {
    if (!gameStarted) {
        setGameStarted(true);
        startSound.play().catch(() => {});
        roomMusic.play().catch(() => {});
        document.getElementById('intro-screen')?.classList.add('hidden');
        document.getElementById('game-world')?.classList.remove('hidden');
        updatePlayerPosition();
        return;
    }

    if (canInteractWithPC && e.key === 'Enter') {
        roomMusic.pause();
        pokedexMusic.play().catch(() => {});
        document.getElementById('game-world')?.classList.add('hidden');
        document.getElementById('pokedex-app')?.classList.remove('hidden');
        document.getElementById('ma-bulle-dialogue')?.classList.add('hidden');
        return;
    }

    if (!document.getElementById('game-world')?.classList.contains('hidden')) {
        movePlayer(e.key);
    }
});

document.getElementById('search-input')?.addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value.toLowerCase();
    setFilteredPokemons(allPokemons.filter(p => p.name.includes(val)));
    setCurrentPage(0);
    updateDisplay();
});

document.getElementById('next-page')?.addEventListener('click', () => { setCurrentPage(currentPage + 1); updateDisplay(); window.scrollTo(0,0); });
document.getElementById('prev-page')?.addEventListener('click', () => { if(currentPage > 0) { setCurrentPage(currentPage - 1); updateDisplay(); window.scrollTo(0,0); } });
document.getElementById('close-modal')?.addEventListener('click', () => document.getElementById('pokemon-modal')?.classList.add('hidden'));

document.getElementById('back-to-room')?.addEventListener('click', () => {
    pokedexMusic.pause();
    document.getElementById('pokedex-app')?.classList.add('hidden');
    document.getElementById('game-world')?.classList.remove('hidden');
    roomMusic.play().catch(() => {});
    setPlayerPos(200, playerY + 20);
    updatePlayerPosition();
});

fetchAllPokemons();