const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const wordList = [/* La tua lista di 300 parole rimane qui, la ometto per brevità */ "Letto", "Sedia", "Tavolo", "Armadio", "Lampada", "Specchio", "Tappeto", "Scopa", "Forno", "Frigorifero", "Divano", "Scrivania", "Sveglia", "Appendiabiti", "Tenda", "Cuscino", "Libreria", "Vaso", "Orologio", "Forchetta", "Coltello", "Cucchiaio", "Piatto", "Bicchiere", "Tazza", "Padella", "Pentola", "Lavatrice", "Asciugamano", "Sapone", "Mela", "Banana", "Formaggio", "Pane", "Latte", "Carota", "Pomodoro", "Gelato", "Caffè", "Acqua", "Succo", "Olio", "Sale", "Pepe", "Pasta", "Pizza", "Riso", "Pollo", "Pesce", "Uovo", "Biscotto", "Cioccolato", "Limone", "Arancia", "Patata", "Cipolla", "Aglio", "Insalata", "Torta", "Vino", "Cane", "Gatto", "Cavallo", "Mucca", "Pecora", "Gallo", "Tigre", "Leone", "Giraffa", "Scimmia", "Elefante", "Balena", "Squalo", "Delfino", "Pinguino", "Farfalla", "Ragno", "Ape", "Formica", "Serpente", "Aquila", "Gufo", "Coccodrillo", "Ippopotamo", "Zebra", "Orso", "Lupo", "Volpe", "Scoiattolo", "Pipistrello", "Medico", "Pompiere", "Poliziotto", "Insegnante", "Cuoco", "Pittore", "Attore", "Cantante", "Elettricista", "Meccanico", "Pilota", "Scuola", "Ospedale", "Supermercato", "Parco", "Museo", "Banca", "Ufficio Postale", "Ristorante", "Aeroporto", "Stazione", "Biblioteca", "Teatro", "Cinema", "Spiaggia", "Farmacia", "Negozio", "Hotel", "Chiesa", "Piazza", "Albero", "Fiore", "Fiume", "Montagna", "Nuvola", "Pioggia", "Neve", "Stella", "Luna", "Sole", "Deserto", "Isola", "Vulcano", "Foresta", "Cascata", "Lago", "Mare", "Cielo", "Pietra", "Sabbia", "Mano", "Piede", "Occhio", "Naso", "Bocca", "Orecchio", "Capelli", "Dito", "Gamba", "Braccio", "Scarpa", "Maglietta", "Pantaloni", "Cappello", "Giacca", "Guanto", "Sciarpa", "Calzino", "Camicia", "Gonna", "Telefono", "Computer", "Tablet", "Televisione", "Fotocamera", "Cuffie", "Microfono", "Tastiera", "Mouse", "Stampante", "Libro", "Film", "Musica", "Videogioco", "Chitarra", "Pianoforte", "Calcio", "Pallacanestro", "Bicicletta", "Auto", "Amore", "Odio", "Tempo", "Spazio", "Idea", "Sogno", "Paura", "Gioia", "Tristezza", "Fortuna", "Destino", "Libertà", "Giustizia", "Pace", "Caos", "Memoria", "Pensiero", "Silenzio", "Energia", "Anima", "Nuoto", "Corsa", "Sci", "Tennis", "Pallavolo", "Yoga", "Danza", "Arrampicata", "Pugilato", "Scacchi", "Meditazione", "Pesca", "Giardinaggio", "Cucina", "Lettura", "Scherma", "Golf", "Surf", "Ciclismo", "Bowling", "Pirata", "Astronauta", "Scienziato", "Detective", "Supereroe", "Re", "Regina", "Mago", "Fantasma", "Alieno", "Cowboy", "Ninja", "Zombi", "Vampiro", "Robot", "Gladiatore", "Esploratore", "Giudice", "Presidente", "Spia", "Violino", "Batteria", "Flauto", "Tromba", "Sassofono", "Arpa", "Pennello", "Tela", "Scultura", "Statua", "Mosaico", "Affresco", "Poesia", "Romanzo", "Spartito", "Basso", "Ukulele", "Tamburo", "Argilla", "Acquerello", "Terremoto", "Tsunami", "Uragano", "Tornado", "Arcobaleno", "Aurora", "Eclissi", "Meteora", "Fulmine", "Grandine", "Nebbia", "Marea", "Eruzione", "Tramonto", "Alba", "Stalattite", "Ghiacciaio", "Geyser", "Cratere", "Duna", "Sottomarino", "Elicottero", "Mongolfiera", "Dirigibile", "Treno a vapore", "Monopattino", "Skateboard", "Trattore", "Ambulanza", "Camion dei pompieri", "Limousine", "Yacht", "Jet-ski", "Deltaplano", "Funivia", "Roulotte", "Risciò", "Sidecar", "Traghetto", "Canoa", "Piramide", "Grattacielo", "Ponte", "Diga", "Faro", "Mulino a vento", "Castello", "Cattedrale", "Igloo", "Palafitta", "Acquedotto", "Anfiteatro", "Labirinto", "Metropolitana", "Osservatorio", "Granaio", "Fabbrica", "Capanna", "Bunker", "Santuario"];

