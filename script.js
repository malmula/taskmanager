const tasks = JSON.parse(localStorage.getItem('tasks')) || { studying: {}, praying: {} };

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  // Iterate over the tasks sections (studying, praying)
  Object.keys(tasks).forEach((section) => {
    Object.keys(tasks[section]).forEach((column) => {
      const container = document.querySelector(`#${section} .column[data-column="${column}"] .tasks`);
      container.innerHTML = ''; // Clear current tasks
      // Only render tasks that are not undefined or null
      tasks[section][column]?.forEach((task, index) => {
        if (task !== undefined && task !== null) { // Ensure task is valid
          const taskElement = document.createElement('div');
          taskElement.className = 'task';
          taskElement.innerHTML = `
            <span>${task}</span>
            <button class="delete-btn" data-section="${section}" data-column="${column}" data-index="${index}">❌</button>
          `;
          taskElement.draggable = true;

          // Add drag-and-drop handlers for desktop
          taskElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({ section, column, index }));
          });

          // Add touch handlers for mobile
          taskElement.addEventListener('touchstart', (e) => handleTouchStart(e, section, column, index));
          taskElement.addEventListener('touchend', handleTouchEnd);

          container.appendChild(taskElement);
        }
      });
    });
  });

  // Attach delete functionality
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('pointerdown', handleDeleteTask);
  });
}

function handleDeleteTask(e) {
  e.preventDefault(); // Prevent default behavior (important for mobile)
  const section = e.target.dataset.section;
  const column = e.target.dataset.column;
  const index = parseInt(e.target.dataset.index, 10);

  if (tasks[section] && tasks[section][column]) {
    // Remove the task from the array
    tasks[section][column].splice(index, 1);
    // Clean up the array to avoid undefined/null values
    tasks[section][column] = tasks[section][column].filter((task) => task !== undefined && task !== null);
    saveTasks(); // Save the updated tasks to localStorage
    renderTasks(); // Re-render tasks to reflect the changes
  }
}

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
      const task = tasks[section][oldColumn].splice(taskIndex, 1)[0]; // Remove task from old column
      tasks[section][newColumn] = tasks[section][newColumn] || [];
      tasks[section][newColumn].push(task); // Add task to new column
      saveTasks();
      renderTasks();
    }
  }
  draggedTask = null;
}

let draggedTask = null;

function addTask(section, column) {
  const task = prompt('Enter your task:');
  if (task && task.trim() !== '') {
    tasks[section][column] = tasks[section][column] || [];
    tasks[section][column].push(task.trim()); // Ensure no blank tasks are added
    saveTasks();
    renderTasks();
  }
}

// Add drop functionality for desktop
document.querySelectorAll('.column').forEach((column) => {
  column.addEventListener('dragover', (e) => e.preventDefault());
  column.addEventListener('drop', (e) => {
    e.preventDefault();
    const { section, column: oldColumn, index } = JSON.parse(e.dataTransfer.getData('text/plain'));
    const task = tasks[section][oldColumn].splice(index, 1)[0]; // Remove task from the original column
    const newColumn = column.getAttribute('data-column');
    tasks[section][newColumn] = tasks[section][newColumn] || [];
    tasks[section][newColumn].push(task); // Add task to the new column
    saveTasks();
    renderTasks();
  });
});

renderTasks();
