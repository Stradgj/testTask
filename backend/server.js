const express = require("express");
const bodyParser = require("body-parser");

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
    description: "Certificate renewal task — see internal docs.",
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

  const isOwner = task.ownerId === req.user.id;
  const isAdmin = req.user.role === "admin";

  if (task.isPrivate && !isOwner && !isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.json({ success: true, task });
});

app.get("/api/tasks", authMiddleware, (req, res) => {
  const visibleTasks = tasks.filter(
    (t) =>
      !t.isPrivate || t.ownerId === req.user.id || req.user.role === "admin",
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

  const ALLOWED_KEYS = ["theme", "notifications", "view"];
  const userSettings = req.body.settings || {};

  const safeSettings = {};
  for (const key of ALLOWED_KEYS) {
    if (Object.prototype.hasOwnProperty.call(userSettings, key)) {
      safeSettings[key] = userSettings[key];
    }
  }

  const finalSettings = { ...defaultWorkspaceSettings, ...safeSettings };
  res.json({ success: true, settings: finalSettings });
});

app.listen(3000, () => console.log("DevTasker API running on port 3000"));
