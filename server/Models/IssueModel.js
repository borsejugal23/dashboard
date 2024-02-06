const mongoose = require("mongoose");

const issueSchema = mongoose.Schema(
  {
    issue: { type: String, required: true },
    empID: { type: String, required: true },
    empName: { type: String, required: true },
    status: { type: Boolean, default: false },
    feedback: { type: String, default: "" },
  },
  { versionKey: false }
);

const IssueModel = mongoose.model("issue", issueSchema);

module.exports = { IssueModel };
