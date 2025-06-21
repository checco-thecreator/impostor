// --- Importa le librerie necessarie ---
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// --- Inizializzazione del server ---
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// --- Configurazione di base ---
const PORT = process.env.PORT || 3000;

// <-- MODIFICA: La nuova lista di parole con circa 300 termini -->
const wordList = [
    // Oggetti di Casa (esistenti)
    "Letto", "Sedia", "Tavolo", "Armadio", "Lampada", "Specchio", "Tappeto", "Scopa", "Forno", "Frigorifero", 
    "Divano", "Scrivania", "Sveglia", "Appendiabiti", "Tenda", "Cuscino", "Libreria", "Vaso", "Orologio", "Forchetta",
    "Coltello", "Cucchiaio", "Piatto", "Bicchiere", "Tazza", "Padella", "Pentola", "Lavatrice", "Asciugamano", "Sapone",

    // Cibo e Cucina (esistenti)
    "Mela", "Banana", "Formaggio", "Pane", "Latte", "Carota", "Pomodoro", "Gelato", "Caffè", "Acqua", 
    "Succo", "Olio", "Sale", "Pepe", "Pasta", "Pizza", "Riso", "Pollo", "Pesce", "Uovo",
    "Biscotto", "Cioccolato", "Limone", "Arancia", "Patata", "Cipolla", "Aglio", "Insalata", "Torta", "Vino",

    // Animali (esistenti)
    "Cane", "Gatto", "Cavallo", "Mucca", "Pecora", "Gallo", "Tigre", "Leone", "Giraffa", "Scimmia", 
    "Elefante", "Balena", "Squalo", "Delfino", "Pinguino", "Farfalla", "Ragno", "Ape", "Formica", "Serpente",
    "Aquila", "Gufo", "Coccodrillo", "Ippopotamo", "Zebra", "Orso", "Lupo", "Volpe", "Scoiattolo", "Pipistrello",

    // Professioni e Luoghi (esistenti)
    "Medico", "Pompiere", "Poliziotto", "Insegnante", "Cuoco", "Pittore", "Attore", "Cantante", "Elettricista", "Meccanico", 
    "Pilota", "Scuola", "Ospedale", "Supermercato", "Parco", "Museo", "Banca", "Ufficio Postale", "Ristorante", "Aeroporto", 
    "Stazione", "Biblioteca", "Teatro", "Cinema", "Spiaggia", "Farmacia", "Negozio", "Hotel", "Chiesa", "Piazza",

    // Natura e Ambiente (esistenti)
    "Albero", "Fiore", "Fiume", "Montagna", "Nuvola", "Pioggia", "Neve", "Stella", "Luna", "Sole",
    "Deserto", "Isola", "Vulcano", "Foresta", "Cascata", "Lago", "Mare", "Cielo", "Pietra", "Sabbia",

    // Parti del corpo e Abbigliamento (esistenti)
    "Mano", "Piede", "Occhio", "Naso", "Bocca", "Orecchio", "Capelli", "Dito", "Gamba", "Braccio",
    "Scarpa", "Maglietta", "Pantaloni", "Cappello", "Giacca", "Guanto", "Sciarpa", "Calzino", "Camicia", "Gonna",

    // Tecnologia e Hobby (esistenti)
    "Telefono", "Computer", "Tablet", "Televisione", "Fotocamera", "Cuffie", "Microfono", "Tastiera", "Mouse", "Stampante",
    "Libro", "Film", "Musica", "Videogioco", "Chitarra", "Pianoforte", "Calcio", "Pallacanestro", "Bicicletta", "Auto",

    // --- NUOVE PAROLE ---

    // Concetti Astratti
    "Amore", "Odio", "Tempo", "Spazio", "Idea", "Sogno", "Paura", "Gioia", "Tristezza", "Fortuna", 
    "Destino", "Libertà", "Giustizia", "Pace", "Caos", "Memoria", "Pensiero", "Silenzio", "Energia", "Anima",

    // Sport e Attività
    "Nuoto", "Corsa", "Sci", "Tennis", "Pallavolo", "Yoga", "Danza", "Arrampicata", "Pugilato", "Scacchi", 
    "Meditazione", "Pesca", "Giardinaggio", "Cucina", "Lettura", "Scherma", "Golf", "Surf", "Ciclismo", "Bowling",

    // Personaggi e Ruoli
    "Pirata", "Astronauta", "Scienziato", "Detective", "Supereroe", "Re", "Regina", "Mago", "Fantasma", "Alieno", 
    "Cowboy", "Ninja", "Zombi", "Vampiro", "Robot", "Gladiatore", "Esploratore", "Giudice", "Presidente", "Spia",

    // Strumenti Musicali e Arte
    "Violino", "Batteria", "Flauto", "Tromba", "Sassofono", "Arpa", "Pennello", "Tela", "Scultura", "Statua", 
    "Mosaico", "Affresco", "Poesia", "Romanzo", "Spartito", "Basso", "Ukulele", "Tamburo", "Argilla", "Acquerello",

    // Fenomeni Naturali
    "Terremoto", "Tsunami", "Uragano", "Tornado", "Arcobaleno", "Aurora", "Eclissi", "Meteora", "Fulmine", "Grandine", 
    "Nebbia", "Marea", "Eruzione", "Tramonto", "Alba", "Stalattite", "Ghiacciaio", "Geyser", "Cratere", "Duna",

    // Veicoli e Trasporti
    "Sottomarino", "Elicottero", "Mongolfiera", "Dirigibile", "Treno a vapore", "Monopattino", "Skateboard", "Trattore", "Ambulanza", "Camion dei pompieri", 
    "Limousine", "Yacht", "Jet-ski", "Deltaplano", "Funivia", "Roulotte", "Risciò", "Sidecar", "Traghetto", "Canoa",
    
    // Edifici e Strutture
    "Piramide", "Grattacielo", "Ponte", "Diga", "Faro", "Mulino a vento", "Castello", "Cattedrale", "Igloo", "Palafitta",
    "Acquedotto", "Anfiteatro", "Labirinto", "Metropolitana", "Osservatorio", "Granaio", "Fabbrica", "Capanna", "Bunker", "Santuario"
];

