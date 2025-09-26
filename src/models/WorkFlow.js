const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const workflowSchema = new Schema({
  status: { type: String, required: true },
  allowedNext: [{ type: String }],
});

module.exports = mongoose.model("Workflow", workflowSchema);
