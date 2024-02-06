const express = require("express");
const { tokenVerifier } = require("../middleware/tokenVerifier");
const { TodoModel } = require("../Models/TodoModel");

const todoRouter = express.Router();

todoRouter.use(tokenVerifier);

todoRouter.post("/", async (req, res) => {
  const { userID, userName, title, desc, date } = req.body;
  try {
    const initTodos = new TodoModel({
      empID: userID,
      empName: userName,
      title,
      desc,
      date,
    });

    initTodos.save();
    res.statusMessage = "Success";
    res.json({ msg: "Todo added.", todos: initTodos });
  } catch (error) {
    res.status(404).json({ error });
  }
});

todoRouter.get("/", async (req, res) => {
  const { userID } = req.body;
  try {
    const todos = await TodoModel.find({ empID: userID });
    // console.log(todos);
    res.json({ todos });
  } catch (error) {
    res.status(404).json({ error });
  }
});

todoRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const todos = await TodoModel.findOneAndDelete({ _id: id }, { new: true });
    res.statusMessage = "Success";
    res.json({ msg: "Success", todos });
  } catch (error) {
    res.status(404).json({ error });
  }
});

todoRouter.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, desc, date } = req.body;
  try {
    const todos = await TodoModel.findOneAndUpdate(
      { _id: id },
      { title, desc, date },
      { new: true }
    );
    res.statusMessage = "Success";
    res.json({ todos });
  } catch (error) {
    res.status(404).json({ error });
  }
});

module.exports = { todoRouter };
