const mongoose = require("mongoose");

const todoSchema = mongoose.Schema(
  {
    empID: { type: String },
    empName: { type: String },
    title: { type: String },
    desc: { type: String },
    date: { type: String },
  },
  { versionKey: false }
);

const TodoModel = mongoose.model("todo", todoSchema);

module.exports = { TodoModel };
