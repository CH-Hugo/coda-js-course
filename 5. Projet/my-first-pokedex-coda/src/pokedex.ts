import type { Pokemon } from './types';
import {
    allPokemons,
    filteredPokemons,
    currentPage,
    itemsPerPage,
    setAllPokemons,
    setFilteredPokemons,
    getActiveTeam,
    activeTeamId,
    saveTeam,
    setCurrentPage,
    updateFilters,
    activeFilters,
    resetFilters,
    setPlayerTeam
} from './state';

const listElement = document.getElementById('pokemon-list') as HTMLUListElement;
const pageInfo = document.getElementById('page-info');
const modal = document.getElementById('pokemon-modal');
const modalBody = document.getElementById('modal-body');
const startSound = new Audio('/src/assets/pokemon-plink_.mp3');

function getGenerationById(id: number): number {
    if (id <= 0) return 0;
    if (id <= 151) return 1;
    if (id <= 251) return 2;
    if (id <= 386) return 3;
    if (id <= 493) return 4;
    if (id <= 649) return 5;
    if (id <= 721) return 6;
    if (id <= 809) return 7;
    if (id <= 898) return 8;
    if (id <= 1025) return 9;
    return 0;
}

export async function fetchAllPokemons() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1300');
        const data = await response.json();

        const detailedPokemons = await Promise.all(
            data.results.map(async (pokemon: any) => {
                const res = await fetch(pokemon.url);
                const details = await res.json();

                return {
                    name: pokemon.name,
                    url: pokemon.url,
                    id: details.id,
                    types: details.types,
                    abilities: details.abilities,
                    generation: getGenerationById(details.id)
                };
            })
        );

        setAllPokemons(detailedPokemons);
        updateDisplay();
    } catch (error) {
        console.error("Erreur d'initialisation du Pokédex:", error);
    }
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

    const pokemonCards = await Promise.all(pokemonsToDisplay.map(async (pokemon) => {
        const urlParts = pokemon.url.split('/');
        const pokemonId = parseInt(urlParts[urlParts.length - 2]);

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

        li.addEventListener('click', () => showPokemonDetail(pokemonId.toString()));
        return { id: pokemonId, element: li };
    }));

    pokemonCards.sort((a, b) => a.id - b.id);
    pokemonCards.forEach(card => listElement.appendChild(card.element));
}

function applyAllFilters() {
    const nameVal = (document.getElementById('search-input') as HTMLInputElement)?.value.toLowerCase() || "";
    const typeVal = (document.getElementById('filter-type') as HTMLSelectElement).value;
    const genVal = parseInt((document.getElementById('filter-gen') as HTMLSelectElement).value);
    const abilityVal = (document.getElementById('filter-ability') as HTMLInputElement).value.toLowerCase();

    updateFilters('name', nameVal);
    updateFilters('type', typeVal);
    updateFilters('gen', genVal);
    updateFilters('ability', abilityVal);

    const result = allPokemons.filter(p => {
        const matchesName = p.name.toLowerCase().includes(activeFilters.name);
        const matchesType = activeFilters.type === "" || p.types.some(t => t.type.name === activeFilters.type);
        const matchesGen = activeFilters.gen === 0 || p.generation === activeFilters.gen;
        const matchesAbility = activeFilters.ability === "" || p.abilities.some(a => a.ability.name.toLowerCase().includes(activeFilters.ability));

        return matchesName && matchesType && matchesGen && matchesAbility;
    });

    setFilteredPokemons(result);
    setCurrentPage(0);
    updateDisplay();
}

document.getElementById('btn-apply-filters')?.addEventListener('click', applyAllFilters);

document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
    resetFilters();
    (document.getElementById('search-input') as HTMLInputElement).value = "";
    (document.getElementById('filter-type') as HTMLSelectElement).value = "";
    (document.getElementById('filter-gen') as HTMLSelectElement).value = "0";
    (document.getElementById('filter-ability') as HTMLInputElement).value = "";
    updateDisplay();
});

