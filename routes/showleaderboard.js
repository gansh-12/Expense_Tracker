//routes/showleaderboard.js
const express=require('express');
const router=express.Router();

const {getLeaderboard}=require('../controller/premiumController');

router.get('/showleaderboard',getLeaderboard);

module.exports=router;
