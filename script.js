// Section navigation
function showSection(sectionId) {
  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.remove("active");
  });

  document.getElementById(sectionId).classList.add("active");
}

// show To-Do by default
showSection("todo-section");

const todoDaysEl = document.getElementById("todoDays");
const weekLabel = document.getElementById("weekLabel");

let todos = JSON.parse(localStorage.getItem("todos")) || {};
let currentWeekOffset = 0;

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getWeekKey(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset * 7);

  const year = date.getFullYear();
  const firstDay = new Date(year, 0, 1);
  const week = Math.ceil((((date - firstDay) / 86400000) + firstDay.getDay() + 1) / 7);

  return `${year}-W${week}`;
}

function renderTodos() {
  const weekKey = getWeekKey(currentWeekOffset);
  weekLabel.textContent = weekKey;

  if (!todos[weekKey]) {
    todos[weekKey] = Array(7).fill().map(() => []);
  }

  todoDaysEl.innerHTML = "";

  todos[weekKey].forEach((dayTodos, dayIndex) => {
    const dayEl = document.createElement("div");
    dayEl.className = "todo-day";
    dayEl.innerHTML = `<strong>${days[dayIndex]}</strong>`;

    dayTodos.forEach((todo, index) => {
      const item = document.createElement("div");
      item.className = "todo-item" + (todo.done ? " done" : "");

      item.innerHTML = `
        <input type="checkbox" ${todo.done ? "checked" : ""}>
        <div class="todo-content">
          <span>${todo.text}</span>
          ${todo.note ? `<div class="todo-note">${todo.note}</div>` : ""}
        </div>
        <button>×</button>
      `;

      item.querySelector("input").onchange = () => {
        todo.done = !todo.done;
        saveTodos();
        renderTodos();
      };

      item.querySelector("button").onclick = () => {
        dayTodos.splice(index, 1);
        saveTodos();
        renderTodos();
      };

      dayEl.appendChild(item);
    });

    todoDaysEl.appendChild(dayEl);
  });
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

document.getElementById("addTodo").onclick = () => {
  const text = todoText.value.trim();
  if (!text) return;

  const note = todoNote.value.trim();
  const day = Number(todoDay.value);
  const weekKey = getWeekKey(currentWeekOffset);

  todos[weekKey][day].push({
    text,
    note,
    done: false
  });

  saveTodos();
  todoText.value = "";
  todoNote.value = "";
  renderTodos();
};

document.getElementById("prevWeek").onclick = () => {
  currentWeekOffset--;
  renderTodos();
};

document.getElementById("nextWeek").onclick = () => {
  currentWeekOffset++;
  renderTodos();
};

document.getElementById("deleteWeek").onclick = () => {
  if (!confirm("Delete all tasks for this week?")) return;

  const weekKey = getWeekKey(currentWeekOffset);
  delete todos[weekKey];
  saveTodos();
  renderTodos();
};

renderTodos();


// Monthly Budget
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const currentMonthSpan = document.getElementById("current-month");

const incomeInput = document.getElementById("income");
const expenseNameInput = document.getElementById("expense-name");
const expenseAmountInput = document.getElementById("expense-amount");
const addExpenseBtn = document.getElementById("add-expense");
const expenseList = document.getElementById("expense-list");

const savingsInput = document.getElementById("savings");
const leftAfterExpensesSpan = document.getElementById("left-after-expenses");
const leftAfterSavingsSpan = document.getElementById("left-after-savings");

const extraNameInput = document.getElementById("extra-name");
const extraAmountInput = document.getElementById("extra-amount");
const addExtraBtn = document.getElementById("add-extra");
const extraList = document.getElementById("extra-list");

const finalLeftSpan = document.getElementById("final-left");

const BUDGET_KEY = "monthly_budget_v1";

let budgetData = JSON.parse(localStorage.getItem(BUDGET_KEY)) || {};

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth()+1}`; // YYYY-M
}

let currentMonth = getMonthKey();

if (!budgetData[currentMonth]) {
  budgetData[currentMonth] = {
    income: 0,
    expenses: [],
    savings: 0,
    extra: []
  };
}

function updateMonthDisplay() {
  currentMonthSpan.textContent = currentMonth;
}

function saveBudget() {
  localStorage.setItem(BUDGET_KEY, JSON.stringify(budgetData));
}

function changeMonth(offset) {
  let parts = currentMonth.split("-");
  let year = Number(parts[0]);
  let month = Number(parts[1]) + offset;

  if (month < 1) {
    month = 12;
    year -= 1;
  } else if (month > 12) {
    month = 1;
    year += 1;
  }

  currentMonth = `${year}-${month}`;
  if (!budgetData[currentMonth]) {
    budgetData[currentMonth] = { income:0, expenses:[], savings:0, extra:[] };
  }
  renderBudget();
}

prevMonthBtn.onclick = () => changeMonth(-1);
nextMonthBtn.onclick = () => changeMonth(1);

incomeInput.onchange = () => {
  budgetData[currentMonth].income = Number(incomeInput.value) || 0;
  saveBudget();
  renderBudget();
};

savingsInput.onchange = () => {
  budgetData[currentMonth].savings = Number(savingsInput.value) || 0;
  saveBudget();
  renderBudget();
};

addExpenseBtn.onclick = () => {
  const name = expenseNameInput.value.trim();
  const amount = Number(expenseAmountInput.value);
  if (!name || !amount) return;

  budgetData[currentMonth].expenses.push({ name, amount });
  expenseNameInput.value = "";
  expenseAmountInput.value = "";
  saveBudget();
  renderBudget();
};

addExtraBtn.onclick = () => {
  const name = extraNameInput.value.trim();
  const amount = Number(extraAmountInput.value);
  if (!name || !amount) return;

  budgetData[currentMonth].extra.push({ name, amount });
  extraNameInput.value = "";
  extraAmountInput.value = "";
  saveBudget();
  renderBudget();
};

function renderBudget() {
  updateMonthDisplay();
  const monthData = budgetData[currentMonth];

  incomeInput.value = monthData.income || 0;
  savingsInput.value = monthData.savings || 0;

  // Expenses
  expenseList.innerHTML = "";
  let totalExpenses = 0;
  monthData.expenses.forEach((e, i) => {
    const li = document.createElement("li");
    li.textContent = `${e.name}: ${e.amount}`;
    expenseList.appendChild(li);
    totalExpenses += e.amount;
  });

  // Left after expenses
  let leftAfterExpenses = monthData.income - totalExpenses;
  leftAfterExpensesSpan.textContent = leftAfterExpenses;

  // Left after savings
  let leftAfterSavings = leftAfterExpenses - monthData.savings;
  leftAfterSavingsSpan.textContent = leftAfterSavings;

  // Extra
  extraList.innerHTML = "";
  let totalExtra = 0;
  monthData.extra.forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.name}: ${e.amount}`;
    extraList.appendChild(li);
    totalExtra += e.amount;
  });

  // Final left
  finalLeftSpan.textContent = leftAfterSavings - totalExtra;
}

