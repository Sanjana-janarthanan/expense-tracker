const mongoose = require("mongoose");
const expenseRoutes = require("./routes/expenses");
const express = require("express");
const cors = require("cors");

require("dotenv").config();


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Expense Tracker API Running");
});

app.use("/expenses", expenseRoutes);

mongoose.connect(process.env.MONGO_URI)


.then(() => {
    console.log("MongoDB Connected");
})

.catch((error) => {
    console.log("MongoDB connection error:", error);
});


app.listen(5000, () => {
    console.log("Server running on port 5000");
});
