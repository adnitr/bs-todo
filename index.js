const form = document.querySelector('.modal form')
const titleInput = document.querySelector('input')
const urgentCheckInput = document.querySelector('#urgent')
const importantCheckInput = document.querySelector('#important')
const clearFilterBtn = document.querySelector('#clear-f')
const tableBody = document.getElementById('tbody')
const modalCloseBtn = document.querySelector('.modal-header button')
const modalOpenBtn = document.querySelector('#modal-open-btn')
const modalSubmitBtn = document.querySelector('.modal form button')
const filterInputs = document.querySelectorAll('.filter-cb')
const searchInput = document.querySelector('#search-input')
const backendURL = 'https://tasks-68608-default-rtdb.firebaseio.com/tasks.json'

/********************************************** */
//DB FUNCTIONS
/********************************************** */
// const addTaskToDB = async (taskObj) => {
//   await fetch(backendURL, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(taskObj),
//   })
// }

// const fetchTasksFromDB = async () => {
//   const response = await fetch(backendURL)
//   const data = await response.json()
//   const tasksDB = []
//   for (const key in data) {
//     tasksDB.push({ ...data[key], id: key })
//   }
//   return tasksDB
// }

// fetchTasksFromDB()
/********************************************** */
//UTILITY FUNCTIONS
/********************************************** */
const generateId = () => Date.now().toString()

let tasks = JSON.parse(localStorage.getItem('tasks')) || [
  { id: generateId(), title: 'Dummy task', urgent: true, important: true },
]

/********************************************** */
//MODAL FUNCTIONALITY
/********************************************** */
const fetchInputValues = () => {
  return {
    id: generateId(),
    title: titleInput.value,
    urgent: urgentCheckInput.checked,
    important: importantCheckInput.checked,
  }
}

const resetInputs = () => {
  titleInput.value = ''
  urgentCheckInput.checked = false
  importantCheckInput.checked = false
}

const closeModal = () => {
  modalCloseBtn.click()
}

const fillInputsForEdit = (taskId) => {
  const task = tasks.find((task) => task.id === taskId)
  titleInput.value = task.title
  importantCheckInput.checked = task.important
  urgentCheckInput.checked = task.urgent
}

/********************************************** */
//TASK FUNCTIONS
/********************************************** */
const AddTask = (taskObj) => {
  // await addTaskToDB(taskObj)
  tasks.push(taskObj)
  localStorage.setItem('tasks', JSON.stringify(tasks))
}

const removeTask = (taskId) => {
  tasks = tasks.filter((task) => task.id !== taskId)
  localStorage.setItem('tasks', JSON.stringify(tasks))
  if (tasks.length === 0) {
    localStorage.removeItem('tasks')
  }
}

const EditTask = (taskId, newTaskObj) => {
  const taskIndex = tasks.findIndex((task) => task.id === taskId)
  tasks[taskIndex] = { ...newTaskObj, id: taskId }
  localStorage.setItem('tasks', JSON.stringify(tasks))
}

/********************************************** */
//FILTER FUNCTIONALITY
/********************************************** */
const filterLogic = (
  tasksObj,
  filterOptions /* ex. [{important: true}, {urgent: false}] */,
  searchByWord
) => {
  let retrunValue = true
  // the taskObj consist of all the badge objects available
  // if the badges present in the taskObj is a superset of the badges list provided as a filter
  // means for each true badge if we find the badge present in the taskObj then it is "in"
  const wordIncluded = tasksObj.title
    .toLowerCase()
    .includes(searchByWord.toLowerCase())
  if (!wordIncluded) {
    return false
  }
  for (let i = 0; i < filterOptions.length; i++) {
    const key = Object.keys(filterOptions[i])[0]
    const value = Object.values(filterOptions[i])[0]
    if (value) {
      if (tasksObj[key]) {
        continue
      } else {
        retrunValue = false
        break
      }
    } else {
      continue
    }
  }

  return retrunValue
}

const fetchFilterOptions = () => {
  let filterOptions = []
  filterInputs.forEach((filterInput) => {
    let obj = {}
    obj[filterInput.value] = filterInput.checked
    filterOptions.push(obj)
  })
  return filterOptions
}

const filterTasks = () => {
  const searchKeyword = searchInput.value
  const filterOptions = fetchFilterOptions()
  return tasks.filter((task) => filterLogic(task, filterOptions, searchKeyword))
}

