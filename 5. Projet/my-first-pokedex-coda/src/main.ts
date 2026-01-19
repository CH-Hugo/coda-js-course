interface Pokemon {
  name: string;
  url: string;
}

const listElement = document.getElementById('pokemon-list') as HTMLUListElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;

const prevBtn = document.getElementById('prev-page') as HTMLButtonElement;
const nextBtn = document.getElementById('next-page') as HTMLButtonElement;
const pageInfo = document.getElementById('page-info') as HTMLElement;

let allPokemons: Pokemon[] = [];
let filteredPokemons: Pokemon[] = [];
let currentPage = 0;
const itemsPerPage = 25;

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
    // Utilisation de l'ID extrait pour l'image
    img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
    img.alt = pokemon.name;

    const span = document.createElement('span');
    span.textContent = `#${pokemonId} - ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}`;

    li.appendChild(img);
    li.appendChild(span);
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

// --- Événements ---

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


fetchAllPokemons().catch(err => console.error("Initialisation échouée", err));