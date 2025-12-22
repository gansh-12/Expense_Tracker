//public/login.js
function login(e) {
    e.preventDefault();
    console.log(e.target.name);
    
    const loginDetails={
        email:e.target.email.value,
        password:e.target.password.value
    }
    
    console.log(loginDetails);
    axios.post('http://localhost:3000/user/login', loginDetails).then(response => {
        alert(response.data.message);
        localStorage.setItem("userId", response.data.userId);
        window.location.href="expense_screen.html";
    }).catch(err=> {
        console.log(JSON.stringify(err));
        alert(err.response.data.message);
    });
}

document.getElementById("forgotPasswordBtn").addEventListener("click",()=> {
    document.getElementById("forgotPasswordForm").style.display="block";
})

document.getElementById("sendMailBtn").addEventListener("click",async ()=> {
    const email=document.getElementById("forgotEmail").value;

    if (!email) {
        alert("Please enter your email");
        return;
    }

    try {
        const response=await axios.post("http://localhost:3000/password/forgotpassword",{email});
        alert(response.data.message);
    } catch (error) {
        console.error("Error sending mail:",error);
        alert("Failed to send mail");
    }
})
