// Theme & Nav (shared)
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);
themeToggle.querySelector("i").className = savedTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  themeToggle.querySelector("i").className = next === "dark" ? "fas fa-sun" : "fas fa-moon";
});

const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// Todo App Logic
const STORAGE_KEY = "zakaria_todos_v1";
let todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let dragStartIndex = null;

const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoCategory = document.getElementById("todoCategory");
const todoPriority = document.getElementById("todoPriority");
const todoDate = document.getElementById("todoDate");
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");
const filterStatus = document.getElementById("filterStatus");
const filterCategory = document.getElementById("filterCategory");
const filterPriority = document.getElementById("filterPriority");
const searchInput = document.getElementById("searchInput");

todoDate.valueAsDate = new Date(Date.now() + 86400000);

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  renderTodos();
  updateStats();
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const due = new Date(dateStr + "T23:59:59");
  return due < new Date();
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function getCategoryLabel(cat) {
  return { work: "Travail", personal: "Personnel", study: "Etudes" }[cat] || cat;
}

function getPriorityLabel(prio) {
  return { high: "Haute", medium: "Moyenne", low: "Basse" }[prio] || prio;
}

function renderTodos() {
  const status = filterStatus.value;
  const cat = filterCategory.value;
  const prio = filterPriority.value;
  const search = searchInput.value.toLowerCase().trim();

  let filtered = todos.filter(t => {
    if (status === "active" && t.completed) return false;
    if (status === "completed" && !t.completed) return false;
    if (cat !== "all" && t.category !== cat) return false;
    if (prio !== "all" && t.priority !== prio) return false;
    if (search && !t.text.toLowerCase().includes(search)) return false;
    return true;
  });

  if (filtered.length === 0) {
    todoList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <p>Aucune tache trouvee.</p>
      </div>`;
    return;
  }

  todoList.innerHTML = filtered.map((todo, index) => {
    const overdue = !todo.completed && isOverdue(todo.dueDate);
    const catClass = "tag-cat-" + todo.category;
    const prioClass = "tag-prio-" + todo.priority;
    return `
      <div class="todo-item ${todo.completed ? "completed" : ""} ${overdue ? "overdue" : ""} ${todo.priority === "high" && !todo.completed ? "high-priority" : ""}" 
           draggable="true" data-index="${todos.indexOf(todo)}" data-id="${todo.id}">
        <div class="todo-check ${todo.completed ? "checked" : ""}" data-id="${todo.id}">
          ${todo.completed ? "<i class=\"fas fa-check\" style=\"font-size:0.7rem;\"></i>" : ""}
        </div>
        <div class="todo-content">
          <div class="todo-text">${escapeHtml(todo.text)}</div>
          <div class="todo-meta">
            <span class="tag ${catClass}">${getCategoryLabel(todo.category)}</span>
            <span class="tag ${prioClass}">${getPriorityLabel(todo.priority)}</span>
            <span><i class="fas fa-calendar-alt"></i> ${formatDate(todo.dueDate)} ${overdue ? "<strong style=\"color:#ef4444;\">(en retard)</strong>" : ""}</span>
          </div>
        </div>
        <div class="todo-actions">
          <button class="btn-edit" data-id="${todo.id}" title="Modifier"><i class="fas fa-pen"></i></button>
          <button class="btn-delete" data-id="${todo.id}" title="Supprimer"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
  }).join("");

  attachDragEvents();
  attachClickEvents();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function attachClickEvents() {
  document.querySelectorAll(".todo-check").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const todo = todos.find(t => t.id === id);
      if (todo) { todo.completed = !todo.completed; saveTodos(); }
    });
  });

  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (confirm("Supprimer cette tache ?")) {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
      }
    });
  });

  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const todo = todos.find(t => t.id === id);
      if (!todo) return;
      const newText = prompt("Modifier la tache :", todo.text);
      if (newText !== null && newText.trim() !== "") {
        todo.text = newText.trim();
        saveTodos();
      }
    });
  });
}

function attachDragEvents() {
  const items = document.querySelectorAll(".todo-item");
  items.forEach(item => {
    item.addEventListener("dragstart", () => {
      item.classList.add("dragging");
      dragStartIndex = +item.dataset.index;
    });
    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
      dragStartIndex = null;
    });
    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(todoList, e.clientY);
      const draggable = document.querySelector(".dragging");
      if (afterElement == null) todoList.appendChild(draggable);
      else todoList.insertBefore(draggable, afterElement);
    });
    item.addEventListener("drop", () => {
      const newOrder = [...document.querySelectorAll(".todo-item")].map(el => el.dataset.id);
      const reordered = [];
      newOrder.forEach(id => {
        const t = todos.find(x => x.id === id);
        if (t) reordered.push(t);
      });
      todos = reordered;
      saveTodos();
    });
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".todo-item:not(.dragging)")];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateStats() {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const active = total - completed;
  const overdue = todos.filter(t => !t.completed && isOverdue(t.dueDate)).length;
  document.getElementById("statTotal").textContent = total;
  document.getElementById("statActive").textContent = active;
  document.getElementById("statCompleted").textContent = completed;
  document.getElementById("statOverdue").textContent = overdue;
}

function addTodo() {
  const text = todoInput.value.trim();
  const category = todoCategory.value;
  const priority = todoPriority.value;
  const dueDate = todoDate.value;

  if (!text) { alert("Veuillez entrer une tache."); return; }
  if (!dueDate) { alert("Veuillez choisir une date d echeance."); return; }

  todos.unshift({
    id: generateId(),
    text,
    category,
    priority,
    dueDate,
    completed: false,
    createdAt: new Date().toISOString()
  });

  todoInput.value = "";
  saveTodos();
}

addBtn.addEventListener("click", (e) => {
  e.preventDefault();
  addTodo();
});

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo();
});

[filterStatus, filterCategory, filterPriority].forEach(el => el.addEventListener("change", renderTodos));
searchInput.addEventListener("input", renderTodos);

document.getElementById("btnCompleteAll").addEventListener("click", () => {
  const active = todos.filter(t => !t.completed);
  if (active.length === 0) { alert("Toutes les taches sont deja terminees !"); return; }
  if (confirm(`Marquer ${active.length} tache(s) comme terminee(s) ?`)) {
    todos.forEach(t => t.completed = true);
    saveTodos();
  }
});

document.getElementById("btnDeleteCompleted").addEventListener("click", () => {
  const completed = todos.filter(t => t.completed);
  if (completed.length === 0) { alert("Aucune tache terminee a supprimer."); return; }
  if (confirm(`Supprimer ${completed.length} tache(s) terminee(s) ?`)) {
    todos = todos.filter(t => !t.completed);
    saveTodos();
  }
});

document.getElementById("btnClearAll").addEventListener("click", () => {
  if (todos.length === 0) { alert("La liste est deja vide."); return; }
  if (confirm("Supprimer TOUTES les taches ? Cette action est irreversible.")) {
    todos = [];
    saveTodos();
  }
});

document.getElementById("btnExport").addEventListener("click", () => {
  const dataStr = JSON.stringify(todos, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "todos_zakaria_" + new Date().toISOString().slice(0,10) + ".json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("importFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const imported = JSON.parse(ev.target.result);
      if (!Array.isArray(imported)) throw new Error("Format invalide");
      if (confirm(`Importer ${imported.length} tache(s) ? Elles seront ajoutees a votre liste actuelle.`)) {
        todos = [...imported, ...todos];
        saveTodos();
      }
    } catch (err) {
      alert("Erreur lors de l import : " + err.message);
    }
    e.target.value = "";
  };
  reader.readAsText(file);
});

renderTodos();
updateStats();
