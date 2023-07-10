const loginForm = document.getElementById('login')

var already_once = false
loginForm.addEventListener('submit', e => {
    e.preventDefault();
    db.collection('users').get().then(snapshot => {
        var password = "---"
        snapshot.docs.forEach(doc => {
            if (doc.data().username == loginForm.username_txt.value) {
                password = doc.data().password
            }
        })
        return password
    }).then(res => {
        if (res === "---") {
            alert("User doesn't exist")
            loginForm.reset();
        }
        else {
            if (res === loginForm.password_txt.value) {
                window.location.replace("/?user="+loginForm.username_txt.value)

            }
            else {
                alert("Password Incorrect")
                loginForm.reset();
            }
        }
    })
})
