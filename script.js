
document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const clearAllBtn = document.getElementById('clear-all-btn');

    const loadTasks = () => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => addTaskToDOM(task));
        updateTaskNumbers();
    };

    const saveTasks = () => {
        const tasks = Array.from(document.querySelectorAll('.task-item')).map(taskItem => ({
            text: taskItem.querySelector('.task-text').innerText,
            completed: taskItem.classList.contains('completed')
        }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const addTaskToDOM = (task) => {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
        if (task.completed) taskItem.classList.add('completed');

        const taskNumber = document.createElement('span');
        taskNumber.className = 'task-number';

        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.innerText = task.text;

        const actions = document.createElement('div');
        actions.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '✎';
        editBtn.onclick = () => {
            taskText.contentEditable = true;
            taskText.focus();
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '🗑';
        deleteBtn.onclick = () => {
            taskItem.remove();
            updateTaskNumbers();
            saveTasks();
        };

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.onchange = () => {
            taskItem.classList.toggle('completed');
            saveTasks();
        };

        taskItem.appendChild(taskNumber);
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskText);
        taskItem.appendChild(actions);

        taskList.appendChild(taskItem);

        taskText.addEventListener('blur', () => {
            taskText.contentEditable = false;
            saveTasks();
        });

        taskText.addEventListener('input', saveTasks);

        makeDraggable(taskItem);
        updateTaskNumbers();
    };

    const makeDraggable = (taskItem) => {
        taskItem.draggable = true;

        taskItem.ondragstart = (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', null); // Required for Firefox
            draggingItem = taskItem;
            taskItem.classList.add('dragging');
        };

        taskItem.ondragend = (e) => {
            taskItem.classList.remove('dragging');
            draggingItem = null;
            saveTasks();
            updateTaskNumbers();
        };

        taskItem.ondragover = (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        };

        taskItem.ondrop = (e) => {
            e.stopPropagation();
            if (draggingItem && draggingItem !== taskItem) {
                const allTasks = Array.from(taskList.children);
                const draggingIndex = allTasks.indexOf(draggingItem);
                const targetIndex = allTasks.indexOf(taskItem);

                if (draggingIndex < targetIndex) {
                    taskList.insertBefore(draggingItem, taskItem.nextSibling);
                } else {
                    taskList.insertBefore(draggingItem, taskItem);
                }

                saveTasks();
                updateTaskNumbers();
            }
        };
    };

    const updateTaskNumbers = () => {
        const taskItems = document.querySelectorAll('.task-item .task-number');
        taskItems.forEach((taskNumber, index) => {
            taskNumber.innerText = index + 1 + '.';
        });
    };

    const addTask = () => {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            alert('Please enter a task.');
            return;
        }

        const task = { text: taskText, completed: false };
        addTaskToDOM(task);
        saveTasks();
        taskInput.value = '';
    };

    addTaskBtn.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    clearAllBtn.addEventListener('click', () => {
        taskList.innerHTML = '';
        saveTasks();
    });

    loadTasks();
});
