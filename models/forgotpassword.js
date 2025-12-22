//models/forgotpassword.js
const {DataTypes}=require('sequelize');
const sequelize=require('../utils/db-connection');
const User=require('./user');

const Forgotpassword=sequelize.define(
    'Forgotpassword',
    {
        id:{
            type:DataTypes.UUID,
            defaultValue:DataTypes.UUIDV4,
            primaryKey:true,
            allowNull:false
        },
        isactive:{
            type:DataTypes.BOOLEAN,
            defaultValue:true,
            allowNull:false            
        },
    },
    {
        tableName:'ForgotPasswordRequests',
        timestamps:true
    }
)

User.hasMany(Forgotpassword,{foreignKey:'userId'});
Forgotpassword.belongsTo(User,{foreignKey:'userId'});

module.exports=Forgotpassword;
