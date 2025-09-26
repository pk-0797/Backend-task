# Task Management System (MERN)

A simple **MERN stack project** with authentication, role-based access, task workflows, and notifications.

---


## 🚀 Frontend Setup
cd frontend-task
npm install
npm run dev

Runs at: http://localhost:5173


## 🚀 Backend Setup
```bash
cd Backend-task
npm install
npm start


Runs at: http://localhost:4000

## User Routes

POST /api/user/signup → Register new user
POST /api/user/login → Login user
GET /api/user/all → Get all users

## Role Routes for add role in future

POST /api/role/addrole → Add a new role


## Task Routes 

POST /api/task/create → Create a task ("Admin only")
GET /api/task/list → Get all tasks
GET /api/task/:id → Get single task by ID
PUT /api/task/change-status/:id → Change task status
POST /api/task/comment/:id → Add a comment to a task
