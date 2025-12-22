//public/signup.js
function signup(e) {
    e.preventDefault();
    
    const signupDetails={
        name:e.target.name.value,
        email:e.target.email.value,
        password:e.target.password.value
    }
    
    console.log(signupDetails);
    axios.post('http://localhost:3000/user/signup', signupDetails).then(response => {
        alert(response.data.message, false);
    }).catch(err=> {
        console.log(JSON.stringify(err));
        document.body.innerHTML+=`<div style="color:red;">${err.message}</div>`;
    });
}
