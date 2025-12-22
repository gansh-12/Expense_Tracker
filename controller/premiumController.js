//controller/premiumController.js
const Expense=require("../models/expense");
const User = require("../models/user");
const {Sequelize}=require("sequelize");

exports.getLeaderboard=async (req,res)=> {
    try {
        const leadeboardData=await User.findAll({
            attributes:["name","totalExpense"],
            include:[
                {
                    model:Expense,
                    attributes:[]
                }
            ],
            group:["User.id"],
            order:[
                [Sequelize.literal("totalExpense"),"DESC"]
            ]
        })
        
        res.status(200).json(leadeboardData);
    } catch (error) {
        console.error("Error fetching leaderboard:",error.message);
        res.status(500).json({message:error.message});
    }
}
