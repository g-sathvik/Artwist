// initializing canvas
var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var heightRatio = 0.6;
canvas.width = window.innerWidth * 0.45;
canvas.height = canvas.width * heightRatio;
console.log(canvas.width, canvas.height);
var eraser=false;
var draw = false; 
var guesses=0;
//initializing id
var id;


socket.on('room',(a)=>{
    id=a;
});

// recieving players list and adding html elements in game lobby/player list depending if the game has started
socket.on('players',(a)=>{
    game_players=document.getElementById('leaderboard');
    // game_players.innerHTML="<ul id=\"leaderboard\">"
    game_players.innerHTML=""
for(var i in a){    
    if(a[i].id==id){
        // game_players.innerHTML=game_players.innerHTML+"<li class='list-group-item' style='width:100%; background-color:#81db76'>"+a[i].id+"   -    "+a[i].score+"</li>"
        game_players.innerHTML=game_players.innerHTML+"<div  class=\"list-group-item list-group-item-action\" style=\"display: flex; align-items: center; justify-content: space-between; background-color: greenyellow;\"> <img src=\"../Profile/resources/modi.png\" alt=\"modi ki jai\" class=\"profile\" />"+"\n"+"<p>" + a[i].id + "</p>"+"\n"+"<p> " + a[i].score + " pts</p> </div>"
    }
    else{
        game_players.innerHTML=game_players.innerHTML+"<div  class=\"list-group-item list-group-item-action\" style=\"display: flex; align-items: center; justify-content: space-between; \"> <img src=\"../Profile/resources/modi.png\" alt=\"modi ki jai\" class=\"profile\" />"+"\n"+"<p>" + a[i].id + "</p>"+"\n"+"<p> " + a[i].score + " pts</p> </div>"
    }
}
game_players.innerHTML=game_players.innerHTML+"</div>"
lobby=document.getElementById('players')
lobby.innerHTML=""
for(var i in a){
    if(a[i].id==id){
        lobby.innerHTML=lobby.innerHTML+"<div class=\"col d-flex align-items-start self_player\">👤 <h3 class=\"fw-bold mb-0 fs-4\" >"+a[i].id+"</h3> </div>"
    }
    else{
        lobby.innerHTML=lobby.innerHTML+"<div class=\"col d-flex align-items-start other_player\">👤 <h3 class=\"fw-bold mb-0 fs-4\">"+a[i].id+"</h3> </div>"
    }
} 
})

//on clicking play the function is called, game page is loaded and socket emits start_game
function start_game(){ //for starting player
    document.getElementById('lobby').style.display='none';
    document.getElementById('game').style.display='block';
    start=true;
    document.getElementById('buttons').innerHTML='';
    socket.emit('start_game')
}

socket.on('start_game', ()=>{// for other player
    document.getElementById('lobby').style.display='none';
    document.getElementById('game').style.display='block';
    start=true;
})

//information about the drawer is sent and let its socket know
socket.on('drawer',(a)=>{
    if(a.drawer_id!=id){
        context.font = "30px Comic Sans MS";
        context.fillStyle = "red";
        context.textAlign = "center";
        context.fillText(a.message,(canvas.width / 2), (canvas.height / 2)-30)
        context.fillText(a.drawer_id + " is choosing a word...",(canvas.width / 2), (canvas.height / 2)+10);
    }
    else{
        context.font = "30px Comic Sans MS";
        context.fillStyle = "red";
        context.textAlign = "center";
        context.fillText(a.message,(canvas.width / 2), (canvas.height / 2)-30)
        context.fillText("Its your turn choose a word",(canvas.width / 2), (canvas.height / 2)+10);
    }
    socket.emit('who_is_drawer',a.drawer_id)  
})


//---------------------------------------Drawer---------------------------------------------------
//the drawer server sends the list of words and they get displayed
socket.on("choose",(a)=>{
    document.getElementById('choose').innerHTML="<button class=\"choice_btn\" onclick=\"send_choice(\'"+String(a.word1)+"\')\">"+String(a.word1)+"</button>"+'\n'+"<button class=\"choice_btn\" onclick=\"send_choice(\'"+String(a.word2)+"\')\">"+String(a.word2)+"</button>"+'\n'+"<button class=\"choice_btn\" onclick=\"send_choice(\'"+String(a.word3)+"\')\">"+String(a.word3)+"</button>"
});

