//controller/expenseController.js
const Expense = require('../models/expense');
const User = require('../models/user');
const sequelize = require('../utils/db-connection');
const { Op } = require("sequelize");
const S3services=require('../services/S3services');

const addExpense = async (req, res) => {
    const { amount, description, category, userId } = req.body;
    const recordType = req.body.type || "expense";
    const t = await sequelize.transaction();
    console.log("Received expense data: ", req.body);
    try {
        if (!amount || !description || !category) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const expense = await Expense.create({ amount, description, category, type: recordType, userId }, { transaction: t });
        const user = await User.findByPk(userId, { transaction: t });
        if (recordType === "expense") {
            if (user) {
                const newTotalExpense = user.totalExpense + parseInt(amount);
                await user.update(
                    { totalExpense: newTotalExpense },
                    { transaction: t }
                )
            }
        }
        await t.commit();
        res.status(201).json(expense);
    } catch (error) {
        await t.rollback();
        console.log("Error in addExpense: ", error.message);
        res.status(500).json({ message: error.message });
    }
}

const getExpenses = async (req, res) => {
    try {
        const { userId, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await Expense.findAndCountAll({
            where: { userId },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["createdAt", "DESC"]]
        });
        res.status(200).json({ expenses: rows, totalItems: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const expense = await Expense.findByPk(id, { transaction: t });
        if (!expense) {
            await t.rollback();
            return res.status(404).json({ message: "Expense not found" });
        }

        const user = await User.findByPk(expense.userId, { transaction: t });
        if (user && expense.type === "expense") {
            if (user) {
                const newTotalExpense = user.totalExpense - parseInt(expense.amount);
                await user.update({ totalExpense: newTotalExpense }, { transaction: t });
            }
        }

        await Expense.destroy({ where: { id }, transaction: t });

        await t.commit();
        res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        await t.rollback();
        console.log("Error in deleteExpense:", error.message);
        res.status(500).json({ message: error.message });
    }
}

const downloadExpense = async (req, res) => {
    try {
        const userId=req.query.userId;

        const user=await User.findByPk(userId);

        if (!user.isPremiumUser) {
            return res.status(404).json({message:"Not a premium user"});
        }

        const expenses = await Expense.findAll({where:{userId}});
        console.log(expenses);
        const stringifiedExpenses = JSON.stringify(expenses);

        const filename = `Expense${userId}/${new Date()}.txt`;
        const fileURL = await S3services.uploadToS3(stringifiedExpenses, filename);
        res.status(200).json({ fileURL, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({fileURL:'',success:false,err:err});
    }
}

const getReport = async (req, res) => {
    const { userId, period } = req.query;
    const today = new Date();

    let condition = { userId };

    if (period === "daily") {
        condition.date = today.toISOString().split("T")[0];
    }

    if (period === "weekly") {
        const last7 = new Date();
        last7.setDate(today.getDate() - 7);

        condition.date = { [Op.between]: [last7, today] }
    }

    if (period === "monthly") {
        const first = new Date(today.getFullYear(), today.getMonth(), 1);
        const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        condition.date = { [Op.between]: [first, last] };
    }

    if (period === "yearly") {
        const first = new Date(today.getFullYear(), 0, 1);
        const last = new Date(today.getFullYear(), 11, 31);

        condition.date = { [Op.between]: [first, last] };
    }

    const report = await Expense.findAll({ where: condition });

    res.json(report);
}

const downloadReport = async (req, res) => {
    try {
        const { userId, period } = req.query;
        const today = new Date();
        let condition = { userId };

        if (period === "daily") {
            condition.date = today.toISOString().split("T")[0];
        }

        if (period === "weekly") {
            const last7 = new Date();
            last7.setDate(today.getDate() - 7);
            condition.date = { [Op.between]: [last7, today] };
        }

        if (period === "monthly") {
            const first = new Date(today.getFullYear(), 0, 1);
            const last = new Date(today.getFullYear(), 11, 31);
            condition.date = { [Op.between]: [first, last] };
        }

        const expenses = await Expense.findAll({ where: condition });

        let csv = "Date,Description,Category,Income,Expense\n";

        expenses.forEach(e => {
            csv += `${e.date},${e.description},${e.category},` +
                `${e.type === "income" ? e.amount : 0},` +
                `${e.type === "expense" ? e.amount : 0}\n`;
        })

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment;filename=expense-report.csv");

        res.send(csv);
    } catch (error) {
        return res.status(500).json({ message: "Failed to download report" });
    }
}

module.exports = {
    addExpense,
    getExpenses,
    deleteExpense,
    getReport,
    downloadReport,
    downloadExpense
}
