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

// 3. VARIABLES D'ÉTAT
let allPokemons: Pokemon[] = [];
let filteredPokemons: Pokemon[] = [];
let currentPage = 0;
const itemsPerPage = 25;
let gameStarted = false;

// 4. SON ET INTRO
const startSound = new Audio('/src/assets/pokemon-plink_.mp3');
startSound.preload = 'auto';

window.addEventListener('keydown', () => {
    if (!gameStarted) {
        startSound.currentTime = 0;
        startSound.play().catch(err => console.log("Erreur son:", err));

        const introScreen = document.getElementById('intro-screen');
        const pokedexApp = document.getElementById('pokedex-app');

        if (introScreen && pokedexApp) {
            introScreen.classList.add('hidden');
            pokedexApp.classList.remove('hidden');
        }

        gameStarted = true;
        console.log("Le Pokédex est prêt !");
    }
});

// 5. FONCTIONS API ET DÉTAILS
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
                </div>
            `;
        }
        modal?.classList.remove('hidden');
    } catch (error) {
        console.error("Erreur détails :", error);
    }
}

// 6. AFFICHAGE ET PAGINATION
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
        img.alt = pokemon.name;

        const span = document.createElement('span');
        span.textContent = `#${pokemonId} - ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}`;

        li.appendChild(img);
        li.appendChild(span);

        // Événement clic pour ouvrir le modal
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

// 7. ÉVÉNEMENTS INTERFACE
searchInput?.addEventListener('input', () => {
    const value = searchInput.value.toLowerCase();
    filteredPokemons = allPokemons.filter(p => p.name.includes(value));
    currentPage = 0;
    updateDisplay();
});

nextBtn?.addEventListener('click', () => {
    currentPage++;
    updateDisplay();
    window.scrollTo(0, 0);
});

prevBtn?.addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        updateDisplay();
        window.scrollTo(0, 0);
    }
});

closeModalBtn?.addEventListener('click', () => modal?.classList.add('hidden'));

window.addEventListener('click', (event) => {
    if (event.target === modal) modal.classList.add('hidden');
});

// 8. LANCEMENT
fetchAllPokemons().catch(err => console.error("Initialisation échouée", err));