async function getEvolutionData(speciesUrl: string) {
    try {
        const speciesRes = await fetch(speciesUrl);
        const speciesData = await speciesRes.json();

        const evoRes = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoRes.json();

        const evolutions = [];
        let currentLevel = evoData.chain;

        while (currentLevel) {
            const pokemonId = currentLevel.species.url.split('/').filter(Boolean).pop();
            evolutions.push({
                name: currentLevel.species.name,
                id: pokemonId,
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
            });
            currentLevel = currentLevel.evolves_to[0];
        }
        return evolutions;
    } catch (error) {
        console.error("Erreur Evolution:", error);
        return [];
    }
}

export async function showPokemonDetail(id: string) {
    const numericId = parseInt(id);
    if (!((numericId >= 1 && numericId <= 1025) || (numericId >= 10001 && numericId <= 10300))) return;

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${numericId}`);
        const data: any = await response.json();
        startSound.play().catch(() => {});

        const evolutions = await getEvolutionData(data.species.url);
        const evolutionsHTML = evolutions.map(evo => `
            <div class="evo-item ${evo.id === id ? 'current-evo' : ''}" style="cursor:pointer; text-align:center;" data-id="${evo.id}">
                <img src="${evo.sprite}" alt="${evo.name}" width="50">
                <p style="font-size: 0.6rem; margin:0;">${evo.name.toUpperCase()}</p>
            </div>
        `).join('<span style="align-self:center;">→</span>');

        const cryUrl = data.cries?.latest || data.cries?.legacy;
        const typesHTML = data.types.map((t: any) => `
            <span class="type-badge ${t.type.name}">${t.type.name.toUpperCase()}</span>
        `).join('');

        const statsHTML = data.stats.map((s: any) => `
            <div class="stat-line">
                <span class="stat-name">${s.stat.name.toUpperCase()}</span>
                <div class="stat-bar-bg">
                    <div class="stat-bar-fill" style="width: ${Math.min(s.base_stat, 100)}%"></div>
                </div>
                <span class="stat-value">${s.base_stat}</span>
            </div>`).join('');

        if (modalBody) {
            modalBody.innerHTML = `
            <div class="pokedex-kalos">
                <button id="close-modal">X</button>
                <div class="pokedex-left">
                    <div class="pokedex-main-screen">
                        <div class="artwork-container" id="artwork-trigger" style="cursor: pointer;">
                            <img id="pokemon-artwork" src="${data.sprites.other['official-artwork'].front_default}" alt="${data.name}">
                        </div>
                        <div class="screen-footer">
                            <h2 class="pokedex-name">${data.name.toUpperCase()}</h2>
                            <button class="add-team-btn" id="btn-add-team">AJOUTER À L'ÉQUIPE ${activeTeamId}</button>
                        </div>
                        <div class="evolution-container" style="margin-top:10px; border-top: 1px solid #555; padding-top:5px;">
                            <p style="font-size:0.7rem; margin-bottom:5px;">LIGNE D'ÉVOLUTION :</p>
                            <div style="display:flex; justify-content: space-around;">
                                ${evolutionsHTML}
                            </div>
                        </div>
                    </div>
                    <div class="dpad">
                        <button class="dpad-btn left" onclick="window.showPokemonDetail('${data.id - 1}')"></button>
                        <button class="dpad-btn right" onclick="window.showPokemonDetail('${data.id + 1}')"></button>
                    </div>
                </div>
                <div class="pokedex-right">
                    <div class="pokedex-data-screen">
                        <div class="data-header">
                            <p>N° : ${data.id}</p>
                            <p>HT : ${data.height / 10} m</p>
                            <p>WT : ${data.weight / 10} kg</p>
                        </div>
                        <div class="types-section">
                            <p>TYPES :</p>
                            <div class="types-container">${typesHTML}</div>
                        </div>
                        <div class="stats-container">
                            <h3>STATISTIQUES BASE</h3>
                            ${statsHTML}
                        </div>
                    </div>
                </div>
            </div>`;

            document.querySelectorAll('.evo-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const targetId = (e.currentTarget as HTMLElement).dataset.id;
                    if (targetId) showPokemonDetail(targetId);
                });
            });

            if (cryUrl) {
                const trigger = document.getElementById('artwork-trigger');
                trigger?.addEventListener('click', () => {
                    const audio = new Audio(cryUrl);
                    audio.volume = 0.4;
                    audio.play();
                    const img = document.getElementById('pokemon-artwork');
                    img?.classList.add('bounce-animation');
                    setTimeout(() => img?.classList.remove('bounce-animation'), 500);
                });
            }

            document.getElementById('btn-add-team')?.addEventListener('click', () => {
                const currentTeam = getActiveTeam();
                if (currentTeam.length >= 6) {
                    alert(`Équipe ${activeTeamId} complète (6 max) !`);
                    return;
                }
                if (currentTeam.some((p: any) => p.id === data.id)) {
                    alert("Ce Pokémon est déjà dans cette équipe !");
                    return;
                }
                currentTeam.push(data);
                saveTeam();
                updateTeamUI();
                alert(`${data.name.toUpperCase()} a rejoint l'équipe ${activeTeamId} !`);
            });

            document.getElementById('close-modal')?.addEventListener('click', () => {
                modal?.classList.add('hidden');
            });
        }
        modal?.classList.remove('hidden');
    } catch (error) {
        console.error("Erreur Détails:", error);
    }
}

