//user_form.js
const express=require('express');
const fs=require("fs");
const morgan=require("morgan");
const path=require('path');
const app=express();
const sequelize=require('./utils/db-connection');
const {userSignup, userLogin, getUserById}=require('./controller/userController');
const {processPayment}=require('./controller/paymentController');
const paymentRoutes=require('./routes/paymentRoutes');
const showLeaderboardRoutes=require('./routes/showleaderboard');
const passwordRoutes=require("./routes/passwordRoutes");
const expenseRoutes=require("./routes/expenseRoutes");

require('./models/user');
require('./models/forgotpassword');

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use("/expense",expenseRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/payment',paymentRoutes);

app.use('/premium',showLeaderboardRoutes);

app.use('/password',passwordRoutes)

app.get('/',(req, res)=> {
    res.sendFile(path.join(__dirname, 'public', 'signup_screen.html'));
})

app.get('/login', (req, res)=> {
    res.sendFile(path.join(__dirname, 'public', 'login_screen.html'));
})

app.get('/user/:id',getUserById);

app.post('/user/signup', userSignup);
app.post('/user/login', userLogin);

app.post('/process-payment', processPayment);

const accessLogStream=fs.createWriteStream(
    path.join(__dirname,"logs","access.log"),
    {flags:"a"}
)

app.use(morgan("combined",{stream:accessLogStream}));

sequelize.sync({alter:false}).then(()=> {
    app.listen(3000, ()=> {
        console.log("Server is running");
    })
}).catch((err)=> {
    console.log('DB Sync failed:',err.message);
})

