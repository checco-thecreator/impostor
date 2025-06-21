const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const wordList = [/* La tua lista di 300 parole rimane qui, la ometto per brevità */ "Letto", "Sedia", "Tavolo", "Armadio", "Lampada", "Specchio", "Tappeto", "Scopa", "Forno", "Frigorifero", "Divano", "Scrivania", "Sveglia", "Appendiabiti", "Tenda", "Cuscino", "Libreria", "Vaso", "Orologio", "Forchetta", "Coltello", "Cucchiaio", "Piatto", "Bicchiere", "Tazza", "Padella", "Pentola", "Lavatrice", "Asciugamano", "Sapone", "Mela", "Banana", "Formaggio", "Pane", "Latte", "Carota", "Pomodoro", "Gelato", "Caffè", "Acqua", "Succo", "Olio", "Sale", "Pepe", "Pasta", "Pizza", "Riso", "Pollo", "Pesce", "Uovo", "Biscotto", "Cioccolato", "Limone", "Arancia", "Patata", "Cipolla", "Aglio", "Insalata", "Torta", "Vino", "Cane", "Gatto", "Cavallo", "Mucca", "Pecora", "Gallo", "Tigre", "Leone", "Giraffa", "Scimmia", "Elefante", "Balena", "Squalo", "Delfino", "Pinguino", "Farfalla", "Ragno", "Ape", "Formica", "Serpente", "Aquila", "Gufo", "Coccodrillo", "Ippopotamo", "Zebra", "Orso", "Lupo", "Volpe", "Scoiattolo", "Pipistrello", "Medico", "Pompiere", "Poliziotto", "Insegnante", "Cuoco", "Pittore", "Attore", "Cantante", "Elettricista", "Meccanico", "Pilota", "Scuola", "Ospedale", "Supermercato", "Parco", "Museo", "Banca", "Ufficio Postale", "Ristorante", "Aeroporto", "Stazione", "Biblioteca", "Teatro", "Cinema", "Spiaggia", "Farmacia", "Negozio", "Hotel", "Chiesa", "Piazza", "Albero", "Fiore", "Fiume", "Montagna", "Nuvola", "Pioggia", "Neve", "Stella", "Luna", "Sole", "Deserto", "Isola", "Vulcano", "Foresta", "Cascata", "Lago", "Mare", "Cielo", "Pietra", "Sabbia", "Mano", "Piede", "Occhio", "Naso", "Bocca", "Orecchio", "Capelli", "Dito", "Gamba", "Braccio", "Scarpa", "Maglietta", "Pantaloni", "Cappello", "Giacca", "Guanto", "Sciarpa", "Calzino", "Camicia", "Gonna", "Telefono", "Computer", "Tablet", "Televisione", "Fotocamera", "Cuffie", "Microfono", "Tastiera", "Mouse", "Stampante", "Libro", "Film", "Musica", "Videogioco", "Chitarra", "Pianoforte", "Calcio", "Pallacanestro", "Bicicletta", "Auto", "Amore", "Odio", "Tempo", "Spazio", "Idea", "Sogno", "Paura", "Gioia", "Tristezza", "Fortuna", "Destino", "Libertà", "Giustizia", "Pace", "Caos", "Memoria", "Pensiero", "Silenzio", "Energia", "Anima", "Nuoto", "Corsa", "Sci", "Tennis", "Pallavolo", "Yoga", "Danza", "Arrampicata", "Pugilato", "Scacchi", "Meditazione", "Pesca", "Giardinaggio", "Cucina", "Lettura", "Scherma", "Golf", "Surf", "Ciclismo", "Bowling", "Pirata", "Astronauta", "Scienziato", "Detective", "Supereroe", "Re", "Regina", "Mago", "Fantasma", "Alieno", "Cowboy", "Ninja", "Zombi", "Vampiro", "Robot", "Gladiatore", "Esploratore", "Giudice", "Presidente", "Spia", "Violino", "Batteria", "Flauto", "Tromba", "Sassofono", "Arpa", "Pennello", "Tela", "Scultura", "Statua", "Mosaico", "Affresco", "Poesia", "Romanzo", "Spartito", "Basso", "Ukulele", "Tamburo", "Argilla", "Acquerello", "Terremoto", "Tsunami", "Uragano", "Tornado", "Arcobaleno", "Aurora", "Eclissi", "Meteora", "Fulmine", "Grandine", "Nebbia", "Marea", "Eruzione", "Tramonto", "Alba", "Stalattite", "Ghiacciaio", "Geyser", "Cratere", "Duna", "Sottomarino", "Elicottero", "Mongolfiera", "Dirigibile", "Treno a vapore", "Monopattino", "Skateboard", "Trattore", "Ambulanza", "Camion dei pompieri", "Limousine", "Yacht", "Jet-ski", "Deltaplano", "Funivia", "Roulotte", "Risciò", "Sidecar", "Traghetto", "Canoa", "Piramide", "Grattacielo", "Ponte", "Diga", "Faro", "Mulino a vento", "Castello", "Cattedrale", "Igloo", "Palafitta", "Acquedotto", "Anfiteatro", "Labirinto", "Metropolitana", "Osservatorio", "Granaio", "Fabbrica", "Capanna", "Bunker", "Santuario"];

