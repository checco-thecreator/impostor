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
    return {
        lobbyCode,
        players: lobby.players,
        hostId: lobby.hostId,
        gameState: lobby.gameState,
        settings: lobby.settings,
        turnIndex: lobby.turnIndex,
        // Rimosso clues e word (inviato solo alla fine)
    };
}

function resetLobby(lobby) {
    lobby.gameState = 'waiting';
    lobby.word = '';
    lobby.impostorIds = new Set();
    lobby.turnIndex = 0;
    lobby.votes = {};
    lobby.players.forEach(p => p.isReady = false);
}

io.on('connection', (socket) => {
    socket.on('createLobby', ({ nickname, avatar }) => {
        let lobbyCode;
        do { lobbyCode = Math.random().toString(36).substring(2, 6).toUpperCase(); } while (lobbies[lobbyCode]);

        lobbies[lobbyCode] = { players: [], hostId: socket.id, settings: { numImpostors: 1 } };
        resetLobby(lobbies[lobbyCode]);

        socket.join(lobbyCode);
        lobbies[lobbyCode].players.push({ id: socket.id, nickname, avatar });
        io.to(lobbyCode).emit('lobbyUpdate', getLobbyState(lobbyCode));
    });

    socket.on('joinLobby', ({ lobbyCode, nickname, avatar }) => {
        const lobby = lobbies[lobbyCode];
        if (!lobby) return socket.emit('errorMsg', { title: "Oops!", message: "Lobby non trovata." });
        if (lobby.players.length >= 8) return socket.emit('errorMsg', { title: "Spiacenti!", message: "La lobby è piena." });
        if (lobby.gameState !== 'waiting') return socket.emit('errorMsg', { title: "Troppo tardi!", message: "La partita è già iniziata." });
        
        socket.join(lobbyCode);
        lobby.players.push({ id: socket.id, nickname, avatar });
        io.to(lobbyCode).emit('lobbyUpdate', getLobbyState(lobbyCode));
    });

    socket.on('startGame', ({ lobbyCode }) => {
        const lobby = lobbies[lobbyCode];
        if (!lobby || socket.id !== lobby.hostId) return;

        lobby.gameState = 'playing';
        lobby.word = wordList[Math.floor(Math.random() * wordList.length)];
        
        const impostorCount = Math.min(lobby.settings.numImpostors, lobby.players.length - 1);
        const playersCopy = [...lobby.players];
        for (let i = 0; i < impostorCount; i++) {
            const randomIndex = Math.floor(Math.random() * playersCopy.length);
            lobby.impostorIds.add(playersCopy.splice(randomIndex, 1)[0].id);
        }
        
        // Scegli un giocatore casuale per iniziare
        lobby.turnIndex = Math.floor(Math.random() * lobby.players.length);

        lobby.players.forEach(player => {
            const isImpostor = lobby.impostorIds.has(player.id);
            io.to(player.id).emit('gameStarted', {
                role: isImpostor ? 'impostor' : 'player',
                word: isImpostor ? null : lobby.word,
            });
        });
        io.to(lobbyCode).emit('turnUpdate', getLobbyState(lobbyCode));
    });

    // MODIFICA: Nuovo evento per passare il turno
    socket.on('passTurn', ({ lobbyCode }) => {
        const lobby = lobbies[lobbyCode];
        if (!lobby || lobby.gameState !== 'playing' || socket.id !== lobby.players[lobby.turnIndex].id) return;
        
        // Passa al giocatore successivo, tornando all'inizio se necessario
        lobby.turnIndex = (lobby.turnIndex + 1) % lobby.players.length;
        
        io.to(lobbyCode).emit('turnUpdate', getLobbyState(lobbyCode));
    });

    // MODIFICA: Nuovo evento per iniziare la votazione
    socket.on('requestVoting', ({ lobbyCode }) => {
        const lobby = lobbies[lobbyCode];
        if (!lobby || lobby.gameState !== 'playing') return;

        lobby.gameState = 'voting';
        io.to(lobbyCode).emit('startVoting', getLobbyState(lobbyCode));
    });


    socket.on('playerVote', ({ lobbyCode, votedPlayerId }) => {
        const lobby = lobbies[lobbyCode];
        if (!lobby || lobby.gameState !== 'voting' || lobby.votes[socket.id]) return;

        lobby.votes[socket.id] = votedPlayerId;
        const voteCount = Object.keys(lobby.votes).length;

        // Anti-auto-voto: l'ultimo giocatore non può votare se stesso, quindi il conteggio non arriverà mai a `players.length` se c'è un solo giocatore rimasto da votare
        const nonVoters = lobby.players.filter(p => !Object.keys(lobby.votes).includes(p.id));
        const possibleTargets = lobby.players.filter(p => p.id !== nonVoters[0]?.id).map(p => p.id);
        const allVotesInForPossibleTargets = Object.values(lobby.votes).every(votedId => possibleTargets.includes(votedId));

        if (voteCount >= lobby.players.filter(p => p.id !== votedPlayerId).length && allVotesInForPossibleTargets) {
            const tally = {};
            Object.values(lobby.votes).forEach(vote => { tally[vote] = (tally[vote] || 0) + 1; });
            // Gestione parità: al momento vince il primo incontrato. Si può migliorare in futuro.
            const ejectedPlayerId = Object.keys(tally).reduce((a, b) => tally[a] > tally[b] ? a : b, Object.keys(tally)[0]);
            const ejectedPlayer = lobby.players.find(p => p.id === ejectedPlayerId);
            const wasImpostor = lobby.impostorIds.has(ejectedPlayerId);
            
            let result;
            if (wasImpostor) {
                result = { winner: 'Innocenti', reason: `Avete scoperto l'impostore: ${ejectedPlayer.nickname}!` };
            } else {
                result = { winner: 'Impostori', reason: `Avete eliminato un innocente: ${ejectedPlayer.nickname}!` };
            }
            lobby.gameState = 'ended';
            io.to(lobbyCode).emit('gameOver', { ejectedPlayer, result, word: lobby.word });
        }
    });

    socket.on('impostorGuess', ({ lobbyCode, guess }) => {
        const lobby = lobbies[lobbyCode];
        const player = lobby.players.find(p => p.id === socket.id);
        if (!lobby || lobby.gameState !== 'playing' || !lobby.impostorIds.has(socket.id)) return;
        
        const correctGuess = guess.trim().toLowerCase() === lobby.word.trim().toLowerCase();
        let result;
        if (correctGuess) {
            result = { winner: 'Impostori', reason: `${player.nickname} ha indovinato la parola segreta!` };
        } else {
            result = { winner: 'Innocenti', reason: `${player.nickname} ha tentato di indovinare ma ha sbagliato!` };
        }
        
        lobby.gameState = 'ended';
        io.to(lobbyCode).emit('gameOver', { ejectedPlayer: player, result, word: lobby.word });
    });

    socket.on('playAgain', ({ lobbyCode }) => {
        const lobby = lobbies[lobbyCode];
        if (!lobby || socket.id !== lobby.hostId) return;
        resetLobby(lobby);
        io.to(lobbyCode).emit('lobbyUpdate', getLobbyState(lobbyCode));
    });

    socket.on('disconnect', () => {
        // Logica di disconnessione (complessa, per ora la omettiamo ma sarebbe da implementare)
        // Bisognerebbe trovare la lobby del giocatore, rimuoverlo, e gestire i casi critici 
        // (es. l'host si disconnette, il giocatore di turno si disconnette, etc.)
    });
});

app.use(express.static('public'));
server.listen(PORT, () => console.log(`Server in ascolto sulla porta ${PORT}`));