//once the choice is chosen the round starts and the drawign tools are visible
function send_choice(choice){
    document.getElementById('guess_input').innerHTML="";
    document.getElementById('choose').innerHTML="You have chosen "+ choice;
    socket.emit('chosen',choice)
    canvas.addEventListener('touchstart', touchstart, false);
    canvas.addEventListener('touchmove', touchmove, false);
    canvas.addEventListener('touchend', touchend, false);        
    
    canvas.addEventListener('mousedown', drawstart, false);
    canvas.addEventListener('mousemove', drawmove, false);
    canvas.addEventListener('mouseup', drawend, false);

    document.getElementById("drawing_tools").innerHTML=" <button id=\"trash\" onclick=\"clears()\">🗑️</button>"+'\n'+
    "<button id=\"pencil\" onclick=\"writes()\">✏️</button>"+'\n'+
    "<button><img width=\"10\" height=\"20\" src=\"./resources/eraser.png\" alt=\"eraser\" id=\"eraser\" onclick=\"erases()\"/></button> "+'\n'+
    "<button style=\"background-color: red; width: 30px; height: 30px\" onclick=\"change_color('red')\" ></button>"+'\n'+
    "<button style=\"background-color: blue; width: 30px; height: 30px\" onclick=\"change_color('blue')\"></button>"+'\n'+
    "<button style=\"background-color: green; width: 30px; height: 30px\" onclick=\"change_color('green')\"></button>"+'\n'+
    "<button style=\"background-color: white; width: 30px; height: 30px\" onclick=\"change_color('white')\"></button>"+'\n'+
    "<button   style=\"background-color: yellow; width: 30px; height: 30px\" onclick=\"change_color('yellow')\"></button>"+'\n'+
    "<button style=\"background-color: orange; width: 30px; height: 30px\" onclick=\"change_color('orange')\"></button>"+'\n'+
    "<button style=\"background-color: black; width: 30px; height: 30px\" onclick=\"change_color('black')\"></button>"+'\n'+
    "<button style=\"background-color: pink; width: 30px; height: 30px\" onclick=\"change_color('pink')\"></button>"+'\n'+
    "<button style=\"background-color: brown; width: 30px; height: 30px\" onclick=\"change_color('brown')\" ></button>"+'\n'+
    "<button style=\"border-color: white;background-color: white;box-shadow: 0 0 white; height: 50px; width: 50px; display:flex; flex-direction:column; justify-content:center;\" onclick=\"change_width(1)\"><div style=\"border-radius:50%; background-color:black; height:5px; width:5px\"></div></button>"+'\n'+
    "<button style=\"border-color: white;background-color: white;box-shadow: 0 0 white; height: 50px; width: 50px; display:flex; flex-direction:column; justify-content:center;\" onclick=\"change_width(11)\"><div style=\"border-radius:50%; background-color:black; height:15px; width:15px\"></div></button>"+'\n'+
    "<button style=\"border-color: white;background-color: white;box-shadow: 0 0 white; height: 50px; width: 50px; display:flex; flex-direction:column; justify-content:center;\" onclick=\"change_width(30)\"><div style=\"border-radius:50%; background-color:black; height:30px; width:30px\"></div></button>";
    context.clearRect(0,0,canvas.width,canvas.height);
}


//drawing functions
function writes(){
    eraser=false;
    context.lineWidth=1;
    context.strokeStyle='#000000';
    socket.emit('writes',);
}

function change_color(col){
    eraser=false;
    context.lineWidth=1;    
    context.strokeStyle=col;
    socket.emit('change_color',col);
}

function change_width(siz){
    context.lineWidth=siz;
    socket.emit('change_width',siz);
}

function erases(){
    eraser=true;
    socket.emit('erases',);
}

