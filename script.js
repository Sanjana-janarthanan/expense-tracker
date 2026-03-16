let expenses = [];
let editIndex = null;
let chart;
let trendChart;


window.addEventListener("DOMContentLoaded", function () {

    loadExpenses();

    document.getElementById("filter").addEventListener("change", updateUI);
    document.getElementById("sort").addEventListener("change", updateUI);
    document.getElementById("search").addEventListener("input", updateUI);
    document.getElementById("monthFilter").addEventListener("change", updateUI);


   

    const filterDropdown = document.getElementById("filter");

    filterDropdown.innerHTML = '<option value="all">All</option>';

    let categories = [...new Set(expenses.map(exp => exp.category))];

    categories.forEach(cat => {
        let option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        filterDropdown.appendChild(option);
    });

        const monthDropdown = document.getElementById("monthFilter");

    let months = [...new Set(expenses.map(exp => exp.date.slice(0,7)))];

    months.forEach(month => {
        let option = document.createElement("option");
        option.value = month;
        option.textContent = month;
        monthDropdown.appendChild(option);
    });

    updateUI();
    fetchExpenses();

});



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

        await fetch(`http://localhost:5000/expenses/${editId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(expenseData)
        });

        editId = null;

    } else {

        await fetch("http://localhost:5000/expenses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(expenseData)
        });

    }

    fetchExpenses();

    amountInput.value = "";
    categoryInput.value = "";
    dateInput.value = "";
}



function updateUI() {

    let expenseList = document.getElementById("expenseList");
    let totalDisplay = document.getElementById("total");
    let filterDropdown = document.getElementById("filter");

    let selectedFilter = filterDropdown.value;
    let searchValue = document.getElementById("search").value.toLowerCase();
    let sortValue = document.getElementById("sort").value;

    let monthTotal = 0;
    let currentMonth = new Date().toISOString().slice(0, 7);
    let selectedMonth = document.getElementById("monthFilter").value;



    expenseList.innerHTML = "";

    if (expenses.length === 0) {
        expenseList.innerHTML = "<p>No expenses added yet.</p>";
        totalDisplay.textContent = "0";
        renderChart([]);
        return;
    }

    let filteredExpenses = expenses
        .map((exp, index) => ({ ...exp, originalIndex: index }))
        .filter(exp =>
            (selectedFilter === "all" || exp.category === selectedFilter) &&
            (
                exp.category.toLowerCase().includes(searchValue) ||
                exp.amount.toString().includes(searchValue) ||
                exp.date.includes(searchValue)
            )
        );

        let emptyMessage = document.getElementById("emptyMessage");
        
        if (filteredExpenses.length === 0) {
            emptyMessage.style.display = "block";
        } else {
            emptyMessage.style.display = "none";
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

    filteredExpenses.forEach(exp => {

        total += exp.amount;
        if (selectedMonth === "" || exp.date.startsWith(selectedMonth)) {
            monthTotal += exp.amount;
        }



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

    let monthTotalDisplay = document.getElementById("monthTotal");
    if (monthTotalDisplay) {
        monthTotalDisplay.textContent = monthTotal;
    }

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

async function deleteExpense(id) {

    await fetch(`http://localhost:5000/expenses/${id}`, {
        method: "DELETE"
    });

    fetchExpenses();
}



function editExpense(id) {

    const expense = expenses.find(exp => exp._id === id);

    document.getElementById("amount").value = expense.amount;
    document.getElementById("category").value = expense.category;
    document.getElementById("date").value = expense.date;

    editId = id;
}



function renderChart(dataSource) {

    if (dataSource.length === 0) {

        if (chart) {
            chart.destroy();
        }

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

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: data
            }]
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

    if (trendChart) {
        trendChart.destroy();
    }


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

document.getElementById("themeToggle").addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");

});


fetch("http://localhost:5000/expenses")
.then(response => response.json())
.then(data => {
    console.log("Expenses from backend:", data);
});


async function loadExpenses() {

    const response = await fetch("http://localhost:5000/expenses");
    const data = await response.json();

    expenses = data.data;

    populateFilters(); 
    updateUI();
}


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


async function fetchExpenses() {

    const response = await fetch("http://localhost:5000/expenses");

    const result = await response.json();

    expenses = result.data;

    updateUI();
}
