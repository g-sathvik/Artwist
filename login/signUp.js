const submitForm = document.getElementById('signup')

var already_once = false
submitForm.addEventListener('submit', e => {
    if (submitForm.password_txt.value === submitForm.password_txt1.value) {
        e.preventDefault();
        db.collection('users').get().then(snapshot => {
            var present = true
            snapshot.docs.forEach(doc => {
                if (doc.data().username == submitForm.user_txt.value) {
                    present = false
                }
            })
            return present
        }).then(res => {
            if (res) {
                db.collection('users').add({
                    username: submitForm.user_txt.value,
                    password: submitForm.password_txt.value,
                    games: 0,
                    highestScore: 0
                });
                //alert("Go to Homepage");
                //window.location.replace('/?user='+submitForm.user_txt.value);
                alert("Account created.You can now login with your credentials")
                submitForm.reset();
                return true
            }
            else {
                if (!already_once) {
                    alert("Username already exists.Try another")
                    submitForm.reset();
                    already_once = true
                }
                return false
            }
        })
    }
    else {
        console.log('Please');
        alert("Passwords do not match")
    }
})



