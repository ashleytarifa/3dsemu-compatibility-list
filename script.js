// script.js
let currentOS = 'windows';
let currentEmulator = 'citra';

// =======================================================================
// ONDE COLOCAR O NOME DAS SUAS VARIAVEIS (gameDataA, gameDataB, etc.)
// =======================================================================
// IMPORTAR OS DADOS DOS JOGOS DE CADA ARQUIVO:
import { gamesA } from './data/a.js'; // Importa a constante 'gamesA' do arquivo 'data/a.js'
// import { gamesB } from './data/b.js'; // Descomente quando criar data/b.js
// import { gamesC } from './data/c.js'; // Descomente quando criar data/c.js
// import { gamesD } from './data/d.js'; // Descomente quando criar data/d.js
// ... ADICIONE TODAS AS SUAS IMPORTAÇÕES AQUI.

// COMBINAR TODOS OS DADOS IMPORTADOS EM UMA ÚNICA ARRAY gameData
// Certifique-se de que todas as arrays que você exportou estejam listadas aqui.
const gameData = [
    ...gamesA,
    // ...gamesB, // Descomente quando criar data/b.js
    // ...gamesC, // Descomente quando criar data/c.js
    // ...gamesD, // Descomente quando criar data/d.js
].flat();


function getStarRating(ratingCode) {
    const starRatings = {
        's5': '⭐⭐⭐⭐⭐',
        's4': '⭐⭐⭐⭐',
        's3': '⭐⭐⭐',
        's2': '⭐⭐',
        's1': '⭐',
        's0': '✩' // Não testado ou unplayable
    };
    return starRatings[ratingCode] || '✩';
}


function renderTable() {
    const tbody = document.getElementById('compatibilityTableBody');
    tbody.innerHTML = ''; // Limpa o tbody existente

    const emulatorsOrder = ['citra', 'lime3ds', 'azahar', 'panda3ds', 'mikage'];
    const ossOrder = ['windows', 'linux', 'android'];

    // Para cada jogo em gameData, cria uma nova linha na tabela
    gameData.forEach(game => {
        const row = document.createElement('tr');
        row.classList.add('game-row'); // Adiciona uma classe para facilitar a seleção posterior no filtro de pesquisa

        // Células fixas (Game Name, Region)
        const gameNameCell = document.createElement('td');
        gameNameCell.textContent = game.name;
        row.appendChild(gameNameCell);

        const regionCell = document.createElement('td');
        regionCell.textContent = game.region;
        row.appendChild(regionCell);

        // Gera as células de compatibilidade para cada emulador e OS
        emulatorsOrder.forEach(emulatorKey => {
            ossOrder.forEach(osKey => {
                const compData = game.compatibility[emulatorKey]?.[osKey];

                // Célula de compatibilidade (estrelas)
                const compCell = document.createElement('td');
                compCell.classList.add(osKey, emulatorKey, 'stars', compData?.rating || 's0'); // Adiciona 's0' se não houver rating
                compCell.textContent = compData?.rating ? getStarRating(compData.rating) : 'N/A'; // Exibe N/A se não houver dados
                row.appendChild(compCell);

                // Célula de versão do emulador
                const versionCell = document.createElement('td');
                versionCell.classList.add(osKey, emulatorKey);
                versionCell.textContent = compData?.version || 'N/A';
                row.appendChild(versionCell);

                // Célula de data de lançamento do jogo (agora no objeto de compatibilidade)
                const releaseDateCell = document.createElement('td');
                releaseDateCell.classList.add(osKey, emulatorKey);
                releaseDateCell.textContent = compData?.releaseDate || 'N/A';
                row.appendChild(releaseDateCell);

                // Célula de última data de teste
                const lastTestCell = document.createElement('td');
                lastTestCell.classList.add(osKey, emulatorKey);
                lastTestCell.textContent = compData?.lastTest || 'N/A';
                row.appendChild(lastTestCell);

                // Célula de testado por
                const testedByCell = document.createElement('td');
                testedByCell.classList.add(osKey, emulatorKey);
                if (compData?.testedBy?.name && compData.testedBy.url) {
                    const link = document.createElement('a');
                    link.href = compData.testedBy.url;
                    link.textContent = compData.testedBy.name;
                    link.target = "_blank"; // Abre em nova aba
                    testedByCell.appendChild(link);
                } else {
                    testedByCell.textContent = compData?.testedBy?.name || 'N/A';
                }
                row.appendChild(testedByCell);

                // Célula de notas
                const notesCell = document.createElement('td');
                notesCell.classList.add(osKey, emulatorKey, 'notes-cell'); // Adicionando classe 'notes-cell' para identificar
                notesCell.textContent = compData?.notes || 'N/A';
                row.appendChild(notesCell);
            });
        });
        tbody.appendChild(row);
    });

    applyFilters(); // Aplica os filtros iniciais após a tabela ser renderizada
}


