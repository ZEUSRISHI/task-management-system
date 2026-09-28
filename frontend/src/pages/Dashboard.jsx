import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [tasks, setTasks] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    due_date: ""
  });

  const loadTasks = async () => {
    try {
      const response = await api.get("/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const createTask = async (e) => {
    e.preventDefault();

    try {
      await api.post("/tasks", form);

      setForm({
        title: "",
        description: "",
        priority: "MEDIUM",
        due_date: ""
      });

      loadTasks();

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to create task"
      );
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, {
        status
      });

      loadTasks();

    } catch (error) {
      console.error(error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      loadTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="dashboard">
      <header>
        <div>
          <h1>Task Manager</h1>
          <p>Welcome, {user?.name}</p>
        </div>

        <button onClick={logout}>
          Logout
        </button>
      </header>

      <section className="create-task">
        <h2>Create Task</h2>

        <form onSubmit={createTask}>
          <input
            type="text"
            placeholder="Task title"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value
              })
            }
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value
              })
            }
          />

          <select
            value={form.priority}
            onChange={(e) =>
              setForm({
                ...form,
                priority: e.target.value
              })
            }
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          <input
            type="date"
            value={form.due_date}
            onChange={(e) =>
              setForm({
                ...form,
                due_date: e.target.value
              })
            }
          />

          <button type="submit">
            Add Task
          </button>
        </form>
      </section>

      <section>
        <h2>Your Tasks</h2>

        <div className="task-list">
          {tasks.map((task) => (
            <div
              className="task-card"
              key={task.id}
            >
              <h3>{task.title}</h3>

              <p>
                {task.description}
              </p>

              <p>
                Priority: {task.priority}
              </p>

              <p>
                Status: {task.status}
              </p>

              {task.due_date && (
                <p>
                  Due:{" "}
                  {new Date(
                    task.due_date
                  ).toLocaleDateString()}
                </p>
              )}

              <select
                value={task.status}
                onChange={(e) =>
                  updateStatus(
                    task.id,
                    e.target.value
                  )
                }
              >
                <option value="TODO">
                  Todo
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="COMPLETED">
                  Completed
                </option>
              </select>

              <button
                onClick={() =>
                  deleteTask(task.id)
                }
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;