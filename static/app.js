/* ============================================================
   STUDY PLANNER APP — FULL VERSION
   Features:
   - Add tasks
   - Energy filtering
   - Chunk progress tracking
   - LocalStorage saving/loading
   - Focus Mode data transfer
   - Minutes-only timer
   ============================================================ */

/* ------------------------------
   GLOBAL STATE
------------------------------ */

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];


/* ------------------------------
   SAVE & LOAD
------------------------------ */

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}


/* ------------------------------
   RENDER TASK LIST
------------------------------ */

function renderTasks(filter = "all") {
  const list = document.getElementById("taskList");
  const empty = document.getElementById("emptyState");

  if (!list) return; // Not on index.html

  list.innerHTML = "";

  const filtered = tasks.filter(t => filter === "all" || t.energy === filter);

  if (filtered.length === 0) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  filtered.forEach(task => {
    const card = document.createElement("div");
    card.className = "task-card";

    const progressPercent = (task.completedChunks / task.chunks) * 100;

    card.innerHTML = `
      <div class="task-header">
        <p class="task-name">${task.name}</p>
        <span class="energy-tag energy-${task.energy}">${task.energy}</span>
      </div>

      <p class="small-text">${task.step}</p>
      <p class="meta-row">Materials: ${task.materials}</p>
      <p class="meta-row">Estimated time: ${task.time} mins</p>

      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPercent}%"></div>
      </div>

      <button class="primary-btn" onclick="openFocusMode(${task.id})">Focus</button>
    `;

    list.appendChild(card);
  });
}


/* ------------------------------
   ADD TASK
------------------------------ */

function addTask() {
  const name = document.getElementById("taskName").value.trim();
  const step = document.getElementById("taskStep").value.trim();
  const materials = document.getElementById("taskMaterials").value.trim();
  const time = document.getElementById("taskTime").value;
  const energy = document.getElementById("taskEnergy").value;
  const chunks = parseInt(document.getElementById("taskChunks").value);

  if (!name || !step) return alert("Please enter a task name and first tiny step.");

  const newTask = {
    id: Date.now(),
    name,
    step,
    materials,
    time,
    energy,
    chunks,
    completedChunks: 0
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
  clearForm();
}

function clearForm() {
  document.getElementById("taskName").value = "";
  document.getElementById("taskStep").value = "";
  document.getElementById("taskMaterials").value = "";
  document.getElementById("taskTime").value = "";
  document.getElementById("taskChunks").value = 1;
}


/* ------------------------------
   ENERGY FILTER
------------------------------ */

function setupFilters() {
  const chips = document.querySelectorAll(".chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      renderTasks(chip.dataset.energy);
    });
  });
}


/* ------------------------------
   FOCUS MODE — LOAD TASK
------------------------------ */

function openFocusMode(id) {
  localStorage.setItem("focusTaskId", id);
  window.location.href = "/focus";
}

function loadFocusTask() {
  const id = parseInt(localStorage.getItem("focusTaskId"));
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  document.getElementById("focusTaskName").textContent = task.name;
  document.getElementById("focusStep").textContent = task.step;
  document.getElementById("focusMaterials").textContent = task.materials;
  document.getElementById("focusChunks").textContent =
    `${task.completedChunks} / ${task.chunks}`;
}


/* ------------------------------
   FOCUS MODE — CHUNK COMPLETION
------------------------------ */

function completeChunk() {
  const id = parseInt(localStorage.getItem("focusTaskId"));
  const task = tasks.find(t => t.id === id);

  if (task.completedChunks < task.chunks) {
    task.completedChunks++;
    saveTasks();
    loadFocusTask();
  }
}


/* ------------------------------
   TIMER (MINUTES ONLY)
------------------------------ */

let timer = null;
let minutes = 0;

function updateTimerDisplay() {
  document.getElementById("timerDisplay").textContent = minutes;
}

function startTimer() {
  if (timer) return;

  timer = setInterval(() => {
    minutes++;
    updateTimerDisplay();
  }, 60000); // 1 minute
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
}

function resetTimer() {
  stopTimer();
  minutes = 0;
  updateTimerDisplay();
}


/* ------------------------------
   PAGE INITIALISATION
------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addTaskBtn");
  const completeBtn = document.getElementById("completeChunk");

  if (addBtn) {
    addBtn.addEventListener("click", addTask);
    setupFilters();
    renderTasks();
  }

  if (completeBtn) {
    completeBtn.addEventListener("click", completeChunk);

    document.getElementById("startTimer").addEventListener("click", startTimer);
    document.getElementById("stopTimer").addEventListener("click", stopTimer);
    document.getElementById("resetTimer").addEventListener("click", resetTimer);

    loadFocusTask();
  }
});