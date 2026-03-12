const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();
app.use(bodyParser.json());

const users = [
  { id: 1, username: "admin_alex", role: "admin" },
  { id: 2, username: "dev_sam", role: "developer" },
];

let tasks = [
  {
    id: 101,
    ownerId: 1,
    title: "Setup CI/CD pipeline",
    description: "Use GitHub Actions for deployment",
    isPrivate: false,
  },
  {
    id: 102,
    ownerId: 1,
    title: "Update SSL certificates",
    description: "Keys are on the prod server: <b>root:mY_sUpEr_pAsS</b>",
    isPrivate: true,
  },
];

const authMiddleware = (req, res, next) => {
  const userId = parseInt(req.headers.authorization);
  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  req.user = user;
  next();
};

app.get("/api/tasks/:id", authMiddleware, (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === taskId);

  if (!task) return res.status(404).json({ error: "Task not found" });

  res.json({ success: true, task });
});

app.get("/api/tasks", authMiddleware, (req, res) => {
  const visibleTasks = tasks.filter(
    (t) => !t.isPrivate || t.ownerId === req.user.id,
  );
  res.json({ success: true, tasks: visibleTasks });
});

app.post("/api/tasks", authMiddleware, (req, res) => {
  const { title, description, isPrivate } = req.body;

  const newTask = {
    id: tasks.length + 101,
    ownerId: req.user.id,
    title,

    description,
    isPrivate: isPrivate || false,
  };

  tasks.push(newTask);
  res.json({ success: true, task: newTask });
});

app.post("/api/settings", authMiddleware, (req, res) => {
  const defaultWorkspaceSettings = {
    theme: "dark",
    notifications: true,
    view: "list",
  };

  const userSettings = req.body.settings || {};

  const finalSettings = _.merge({}, defaultWorkspaceSettings, userSettings);

  res.json({ success: true, settings: finalSettings });
});

app.listen(3000, () => console.log("DevTasker API running on port 3000"));
