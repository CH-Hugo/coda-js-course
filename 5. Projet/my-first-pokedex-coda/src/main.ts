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
    loadTeam
} from './state';
import { movePlayer, updatePlayerPosition } from './gameLogic';
import { fetchAllPokemons, updateDisplay, updateTeamUI } from './pokedex';
import { pokemonTransition } from './utils';

// --- INITIALISATION DES AUDIOS ---
const startSound = new Audio('/src/assets/pokemon-plink_.mp3');
const roomMusic = new Audio('/src/assets/theme.mp3');
const pokedexMusic = new Audio('/src/assets/pokedex.mp3');

roomMusic.loop = true;
roomMusic.volume = 0.4;
pokedexMusic.loop = true; 
pokedexMusic.volume = 0.4;

// --- GESTION DES TOUCHES ---
window.addEventListener('keydown', (e) => {
    // 1. Démarrage du jeu (Ecran titre)
    if (!gameStarted) {
        setGameStarted(true);
        startSound.play().catch(() => {});
        
        // On lance la transition
        pokemonTransition(() => {
            roomMusic.play().catch(() => {});
            document.getElementById('intro-screen')?.classList.add('hidden');
            document.getElementById('game-world')?.classList.remove('hidden');
            updatePlayerPosition();
        });
        
        return;
    }

    // 2. Interaction PC (Ouvrir le Pokédex avec Transition)
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

    // 3. Déplacement (uniquement si le monde est visible)
    const isWorldVisible = !document.getElementById('game-world')?.classList.contains('hidden');
    if (isWorldVisible) {
        movePlayer(e.key);
    }
});

// --- INTERFACE DU POKÉDEX ---

// Barre de recherche
document.getElementById('search-input')?.addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value.toLowerCase();
    setFilteredPokemons(allPokemons.filter(p => p.name.includes(val)));
    setCurrentPage(0);
    updateDisplay();
});

// Boutons de pagination
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

// Fermer la fiche d'un Pokémon
document.getElementById('close-modal')?.addEventListener('click', () => {
    document.getElementById('pokemon-modal')?.classList.add('hidden');
});

// --- RETOUR AU JEU (Bouton RETOUR avec Transition) ---
document.getElementById('back-to-room')?.addEventListener('click', () => {
    pokemonTransition(() => {
        pokedexMusic.pause();
        document.getElementById('pokedex-app')?.classList.add('hidden');
        document.getElementById('game-world')?.classList.remove('hidden');
        roomMusic.play().catch(() => {});
        startSound.play().catch(() => {});
        
        // Repositionne pour éviter de boucler sur le dialogue
        // On garde son X (200) et on le descend un peu (Y + 20)
        setPlayerPos(200, playerY + 20);
        updatePlayerPosition();
    });
});

// Ouvrir le panneau (Clic sur la Pokéball/Texte Équipe)
document.getElementById('open-team')?.addEventListener('click', () => {
    const teamPanel = document.getElementById('team-panel');
    teamPanel?.classList.remove('hidden'); // Affiche le panneau
    updateTeamUI(); // Force la mise à jour visuelle des membres et de l'analyse
});

// Fermer le panneau (Bouton RETOUR du panneau latéral)
document.getElementById('close-team')?.addEventListener('click', () => {
    document.getElementById('team-panel')?.classList.add('hidden');
});

// --- LANCEMENT INITIAL ---
loadTeam();
fetchAllPokemons();
updateTeamUI(); // Initialise l'affichage au chargement