const Task = require("../models/TaskModel");
const Workflow = require("../models/WorkFlow");
const Notification = require("../models/NotificationModel");

const isAllowedTransition = async (from, to) => {
  const workFlow = await Workflow.findOne({ status: from });
  if (!workFlow) return false;
  return workFlow.allowedNext.includes(to);
};

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedUsers = [],
      priority,
      dueDate,
    } = req.body;
    const createdBy = req.user._id;
    const task = await Task.create({
      title,
      description,
      assignedUsers,
      priority,
      dueDate,
      createdBy,
    });

    const io = req.app.get("io");
    const sockets = req.app.get("sockets");
    for (const u of assignedUsers) {
      await Notification.create({
        user: u,
        message: `You were assigned to task "${title}"`,
      });
      const sid = sockets.get(String(u));
      if (sid && io)
        io.to(sid).emit("notification", { message: `Assigned: ${title}` });
    }
    res.status(201).json({ data: task });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const listTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === "Admin") {
      tasks = await Task.find()
        .populate("assignedUsers createdBy", "name email")
        .populate("comments.author", "name email")
        .populate("history.changedBy", "name email");
    } else {
      tasks = await Task.find({ assignedUsers: req.user._id })
        .populate("assignedUsers createdBy", "name email")
        .populate("comments.author", "name email")
        .populate("history.changedBy", "name email");
    }
    res.json({ data: tasks });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedUsers createdBy", "name email")
      .populate("comments.author", "name email")
      .populate("history.changedBy", "name email");

    if (!task) return res.status(404).json({ message: "Task not found" });

    const isAssigned = task.assignedUsers.some(
      (u) => String(u._id || u) === String(req.user._id)
    );

    if (req.user.role !== "Admin" && !isAssigned)
      return res.status(403).json({ message: "Forbidden" });

    res.json({ data: task });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const changeStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const to = req.body.to;
    const from = task.currentStatus;

    const isAssigned = task.assignedUsers.some(
      (u) => String(u) === String(req.user._id)
    );
    if (req.user.role !== "Admin" && !isAssigned)
      return res
        .status(403)
        .json({ message: "Only Admin or assigned user can change status" });

    const allowed = await isAllowedTransition(from, to);
    if (!allowed)
      return res
        .status(400)
        .json({ message: `Invalid transition from ${from} to ${to}` });

    task.currentStatus = to;
    task.history.push({
      changedBy: req.user._id,
      from,
      to,
      note: req.body.note || "",
    });
    await task.save();

    const io = req.app.get("io");
    const sockets = req.app.get("sockets");
    for (const u of task.assignedUsers) {
      await Notification.create({
        user: u,
        message: `Task "${task.title}" moved ${from} → ${to}`,
      });
      const sid = sockets.get(String(u));
      if (sid && io)
        io.to(sid).emit("notification", {
          message: `Status update: ${task.title} → ${to}`,
        });
    }

    res.json({ data: task });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Not found" });
    const isAssigned = task.assignedUsers.some(
      (u) => String(u) === String(req.user._id)
    );
    if (!isAssigned && req.user.role !== "Admin")
      return res
        .status(403)
        .json({ message: "Only assigned users can comment" });

    task.comments.push({ text: req.body.text, author: req.user._id });
    task.history.push({
      changedBy: req.user._id,
      from: task.currentStatus,
      to: task.currentStatus,
      note: `Comment added`,
    });
    await task.save();

    const io = req.app.get("io");
    const sockets = req.app.get("sockets");
    for (const u of task.assignedUsers) {
      if (String(u) === String(req.user._id)) continue;
      await Notification.create({
        user: u,
        message: `New comment on "${task.title}"`,
      });
      const sid = sockets.get(String(u));
      if (sid && io)
        io.to(sid).emit("notification", {
          message: `New comment on ${task.title}`,
        });
    }

    res.json({ data: task });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  createTask,
  listTasks,
  getTask,
  changeStatus,
  addComment,
};
