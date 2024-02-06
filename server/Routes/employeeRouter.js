const express = require("express");
const { UserModel, UserTaskModel } = require("../Models/UserModel");
const { tokenVerifier } = require("../middleware/tokenVerifier");
const { issueModel, IssueModel } = require("../Models/IssueModel");

const employeeRouter = express.Router();

employeeRouter.route("/details/:id").get(getEmpByDetails);
employeeRouter.route("/updates/:id").get(getDailyUpdatesFromId);
employeeRouter.route("/updatetask/:id").post(updateUserTask);
employeeRouter.route("/updatetodo/:id").post(updateTodo);
employeeRouter.route("/deletetask/:id").delete(deleteTask);

// Employee Details from id -------------------------------------------------------------------------------------------------------------------------
async function getEmpByDetails(req, res) {
  let empId = req.params.id;
  try {
    let updatedEmpObj = await UserModel.find({ id: empId });
    res.json(updatedEmpObj);
  } catch (error) {
    console.log(error);
  }
}

employeeRouter.get("/getEmpDetails/:id", async (req, res) => {
  let empId = req.params.id;
  try {
    let updatedEmpObj = await UserModel.findOne({ _id: empId });
    // console.log(updatedEmpObj);
    res.json(updatedEmpObj);
  } catch (error) {
    console.log(error);
  }
});

// get daily updates from id -------------------------------------------------------------------------------------------------------
async function deleteTask(req, res) {
  let userTaskId = req.params.id;
  let userId = req.body.empId;
  // console.log(userTaskId, userId);

  try {
    let responseObj = await UserTaskModel.updateOne(
      { employeId: userId },
      {
        $pull: {
          taskCompletedArr: { taskId: userTaskId },
        },
      },
      { new: true }
    );
    // console.log(responseObj);
    res.json({ status: 200 });
  } catch (error) {}

  // res.json({userTaskId, userId})
}

async function getDailyUpdatesFromId(req, res) {
  let empId = req.params.id;

  try {
    let responseObj = await UserTaskModel.findOne({ employeId: empId });
    res.json(responseObj);
  } catch (error) {
    res.json(error);
  }
}

async function updateUserTask(req, res) {
  let empId = req.params.id;
  let newUpdatedtask = req.body;
  // console.log(req.body);

  try {
    let responseObj = await UserTaskModel.find({ employeId: empId });

    if (responseObj.length === 0) {
      await UserTaskModel.create({
        employeId: `${empId}`,
        taskCompletedArr: [],
        taskAssignArr: {},
      });

      let newResponse = await updateCompletedTask(empId, newUpdatedtask);
      res.json(newResponse);
    } else {
      let newResponse = await updateCompletedTask(empId, newUpdatedtask);
      res.json(newResponse);
    }
  } catch (error) {
    res.json({
      status: 400,
      errorObj: error.message,
    });
  }
}

async function updateCompletedTask(empId, newUpdatedtask) {
  let newRes = await UserTaskModel.findOneAndUpdate(
    { employeId: empId },
    {
      $push: {
        taskCompletedArr: newUpdatedtask,
      },
    },
    {
      new: true,
    }
  );
  return newRes;
}

async function updateTodo(req, res) {
  let empId = req.params.id;
  let todoObj = req.body;
  // console.log(todoObj);

  let responseObj = await UserTaskModel.findOneAndUpdate(
    { employeId: empId },
    {
      $push: {
        todoArr: todoObj,
      },
    },
    { new: true }
  );

  res.json(responseObj);
}

employeeRouter.post("/issues", tokenVerifier, async (req, res) => {
  const { id } = req.params;
  const { issue, userName: empName, userID: empID } = req.body;
  // console.log("HERE");
  try {
    const newIssue = new IssueModel({ issue, empID, empName });
    await newIssue.save();
    res.statusMessage = "Saved";
    res.json({ msg: "Success", issue });
  } catch (error) {
    res.json({ error: error.message });
  }
});

employeeRouter.get("/issues", tokenVerifier, async (req, res) => {
  const { userID: empID, role } = req.body;
  try {
    const query = {};
    if (!role) {
      query.empID = empID;
    }
    const issues = await IssueModel.find(query);
    // console.log(issues, "is");
    res.json({ issues });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

employeeRouter.patch("/issues/:id", async (req, res) => {
  const { id } = req.params;
  const { feedback } = req.body;

  const issue = await IssueModel.findOneAndUpdate(
    { _id: id },
    { feedback, status: true },
    { new: true }
  );

  if (issue) {
    res.statusMessage = "Success";
    res.json({ msg: "Updated", issue });
  } else {
    res.statusMessage = "Failed";
    res.json({ msg: "Something went wrong." });
  }
  try {
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

employeeRouter.delete("/issues", tokenVerifier, async (req, res) => {
  const { userID } = req.body;

  const issue = await IssueModel.deleteMany({ empID: userID, status: true });

  if (issue) {
    res.statusMessage = "Success";
    res.json({ msg: "Updated", issue });
  } else {
    res.statusMessage = "Failed";
    res.json({ msg: "Something went wrong." });
  }
  try {
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = employeeRouter;
