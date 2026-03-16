const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");


router.get("/", async (req, res) => {

    try {

        const expenses = await Expense.find();

        res.json(expenses);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

});


router.post("/", async (req, res) => {

    try {

        const newExpense = new Expense(req.body);

        const savedExpense = await newExpense.save();

        res.json({
            success: true,
            data: savedExpense
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

});


router.delete("/:id", async (req, res) => {

    try {

        const deletedExpense = await Expense.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Expense deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});



router.put("/:id", async (req, res) => {

    try {

        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json({
            success: true,
            data: updatedExpense
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});



module.exports = router;
