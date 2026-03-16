let expenses = [];
let chart;
let trendChart;
let editId = null;

window.addEventListener("DOMContentLoaded", function () {

    loadExpenses();

    document.getElementById("filter").addEventListener("change", updateUI);
    document.getElementById("sort").addEventListener("change", updateUI);
    document.getElementById("search").addEventListener("input", updateUI);
    document.getElementById("monthFilter").addEventListener("change", updateUI);

    document.getElementById("themeToggle").addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
    });

});



/* ================================
   LOAD EXPENSES FROM BACKEND
================================ */

async function loadExpenses() {

    const response = await fetch("https://expense-tracker-ibg3.onrender.com/expenses");

    const data = await response.json();

    expenses = data;   // backend returns array

    populateFilters();

    updateUI();
}



/* ================================
   FETCH EXPENSES (REFRESH)
================================ */

async function fetchExpenses() {

    const response = await fetch("https://expense-tracker-ibg3.onrender.com/expenses");

    const result = await response.json();

    expenses = result;

    populateFilters();

    updateUI();
}



/* ================================
   ADD OR UPDATE EXPENSE
================================ */

async function addExpense() {

    let amountInput = document.getElementById("amount");
    let categoryInput = document.getElementById("category");
    let dateInput = document.getElementById("date");

    let amount = Number(amountInput.value);
    let category = categoryInput.value.trim().toLowerCase();
    let date = dateInput.value;

    if (amount <= 0 || category === "" || date === "") {
        alert("Please enter valid details");
        return;
    }

    let expenseData = { amount, category, date };

    if (editId) {

        await fetch(`https://expense-tracker-ibg3.onrender.com/expenses/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(expenseData)
        });

        editId = null;

    } else {

        await fetch("https://expense-tracker-ibg3.onrender.com/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(expenseData)
        });

    }

    fetchExpenses();

    amountInput.value = "";
    categoryInput.value = "";
    dateInput.value = "";
}



/* ================================
   DELETE EXPENSE
================================ */

async function deleteExpense(id) {

    await fetch(`https://expense-tracker-ibg3.onrender.com/expenses/${id}`, {
        method: "DELETE"
    });

    fetchExpenses();
}



/* ================================
   EDIT EXPENSE
================================ */

function editExpense(id) {

    const expense = expenses.find(exp => exp._id === id);

    document.getElementById("amount").value = expense.amount;
    document.getElementById("category").value = expense.category;
    document.getElementById("date").value = expense.date;

    editId = id;
}



/* ================================
   POPULATE FILTER DROPDOWNS
================================ */

function populateFilters() {

    const filterDropdown = document.getElementById("filter");
    const monthDropdown = document.getElementById("monthFilter");

    filterDropdown.innerHTML = '<option value="all">All</option>';
    monthDropdown.innerHTML = '<option value="">All Months</option>';

    let categories = [...new Set(expenses.map(exp => exp.category))];

    categories.forEach(cat => {

        let option = document.createElement("option");

        option.value = cat;
        option.textContent = cat;

        filterDropdown.appendChild(option);
    });

    let months = [...new Set(expenses.map(exp => exp.date.slice(0,7)))];

    months.forEach(month => {

        let option = document.createElement("option");

        option.value = month;
        option.textContent = month;

        monthDropdown.appendChild(option);
    });

}



/* ================================
   UPDATE UI
================================ */

