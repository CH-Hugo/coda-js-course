import type { Pokemon } from './types';
import { filteredPokemons, currentPage, itemsPerPage, setAllPokemons } from './state';

const listElement = document.getElementById('pokemon-list') as HTMLUListElement;
const pageInfo = document.getElementById('page-info');
const modal = document.getElementById('pokemon-modal');
const modalBody = document.getElementById('modal-body');
const startSound = new Audio('/src/assets/pokemon-plink_.mp3');

export async function fetchAllPokemons() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await response.json();
        setAllPokemons(data.results);
        updateDisplay();
    } catch (error) { console.error(error); }
}

export function updateDisplay() {
    const startIndex = currentPage * itemsPerPage;
    const pageToDisplay = filteredPokemons.slice(startIndex, startIndex + itemsPerPage);
    displayPokemons(pageToDisplay);
    updatePaginationUI();
}

async function displayPokemons(pokemonsToDisplay: Pokemon[]) {
    if (!listElement) return;
    listElement.innerHTML = '';

    await Promise.all(pokemonsToDisplay.map(async (pokemon) => {
        const urlParts = pokemon.url.split('/');
        const pokemonId = urlParts[urlParts.length - 2];
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const data = await response.json();

        const li = document.createElement('li');
        li.classList.add('pokemon-item');
        const img = document.createElement('img');
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
        li.appendChild(img);

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('pokemon-name-label');
        nameSpan.textContent = `#${pokemonId} - ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}`;
        li.appendChild(nameSpan);

        const typesContainer = document.createElement('div');
        typesContainer.classList.add('types-container');
        data.types.forEach((t: any) => {
            const typeSpan = document.createElement('span');
            typeSpan.classList.add('type-badge', t.type.name);
            typeSpan.textContent = t.type.name.toUpperCase();
            typesContainer.appendChild(typeSpan);
        });
        li.appendChild(typesContainer);
        li.addEventListener('click', () => showPokemonDetail(pokemonId));
        listElement.appendChild(li);
    }));
}

export async function showPokemonDetail(id: string) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();
        startSound.play().catch(() => {});

        const cryUrl = data.cries?.latest || data.cries?.legacy;
        const typesHTML = data.types.map((t: any) => `<span class="type-badge ${t.type.name}">${t.type.name.toUpperCase()}</span>`).join('');
        const statsHTML = data.stats.map((s: any) => `
            <div class="stat-line">
                <span class="stat-name">${s.stat.name.toUpperCase()}</span>
                <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${Math.min(s.base_stat, 100)}%"></div></div>
                <span class="stat-value">${s.base_stat}</span>
            </div>`).join('');

        if (modalBody) {
            modalBody.innerHTML = `
                <div class="modal-detail">
                    <div class="image-container"><img id="pokemon-artwork" src="${data.sprites.other['official-artwork'].front_default}"></div>
                    <div class="header-detail"><h2>${data.name.toUpperCase()}</h2>
                    ${cryUrl ? `<button class="cry-button" id="btn-cry">🔊 CRI</button>` : ''}</div>
                    <div class="info-grid">
                        <div class="physique">
                            <p><strong>N° :</strong> ${data.id}</p>
                            <p><strong>Taille :</strong> ${data.height / 10} m</p>
                            <p><strong>Poids :</strong> ${data.weight / 10} kg</p>
                            <div class="types-container">${typesHTML}</div>
                        </div>
                        <div class="stats-section">${statsHTML}</div>
                    </div>
                </div>`;
            if (cryUrl) {
                document.getElementById('btn-cry')?.addEventListener('click', () => {
                    new Audio(cryUrl).play();
                    const img = document.getElementById('pokemon-artwork');
                    img?.classList.add('bounce-animation');
                    setTimeout(() => img?.classList.remove('bounce-animation'), 500);
                });
            }
        }
        modal?.classList.remove('hidden');
    } catch (error) { console.error(error); }
}

function updatePaginationUI() {
    const maxPage = Math.ceil(filteredPokemons.length / itemsPerPage);
    if (pageInfo) pageInfo.textContent = `Page ${currentPage + 1} sur ${maxPage || 1}`;
}