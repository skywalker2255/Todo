import React, { useState } from "react";
import {
  Plus,
  FileDown,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

type Todo = {
  id: number;
  description: string;
  status: "pending" | "completed";
};

type Project = {
  id: number;
  title: string;
  todos: Todo[];
};

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [projectTitle, setProjectTitle] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingTodo, setEditingTodo] = useState<{ value: string; id: number }>(
    { value: "", id: 0 }
  );
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(
    null
  );
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

  const handleUpdateProjectTitle = (projectId: number) => {
    if (editingTitle.trim() === "") return;

    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === projectId ? { ...project, title: editingTitle } : project
      )
    );

    setEditingProjectId(null);
    setEditingTitle("");
  };

  const handleCreateProject = () => {
    if (projectTitle.trim() === "") return;
    const newProject: Project = {
      id: Date.now(),
      title: projectTitle,
      todos: [],
    };
    setProjects((prev) => [...prev, newProject]);
    setProjectTitle("");
  };

  const handleAddTodo = (
    projectId: number,
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (inputValue.trim() === "") return;
    const newTodo: Todo = {
      id: Date.now(),
      description: inputValue,
      status: "pending",
    };
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === projectId
          ? { ...project, todos: [...project.todos, newTodo] }
          : project
      )
    );
    setInputValue("");
  };

  const handleDeleteTodo = (projectId: number, todoId: number) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              todos: project.todos.filter((todo) => todo.id !== todoId),
            }
          : project
      )
    );
  };

  const handleEditTodo = (todoId: number, currentDescription: string) => {
    setEditingTodo({ value: currentDescription, id: todoId });
    setIsEditModalOpen(true);
  };

  const handleUpdateTodo = (projectId: number) => {
    if (editingTodo.value.trim() === "") return;
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              todos: project.todos.map((todo) =>
                todo.id === editingTodo.id
                  ? { ...todo, description: editingTodo.value }
                  : todo
              ),
            }
          : project
      )
    );
    setIsEditModalOpen(false);
  };

  const handleToggleTodoStatus = (projectId: number, todoId: number) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              todos: project.todos.map((todo) =>
                todo.id === todoId
                  ? {
                      ...todo,
                      status:
                        todo.status === "pending" ? "completed" : "pending",
                    }
                  : todo
              ),
            }
          : project
      )
    );
  };

  const handleExportProject = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const completedTodos = project.todos.filter(
      (todo) => todo.status === "completed"
    ).length;
    const totalTodos = project.todos.length;

    const markdownContent = `
# ${project.title}
Progress: ${completedTodos}/${totalTodos} completed

## Pending
${project.todos
  .filter((todo) => todo.status === "pending")
  .map((todo) => `- [ ] ${todo.description}`)
  .join("\n")}

## Completed
${project.todos
  .filter((todo) => todo.status === "completed")
  .map((todo) => `- [x] ${todo.description}`)
  .join("\n")}
`;

    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.title}.md`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-md mb-8 p-6">
          <h1 className="text-3xl font-bold text-center mb-6">
            Project Manager
          </h1>
          <div className="flex gap-2">
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="Enter project title"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCreateProject}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </button>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Project Header */}
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{project.title}</h2>
                  <div className="flex gap-2">
                  {editingProjectId === project.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateProjectTitle(project.id)}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingProjectId(null);
                            setEditingTitle("");
                          }}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingProjectId(project.id);
                            setEditingTitle(project.title);
                          }}
                          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => handleExportProject(project.id)}
                      className="flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Export
                    </button>
                    <button
                      onClick={() =>
                        setExpandedProjectId(
                          expandedProjectId === project.id ? null : project.id
                        )
                      }
                      className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      {expandedProjectId === project.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Project Content */}
              {expandedProjectId === project.id && (
                <div className="p-6">
                  <form
                    onSubmit={(e) => handleAddTodo(project.id, e)}
                    className="flex gap-2 mb-6"
                  >
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Add a new todo"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Todo
                    </button>
                  </form>

                  <div className="space-y-2">
                    {project.todos.map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={todo.status === "completed"}
                          onChange={() =>
                            handleToggleTodoStatus(project.id, todo.id)
                          }
                          className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span
                          className={`flex-1 ${
                            todo.status === "completed"
                              ? "line-through text-gray-500"
                              : ""
                          }`}
                        >
                          {todo.description}
                        </span>
                        <button
                          onClick={() =>
                            handleEditTodo(todo.id, todo.description)
                          }
                          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTodo(project.id, todo.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Edit Todo</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <textarea
                  value={editingTodo.value}
                  onChange={(e) =>
                    setEditingTodo({ ...editingTodo, value: e.target.value })
                  }
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateTodo(expandedProjectId!)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