(window as any).showPokemonDetail = showPokemonDetail;

export function updateTeamUI() {
    const teamList = document.getElementById('team-list');
    const teamCount = document.getElementById('team-count');
    const currentTeam = getActiveTeam();

    if (teamCount) teamCount.textContent = currentTeam.length.toString();

    if (teamList) {
        teamList.innerHTML = '';
        currentTeam.forEach((pokemon: any) => {
            const memberDiv = document.createElement('div');
            memberDiv.className = 'team-member-card';

            const movesHTML = pokemon.moves.slice(0, 4).map((m: any) =>
                `<span class="move-tag">${m.move.name.replace('-', ' ')}</span>`
            ).join('');

            memberDiv.innerHTML = `
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                <div class="member-info">
                    <span class="member-name">${pokemon.name.toUpperCase()}</span>
                    <div class="member-types">
                        ${pokemon.types.map((t: any) => `<span class="mini-type ${t.type.name}"></span>`).join('')}
                    </div>
                    <div class="member-moves">${movesHTML}</div>
                    <button class="remove-btn" data-id="${pokemon.id}">×</button>
                </div>
            `;
            teamList.appendChild(memberDiv);
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt((e.currentTarget as HTMLElement).dataset.id!);
                removeFromTeam(id);
            });
        });
    }
    analyzeTeamTypes();
}

export function removeFromTeam(id: number) {
    const currentTeam = getActiveTeam();
    const newTeam = currentTeam.filter((p: any) => p.id !== id);
    setPlayerTeam(newTeam);
    saveTeam();
    updateTeamUI();
}

function analyzeTeamTypes() {
    const analysisDiv = document.getElementById('team-analysis');
    const currentTeam = getActiveTeam();
    if (!analysisDiv) return;

    const typeCounts: { [key: string]: number } = {};
    currentTeam.forEach((pokemon: any) => {
        pokemon.types.forEach((t: any) => {
            const typeName = t.type.name;
            typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
        });
    });

}

function updatePaginationUI() {
    const maxPage = Math.ceil(filteredPokemons.length / itemsPerPage);
    if (pageInfo) pageInfo.textContent = `Page ${currentPage + 1} sur ${maxPage || 1}`;
}
