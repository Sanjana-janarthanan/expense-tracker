
#  Expense Tracker (Full Stack Web Application)

A full-stack expense tracking web application that allows users to manage daily expenses efficiently with real-time data visualization and cloud-based storage.

---

##  Live Demo

Frontend (Netlify):
https://storied-manatee-985d87.netlify.app/

Backend API (Render):
https://expense-tracker-ibg3.onrender.com

---

##  Project Overview

The Expense Tracker is a web application that enables users to record, manage, and analyze their expenses. It provides features such as adding, editing, deleting expenses, filtering by category or month, searching, sorting, and visualizing spending trends through charts.

The application uses a **full-stack architecture** with a deployed backend API and a cloud-hosted database for persistent data storage.

---

##  Features

* Add new expenses with amount, category, and date
* Edit existing expenses
* Delete expenses
* Filter expenses by category
* Filter expenses by month
* Search expenses
* Sort expenses by amount or date
* Monthly spending summary
* Pie chart visualization of expenses by category
* Trend chart showing monthly spending patterns
* Export expense data to CSV
* Dark mode toggle
* Cloud-based data storage with MongoDB Atlas

---

##  Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript (Vanilla JS)
* Chart.js

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas

### Deployment

* Netlify (Frontend)
* Render (Backend)

---

##  How It Works

1. Users enter expense details in the frontend interface.
2. The frontend sends HTTP requests to the backend REST API.
3. The backend processes the request and stores the data in MongoDB Atlas.
4. Stored data is fetched back and displayed on the dashboard.
5. Charts and filters update dynamically based on the stored data.

---

##  API Endpoints

GET /expenses
Fetch all expenses

POST /expenses
Create a new expense

PUT /expenses/:id
Update an existing expense

DELETE /expenses/:id
Delete an expense

---

##  Installation (Local Setup)

Clone the repository

```
git clone https://github.com/Sanjana-janarthanan/expense-tracker.git
```

Install backend dependencies

```
cd backend
npm install
```

Create a `.env` file and add your MongoDB connection string

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Run the backend server

```
npm start
```

Open the frontend `index.html` in a browser.

---

##  Screenshots

<img width="932" height="790" alt="image" src="https://github.com/user-attachments/assets/22234001-1d92-4d48-bc4e-e48cbae8d25d" />


---

##  Learning Outcomes

* Built and integrated RESTful APIs using Node.js and Express.js
* Implemented CRUD operations with MongoDB Atlas
* Connected frontend and backend using Fetch API
* Visualized data using Chart.js
* Deployed a full-stack application using Netlify and Render

---

## 📄 License

This project is created for learning and portfolio purposes.