function applyFilters() {
    const table = document.querySelector('.compatibility');
    const headerRows = table.querySelectorAll('thead tr');
    const mainHeaderRow = headerRows[0]; // Row com "Citra", "Lime3DS", etc.
    const subHeaderRow = headerRows[1];  // Row com "Comp", "Ver", "Release", etc.

    const noResultsMessage = document.getElementById('no-results-message');
    let hasVisibleRows = false;

    // Colunas fixas que devem ser sempre visíveis no cabeçalho principal (Game, Region)
    const alwaysShowMainHeaders = ['Game', 'Region'];
    const emulatorsOrder = ['citra', 'lime3ds', 'azahar', 'panda3ds', 'mikage'];

    // Ocultar/mostrar cabeçalhos da primeira linha (Citra, Lime3DS, etc.)
    const mainHeaders = mainHeaderRow.querySelectorAll('th');
    mainHeaders.forEach(header => {
        const headerText = header.textContent.trim();
        const isEmulatorHeader = emulatorsOrder.includes(header.classList[0]); // Verifica se a primeira classe é um emulador

        if (alwaysShowMainHeaders.includes(headerText)) {
            header.style.display = ''; // Sempre mostra "Game" e "Region"
        } else if (isEmulatorHeader) {
            if (header.classList.contains(currentEmulator)) {
                header.style.display = '';
            } else {
                header.style.display = 'none';
            }
        }
        // A última coluna do cabeçalho principal é a de "Notes" geral (se existir)
        // Ela não tem classe de emulador, então se houver uma, deve ser sempre visível.
        // Se ela tiver uma classe 'notes-header' ou algo similar, você pode adicioná-la aqui.
        // No seu HTML atual, o último <th> na primeira linha é vazio ou para notas gerais, então o display pode ser ajustado.
    });


    // Ocultar/mostrar cabeçalhos da segunda linha (Comp, Ver, Release, etc.)
    const subHeaders = subHeaderRow.querySelectorAll('th');
    subHeaders.forEach(header => {
        const headerClassList = Array.from(header.classList);
        const isOSSpecificHeader = headerClassList.some(cls => ['windows', 'linux', 'android'].includes(cls));
        const isEmulatorSpecificHeader = headerClassList.some(cls => emulatorsOrder.includes(cls));

        // As duas primeiras colunas ('Game', 'Region') e as últimas de 'Notes' (se forem globais)
        // Não possuem classes de OS/emulator, então a condição é apenas para as colunas filtráveis
        if (isOSSpecificHeader || isEmulatorSpecificHeader) {
            if (headerClassList.includes(currentOS) && headerClassList.includes(currentEmulator)) {
                header.style.display = '';
            } else {
                header.style.display = 'none';
            }
        } else {
            // Células fixas na segunda linha (Game, Region, e a última que era "Notes" geral)
            header.style.display = '';
        }
    });


    // Ocultar/mostrar células do corpo da tabela
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let matchesSearch = true; // Assumimos que a linha corresponde à pesquisa inicialmente
        let hasContentInVisibleCells = false; // Flag para verificar se há conteúdo visível

        // Reaplicar filtro de pesquisa
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const gameName = cells[0] ? cells[0].textContent.toLowerCase() : ''; // Pega o nome do jogo da primeira célula
        if (!gameName.includes(searchTerm)) {
            matchesSearch = false;
        }

        cells.forEach((cell, index) => {
            // As duas primeiras células (Game, Region) devem ser sempre visíveis
            const isAlwaysVisibleCell = index < 2;
            // Verifica se a célula atual é uma célula de notas específica do emulador/OS (adicionamos a classe 'notes-cell' na renderTable)
            const isSpecificNotesCell = cell.classList.contains('notes-cell');

            const isCurrentOSAndEmulatorSpecific = cell.classList.contains(currentOS) && cell.classList.contains(currentEmulator);

            if (isAlwaysVisibleCell || (isCurrentOSAndEmulatorSpecific && !isSpecificNotesCell)) {
                cell.style.display = ''; // Mostra a célula
                // Se a célula é visível E tem conteúdo, então a linha tem conteúdo visível
                if (cell.textContent.trim() !== '' && cell.textContent.trim() !== 'N/A') {
                    hasContentInVisibleCells = true;
                }
            } else if (isSpecificNotesCell && isCurrentOSAndEmulatorSpecific) {
                // A célula de notas específica deve ser visível SOMENTE se corresponder ao filtro de OS e Emulador
                cell.style.display = '';
                if (cell.textContent.trim() !== '' && cell.textContent.trim() !== 'N/A') {
                    hasContentInVisibleCells = true;
                }
            }
            else {
                cell.style.display = 'none'; // Oculta a célula
            }
        });

        // A linha é visível se corresponder à pesquisa E tiver conteúdo nas células visíveis
        if (matchesSearch && hasContentInVisibleCells) {
            row.style.display = '';
            hasVisibleRows = true;
        } else {
            row.style.display = 'none';
        }
    });

    // Mostra ou oculta a mensagem de "nenhum resultado"
    if (hasVisibleRows) {
        noResultsMessage.style.display = 'none';
    } else {
        noResultsMessage.style.display = 'block';
    }
}


