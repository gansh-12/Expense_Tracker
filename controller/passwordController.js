//controller/passwordController.js
const Sib=require('sib-api-v3-sdk');
const uuid=require('uuid');
const bcrypt=require('bcrypt');

const User = require('../models/user');
const Forgotpassword=require('../models/forgotpassword');
//require("dotenv").config();

const client=Sib.ApiClient.instance;
        
const apiKey=client.authentications["api-key"];
apiKey.apiKey=process.env.SMTP_API_KEY;

const tranEmailApi=new Sib.TransactionalEmailsApi();

const forgotpassword=async (req,res)=> {
    try {
        const {email}=req.body;
        const user=await User.findOne({where:{email}});
        if (user) {
            const id=uuid.v4();
            await user.createForgotpassword({id,isactive:true});
        
            const msg={
                sender:{
                    email:'kumarhcem@gmail.com',
                    name:'Expense Tracker App'
                },
                to:[{email:email}],
                subject:'Reset Password - Expense Tracker App',
                textContent:'This is a dummy password reset email from Expense Tracker.',
                htmlContent:`<a href="http://localhost:3000/password/resetpassword/${id}">Reset password</a>`
            }

            tranEmailApi
                .sendTransacEmail(msg)
                .then((response) => {
                    return res.status(200).json({message: 'Link to reset password sent to your mail ', sucess: true})
                })  
                .catch((error) => {
                    throw new Error(error);
                })
        
        } else {
            throw new Error('User doesnt exist');
        }
    } catch (error) {
        console.error(error);
        return res.json({message: error});
    }
}

const resetpassword=(req,res) => {
    const id=req.params.id;
    Forgotpassword.findOne({where:{id,isactive:true}})
        .then(forgotpasswordrequest => {
            if (!forgotpasswordrequest) {
                return res.status(404).send("Invalid or expired password reset link");
            }
            forgotpasswordrequest.update({isactive:false});
            res.status(200).send(`
                <html>
                    <script>
                        function formsubmitted(e){
                            e.preventDefault();
                            console.log('called');
                        }
                    </script>

                    <form action="/password/updatepassword/${id}" method="GET">
                        <label for="newpassword">Enter New Password</label>
                        <input name="newpassword" type="password" required />
                        <button type="submit">Reset Password</button>
                    </form>
                </html>
            `)
            res.end();
        })
}

const updatepassword=(req,res) => {
    try {
        const {newpassword}=req.query;
        const {id}=req.params;
        Forgotpassword.findOne({where:{id}}).then(resetpasswordrequest => {
            User.findOne({where:{id:resetpasswordrequest.userId}}).then(user => {
                if (user) {
                    //encrypt the password
                    const saltRounds=10;
                    bcrypt.genSalt(saltRounds,function(err,salt) {
                        if (err) {
                            console.log(err);
                            throw new Error(err);
                        }
                        bcrypt.hash(newpassword,salt,function(err,hash) {
                            //store hash in password DB
                            if (err) {
                                console.log(err);
                                throw new Error(err);
                            }
                            user.update({password:hash}).then(() => {
                                return res.status(200).json({message:'Successfully update the password'});
                            })
                        })
                    })
                } else {
                    return res.status(403).json({error:'No user Exists',sucess:false});
                }
            })
        })
    } catch (error) {
        return res.status(403).json({error,success:false});
    }
}

module.exports={
    forgotpassword,
    resetpassword,
    updatepassword
}
