//routes/passwordRoutes.js
const express=require("express");
const router=express.Router();
const {forgotpassword,resetpassword,updatepassword}=require("../controller/passwordController");

router.post("/forgotpassword",forgotpassword);
router.get("/resetpassword/:id",resetpassword);
router.get("/updatepassword/:id",updatepassword);

module.exports=router;
