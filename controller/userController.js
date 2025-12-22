//controller/userController.js
const User=require('../models/user');
const bcrypt=require('bcrypt');

const userSignup=async (req, res)=> {
    const {name,email,password}=req.body;
    try {
        const existingUser=await User.findOne({where: {email}});
        if (existingUser) {
            res.status(409).json({message: "User already exists"});
            return;
        }
        
        const hashedPassword=await bcrypt.hash(password, 10);
        
        await User.create({name,email, password:hashedPassword});
        
        return res.status(201).json({message: "Signup successful"});

    } catch (error) {
        res.status(500).send(error.message);
    }
}

const userLogin=async (req, res)=> {
    const {email, password}=req.body;
    try {
        const user=await User.findOne({where: {email}});
        if (user) {
            bcrypt.compare(password, user.password, (err, result)=> {
                if (err) {
                    res.status(500).json({success: false, message: 'Something went wrong'});
                }
                if (result===true) {
                    res.status(200).json({success:true, message: "User logged in successfully", userId:user.id});
                } else {
                    return res.status(400).json({success: false, message: "Password is incorrect"});
                }
            })
        } else {
            return res.status(404).json({message: "User not found"});
        }
    } catch (error) {
        return res.status(500).send({message:error, success:false});
    }
}

const getUserById = async (req,res)=> {
    try {
        const {id}=req.params;
        const user=await User.findByPk(id);
        if (!user) return res.status(404).json({message:"User not found"});
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}

module.exports={
    userSignup,
    userLogin,
    getUserById
}
