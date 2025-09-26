const express = require("express");
const router = express.Router();
const { requireUser, requireRole } = require("../middleware/authMiddleware");
const taskController = require("../controllers/taskController");

router.post("/create", requireUser, requireRole(["Admin"]), taskController.createTask);
router.get("/list", requireUser, taskController.listTasks);
router.get("/:id", requireUser, taskController.getTask);
router.put("/change-status/:id", requireUser, taskController.changeStatus);
router.post("/comment/:id", requireUser, taskController.addComment);
module.exports = router;

