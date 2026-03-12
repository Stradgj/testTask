import React, { useState, useEffect } from "react";
import DOMPurify from "dompurify";

function App() {
  const [currentUser, setCurrentUser] = useState(2);
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

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

              <div
                style={{ background: "#f5f5f5", padding: "10px" }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(task.description),
                }}
              />
            </div>
          ))}
        </div>

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
              placeholder="Description (supports basic HTML)"
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
