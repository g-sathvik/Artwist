//requiring all the node modules
const express = require('express');
const app = express();
const server = require('http').Server(app);
const { Server } = require("socket.io");
const io = new Server(server);
const bodyParser = require('body-parser');
app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
var url = require('url');
const { info } = require('console');
const { emit } = require('process');
//----------------------------starting server-----------------------------------------------------------
//This is for mentioning apply css to the html for all css files inside the path given in the argument
app.use(express.static(__dirname));
app.use(express.static(__dirname + "/Profile"));

app.use(express.static(__dirname + "/login"))

// const puppeteer = require('puppeteer');

// (async ()=>{ 
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//     await page.goto('https://www.thegamegal.com/word-generator/',{"waitUntil" : "networkidle0"});
//     await page.click('#newword-button');
//     const someContent = await page.$eval('#gennedword', el => el.innerHTML);
//     console.log(someContent)
//   await browser.close();
// })();
//---------------------------------homepage----------------------------------------
//we are listening to the port 3000 for requests
server.listen(3000, () => {
    //once we start listeing we log the message
    console.log('listening on port 3000')
});

//what to do when it recieves a request for the path "/" which is basically the homepath
//req refers to the request variable and res is the response which we can modify





app.get('/', (req, res) => {
    //in response we are rendering index.ejs file
    if (req.query.user) {
        res.render(__dirname + '/index.ejs', { user: req.query.user });
    }
    else {
        res.redirect("/login")
    }
});

app.post('/account', (req, res) => {
    res.redirect(url.format({ pathname: '/account', query: { 'user': req.query.user } }));
})

//user account page route
app.get('/account', (req, res) => {
    //in response we are rendering user.ejs file
    res.render(__dirname + '/Profile/user.ejs', { user: req.query.user });
    console.log(req.query.user);
});

//login page route
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login/login.html');
})

//signup page route
app.get('/signUp', (req, res) => {
    res.sendFile(__dirname + '/login/signUp.html');
})

app.post('/home', (req, res) => {
    res.redirect("/");
})
//--------------------------------game room------------------------------------------
//list of active rooms
rooms = [];

//dictionary with room code as key and list of players as values
room_members = {}

//creating game room
app.post('/create_room', (req, res) => {
    //generating random room code and adding to the list of rooms
    let room_code = Math.floor(Math.random() * 9000 + 999);
    while (rooms.includes(room_code)) {
        room_code = Math.floor(Math.random() * 9000 + 999);
    }
    rooms.push(room_code);
    room_members[room_code] = []
    console.log(req.body)
    //redirecting to the game room with room code params and room creater parameter as true
    res.redirect(url.format({ pathname: 'game/' + room_code, query: { 'creator': true, 'user': req.query.user } }))
});

//Joining game room
app.post('/join', (req, res) => {
    res.redirect(url.format({ pathname: 'game/' + req.body.room_code, query: { 'creator': false, 'user': req.query.user } })) //redirecting to the game room with room code params and room creater parameter as false
});

//game room along with room code
app.get('/game/:room_code', (req, res) => {
    res.render(__dirname + '/game/game.ejs', { room_code: req.params.room_code, starter: req.query.creator, user: req.query.user });
});

//--------------------------------Game logic----------------------------------

//player id for prototype
player_id = 0

//list of words
words = ["kite", "boat", "coin", "lion", "hippo", "star", "table", "computer", "seashell", "bike", "stairs", "clock", "person", "hand", "shoe", "neck", "hair", "pen", "ball", "desk", "basketball", "feather", "window", "square", "crayon", "bug", "curl", "airplane", "rain", "sunglasses", "mouth", "feet", "roll", "bug", "nail", "shirt", "chicken", "jellyfish", "broom", "cherry", "legs", "fork", "banana", "ghost", "ears", "head", "elephant", "water", "monster", "ring", "purse", "bottle", "watch", "clocks", "phone"
];

