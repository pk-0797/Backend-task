const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  text: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const historySchema = new Schema({
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  from: String,
  to: String,
  note: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    currentStatus: {
      type: String,
      default: "To Do",
    },
    assignedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    dueDate: Date,
    comments: [commentSchema],
    history: [historySchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
