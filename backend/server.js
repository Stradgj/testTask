const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash"); // Старая версия с CVE-2019-10744

const app = express();
app.use(bodyParser.json());

// Моковая БД
// Моковая БД
const users = [
  { id: 1, username: "admin_alex", role: "admin" },
  { id: 2, username: "dev_sam", role: "developer" },
];

// Задачи: 101 - публичная, 102 - приватная админская с секретами
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

// Примитивная авторизация через заголовок (для удобства тестов в Burp)
const authMiddleware = (req, res, next) => {
  const userId = parseInt(req.headers.authorization);
  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  req.user = user;
  next();
};

// --- ЭНДПОИНТЫ ---

// 1. Получение конкретной задачи (Уязвимость: IDOR)
app.get("/api/tasks/:id", authMiddleware, (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === taskId);

  if (!task) return res.status(404).json({ error: "Task not found" });

  // Бэкенд проверяет, что юзер авторизован (через middleware),
  // но забыл проверить: task.ownerId === req.user.id || !task.isPrivate
  res.json({ success: true, task });
});

// Получение списка всех публичных задач (для отрисовки интерфейса)
app.get("/api/tasks", authMiddleware, (req, res) => {
  const visibleTasks = tasks.filter(
    (t) => !t.isPrivate || t.ownerId === req.user.id,
  );
  res.json({ success: true, tasks: visibleTasks });
});

// 2. Создание новой задачи (Уязвимость: Stored XSS)
app.post("/api/tasks", authMiddleware, (req, res) => {
  const { title, description, isPrivate } = req.body;

  const newTask = {
    id: tasks.length + 101,
    ownerId: req.user.id,
    title,
    // Описание сохраняется без санитизации, так как фронт поддерживает HTML-теги
    description,
    isPrivate: isPrivate || false,
  };

  tasks.push(newTask);
  res.json({ success: true, task: newTask });
});

// 3. Сохранение настроек воркспейса (Уязвимость: Prototype Pollution)
app.post("/api/settings", authMiddleware, (req, res) => {
  const defaultWorkspaceSettings = {
    theme: "dark",
    notifications: true,
    view: "list",
  };

  const userSettings = req.body.settings || {};

  // Глубокое слияние объектов через уязвимую функцию
  const finalSettings = _.merge({}, defaultWorkspaceSettings, userSettings);

  res.json({ success: true, settings: finalSettings });
});

app.listen(3000, () => console.log("DevTasker API running on port 3000"));