function drawstart(event) {
    context.beginPath();
    context.moveTo(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop);
    draw = true;
    socket.emit('mouse_down',{
        x:event.pageX,
        y:event.pageY
    });
}

function drawmove(event) {
    if (!draw) return;
    if(eraser){
        context.lineWidth = 40;
        context.strokeStyle= "#FFFFFF";
    }  
    context.lineTo(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop);
    context.stroke();
    socket.emit('mouse_move',{
        x:event.pageX,
        y:event.pageY
    });
}

function drawend(event) {
    if (!draw) return;
    drawmove(event);
    draw = false;
    socket.emit('mouse_up',{
        x:event.pageX,
        y:event.pageY
    });
}

function touchstart(event) {
    drawstart(event.touches[0]);
}

function touchmove(event) {
    event.preventDefault();
    drawmove(event.touches[0]);
}

function touchend(event) { 
    drawend(event.changedTouches[0]) 
}

function clears(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clears',);
}

//-------------------------guessers------------------------------
//the server of the drawer sends to the client of the guessers
socket.on('player_chose',(a)=>{
    // guess bar gets activated
    document.getElementById('choose').innerHTML = "It's not your choice";
    document.getElementById("guess_input").innerHTML="<input type=\"text\" id=\"myInput\" style=\"width:100%; height:50px; border:2px solid black; border-radius: 10px;\"/><button id=\"myEnt\" onclick=\"textEntered()\" style=\"border-radius:50%; height:50px; width:50px\">👉🏻</button>";
    context.clearRect(0,0,canvas.width,canvas.height);
    var input = document.getElementById("myInput");
    input.disabled=false;
    input.addEventListener("keypress", function(event) {
        // If the user presses the "Enter" key on the keyboard
        if (event.key === "Enter") {
            event.preventDefault();
            passToServer(input.value);
            input.value="";
        }
    });
    socket.emit('word',a); // the guesser client sends the word to the guesser server
})

//sending the guessed word to the server
function passToServer(a){
    socket.emit('guess',{
        guess:a,
        time:timer,
        guesses:guesses
    });
};

function textEntered() {
    var input = document.getElementById("myInput");
    passToServer(input.value);
    input.value="";
};

//getting the guessed word from server
socket.on('guess',(a)=>{
    let message=""
    if(a.id==id){
        message=message+"You: "
        if(a.correct){
            message=message+"correct word"
            document.getElementById("myInput").disabled = true;
        }
        else{
            message=message+a.guess
        }
        const myArray = message.split(":",2);
        document.getElementById("chat_window").innerHTML=document.getElementById("chat_window").innerHTML+"<div id=\"guess\" class=\"right\"><div class=\"sender\">"+myArray[0]+"</div><div class=\"message\">"+myArray[1]+"</div></div><br>"
    }
    else{
        message=message+a.id+": "
        if(a.correct){
            guesses+1
            message=message+"correct word"
        }
        else{
            message=message+a.guess
        }
        const myArray = message.split(":",2);
        document.getElementById("chat_window").innerHTML=document.getElementById("chat_window").innerHTML+"<div id=\"guess\" class=\"left\"><div class=\"reciever\">"+myArray[0]+"</div><div class=\"message\">"+myArray[1]+"</div></div><br>"
    }
    // document.getElementById("guess").innerHTML=document.getElementById("guess").innerHTML+message+"<br>"
    if(a.correct){
        socket.emit('correct_guess')
    }
});

socket.on('mouse_down',(event)=>{
    context.beginPath();
    context.moveTo(event.x - canvas.offsetLeft, event.y - canvas.offsetTop);
    draw = true;
});
socket.on('mouse_move',(event)=>{
    if (!draw) return;
    if(eraser){
        context.lineWidth = 40;
        context.strokeStyle= "#FFFFFF";
    }  
    context.lineTo(event.x - canvas.offsetLeft, event.y - canvas.offsetTop);
    context.stroke();
});
socket.on('mouse_up',(event)=>{
    if (!draw) return;
    if(eraser){
        context.lineWidth = 40;
        context.strokeStyle= "#FFFFFF";
    }  
    context.lineTo(event.x - canvas.offsetLeft, event.y - canvas.offsetTop);
    context.stroke();
    draw = false;
});

