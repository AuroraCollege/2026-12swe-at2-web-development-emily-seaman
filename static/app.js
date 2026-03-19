let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks(filter = "all") {
  const list = document.getElementById("taskList");
  const empty = document.getElementById("emptyState");

  if (!list) return;

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

function addTask() {
  const name = document.getElementById("taskName").value.trim();
  const step = document.getElementById("taskStep").value.trim();
  const materials = document.getElementById("taskMaterials").value.trim();
  const time = document.getElementById("taskTime").value;
  const energy = document.getElementById("taskEnergy").value;
  const chunks = parseInt(document.getElementById("taskChunks").value);

  if (!name || !step) {
    alert("Please enter a task name and first tiny step.");
    return;
  }

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

  const percent = (task.completedChunks / task.chunks) * 100;
  document.getElementById("focusProgressFill").style.width = percent + "%";
  
  if (percent === 100) {
  const sparkle = document.createElement("div");
  sparkle.className = "sparkle";
  document.querySelector(".focus-progress").appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 800);
}
}

function completeChunk() {
  const id = parseInt(localStorage.getItem("focusTaskId"));
  const task = tasks.find(t => t.id === id);

  if (!task) return;

  if (task.completedChunks < task.chunks) {
    task.completedChunks++;
    saveTasks();
    loadFocusTask();
  }

  if (task.completedChunks === task.chunks) {
    const msg = document.getElementById("congratsMessage");
    msg.style.display = "block";

    setTimeout(() => {
      msg.style.opacity = 1;
    }, 10);

    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      window.location.href = "/";
    }, 15000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addTask");
  const completeBtn = document.getElementById("completeChunk");

  if (addBtn) {
    addBtn.addEventListener("click", addTask);
    setupFilters();
    renderTasks();
  }

  if (completeBtn) {
    completeBtn.addEventListener("click", completeChunk);
    loadFocusTask();
  }

  const timerDisplay = document.getElementById("timerDisplay");
  const startBtn = document.getElementById("startTimer");
  const stopBtn = document.getElementById("stopTimer");
  const resetBtn = document.getElementById("resetTimer");

  if (timerDisplay && startBtn && stopBtn && resetBtn) {
    let timer = null;
    let minutes = 0;

    function updateDisplay() {
      timerDisplay.textContent = minutes;
    }

    startBtn.addEventListener("click", () => {
      if (timer === null) {
        timer = setInterval(() => {
          minutes++;
          updateDisplay();
        }, 60000);
      }
    });

    stopBtn.addEventListener("click", () => {
      clearInterval(timer);
      timer = null;
    });

    resetBtn.addEventListener("click", () => {
      clearInterval(timer);
      timer = null;
      minutes = 0;
      updateDisplay();
    });

    updateDisplay();
  }
});