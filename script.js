document.addEventListener('DOMContentLoaded', () => {
    const taskListContainer = document.getElementById('task-list-container');
    const createForm = document.getElementById('create-task-form');
    const showCreateFormBtn = document.getElementById('show-create-task-form');
    const createTaskBtn = document.getElementById('create-task-btn');
    const doNowContainer = document.getElementById('do-now-container');
    const finalReportContainer = document.getElementById('final-report-container');
    
    const timerModal = document.getElementById('timer-modal');
    const closeBtn = timerModal.querySelector('.close-btn');
    const startTimerModalBtn = document.getElementById('start-timer-modal-btn');
    const taskInProgressView = document.getElementById('task-in-progress-view');
    const taskDoneBtn = document.getElementById('task-done-btn');

    let tasks = [];
    let currentTask = null;
    let timerInterval;


    function updateSummary() {
        const total = tasks.length;
        const inProgress = tasks.filter(t => t.status === 'In Progress').length;
        const done = tasks.filter(t => t.status === 'Done').length;

        document.getElementById('total-tasks').textContent = `${total} Task`;
        document.getElementById('in-progress-tasks').textContent = `${inProgress} In progress`;
        document.getElementById('done-tasks').textContent = `${done} Done`;
    }

    function renderTasks() {
        taskListContainer.innerHTML = '';
        finalReportContainer.innerHTML = '';

        tasks.forEach(task => {
            if (task.status !== 'Done') {
                const taskCard = document.createElement('div');
                taskCard.className = 'task-card task-item';
                const moveButtonHTML = (task.status !== 'Done' && (!currentTask || currentTask.id !== task.id))
                    ? `<button class="move-to-do-now" data-id="${task.id}">Move to Do Now &rarr;</button>`
                    : '';

                taskCard.innerHTML = `
                    <h3>${task.name}</h3>
                    <div class="form-row">
                        <select class="task-status-select" data-id="${task.id}">
                            <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>Done</option>
                            <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option value="Not Started" ${task.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                        </select>
                        <select class="task-priority-select" data-id="${task.id}">
                            <option value="High" ${task.priority === 'High' ? 'selected' : ''}>High</option>
                            <option value="Medium" ${task.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                            <option value="Low" ${task.priority === 'Low' ? 'selected' : ''}>Low</option>
                        </select>
                    </div>
                    <p>Due Date: ${task.dueDate}</p>
                    ${moveButtonHTML}
                `;
                taskListContainer.appendChild(taskCard);
            } else {
                const reportItem = document.createElement('div');
                reportItem.className = 'report-item';
                reportItem.innerHTML = `
                    <h4>${task.name} <span class="priority-${task.priority.toLowerCase()}">${task.priority}</span></h4>
                    <p>Time taken: ${formatTime(task.timeTaken)}</p>
                `;
                finalReportContainer.appendChild(reportItem);
            }
        });

        taskListContainer.querySelectorAll('.task-status-select').forEach(select => {
            select.addEventListener('change', (e) => updateTaskStatus(e.target.dataset.id, e.target.value));
        });
        taskListContainer.querySelectorAll('.task-priority-select').forEach(select => {
            select.addEventListener('change', (e) => updateTaskPriority(e.target.dataset.id, e.target.value));
        });
        taskListContainer.querySelectorAll('.move-to-do-now').forEach(button => {
            button.addEventListener('click', (e) => moveToDoNow(e.target.dataset.id));
        });
        
        updateSummary();
        renderDoNow();
    }
    
    function renderDoNow() {
        doNowContainer.innerHTML = '';
        
        if (currentTask && currentTask.status !== 'Done') {
            doNowContainer.innerHTML = `
                <h3>${currentTask.name} <span class="priority-${currentTask.priority.toLowerCase()}">${currentTask.priority}</span></h3>
                <p>Due Date: ${currentTask.dueDate}</p>
                <button id="set-timer-btn">Set Timer</button>
            `;
            document.getElementById('set-timer-btn').addEventListener('click', () => {
                timerModal.style.display = 'block';
            });
        } else {
            doNowContainer.innerHTML = `<p>No task selected for "Do Now".</p>`;
        }
    }

    function formatTime(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        return hours > 0 ? `${hours}hr ${minutes}mins` : `${minutes} mins`;
    }



    createTaskBtn.addEventListener('click', () => {
        const name = document.getElementById('task-name-input').value.trim();
        const status = document.getElementById('task-status-input').value;
        const priority = document.getElementById('task-priority-input').value;
        const dueDate = document.getElementById('task-due-date-input').value;

        if (name) {
            const newTask = {
                id: Date.now().toString(),
                name,
                status,
                priority,
                dueDate: new Date(dueDate).toLocaleDateString('en-GB'),
                timeTaken: 0,
            };
            tasks.push(newTask);
            document.getElementById('task-name-input').value = '';
            createForm.style.display = 'none';
            renderTasks();
        }
    });

    function moveToDoNow(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            if (currentTask && currentTask.status === 'In Progress') {
                currentTask.status = 'Not Started';
            }
            currentTask = task;
            currentTask.status = 'In Progress';
            renderTasks();
        }
    }
    
    function updateTaskStatus(taskId, newStatus) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            if (newStatus === 'Done' && currentTask?.id === taskId) {
                clearInterval(timerInterval);
                taskInProgressView.style.display = 'none';
                currentTask = null;
            }
            renderTasks();
        }
    }

    function updateTaskPriority(taskId, newPriority) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.priority = newPriority;
            renderTasks();
        }
    }



    showCreateFormBtn.addEventListener('click', () => {
        createForm.style.display = createForm.style.display === 'none' ? 'block' : 'none';
    });

    closeBtn.onclick = () => timerModal.style.display = 'none';

    startTimerModalBtn.addEventListener('click', () => {
        const hrs = parseInt(document.getElementById('timer-hrs').value) || 0;
        const min = parseInt(document.getElementById('timer-min').value) || 0;
        const sec = parseInt(document.getElementById('timer-sec').value) || 0;
        const totalSeconds = (hrs * 3600) + (min * 60) + sec;
        
        if (currentTask && totalSeconds > 0) {
            startTimer(totalSeconds);
            timerModal.style.display = 'none';
            document.getElementById('progress-task-name').textContent = currentTask.name;
            document.getElementById('progress-due-date').textContent = currentTask.dueDate;
            taskInProgressView.style.display = 'block';
        } else {
            alert('Please set a valid time.');
        }
    });
    
    function startTimer(duration) {
        let timer = duration;
        let elapsedMinutes = 0;
        clearInterval(timerInterval);

        timerInterval = setInterval(() => {
            const hours = Math.floor(timer / 3600);
            const minutes = Math.floor((timer % 3600) / 60);
            const seconds = timer % 60;
            const display = `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
            document.getElementById('active-timer-display').textContent = display;
            timer--;
            elapsedMinutes += 1/60;
            if (timer < 0) {
                clearInterval(timerInterval);
                alert(`Time's up for ${currentTask.name}!`);
                document.getElementById('active-timer-display').textContent = '00 : 00 : 00';
            }
        }, 1000);
        currentTask.timerInterval = timerInterval;
        currentTask.elapsedMinutes = elapsedMinutes;
    }

    taskDoneBtn.addEventListener('click', () => {
        if (currentTask) {
            clearInterval(currentTask.timerInterval);
            currentTask.status = 'Done';
            const elapsed = currentTask.elapsedMinutes || 24; 
            currentTask.timeTaken = Math.max(elapsed, 24);
            taskInProgressView.style.display = 'none';
            currentTask = null;
            renderTasks();
        }
    });

  
    tasks = [
        { id: '1', name: 'Blockchain', status: 'Done', priority: 'High', dueDate: '16/06/1997', timeTaken: 24 },
        { id: '2', name: 'La lapel', status: 'Done', priority: 'High', dueDate: '16/06/1997', timeTaken: 170 },
        { id: '3', name: 'La lapel', status: 'Done', priority: 'Low', dueDate: '16/06/1997', timeTaken: 60 },
        { id: '4', name: 'Python', status: 'Not Started', priority: 'Medium', dueDate: '16/06/1997', timeTaken: 0 },
    ];

    currentTask = tasks.find(t => t.id === '4');
    if (currentTask) currentTask.status = 'In Progress';
    renderTasks();
});