let lobbies = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Un utente si è connesso:', socket.id);

    socket.on('createLobby', (data) => {
        const { nickname, numImpostors, numPlayers } = data;
        if (!nickname) return;

        let lobbyCode;
        do {
            lobbyCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        } while (lobbies[lobbyCode]);

        lobbies[lobbyCode] = {
            players: [],
            hostId: socket.id,
            word: '',
            settings: {
                numImpostors: parseInt(numImpostors) || 1,
                maxPlayers: parseInt(numPlayers) || 8
            }
        };

        socket.join(lobbyCode);
        const player = { id: socket.id, nickname };
        lobbies[lobbyCode].players.push(player);

        socket.emit('lobbyCreated', { 
            lobbyCode, 
            players: lobbies[lobbyCode].players,
            hostId: lobbies[lobbyCode].hostId 
        });
    });

    socket.on('joinLobby', (data) => {
        const { lobbyCode, nickname } = data;
        if (!nickname || !lobbyCode) return;

        const lobby = lobbies[lobbyCode];
        if (!lobby) {
            return socket.emit('errorMsg', 'Lobby non trovata!');
        }
        
        if (lobby.players.length >= lobby.settings.maxPlayers) {
            return socket.emit('errorMsg', 'Lobby piena!');
        }

        socket.join(lobbyCode);
        const player = { id: socket.id, nickname };
        lobby.players.push(player);

        io.to(lobbyCode).emit('lobbyUpdate', {
            players: lobby.players,
            hostId: lobby.hostId
        });
    });
    
    socket.on('startGame', (data) => {
        const { lobbyCode } = data;
        const lobby = lobbies[lobbyCode];
        if (!lobby || socket.id !== lobby.hostId) return;

        const { players, settings } = lobby;
        
        const impostorCount = Math.min(settings.numImpostors, players.length - 1);
        if (impostorCount < 1) {
            // Non si può giocare se tutti sono impostori
            return;
        }

        lobby.word = wordList[Math.floor(Math.random() * wordList.length)];

        const playersCopy = [...players];
        const impostorIds = new Set();
        for (let i = 0; i < impostorCount; i++) {
            const randomIndex = Math.floor(Math.random() * playersCopy.length);
            const impostor = playersCopy.splice(randomIndex, 1)[0];
            impostorIds.add(impostor.id);
        }

        players.forEach(player => {
            if (impostorIds.has(player.id)) {
                io.to(player.id).emit('gameStarted', { role: 'impostor' });
            } else {
                io.to(player.id).emit('gameStarted', { role: 'player', word: lobby.word });
            }
        });
    });

    socket.on('disconnect', () => {
        console.log('Un utente si è disconnesso:', socket.id);
        for (const lobbyCode in lobbies) {
            const lobby = lobbies[lobbyCode];
            const playerIndex = lobby.players.findIndex(p => p.id === socket.id);

            if (playerIndex !== -1) {
                lobby.players.splice(playerIndex, 1);
                if (lobby.players.length === 0) {
                    console.log(`Lobby ${lobbyCode} vuota, la elimino.`);
                    delete lobbies[lobbyCode];
                } else {
                    if (socket.id === lobby.hostId) {
                        lobby.hostId = lobby.players[0].id;
                        console.log(`Host disconnesso. Nuovo host della lobby ${lobbyCode}: ${lobby.hostId}`);
                    }
                    io.to(lobbyCode).emit('lobbyUpdate', {
                        players: lobby.players,
                        hostId: lobby.hostId
                    });
                }
                break;
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});