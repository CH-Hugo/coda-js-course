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
let canInteractWithPC = false;

// Position et Animation du joueur
let playerX = 200; 
let playerY = 200; 
const step = 8;    
let walkFrame = 0; 

// 4. SON ET INTRO
const startSound = new Audio('/src/assets/pokemon-plink_.mp3');
const roomMusic = new Audio('/src/assets/theme.mp3');
const pokedexMusic = new Audio('/src/assets/pokedex.mp3'); 

startSound.preload = 'auto';
roomMusic.loop = true; 
roomMusic.volume = 0.4;
pokedexMusic.loop = true; 
pokedexMusic.volume = 0.4;

// Gestionnaire global des touches
window.addEventListener('keydown', (e) => {
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

    if (!gameWorld.classList.contains('hidden') && canInteractWithPC) {
        if (e.key === 'Enter') {
            roomMusic.pause();
            gameWorld.classList.add('hidden'); 
            pokedexApp.classList.remove('hidden'); 
            startSound.currentTime = 0;
            startSound.play().catch(err => console.log("Erreur son:", err));
            pokedexMusic.play().catch(err => console.log("Erreur son:", err));
            
            const bulle = document.getElementById('ma-bulle-dialogue');
            if (bulle) bulle.classList.add('hidden');
            
            return; 
        }
    }

    if (!gameWorld.classList.contains('hidden')) {
        movePlayer(e.key);
    }
});

// 5. LOGIQUE DE JEU (Mouvement & Collision)
function movePlayer(key: string) {
    if (!player) return;

    const bubble = document.getElementById('player-bubble');
    if (bubble) {
        bubble.style.display = 'none'; 
    }

    let nextX = playerX;
    let nextY = playerY;

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

    if (canMoveTo(nextX, nextY)) {
        playerX = nextX;
        playerY = nextY;
        updatePlayerPosition();
        checkCollision();
    }
}

function canMoveTo(x: number, y: number): boolean {
    if (x < 0 || x > 350 || y < 40 || y > 270) return false;
    if (x > 260 && y > 170) return false;
    if (y < 115 && x > 70) return false;
    if (x < 45 && y > 190) return false;
    return true; 
}

function updatePlayerPosition() {
    if (player) {
        player.style.left = `${playerX}px`;
        player.style.top = `${playerY}px`;
    }
}

function checkCollision() {
    const pcRect = { x: 15, y: 65, width: 40, height: 40 };
    const bulleElement = document.getElementById('ma-bulle-dialogue');

    const isTouchingPC = (
        playerX < pcRect.x + pcRect.width &&
        playerX + 32 > pcRect.x &&
        playerY < pcRect.y + pcRect.height &&
        playerY + 32 > pcRect.y
    );

    if (isTouchingPC) {
        if (bulleElement) {
            bulleElement.innerHTML = "Veux-tu ouvrir le Pokédex ? <br> (Appuie sur ENTRÉE)";
            bulleElement.classList.remove('hidden');
        }
        canInteractWithPC = true;
    } else {
        if (bulleElement) {
            bulleElement.classList.add('hidden');
        }
        canInteractWithPC = false;
    }
}

// 6. FONCTIONS API ET DÉTAILS (VERSION COLLÈGUE)
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
        startSound.play().catch(err => console.log("Erreur son:", err));

        // Génération des stats avec barres de remplissage (Code collègue)
        const statsHTML = data.stats.map((s: any) => `
            <div class="stat-line">
                <span class="stat-name">${s.stat.name.toUpperCase()}</span>
                <div class="stat-bar-bg">
                    <div class="stat-bar-fill" style="width: ${Math.min(s.base_stat, 100)}%"></div>
                </div>
                <span class="stat-value">${s.base_stat}</span>
            </div>
        `).join('');

        if (modalBody) {
            modalBody.innerHTML = `
                <div class="modal-detail">
                    <img src="${data.sprites.other['official-artwork'].front_default}" alt="${data.name}">
                    <h2>${data.name.toUpperCase()}</h2>
                    
                    <div class="info-grid">
                        <div class="physique">
                            <p><strong>N° :</strong> ${data.id}</p>
                            <p><strong>Taille :</strong> ${data.height / 10} m</p>
                            <p><strong>Poids :</strong> ${data.weight / 10} kg</p>
                            <p><strong>Types :</strong> ${data.types.map((t: any) => t.type.name).join(', ')}</p>
                        </div>
                        
                        <div class="stats-section">
                            ${statsHTML}
                        </div>
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

const backBtn = document.getElementById('back-to-room') as HTMLButtonElement;
backBtn?.addEventListener('click', () => {
    startSound.play().catch(err => console.log("Erreur son:", err));
    pokedexApp.classList.add('hidden');
    pokedexMusic.pause();
    gameWorld.classList.remove('hidden');
    roomMusic.play().catch(err => console.log("Musique bloquée :", err));
    canInteractWithPC = false;
    playerY += 10;
    updatePlayerPosition();
});

// 9. LANCEMENT
fetchAllPokemons().catch(err => console.error("Initialisation échouée", err));