// Funções de filtro de OS e Emulador - Simplificadas para apenas setar a variável global e aplicar filtros
function filterEmulator(emulator) {
    currentEmulator = emulator;
    document.querySelectorAll('.emulator-filter button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`filterBtn${emulator.charAt(0).toUpperCase() + emulator.slice(1)}`).classList.add('active');
    document.getElementById('currentEmulator').textContent =
        emulator.charAt(0).toUpperCase() + emulator.slice(1);
    applyFilters();
}

function filterOS(os) {
    currentOS = os;
    document.querySelectorAll('.filter-bar button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`filterBtn${os.charAt(0).toUpperCase() + os.slice(1)}`).classList.add('active');
    document.getElementById('currentFilter').textContent =
        os.charAt(0).toUpperCase() + os.slice(1);
    applyFilters();
}

// Listener para a barra de pesquisa
function filterGames() {
    applyFilters(); // A função applyFilters já incorpora a lógica de pesquisa agora
}


// Initialize defaults and add event listeners on page load
window.addEventListener('DOMContentLoaded', () => {
    renderTable(); // Primeiro, renderiza a tabela com todos os dados
    filterOS('windows'); // Define o filtro inicial de OS e ativa o botão
    filterEmulator('citra'); // Define o filtro inicial de Emulador e ativa o botão

    // Adiciona event listeners para os botões de OS
    document.getElementById('filterBtnWindows').addEventListener('click', () => filterOS('windows'));
    document.getElementById('filterBtnLinux').addEventListener('click', () => filterOS('linux'));
    document.getElementById('filterBtnAndroid').addEventListener('click', () => filterOS('android'));

    // Adiciona event listeners para os botões de Emulador
    document.getElementById('filterBtnCitra').addEventListener('click', () => filterEmulator('citra'));
    document.getElementById('filterBtnLime3ds').addEventListener('click', () => filterEmulator('lime3ds'));
    document.getElementById('filterBtnAzahar').addEventListener('click', () => filterEmulator('azahar'));
    document.getElementById('filterBtnPanda3ds').addEventListener('click', () => filterEmulator('panda3ds'));
    document.getElementById('filterBtnMikage').addEventListener('click', () => filterEmulator('mikage'));

    // Listener para a barra de pesquisa
    document.getElementById('searchInput').addEventListener('keyup', filterGames);

    // Controle de orientação para dispositivos móveis
    checkOrientation();
});

// Controle de orientação para dispositivos móveis
function checkOrientation() {
    const warning = document.getElementById('orientation-warning');
    if (window.innerWidth < 801 && window.innerHeight > window.innerWidth) { // Se largura for menor que 801px e estiver em modo retrato
        warning.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Evita scroll no corpo
    } else {
        warning.style.display = 'none';
        document.body.style.overflow = 'auto'; // Permite scroll no corpo
    }
}

// Executar na carga e no redimensionamento da janela
window.addEventListener('resize', checkOrientation);