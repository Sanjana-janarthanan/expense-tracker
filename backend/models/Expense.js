const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    date: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Expense", expenseSchema);