/********************************************** */
//TABLE FUNCTIONS
/********************************************** */
const convertToRow = (index, taskObj, searchKeyword) => {
  let BadgeColHtml = `<td>
  <div class="row gx-1 align-items-center">
    <div class="col-auto"><span class="badge text-bg-danger">Urgent</span></div>
    <div class="col-auto"><span class="badge text-bg-warning">Important</span></div>
  </div>
</td>`

  const trashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
<path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
</svg>`

  const editSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
</svg>`

  const buttonHtml = `<td>
  <div class="row gx-1 align-items-center">
    <div class="col-auto"><button type="button" class="btn btn-sm btn-danger btn-list" id="del-${taskObj.id}">${trashSvg}</button></div>
    <div class="col-auto"><button type="button" class="btn btn-sm btn-dark btn-list-edit" id="edit-${taskObj.id}">${editSvg}</button></div>
  </div>
</td>`

  if (!taskObj.urgent && !taskObj.important) {
    BadgeColHtml = `<td>No Priorities</td>`
  } else if (taskObj.important && !taskObj.urgent) {
    BadgeColHtml = `<td>
    <div class="row gx-1 align-items-center">
      <div class="col-auto"><span class="badge text-bg-warning">Important</span></div>
    </div>
  </td>`
  } else if (!taskObj.important && taskObj.urgent) {
    BadgeColHtml = `<td>
    <div class="row gx-1 align-items-center">
    <div class="col-auto"><span class="badge text-bg-danger">Urgent</span></div>
    </div>
  </td>`
  }

  //Logic of styling the title according to the keyword
  let taskTitle = taskObj.title
  if (searchKeyword && searchKeyword !== '') {
    const startingIndexOfKeyword = taskTitle
      .toLowerCase()
      .indexOf(searchKeyword.toLowerCase())
    const endingIndexOfKeyword =
      startingIndexOfKeyword + searchKeyword.length - 1
    const searchKeywordInTitle = taskTitle.slice(
      startingIndexOfKeyword,
      endingIndexOfKeyword + 1
    )
    const preSpan = taskTitle.slice(0, startingIndexOfKeyword)
    const postSpan = taskTitle.slice(endingIndexOfKeyword + 1, taskTitle.length)

    taskTitle = `${preSpan}<span class="bg-warning">${searchKeywordInTitle}</span>${postSpan}`
  }

  return `<tr><th scope="row">${
    index + 1
  }</th><td>${taskTitle}</td>${BadgeColHtml}${buttonHtml}</tr>`
}

const renderTable = () => {
  const taskToBeDisplayed = filterTasks()
  tableBody.innerHTML = taskToBeDisplayed.reduce(
    (prevValue, currValue, currIndex) =>
      prevValue.concat(convertToRow(currIndex, currValue, searchInput.value)),
    ''
  )
  document.querySelectorAll('.btn-list').forEach((element) =>
    element.addEventListener('click', () => {
      if (confirm('The task will be deleted')) {
        removeTask(element.id.split('-')[1])
        renderTable()
      }
    })
  )
  document.querySelectorAll('.btn-list-edit').forEach((element) =>
    element.addEventListener('click', () => {
      modalOpenBtn.click()
      form.id = `edit-task-form-${element.id.split('-')[1]}`
      modalSubmitBtn.textContent = 'Apply Changes'
      fillInputsForEdit(element.id.split('-')[1])
    })
  )
}

renderTable()

/********************************************** */
//ALL EVENT LISTENERS
/********************************************** */

searchInput.addEventListener('input', renderTable)

filterInputs.forEach((filterInput) =>
  filterInput.addEventListener('click', renderTable)
)

clearFilterBtn.addEventListener('click', () => {
  filterInputs.forEach((filterInputs) => (filterInputs.checked = false))
  renderTable()
})

form.addEventListener('submit', (e) => {
  e.preventDefault()
  const inputValues = fetchInputValues()
  if (form.id.split('-')[0] === 'add') {
    closeModal()
    AddTask(inputValues)
  }
  if (form.id.split('-')[0] === 'edit') {
    const taskId = form.id.split('-')[3]

    closeModal()
    EditTask(taskId, inputValues)
  }
  renderTable()
})

document
  .getElementById('exampleModal')
  .addEventListener('hide.bs.modal', () => {
    form.id = 'add-task-form'
    modalSubmitBtn.textContent = 'Add Task'
    resetInputs()
  })