function updateUI() {

    let expenseList = document.getElementById("expenseList");
    let totalDisplay = document.getElementById("total");

    let selectedFilter = document.getElementById("filter").value;
    let searchValue = document.getElementById("search").value.toLowerCase();
    let sortValue = document.getElementById("sort").value;
    let selectedMonth = document.getElementById("monthFilter").value;

    expenseList.innerHTML = "";

    if (!expenses || expenses.length === 0) {

        expenseList.innerHTML = "<p>No expenses added yet.</p>";
        totalDisplay.textContent = "₹0";

        renderChart([]);
        return;
    }

    let filteredExpenses = expenses
        .filter(exp =>
            (selectedFilter === "all" || exp.category === selectedFilter) &&
            (
                exp.category.includes(searchValue) ||
                exp.amount.toString().includes(searchValue) ||
                exp.date.includes(searchValue)
            )
        );



    if (selectedMonth !== "") {

        filteredExpenses = filteredExpenses.filter(exp =>
            exp.date.startsWith(selectedMonth)
        );
    }



    if (sortValue === "amountLow") {
        filteredExpenses.sort((a, b) => a.amount - b.amount);
    }

    if (sortValue === "amountHigh") {
        filteredExpenses.sort((a, b) => b.amount - a.amount);
    }

    if (sortValue === "dateRecent") {
        filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    }



    let total = 0;
    let monthTotal = 0;

    filteredExpenses.forEach(exp => {

        total += exp.amount;

        let li = document.createElement("li");

        li.innerHTML = `
        <div class="expense-info">
            <span class="category">${exp.category}</span>
            <span class="date">${exp.date}</span>
        </div>

        <div class="expense-right">
            <span class="amount">₹${exp.amount}</span>
            <button onclick="editExpense('${exp._id}')">Edit</button>
            <button onclick="deleteExpense('${exp._id}')">X</button>
        </div>
        `;

        expenseList.appendChild(li);
    });



    filteredExpenses.forEach(exp => {

        if (selectedMonth === "" || exp.date.startsWith(selectedMonth)) {
            monthTotal += exp.amount;
        }

    });



    document.getElementById("monthTotal").textContent = monthTotal;

    totalDisplay.textContent = "₹" + total;



    let budgetLimit = 30000;

    let warning = document.getElementById("budgetWarning");

    if (monthTotal > budgetLimit) {

        warning.textContent = "⚠ Budget exceeded!";
        warning.style.color = "red";

    } else {

        warning.textContent = "";

    }



    renderChart(filteredExpenses);

    renderTrendChart();

}



/* ================================
   PIE CHART
================================ */

function renderChart(dataSource) {

    if (dataSource.length === 0) {

        if (chart) chart.destroy();

        return;
    }

    let categoryTotals = {};

    dataSource.forEach(exp => {

        if (!categoryTotals[exp.category]) {
            categoryTotals[exp.category] = 0;
        }

        categoryTotals[exp.category] += exp.amount;
    });

    let labels = Object.keys(categoryTotals);
    let data = Object.values(categoryTotals);

    const ctx = document.getElementById("expenseChart").getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {

        type: "pie",

        data: {
            labels: labels,
            datasets: [{ data: data }]
        },

        options: {
            plugins: {
                title: {
                    display: true,
                    text: "Expenses by Category"
                }
            }
        }

    });

}



/* ================================
   TREND CHART
================================ */

function renderTrendChart() {

    const canvas = document.getElementById("trendChart");

    if (!canvas) return;

    let monthlyTotals = {};

    expenses.forEach(exp => {

        let month = exp.date.slice(0, 7);

        if (!monthlyTotals[month]) {
            monthlyTotals[month] = 0;
        }

        monthlyTotals[month] += exp.amount;

    });

    let months = Object.keys(monthlyTotals).sort();

    let totals = months.map(m => monthlyTotals[m]);

    const ctx = canvas.getContext("2d");

    if (trendChart) trendChart.destroy();

    trendChart = new Chart(ctx, {

        type: "line",

        data: {
            labels: months,
            datasets: [{
                label: "Monthly Spending",
                data: totals,
                borderWidth: 2,
                tension: 0.3,
                fill: false
            }]
        },

        options: {
            plugins: {
                title: {
                    display: true,
                    text: "Monthly Spending Trend"
                }
            }
        }

    });

}



/* ================================
   EXPORT CSV
================================ */

function exportCSV() {

    if (expenses.length === 0) {
        alert("No expenses to export!");
        return;
    }

    let csv = "Date,Category,Amount\n";

    expenses.forEach(exp => {
        csv += `${exp.date},${exp.category},${exp.amount}\n`;
    });

    let blob = new Blob([csv], { type: "text/csv" });

    let link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "expenses.csv";

    link.click();
}