var selected_words = []
//socket connection
io.on('connection', (socket) => {
    // const id=player_id;
    // player_id=player_id+1;

    // Adding player in room
    var room;
    var word;
    var drawer = []
    var round = 1
    var id
    //if we connect to room (defaultly called)
    socket.on('room_code', (a) => {
        //------------------------setting room, players....--------------------------------------
        room = a.room_code;
        id = a.user  //setting the room to room and joining to the room and adding to the room_members dictionary
        console.log(id);
        socket.join(room);
        if (!(room in room_members)) {
            socket.emit("not found");
            return;
        }
        room_members[room].push({ 'id': id, 'score': 0 });

        socket.emit('room', id);    //lettting it know its room (prototype)

        io.to(room).emit('players', room_members[room]);    //showing the room_members
        var guesses = 0
        //disconnecting player
        socket.on('disconnect', function () {
            room_members[room] = room_members[room].filter(function (letter) {
                return letter.id !== id;
            });
            io.to(room).emit('players', room_members[room]);
        });

        //-------------------------Game logic--------------------------------------------------------------
        let decider_id
        let drawer_id
        let drawer_index
        let initial_index
        //once play game is pressed
        socket.on('start_game', () => {
            socket.broadcast.emit('start_game'); //let other players know game is started
            decider_id = id //since start_game is called by the first player, he becomes the decider_id
            //select random player and send to all players
            drawer_index = Math.floor(Math.random() * room_members[room].length)
            // console.log('New index '+drawer_index)
            drawer_id = room_members[room][drawer_index].id;
            for (i in room_members[room]) {
                room_members[room][i] = { 'id': room_members[room][i].id, 'score': 0 }
            }
            initial_index = drawer_index;
            console.log('Drawer ' + drawer_id);
            io.to(room).emit('drawer', { drawer_id: drawer_id, message: "" });
            io.to(room).emit('players', room_members[room]);
            console.log('room members ' + room_members[room]);
        })
        //other players know the drawer and the drawer server sends three random words to the drawer client
        socket.on('who_is_drawer', (a) => {
            drawer_id = a;
            console.log("who is drawer " + drawer_id + " checking with " + id);
            //-------------------------drawer --------------------
            if (id == drawer_id) {
                // console.log(selected_words);
                var word1 = words[Math.floor(Math.random() * words.length)];
                while (selected_words.includes(word1)) {
                    word1 = words[Math.floor(Math.random() * words.length)];
                }
                selected_words.push(word1);
                var word2 = words[Math.floor(Math.random() * words.length)];
                while (selected_words.includes(word2)) {
                    word2 = words[Math.floor(Math.random() * words.length)];
                }
                selected_words.push(word2);
                var word3 = words[Math.floor(Math.random() * words.length)];
                while (selected_words.includes(word3)) {
                    word3 = words[Math.floor(Math.random() * words.length)];
                }
                selected_words.push(word3);
                socket.emit('choose', { word1: word1, word2: word2, word3: word3 });
            }
        })

        //after choosing they send their choice to the drawer server
        socket.on('chosen', (choice) => {
            drawer.push(id)
            word = choice;
            socket.to(room).emit('player_chose', choice); //the choice is sent to other clients
            //game starts and the timer starts
            var counter = 150;
            var timer = setInterval(() => {
                io.to(room).emit('counter', counter);
                counter--
                // console.log('hi '+guesses)
                if (guesses >= (room_members[room].length - 1) && guesses != 0) {
                    clearInterval(timer);
                    io.to(room).emit('restart', 0)
                    return
                }
                if (counter === 0) {
                    io.to(room).emit('restart', 0)
                    clearInterval(timer);
                    return
                }
            }, 1000);

            //getting the mouse strokes from client and sending it to the remaining clients
            socket.on('mouse_up', (a) => {
                socket.to(room).emit('mouse_up', a);
            });
            socket.on('mouse_move', (a) => {
                socket.to(room).emit('mouse_move', a);
            });
            socket.on('mouse_down', (a) => {
                socket.to(room).emit('mouse_down', a);
            });
            socket.on('clears', () => {
                socket.to(room).emit('clears');
            })
            socket.on('writes', () => {
                socket.to(room).emit('writes');;
            });
            socket.on('change_color', (col) => {
                socket.to(room).emit('change_color', col);
            });
            socket.on('change_width', (siz) => {
                socket.to(room).emit('change_width', siz);
            });
            socket.on('erases', () => {
                socket.to(room).emit('erases');
            });

            //disconnecting of the drawer('prototype)
            socket.on('disconnect', function () {
                room_members[room] = room_members[room].filter(function (letter) {
                    return letter.id !== id;
                });
                io.to(room).emit('players', room_members[room]);
            });
        })

        //---------------------------------------guesser--------------------------------------------
        //guesser sends the guess
        socket.on('word', (w) => {
            word = w;
            socket.on('guess', (a) => {
                if (a.guess == word) {
                    io.to(room).emit('guess', { guess: a.guess, id: id, correct: true });
                    for (var i in room_members[room]) {
                        if (room_members[room][i].id == id) {
                            room_members[room][i].score = room_members[room][i].score + a.time;
                        }
                    }
                    for (var i in room_members[room]) {
                        if (room_members[room][i].id == drawer_id) {
                            room_members[room][i].score = room_members[room][i].score + Math.floor(a.time / 3);
                        }
                    }
                }
                else {
                    io.to(room).emit('guess', { guess: a.guess, id: id, correct: false });
                }
            })
        })
        socket.on('correct_guess', () => {
            guesses = guesses + (1 / round)
        })
        //--------------------------------restart-------------------------------
        socket.on('start', () => {
            // console.log('started');
            guesses = 0
            round++
            if (id == decider_id) {
                drawer_index = drawer_index + 1
                if (drawer_index == room_members[room].length) {
                    drawer_index = 0
                }
                if (drawer_index == initial_index) {
                    io.to(room).emit('over', room_members[room]);
                    return
                }
                drawer_id = room_members[room][drawer_index].id;
                io.to(room).emit('drawer', { drawer_id: drawer_id, message: "The correct word is " + word });
                io.to(room).emit('players', room_members[room]);
            }
        });
    });
});