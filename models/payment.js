//models/payment.js
const {DataTypes}=require("sequelize");
const sequelize=require("../utils/db-connection");

const Payment=sequelize.define("Payment",{
    orderId:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    paymentSessionId:{
        type:DataTypes.STRING,
        allowNull:false
    },
    orderAmount:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    orderCurrency:{
        type:DataTypes.STRING,
        defaultValue:"INR"
    },
    paymentStatus:{
        type:DataTypes.STRING,
        defaultValue:"Pending"
    },
    userId:{
        type:DataTypes.INTEGER,
        allowNull:true
    }
},{
    timestamps:true
})

module.exports=Payment;
