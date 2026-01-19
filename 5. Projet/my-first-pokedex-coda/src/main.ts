// 1. INTERFACES
interface Pokemon {
    name: string;
    url: string;
}

// 2. SÉLECTIONS DOM
const listElement = document.getElementById('pokemon-list') as HTMLUListElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const prevBtn = document.getElementById('prev-page') as HTMLButtonElement;
const nextBtn = document.getElementById('next-page') as HTMLButtonElement;
const pageInfo = document.getElementById('page-info') as HTMLElement;

// Sélections Modal
const modal = document.getElementById('pokemon-modal') as HTMLElement;
const modalBody = document.getElementById('modal-body') as HTMLElement;
const closeModalBtn = document.getElementById('close-modal') as HTMLButtonElement;

// Sélections Monde
const gameWorld = document.getElementById('game-world') as HTMLElement;
const pokedexApp = document.getElementById('pokedex-app') as HTMLElement;
const player = document.getElementById('player') as HTMLElement;

// 3. VARIABLES D'ÉTAT
let allPokemons: Pokemon[] = [];
let filteredPokemons: Pokemon[] = [];
let currentPage = 0;
const itemsPerPage = 25;
let gameStarted = false;

// Position et Animation du joueur
let playerX = 200; // Aligné au centre de la chambre
let playerY = 200; 
const step = 8;    // Pas plus petit pour plus de fluidité
let walkFrame = 0; // Pour alterner les jambes du sprite

// 4. SON ET INTRO
const startSound = new Audio('/src/assets/pokemon-plink_.mp3');
const roomMusic = new Audio('/src/assets/theme.mp3'); 

startSound.preload = 'auto';
roomMusic.loop = true; 
roomMusic.volume = 0.4; 

// Gestionnaire global des touches
window.addEventListener('keydown', (e) => {
    // Phase 1 : Quitter l'intro
    if (!gameStarted) {
        startSound.currentTime = 0;
        startSound.play().catch(err => console.log("Erreur son:", err));

        roomMusic.play().catch(err => console.log("Musique bloquée:", err));

        const introScreen = document.getElementById('intro-screen');
        if (introScreen && gameWorld) {
            introScreen.classList.add('hidden');
            gameWorld.classList.remove('hidden');
        }
        gameStarted = true;
        updatePlayerPosition();
        return;
    }

    // Phase 2 : Déplacement dans la chambre
    if (!gameWorld.classList.contains('hidden')) {
        movePlayer(e.key);
    }
});

    // ... la suite de ton code de mouvement
// 5. LOGIQUE DE JEU (Mouvement & Collision)
function movePlayer(key: string) {
    if (!player) return;

    const bubble = document.getElementById('player-bubble');
    if (bubble) {
        bubble.style.display = 'none'; // Ou bubble.remove()
    }

    let nextX = playerX;
    let nextY = playerY;

    // Calcul de l'animation de marche
    walkFrame = (walkFrame + 1) % 4;
    const posX = -(walkFrame * 48);

    if (key === 'ArrowUp') {
        nextY -= step;
        player.style.backgroundPosition = `${posX}px -192px`;
    } else if (key === 'ArrowDown') {
        nextY += step;
        player.style.backgroundPosition = `${posX}px 0px`;
    } else if (key === 'ArrowLeft') {
        nextX -= step;
        player.style.backgroundPosition = `${posX}px -64px`;
    } else if (key === 'ArrowRight') {
        nextX += step;
        player.style.backgroundPosition = `${posX}px -128px`;
    }

    // VÉRIFICATION DES COLLISIONS MURS ET MEUBLES
    if (canMoveTo(nextX, nextY)) {
        playerX = nextX;
        playerY = nextY;
        updatePlayerPosition();
        checkCollision();
    }
}

function canMoveTo(x: number, y: number): boolean {
    // 1. Murs extérieurs
    if (x < 10 || x > 400 || y < 50 || y > 300) return false;

    // 2. Collision avec le LIT (en bas à droite)
    if (x > 330 && y > 210) return false;

    // 3. Collision avec la TV et les MEUBLES DU HAUT
    if (y < 115 && x > 70) return false;

    // 4. Collision avec la PLANTE (en bas à gauche)
    if (x < 50 && y > 260) return false;

    return true; 
}