renderBudget();

// =======================
// HABITS
// =======================

const habitsTable = document.getElementById("habitsTable");
const habitsWeekLabel = document.getElementById("habitsWeekLabel");

let habits = JSON.parse(localStorage.getItem("habits")) || {};
let habitsWeekOffset = 0;

const habitDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getHabitsWeekKey(offset = 0) {
  return getWeekKey(offset); // reuse from todo
}

function renderHabits() {
  const weekKey = getHabitsWeekKey(habitsWeekOffset);
  habitsWeekLabel.textContent = weekKey;

  if (!habits[weekKey]) {
    habits[weekKey] = [];
  }

  let html = `
    <table class="habits-table">
      <thead>
        <tr>
          <th>Habit</th>
          ${habitDays.map(d => `<th>${d}</th>`).join("")}
          <th></th>
        </tr>
      </thead>
      <tbody>
  `;

  habits[weekKey].forEach((habit, hIndex) => {
    html += `
      <tr>
        <td>${habit.name}</td>
        ${habit.days.map((done, dIndex) => `
          <td>
            <input type="checkbox" ${done ? "checked" : ""} 
              data-h="${hIndex}" data-d="${dIndex}">
          </td>
        `).join("")}
        <td><button data-delete="${hIndex}">×</button></td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  habitsTable.innerHTML = html;

  document.querySelectorAll("#habitsTable input").forEach(cb => {
    cb.onchange = () => {
      const h = cb.dataset.h;
      const d = cb.dataset.d;
      habits[weekKey][h].days[d] = cb.checked;
      saveHabits();
    };
  });

  document.querySelectorAll("#habitsTable button").forEach(btn => {
    btn.onclick = () => {
      const index = btn.dataset.delete;
      habits[weekKey].splice(index, 1);
      saveHabits();
      renderHabits();
    };
  });
}

function saveHabits() {
  localStorage.setItem("habits", JSON.stringify(habits));
}

document.getElementById("addHabit").onclick = () => {
  const name = habitName.value.trim();
  if (!name) return;

  const weekKey = getHabitsWeekKey(habitsWeekOffset);

  habits[weekKey].push({
    name,
    days: Array(7).fill(false)
  });

  saveHabits();
  habitName.value = "";
  renderHabits();
};

document.getElementById("habitsPrev").onclick = () => {
  habitsWeekOffset--;
  renderHabits();
};

document.getElementById("habitsNext").onclick = () => {
  habitsWeekOffset++;
  renderHabits();
};

document.getElementById("deleteHabitsWeek").onclick = () => {
  if (!confirm("Delete all habits for this week?")) return;

  const weekKey = getHabitsWeekKey(habitsWeekOffset);
  delete habits[weekKey];
  saveHabits();
  renderHabits();
};

renderHabits();

/*******************************
 * Diary
 *******************************/

const diaryList = document.getElementById('diaryList');
const diaryDate = document.getElementById('diaryDate');
const diaryText = document.getElementById('diaryText');

document.getElementById('saveDiary').addEventListener('click', saveDiary);
document.getElementById('searchDiary').addEventListener('click', searchDiary);

function getDiaryEntries() {
  return JSON.parse(localStorage.getItem('diaryEntries')) || [];
}

function saveDiary() {
  if (!diaryDate.value || !diaryText.value.trim()) return;

  const entries = getDiaryEntries();

  entries.push({
    date: diaryDate.value,
    text: diaryText.value
  });

  localStorage.setItem('diaryEntries', JSON.stringify(entries));

  diaryText.value = '';
  renderDiary(entries);
}

function renderDiary(entries) {
  diaryList.innerHTML = '';

  entries.forEach((entry, index) => {
    const li = document.createElement('li');

    li.innerHTML = `
      <div class="diary-entry">
        <div class="diary-date">${entry.date}</div>
        <div class="diary-text">${entry.text}</div>
        <button class="delete-diary" onclick="deleteDiary(${index})">
          Delete
        </button>
      </div>
    `;

    diaryList.appendChild(li);
  });
}

function searchDiary() {
  const searchValue = document.getElementById('searchDate').value;
  const entries = getDiaryEntries();

  if (!searchValue) {
    renderDiary(entries);
    return;
  }

  const filtered = entries.filter(e => e.date === searchValue);
  renderDiary(filtered);
}

function deleteDiary(index) {
  const entries = getDiaryEntries();
  entries.splice(index, 1);
  localStorage.setItem('diaryEntries', JSON.stringify(entries));
  renderDiary(entries);
}


// Load diary on page load
renderDiary(getDiaryEntries());


/*******************************
 * CALENDAR + EVENTS
 *******************************/

// ======================
// CALENDAR LOGIC
// ======================

const calendarGrid = document.getElementById('calendarGrid');
const monthLabel = document.getElementById('monthLabel');

let currentDate = new Date();

// Storage helpers
function getCalendarEvents() {
  return JSON.parse(localStorage.getItem('calendarEvents')) || {};
}

function saveCalendarEvents(events) {
  localStorage.setItem('calendarEvents', JSON.stringify(events));
}

// Render calendar
function renderCalendar() {
  calendarGrid.innerHTML = '';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthLabel.textContent = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const events = getCalendarEvents();

  // Empty slots
  for (let i = 0; i < firstDay; i++) {
    calendarGrid.appendChild(document.createElement('div'));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    cell.textContent = day;

    // Event dot
    if (events[dateStr]) {
      const dot = document.createElement('span');
      dot.className = 'event-dot';
      cell.appendChild(dot);
    }

    cell.addEventListener('click', () => showDayEvents(dateStr));
    calendarGrid.appendChild(cell);
  }
}

// Show events for a day
function showDayEvents(date) {
  const container = document.getElementById('calendarDiaryEntries');
  const events = getCalendarEvents();

  container.innerHTML = `<h4>${date}</h4>`;

  if (!events[date]) {
    container.innerHTML += '<p>No events</p>';
    return;
  }

  events[date].forEach((ev, index) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <strong>${ev.title}</strong>
      <p>${ev.note || ''}</p>
    `;
    container.appendChild(div);
  });
}

// Add event
document.getElementById('addEvent').addEventListener('click', () => {
  const date = document.getElementById('eventDate').value;
  const title = document.getElementById('eventTitle').value.trim();
  const note = document.getElementById('eventNote').value.trim();

  if (!date || !title) return;

  const events = getCalendarEvents();

  if (!events[date]) events[date] = [];
  events[date].push({ title, note });

  saveCalendarEvents(events);

  document.getElementById('eventTitle').value = '';
  document.getElementById('eventNote').value = '';

  renderCalendar();
  showDayEvents(date);
});

// Month navigation
document.getElementById('prevMonth').onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};

document.getElementById('nextMonth').onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};

// Initial load
renderCalendar();