let lobbies = {};

function getLobbyState(lobbyCode) {
    const lobby = lobbies[lobbyCode];
    if (!lobby) return null;
    return { /* ...stessa logica di prima... */ };
}

function resetLobbyForPlayAgain(lobby) {
    lobby.gameState = 'waiting';
    lobby.word = '';
    lobby.impostorIds = new Set();
    lobby.turnIndex = 0;
    lobby.clues = [];
    lobby.votes = {};
    lobby.players.forEach(p => { p.isEjected = false; p.role = null; });
}

function startNewRound(lobbyCode) {
    const lobby = lobbies[lobbyCode];
    lobby.gameState = 'playing';
    lobby.turnIndex = 0;
    lobby.clues = [];
    lobby.votes = {};
    io.to(lobbyCode).emit('newRoundStarted', getLobbyState(lobbyCode));
}

function checkForGameOver(lobby) {
    const activePlayers = lobby.players.filter(p => !p.isEjected);
    const remainingImpostors = activePlayers.filter(p => lobby.impostorIds.has(p.id));
    const remainingInnocents = activePlayers.length - remainingImpostors.length;

    if (remainingImpostors.length === 0) {
        return { winner: 'Innocenti', reason: 'Tutti gli impostori sono stati eliminati!' };
    }
    if (remainingImpostors.length >= remainingInnocents) {
        return { winner: 'Impostori', reason: 'Gli impostori sono in maggioranza!' };
    }
    return null; // Game continues
}

io.on('connection', (socket) => {
    // createLobby e joinLobby rimangono praticamente uguali...

    socket.on('startGame', ({ lobbyCode }) => {
        const lobby = lobbies[lobbyCode];
        if (!lobby || socket.id !== lobby.hostId) return;
        
        resetLobbyForPlayAgain(lobby);
        lobby.gameState = 'playing';
        lobby.word = wordList[Math.floor(Math.random() * wordList.length)];
        
        // ...logica di assegnazione impostori...

        lobby.players.forEach(player => {
            const isImpostor = lobby.impostorIds.has(player.id);
            player.role = isImpostor ? 'impostor' : 'player';
            io.to(player.id).emit('gameStarted', { role: player.role, word: isImpostor ? null : lobby.word });
        });
        io.to(lobbyCode).emit('turnUpdate', getLobbyState(lobbyCode));
    });

    socket.on('submitClue', ({ lobbyCode, clue }) => {
        const lobby = lobbies[lobbyCode];
        if (!lobby || lobby.gameState !== 'playing' || socket.id !== lobby.players.filter(p => !p.isEjected)[lobby.turnIndex]?.id) return;
        if (clue.trim().toLowerCase() === lobby.word.trim().toLowerCase()) return;
        
        lobby.clues.push({ playerId: socket.id, clue });
        lobby.turnIndex++;
        
        const activePlayers = lobby.players.filter(p => !p.isEjected);
        if (lobby.turnIndex >= activePlayers.length) {
            lobby.gameState = 'voting';
            io.to(lobbyCode).emit('startVoting', getLobbyState(lobbyCode));
        } else {
            io.to(lobbyCode).emit('turnUpdate', getLobbyState(lobbyCode));
        }
    });

    socket.on('playerVote', ({ lobbyCode, votedPlayerId }) => {
        const lobby = lobbies[lobbyCode];
        const activePlayers = lobby.players.filter(p => !p.isEjected);
        if (!lobby || lobby.gameState !== 'voting' || lobby.votes[socket.id]) return;

        lobby.votes[socket.id] = votedPlayerId;
        if (Object.keys(lobby.votes).length === activePlayers.length) {
            const tally = {};
            Object.values(lobby.votes).forEach(vote => { tally[vote] = (tally[vote] || 0) + 1; });
            
            const maxVotes = Math.max(...Object.values(tally));
            const mostVotedIds = Object.keys(tally).filter(id => tally[id] === maxVotes);

            if (mostVotedIds.length > 1) { // TIE
                io.to(lobbyCode).emit('voteResult', { isTie: true, votes: lobby.votes });
                lobby.votes = {}; // Reset for revote
            } else { // EJECTION
                const ejectedPlayerId = mostVotedIds[0];
                const ejectedPlayer = lobby.players.find(p => p.id === ejectedPlayerId);
                ejectedPlayer.isEjected = true;
                const wasImpostor = lobby.impostorIds.has(ejectedPlayerId);
                
                const gameOverState = checkForGameOver(lobby);
                
                io.to(lobbyCode).emit('voteResult', { isTie: false, ejectedPlayer, wasImpostor, votes: lobby.votes, gameOverState });
            }
        }
    });

    socket.on('playAgain', ({ lobbyCode }) => {
        const lobby = lobbies[lobbyCode];
        if (!lobby || socket.id !== lobby.hostId) return;
        resetLobbyForPlayAgain(lobby);
        io.to(lobbyCode).emit('lobbyUpdate', getLobbyState(lobbyCode));
    });

    // ...altri eventi come impostorGuess e disconnect...
});

app.use(express.static('public'));
server.listen(PORT, () => console.log(`Server in ascolto sulla porta ${PORT}`));