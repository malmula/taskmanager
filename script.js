const tasks = JSON.parse(localStorage.getItem('tasks')) || { studying: {}, praying: {} };

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  Object.keys(tasks).forEach((section) => {
    Object.keys(tasks[section]).forEach((column) => {
      const container = document.querySelector(`#${section} .column[data-column="${column}"] .tasks`);
      container.innerHTML = '';
      tasks[section][column]?.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task';
        taskElement.innerHTML = `
          <span>${task}</span>
          <button onclick="deleteTask('${section}', '${column}', ${index})">❌</button>
        `;
        taskElement.draggable = true;

        // Add drag-and-drop handlers for desktop
        taskElement.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', JSON.stringify({ section, column, index }));
        });

        // Add touch drag-and-drop handlers for mobile
        taskElement.addEventListener('touchstart', (e) => handleTouchStart(e, section, column, index));
        taskElement.addEventListener('touchend', handleTouchEnd);

        container.appendChild(taskElement);
      });
    });
  });
}

let draggedTask = null;

function handleTouchStart(e, section, column, index) {
  draggedTask = { section, column, index };
}

function handleTouchEnd(e) {
  const touch = e.changedTouches[0];
  const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
  if (dropTarget && dropTarget.closest('.column')) {
    const newColumn = dropTarget.closest('.column').getAttribute('data-column');
    const section = draggedTask.section;
    const oldColumn = draggedTask.column;
    const taskIndex = draggedTask.index;

    if (newColumn) {
      const task = tasks[section][oldColumn].splice(taskIndex, 1)[0];
      tasks[section][newColumn] = tasks[section][newColumn] || [];
      tasks[section][newColumn].push(task);
      saveTasks();
      renderTasks();
    }
  }
  draggedTask = null;
}

function addTask(section, column) {
  const task = prompt('Enter your task:');
  if (task) {
    tasks[section][column] = tasks[section][column] || [];
    tasks[section][column].push(task);
    saveTasks();
    renderTasks();
  }
}

function deleteTask(section, column, index) {
  tasks[section][column].splice(index, 1);
  saveTasks();
  renderTasks();
}

document.querySelectorAll('.column').forEach((column) => {
  column.addEventListener('dragover', (e) => e.preventDefault());
  column.addEventListener('drop', (e) => {
    e.preventDefault();
    const { section, column: oldColumn, index } = JSON.parse(e.dataTransfer.getData('text/plain'));
    const task = tasks[section][oldColumn].splice(index, 1)[0];
    const newColumn = column.getAttribute('data-column');
    tasks[section][newColumn] = tasks[section][newColumn] || [];
    tasks[section][newColumn].push(task);
    saveTasks();
    renderTasks();
  });
});

renderTasks();
