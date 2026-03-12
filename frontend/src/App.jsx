import React, { useState, useEffect } from "react";

function App() {
  const [currentUser, setCurrentUser] = useState(2); // По умолчанию мы обычный разработчик (ID: 2)
  const [tasks, setTasks] = useState([]);

  // Форма новой задачи
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Загрузка доступных задач при смене юзера
  const fetchTasks = async () => {
    const res = await fetch("/api/tasks", {
      headers: { Authorization: currentUser },
    });
    const data = await res.json();
    if (data.success) setTasks(data.tasks);
  };

  useEffect(() => {
    fetchTasks();
  }, [currentUser]);

  // Создание таски (Вектор для закидывания XSS)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: currentUser,
      },
      body: JSON.stringify({
        title: newTitle,
        description: newDesc,
        isPrivate: false,
      }),
    });
    setNewTitle("");
    setNewDesc("");
    fetchTasks();
  };

  // Сохранение настроек (Вектор для Prototype Pollution)
  const handleSaveSettings = async () => {
    const settings = { theme: "light" };
    await fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: currentUser,
      },
      body: JSON.stringify({ settings }),
    });
    alert("Settings applied!");
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "sans-serif",
        padding: "20px",
      }}
    >
      <h1>DevTasker Workspace</h1>

      <div
        style={{
          background: "#333",
          color: "#fff",
          padding: "10px",
          marginBottom: "20px",
        }}
      >
        <label>Logged in as: </label>
        <select
          value={currentUser}
          onChange={(e) => setCurrentUser(parseInt(e.target.value))}
        >
          <option value={1}>Admin Alex (ID: 1)</option>
          <option value={2}>Developer Sam (ID: 2)</option>
        </select>
        <button onClick={handleSaveSettings} style={{ marginLeft: "20px" }}>
          Save Theme
        </button>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        {/* Список задач */}
        <div style={{ flex: 1 }}>
          <h2>Active Tasks</h2>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <h3>
                #{task.id} - {task.title}
              </h3>
              {/* Уязвимость рендеринга: dangerouslySetInnerHTML без очистки */}
              <div
                style={{ background: "#f5f5f5", padding: "10px" }}
                dangerouslySetInnerHTML={{ __html: task.description }}
              />
            </div>
          ))}
        </div>

        {/* Форма создания */}
        <div style={{ width: "300px", background: "#eee", padding: "15px" }}>
          <h2>New Task</h2>
          <form onSubmit={handleCreateTask}>
            <input
              placeholder="Task Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
            />
            <textarea
              placeholder="Description (Supports HTML logs)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              style={{
                width: "100%",
                height: "100px",
                marginBottom: "10px",
                padding: "5px",
              }}
            />
            <button type="submit" style={{ width: "100%", padding: "10px" }}>
              Create Ticket
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
