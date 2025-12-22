//models/expense.js
const {DataTypes}=require('sequelize');
const sequelize=require('../utils/db-connection');
const User=require('./user');

const Expense=sequelize.define('Expense', {
    amount: {
        type: DataTypes.INTEGER,
        allowNull:false
    },
    description: {
        type: DataTypes.STRING,
        allowNull:false
    },
    category:{
        type: DataTypes.STRING,
        allowNull:false
    },
    type:{
        type:DataTypes.ENUM("expense","income"),
        allowNull:false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull:false
    },
    date:{
        type:DataTypes.DATEONLY,
        allowNull:false,
        defaultValue:DataTypes.NOW
    }
},{
    timestamps:true
})

User.hasMany (Expense, {foreignKey: 'userId'});
Expense.belongsTo(User, {foreignKey: 'userId'});

module.exports=Expense;