function updatePlayerPosition() {
    if (player) {
        player.style.left = `${playerX}px`;
        player.style.top = `${playerY}px`;
    }
}

function checkCollision() {
    // Zone du PC AFFINÉE (juste devant le bureau bleu)
    const pcRect = { x: 15, y: 65, width: 40, height: 40 };

    if (playerX < pcRect.x + pcRect.width &&
        playerX + 32 > pcRect.x &&
        playerY < pcRect.y + pcRect.height &&
        playerY + 32 > pcRect.y) {
        
        roomMusic.pause();
        gameWorld.classList.add('hidden');
        pokedexApp.classList.remove('hidden');
    }
}

// 6. FONCTIONS API ET DÉTAILS
async function fetchAllPokemons() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        if (!response.ok) throw new Error('Erreur réseau');
        const data = await response.json();
        allPokemons = data.results;
        filteredPokemons = [...allPokemons];
        updateDisplay();
    } catch (error) {
        console.error("Erreur API :", error);
    }
}

async function showPokemonDetail(id: string) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();

        if (modalBody) {
            modalBody.innerHTML = `
                <div class="modal-detail">
                    <img src="${data.sprites.other['official-artwork'].front_default}" alt="${data.name}">
                    <h2>${data.name.toUpperCase()}</h2>
                    <div class="stats-container">
                        <p><strong>N° :</strong> ${data.id}</p>
                        <p><strong>Taille :</strong> ${data.height / 10} m</p>
                        <p><strong>Poids :</strong> ${data.weight / 10} kg</p>
                        <p><strong>Types :</strong> ${data.types.map((t: any) => t.type.name).join(', ')}</p>
                    </div>
                </div>`;
        }
        modal?.classList.remove('hidden');
    } catch (error) {
        console.error("Erreur détails :", error);
    }
}

// 7. AFFICHAGE ET PAGINATION
function updateDisplay() {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageToDisplay = filteredPokemons.slice(startIndex, endIndex);
    displayPokemons(pageToDisplay);
    updatePaginationUI();
}

function displayPokemons(pokemonsToDisplay: Pokemon[]) {
    if (!listElement) return;
    listElement.innerHTML = '';

    pokemonsToDisplay.forEach((pokemon) => {
        const urlParts = pokemon.url.split('/');
        const pokemonId = urlParts[urlParts.length - 2];
        const li = document.createElement('li');
        li.classList.add('pokemon-item');
        
        const img = document.createElement('img');
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
        li.appendChild(img);

        const span = document.createElement('span');
        span.textContent = `#${pokemonId} - ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}`;
        li.appendChild(span);

        li.addEventListener('click', () => showPokemonDetail(pokemonId));
        listElement.appendChild(li);
    });
}

function updatePaginationUI() {
    const maxPage = Math.ceil(filteredPokemons.length / itemsPerPage);
    if (pageInfo) pageInfo.textContent = `Page ${currentPage + 1} sur ${maxPage || 1}`;
    if (prevBtn) prevBtn.disabled = currentPage === 0;
    if (nextBtn) nextBtn.disabled = (currentPage + 1) >= maxPage;
}

// 8. ÉVÉNEMENTS INTERFACE
searchInput?.addEventListener('input', () => {
    filteredPokemons = allPokemons.filter(p => p.name.includes(searchInput.value.toLowerCase()));
    currentPage = 0;
    updateDisplay();
});

nextBtn?.addEventListener('click', () => { currentPage++; updateDisplay(); window.scrollTo(0, 0); });
prevBtn?.addEventListener('click', () => { if (currentPage > 0) { currentPage--; updateDisplay(); window.scrollTo(0, 0); } });
closeModalBtn?.addEventListener('click', () => modal?.classList.add('hidden'));

// 9. LANCEMENT
fetchAllPokemons().catch(err => console.error("Initialisation échouée", err));