let lobbies = {};

function resetLobby(lobbyCode) {
    if (!lobbies[lobbyCode]) return;
    const lobby = lobbies[lobbyCode];
    lobby.gameState = 'waiting';
    lobby.word = '';
    lobby.impostorIds = new Set();
    lobby.votes = {};
    lobby.timer = null;
    lobby.timerValue = 120; // 2 minuti
    // Reset ruoli giocatori
    lobby.players.forEach(p => p.role = null);
}

io.on('connection', (socket) => {
    // --- LOBBY MANAGEMENT ---
    socket.on('createLobby', (data) => {
        const { nickname, avatar, numImpostors, numPlayers } = data;
        let lobbyCode;
        do { lobbyCode = Math.random().toString(36).substring(2, 6).toUpperCase(); } while (lobbies[lobbyCode]);
        
        lobbies[lobbyCode] = {
            players: [],
            hostId: socket.id,
            settings: { numImpostors: parseInt(numImpostors) || 1, maxPlayers: parseInt(numPlayers) || 8 }
        };
        resetLobby(lobbyCode); // Inizializza lo stato

        socket.join(lobbyCode);
        const player = { id: socket.id, nickname, avatar };
        lobbies[lobbyCode].players.push(player);

        socket.emit('lobbyCreated', { lobbyCode, players: lobbies[lobbyCode].players, hostId: socket.id });
    });

    socket.on('joinLobby', (data) => {
        const { lobbyCode, nickname, avatar } = data;
        const lobby = lobbies[lobbyCode];
        if (!lobby) return socket.emit('errorMsg', 'Lobby non trovata!');
        if (lobby.players.length >= lobby.settings.maxPlayers) return socket.emit('errorMsg', 'Lobby piena!');
        if (lobby.gameState !== 'waiting') return socket.emit('errorMsg', 'Partita già iniziata!');
        
        socket.join(lobbyCode);
        const player = { id: socket.id, nickname, avatar };
        lobby.players.push(player);
        io.to(lobbyCode).emit('lobbyUpdate', { players: lobby.players, hostId: lobby.hostId });
    });

    // --- GAMEPLAY LOGIC ---
    socket.on('startGame', ({ lobbyCode }) => {
        const lobby = lobbies[lobbyCode];
        if (!lobby || socket.id !== lobby.hostId) return;

        lobby.gameState = 'discussing';
        lobby.word = wordList[Math.floor(Math.random() * wordList.length)];
        const { players, settings } = lobby;
        const impostorCount = Math.min(settings.numImpostors, players.length - 1);
        
        const playersCopy = [...players];
        for (let i = 0; i < impostorCount; i++) {
            const randomIndex = Math.floor(Math.random() * playersCopy.length);
            const impostor = playersCopy.splice(randomIndex, 1)[0];
            lobby.impostorIds.add(impostor.id);
        }

        players.forEach(p => {
            const isImpostor = lobby.impostorIds.has(p.id);
            p.role = isImpostor ? 'impostor' : 'player';
            io.to(p.id).emit('gameStarted', {
                role: p.role,
                word: isImpostor ? null : lobby.word,
                players: lobby.players
            });
        });
    });

    socket.on('startTimer', ({ lobbyCode }) => {
        const lobby = lobbies[lobbyCode];
        if (!lobby || socket.id !== lobby.hostId || lobby.timer) return;

        lobby.timer = setInterval(() => {
            lobby.timerValue--;
            io.to(lobbyCode).emit('timerUpdate', lobby.timerValue);
            if (lobby.timerValue <= 0) {
                clearInterval(lobby.timer);
                lobby.timer = null;
                io.to(lobbyCode).emit('votingStarted', lobby.players);
            }
        }, 1000);
    });

    socket.on('startVoting', ({ lobbyCode }) => {
        const lobby = lobbies[lobbyCode];
        if (!lobby || socket.id !== lobby.hostId) return;
        if (lobby.timer) {
            clearInterval(lobby.timer);
            lobby.timer = null;
        }
        lobby.gameState = 'voting';
        io.to(lobbyCode).emit('votingStarted', lobby.players);
    });
    
    socket.on('playerVote', ({ lobbyCode, votedPlayerId }) => {
        const lobby = lobbies[lobbyCode];
        if (!lobby || lobby.gameState !== 'voting') return;
        
        lobby.votes[socket.id] = votedPlayerId;
        const voteCount = Object.keys(lobby.votes).length;

        if (voteCount === lobby.players.length) {
            const tally = {};
            for (const voterId in lobby.votes) {
                const vote = lobby.votes[voterId];
                tally[vote] = (tally[vote] || 0) + 1;
            }
            
            let maxVotes = 0;
            let ejectedPlayerId = null;
            for (const playerId in tally) {
                if (tally[playerId] > maxVotes) {
                    maxVotes = tally[playerId];
                    ejectedPlayerId = playerId;
                }
            }
            
            lobby.gameState = 'ended';
            const ejectedPlayer = lobby.players.find(p => p.id === ejectedPlayerId);
            const wasImpostor = lobby.impostorIds.has(ejectedPlayerId);
            const remainingImpostors = lobby.players.filter(p => p.id !== ejectedPlayerId && lobby.impostorIds.has(p.id));
            
            let result = {};
            if (wasImpostor && remainingImpostors.length === 0) {
                result = { winner: 'Innocenti', reason: `${ejectedPlayer.nickname} era l'ultimo impostore!` };
            } else if (wasImpostor) {
                result = { winner: 'Nessuno', reason: `${ejectedPlayer.nickname} era un impostore, ma ne rimangono altri!` };
            } else {
                 result = { winner: 'Impostori', reason: `${ejectedPlayer.nickname} non era un impostore!` };
            }
            
            io.to(lobbyCode).emit('gameOver', { ejectedPlayer, wasImpostor, result, word: lobby.word });
        }
    });
    
    socket.on('playAgain', ({ lobbyCode }) => {
        const lobby = lobbies[lobbyCode];
        if (!lobby || socket.id !== lobby.hostId) return;
        
        resetLobby(lobbyCode);
        io.to(lobbyCode).emit('lobbyUpdate', { players: lobby.players, hostId: lobby.hostId });
    });

    socket.on('disconnect', () => {
        // ... la logica di disconnessione rimane identica a prima ...
    });
});

app.use(express.static('public'));
server.listen(PORT, () => console.log(`Server in ascolto sulla porta ${PORT}`));