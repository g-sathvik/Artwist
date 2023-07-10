let params = (new URL(document.location)).searchParams;
let user = params.get("user");

db.collection('users').get().then(snapshot=>{
    snapshot.docs.forEach(doc => {
        if(doc.data().username == user){
            document.getElementById('games').innerHTML=doc.data().games;
            document.getElementById('highest').innerHTML=doc.data().highestScore;
        }
    })
})