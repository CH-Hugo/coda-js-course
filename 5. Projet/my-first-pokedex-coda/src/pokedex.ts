import type { Pokemon } from './types';
import { 
    filteredPokemons, 
    currentPage, 
    itemsPerPage, 
    setAllPokemons, 
    getActiveTeam, // Remplace playerTeam pour la lecture
    activeTeamId,  // Pour savoir quelle équipe on modifie
    saveTeam, 
    setPlayerTeam 
} from './state';

// Éléments du DOM
const listElement = document.getElementById('pokemon-list') as HTMLUListElement;
const pageInfo = document.getElementById('page-info');
const modal = document.getElementById('pokemon-modal');
const modalBody = document.getElementById('modal-body');
const startSound = new Audio('/src/assets/pokemon-plink_.mp3');

/** --- LOGIQUE DU POKÉDEX --- **/

export async function fetchAllPokemons() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10025');
        const data = await response.json();
        setAllPokemons(data.results);
        updateDisplay();
    } catch (error) { 
        console.error("Erreur Fetch Liste:", error); 
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

/** --- DÉTAILS ET AJOUT À L'ÉQUIPE --- **/

export async function showPokemonDetail(id: string) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data: any = await response.json();
        startSound.play().catch(() => {});

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
                    </div>
                    <div class="dpad">
                        <div class="dpad-btn up"></div>
                        <div class="dpad-btn down"></div>
                        <div class="dpad-btn left"></div>
                        <div class="dpad-btn right"></div>
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
                    <div class="abxy-cluster">
                        <div class="btn-ds btn-x">X</div>
                        <div class="btn-ds btn-y">Y</div>
                        <div class="btn-ds btn-a">A</div>
                        <div class="btn-ds btn-b">B</div>
                    </div>
                </div>
            </div>`;

            // Logique du cri et animation lors du clic sur l'image
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

            // Gestion de l'ajout à l'équipe (Équipe Active)
            document.getElementById('btn-add-team')?.addEventListener('click', () => {
                const currentTeam = getActiveTeam(); // Récupère l'équipe 1, 2 ou 3 selon la sélection
                
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

            // Gestion de la fermeture
            document.getElementById('close-modal')?.addEventListener('click', () => {
                modal?.classList.add('hidden');
            });
        }
        modal?.classList.remove('hidden');
    } catch (error) { 
        console.error("Erreur Détails:", error); 
    }
}

/** --- GESTIONNAIRE D'ÉQUIPE VISUEL --- **/

export function updateTeamUI() {
    const teamList = document.getElementById('team-list');
    const teamCount = document.getElementById('team-count');
    const currentTeam = getActiveTeam(); // Récupère l'équipe active
    
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
                </div>
                <button class="remove-btn" data-id="${pokemon.id}">❌</button>
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
    setPlayerTeam(newTeam); // Met à jour l'équipe active dans l'objet global
    saveTeam();
    updateTeamUI();
}

/** --- ANALYSEUR DE TYPES ET FAIBLESSES --- **/

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

    let html = `<h3>Analyse de l'équipe ${activeTeamId}</h3>`;
    if (currentTeam.length === 0) {
        html += '<p>Votre équipe est vide.</p>';
    } else {
        for (const [type, count] of Object.entries(typeCounts)) {
            const isWarning = count >= 3;
            html += `
                <div class="analysis-row">
                    <span class="type-badge ${type}">${type.toUpperCase()}</span> : ${count}
                    ${isWarning ? `<br><small style="color: #ffcc00">⚠️ Risque de faiblesse aux contres ${type}</small>` : ''}
                </div>
            `;
        }
    }
    analysisDiv.innerHTML = html;
}

function updatePaginationUI() {
    const maxPage = Math.ceil(filteredPokemons.length / itemsPerPage);
    if (pageInfo) pageInfo.textContent = `Page ${currentPage + 1} sur ${maxPage || 1}`;
}