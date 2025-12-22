//routes/expenseRoutes.js
const express=require("express");
const router=express.Router();
const {addExpense,getExpenses,deleteExpense,getReport,downloadReport,downloadExpense}=require("../controller/expenseController");

router.post("/",addExpense);
router.get("/",getExpenses);
router.delete("/:id",deleteExpense);

router.get("/report",getReport);
router.get("/report/download",downloadReport);

router.get("/download",downloadExpense);

module.exports=router;
