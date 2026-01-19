// 1. Interfaces
interface Pokemon {
    name: string;
    url: string;
}

// 2. Sélections DOM (Éléments de la liste)
const listElement = document.getElementById('pokemon-list') as HTMLUListElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const prevBtn = document.getElementById('prev-page') as HTMLButtonElement;
const nextBtn = document.getElementById('next-page') as HTMLButtonElement;
const pageInfo = document.getElementById('page-info') as HTMLElement;

// 3. Sélections DOM (Éléments du Modal)
const modal = document.getElementById('pokemon-modal') as HTMLElement;
const modalBody = document.getElementById('modal-body') as HTMLElement;
const closeModalBtn = document.getElementById('close-modal') as HTMLButtonElement;

// 4. Variables d'état
let allPokemons: Pokemon[] = [];
let filteredPokemons: Pokemon[] = [];
let currentPage = 0;
const itemsPerPage = 25;

// 5. FONCTION : Afficher les détails d'un Pokémon (Le Modal)
// On la place ici pour qu'elle soit connue avant d'être appelée
async function showPokemonDetail(id: string) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!response.ok) throw new Error('Impossible de récupérer les détails');

        const data = await response.json();

        // On prépare le contenu du modal avec les données de l'API
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

        // On affiche le modal
        modal?.classList.remove('hidden');

    } catch (error) {
        console.error("Erreur détails :", error);
    }
}

// 6. FONCTION : Récupérer tous les Pokémon
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

// 7. FONCTIONS : Affichage et Pagination
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
        li.dataset.id = pokemonId; // Stockage de l'ID

        const img = document.createElement('img');
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
        img.alt = pokemon.name;

        const span = document.createElement('span');
        span.textContent = `#${pokemonId} - ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}`;

        li.appendChild(img);
        li.appendChild(span);

        // CLIC SUR LA CARTE
        li.addEventListener('click', () => {
            showPokemonDetail(pokemonId);
        });

        listElement.appendChild(li);
    });
}

function updatePaginationUI() {
    const maxPage = Math.ceil(filteredPokemons.length / itemsPerPage);
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage + 1} sur ${maxPage || 1}`;
    }

    if (prevBtn) prevBtn.disabled = currentPage === 0;
    if (nextBtn) nextBtn.disabled = (currentPage + 1) >= maxPage;
}

// 8. Événements
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

// Fermer le modal au clic sur le bouton
closeModalBtn?.addEventListener('click', () => {
    modal?.classList.add('hidden');
});

// Fermer le modal si on clique en dehors du contenu
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.classList.add('hidden');
    }
});

// 9. Lancement
fetchAllPokemons().catch(err => console.error("Initialisation échouée", err));