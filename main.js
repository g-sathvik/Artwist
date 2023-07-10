function opened2(){
    var open2=document.getElementById("join");
    var open=document.getElementById("trail");
    console.log('opened2()');
    console.log(open2);
    open2.classList.add("lobby_present");
    open.classList.add("blurrer");  
}
function joinroom(){
    var roomid = document.getElementById("code").value;
    socket.emit("room_code", roomid);
}

function close1(){
    var open2=document.getElementById("join");
    open2.classList.remove("lobby_present");  
    var open=document.getElementById("trail");
    open.classList.remove("blurrer");
}

var open=document.getElementById("trail");


window.addEventListener("load", (event) => {
    var players=[]
    db.collection('users').get().then(snapshot=>{
    snapshot.docs.forEach(doc => {
        players.push({'user': doc.data().username,'score': doc.data().highestScore})
        //players.push(doc.data().highestScore);
    })
    return true
    }).then(res=>{
        var sorted_players=players.sort((a,b)=>{return -a.score+b.score});
        var leaderboard=document.getElementById("leaderboard");
        leaderboard.innerHTML="";
        console.log(players);
        for(var i in sorted_players){
            console.log('sorry');
            console.log(i);
            console.log(sorted_players[i]);
            leaderboard.innerHTML=leaderboard.innerHTML+"<a  href=\"#\" class=\"leaderboard_player list-group-item list-group-item-action\" style=\"display: flex;align-items: center;justify-content: space-between;\"><img src=\"./Profile/resources/modi.png\" alt=\"modi ki jai\" class=\"profile\"/><p>"+sorted_players[i].user+"</p><p>"+sorted_players[i].score+"pts</p></a>"
        }
    })
});
