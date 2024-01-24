const radioList = document.getElementsByName('raidio-list') // menu 
const titleDisplay = document.querySelector('[data-title-display]')
const taskCounterDisplay = document.querySelector('[data-task-counter]')
const tasksContainer = document.querySelector('[data-task-container]')
const newTaskForm = document.querySelector('[data-new-task-form]')
const newTaskInput = document.querySelector('[data-new-task-name]')
const cleanCompleteTasksBtn = document.querySelector('[data-clear-complete-tasks-btn]')

const LOCAL_STORAGE_LIST_NAME = 'GTD-task-list'
const localStorageTasksList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_NAME)) || []

let listSelected;

// Changes the list selected 
radioList.forEach(radio => {
    radio.addEventListener("change", () => {
        if (radio.checked) {
            renderTasks(radio.id)

            if (radio.id !== "inbox") {
                newTaskForm.style.display = "none"
            } else {
                newTaskForm.style.display = "flex"
            }
        }
    })
})

// Changes the completed status of a task
tasksContainer.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === "input") {
        const taskId = e.target.id
        const selectedTask = localStorageTasksList.find(task => task.id == taskId)
        selectedTask.completed = e.target.checked 
        renderTasksCounter(listSelected)
        renderTasks(listSelected)
        saveToLocalStorage()
    }
})

// Add new task to the inbox list
newTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (newTaskInput.value == null || newTaskInput.value == '') return

    const newTask = createTask(newTaskInput.value)
    newTaskInput.value = null
    localStorageTasksList.push(newTask)
    saveToLocalStorage()
    renderTasks("inbox")
})

// Delete all completed tasks from the current list
cleanCompleteTasksBtn.addEventListener("click", () => {
    const tasksCompleted = localStorageTasksList.filter(task => task.list == listSelected & task.completed == true)

    if(tasksCompleted.length < 1) return

    const confirm = window.confirm(`Are you sure you want delete ${tasksCompleted.length} tasks from ${listSelected}?`)
    if(confirm == true) {
        tasksCompleted.forEach(task => {
            localStorageTasksList.splice((localStorageTasksList.findIndex(element => element.id == task.id)), 1)
            renderTasks(listSelected)
            saveToLocalStorage()
        })
    }

})

function renderTasks(currentList) {
    listSelected = currentList
    cleanElement(tasksContainer)
    titleDisplay.innerHTML = getListTitle(currentList) 
    renderTasksCounter(currentList)
    const tasks = localStorageTasksList.filter(task => task.list == currentList)


    if (currentList === "inbox") { //currentListId
        tasks.forEach(task => {
            const taskTempleteElement = document.importNode(inboxTemplete.content, true)
            createElements(taskTempleteElement, task)
        })
    } else {
        tasks.forEach(task => {
            const taskTempleteElement = document.importNode(listsTemplete.content, true)
            createElements(taskTempleteElement, task)
        })
    }
}

function createElements(taskTempleteElement, task) { 
    const checkbox = taskTempleteElement.querySelector('[data-task-checkbox]')
    const label = taskTempleteElement.querySelector('[data-task-label]')
    checkbox.checked = task.completed
    checkbox.id = task.id
    label.htmlFor = task.id
    label.append(task.name)

    const deleteButton = taskTempleteElement.querySelector('[data-action-buttons="delete"]')
    const editButton = taskTempleteElement.querySelector('[data-action-buttons="edit"]')
    const changeListButtons = taskTempleteElement.querySelectorAll('[data-action-buttons="next"], [data-action-buttons="waitingFor"], [data-action-buttons="someday"]')
    
    // Add listeners to the action buttons
    changeListButtons.forEach(button => {
        // Change the task list 
        button.addEventListener("click", (e) => {
            const action = e.currentTarget.dataset.actionButtons
            task.list = action
            renderTasks(listSelected)
            saveToLocalStorage()
        })

        // Hover effects
        button.addEventListener('mouseover', (e) => {
            const action = e.currentTarget.dataset.actionButtons
            e.target.style.color = `var(--${action}-color)`
        })
        button.addEventListener('mouseout', (e) => {
            e.target.style.color = '' // return to the before color   
        })
    })

    deleteButton.addEventListener("click", () => {deleteTask(checkbox.id)})
    // Hover effects
    deleteButton.addEventListener("mouseover", (e) => {
        e.target.style.color = `var(--danger-color)`   
        
    })
    deleteButton.addEventListener("mouseout", (e) => {
        e.target.style.color = ``   
        
    })

    // Edit task button
    editButton.addEventListener("click", () => {editTask(checkbox.id)})

    // Hide the actions buttons for completed tasks
    // if(task.completed == true) {
    //     hideActionsButtons(label)
    // }

    tasksContainer.appendChild(taskTempleteElement)
}

function createTask(taskName) {
    // All the new tasks will be added to the inbox list 
    return { id: Date.now().toString(), name: taskName, completed: false, list: "inbox"} 
}

function editTask(taskId) {
    const newName = window.prompt('What the new name for this task?')
    if(newName == "" || newName == null) return
    const task = localStorageTasksList.find(task => task.id == taskId)
    task.name = newName
    saveToLocalStorage()
    renderTasks(task.list)
}

function deleteTask(taskId) {
    const task = localStorageTasksList.find(task => task.id == taskId)
    const confirm = window.confirm(`Are you sure you want to delete "${task.name}" ?`)
    if(confirm == true) {
        localStorageTasksList.splice((localStorageTasksList.findIndex(element => element.id == taskId)), 1)
        renderTasks(task.list)
        saveToLocalStorage()
    }
    
}

function hideActionsButtons(label) {
    const li = label.parentNode.closest('li')
    li.querySelector('.task-list__action-buttons').style.display = 'none'
}

// Return the title for the list 
function getListTitle(listName) {
    switch (listName) {
        case "inbox":
            return "Inbox"
        case "next":
            return "Next"
        case "waitingFor": 
            return "Waiting For"
        case "someday":
            return "Someday/Maybe"
    }
}

function saveToLocalStorage() {
    localStorage.setItem(LOCAL_STORAGE_LIST_NAME, JSON.stringify(localStorageTasksList))
}

function renderTasksCounter(selectedlist) {
    const list = localStorageTasksList.filter(task => task.list == selectedlist)
    const tasksNotFinishedCount = list.filter(task => !task.completed).length
    const taskString = tasksNotFinishedCount > 1 ? "tasks" : "task"
    taskCounterDisplay.innerHTML = `${tasksNotFinishedCount} ${taskString}`
}

function cleanElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }
}

renderTasks("inbox")