socket.on('clears',()=>{
    context.beginPath();
    context.clearRect(0, 0, canvas.width, canvas.height); 
});
socket.on('writes',()=>{
    eraser=false;
    context.lineWidth=1;
    context.strokeStyle='#000000';
});
socket.on('change_color',(col)=>{
    eraser=false;
    context.strokeStyle=col;
});

socket.on('change_width',(siz)=>{
    eraser=false;
    context.lineWidth=siz;
});
socket.on('erases',()=>{
    eraser=true;
});


//-------------------------counter --------------------
socket.on('counter',(time)=>{
    timer=time
    document.getElementById('timer').innerHTML=time;
})

//-----------------------------------game restart/over--------------------------------
socket.on('restart',()=>{
    socket.emit('start')
    context.clearRect(0,0,canvas.width,canvas.height);
    if(document.getElementById('myInput')!=null){
        document.getElementById('guess_input').innerHTML="";
    }
    else{
        document.getElementById('drawing_tools').innerHTML=""
        canvas.removeEventListener('touchstart', touchstart, false);
        canvas.removeEventListener('touchmove', touchmove, false);
        canvas.removeEventListener('touchend', touchend, false);    

        canvas.removeEventListener('mousedown', drawstart, false);
        canvas.removeEventListener('mousemove', drawmove, false);
        canvas.removeEventListener('mouseup', drawend, false);
    }
})

let score
socket.on('over',(a)=>{
    document.getElementById('lobby').style.display='block';
    document.getElementById('game').style.display='none';
    var sorted_scores=a.sort((c,b)=>{return -c.score+b.score})
    final_scores=document.getElementById('final_scores')
    // score_board = document.getElementById('score_board')
    // score_board.innerHTML = ""
    final_scores.innerHTML="<div id=\"winner\" class=\"font-effect-neon\">The winner is "+sorted_scores[0].id+"</div>" + final_scores.innerHTML;
    let params = (new URL(document.location)).searchParams;
    let user = params.get("user");
    for(var i in sorted_scores){
        console.log("in loop" + sorted_scores[i])
        if(sorted_scores[i].id==user){
            console.log('hi')
            score=sorted_scores[i].score
        }
        // score_board.innerHTML = score_board.innerHTML+"<a href=\"#\" class=\"leaderboard_player list-group-item list-group-item-action\" style=\" display: flex; align-items: center; justify-content: space-between;\"> <img src=\"./Profile/resources/modi.png\" alt=\"modi ki jai\" class=\"profile\" /> <p>" + sorted_scores[i].id + "</p> <p>" + sorted_scores[i].score+ + "pts</p> </a>"

        // score_board.innerHTML = score_board.innerHTML+"<li class='list-group-item' style='width:100%; background-color:#81db76'>"+sorted_scores[i].id+"   -    "+sorted_scores[i].score+"</li>"

        final_scores.innerHTML = final_scores.innerHTML+"<li class='list-group-item score_item'><p>"+sorted_scores[i].id+"</p> <p>"+sorted_scores[i].score+"</p></li>"
    }
    db.collection('users').get().then(snapshot=>{
        snapshot.docs.forEach(doc => {
            if(doc.data().username == user){
                db.collection("users").doc(doc.id).update({games: doc.data().games+1});
                console.log(doc.data().highestScore)
                console.log(score)
                if(doc.data().highestScore<score){
                    console.log('here')
                    db.collection("users").doc(doc.id).update({highestScore: score});
                }
        }
        })
    })
    document.getElementById('home').innerHTML="<form action=\"/?user="+user+"\" method=\"post\">    <button type=\"submit\" class=\"btn btn-success\">Go to Home</button>  </form>"

})

//------------------------------------------------------------------------------------------------
socket.on('not found',()=>{
    document.getElementsByClassName("header")[0].innerHTML="<h1 >Room Not Found</h1>"
})
