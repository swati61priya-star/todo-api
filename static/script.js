// ---------- date header ----------
document.getElementById('today-date').textContent = new Date().toLocaleDateString(undefined, {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// ---------- tabs ----------
const tabBtns = document.querySelectorAll('.tab-btn');
const panels = { todos: document.getElementById('panel-todos'), journal: document.getElementById('panel-journal') };

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    Object.values(panels).forEach(p => p.classList.remove('active'));
    panels[btn.dataset.tab].classList.add('active');
  });
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function timeAgo(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/* =====================================================
   TODOS
===================================================== */
const todoForm = document.getElementById('todo-form');
const titleInput = document.getElementById('title');
const descInput = document.getElementById('description');
const prioritySelect = document.getElementById('priority');
const todoList = document.getElementById('todo-list');
const todoStatus = document.getElementById('todo-status');
const progressWrap = document.getElementById('progress-wrap');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const progressPercent = document.getElementById('progress-percent');

let selectedEmoji = '✨';
document.querySelectorAll('.emoji-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.emoji-opt').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedEmoji = btn.dataset.emoji;
  });
});

async function loadTodos() {
  todoStatus.textContent = '';
  try {
    const res = await fetch('/todos');
    if (!res.ok) throw new Error();
    const todos = await res.json();
    renderTodos(todos);
  } catch (err) {
    todoStatus.textContent = 'Could not load todos. Is the server running?';
  }
}

function renderTodos(todos) {
  todoList.innerHTML = '';

  if (todos.length === 0) {
    todoList.innerHTML = '<li class="empty">no todos yet — add your first one above 🌱</li>';
    progressWrap.hidden = true;
    return;
  }

  const done = todos.filter(t => t.completed).length;
  progressWrap.hidden = false;
  progressText.textContent = `${done} of ${todos.length} done`;
  const pct = Math.round((done / todos.length) * 100);
  progressPercent.textContent = `${pct}%`;
  progressFill.style.width = `${pct}%`;

  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item priority-${todo.priority || 'medium'}` + (todo.completed ? ' completed' : '');
    li.dataset.id = todo.id;

    li.innerHTML = `
      <button class="check-btn" data-id="${todo.id}" title="mark done">✓</button>
      <div class="todo-emoji">${todo.emoji || '✨'}</div>
      <div class="todo-text">
        <div class="todo-title">${escapeHtml(todo.title)}</div>
        ${todo.description ? `<div class="todo-desc">${escapeHtml(todo.description)}</div>` : ''}
      </div>
      <div class="todo-actions">
        <button class="delete-btn" data-id="${todo.id}" title="delete">🗑️</button>
      </div>
    `;
    todoList.appendChild(li);
  });

  document.querySelectorAll('.check-btn').forEach(btn => btn.addEventListener('click', onToggle));
  document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', onDeleteTodo));
}

todoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;

  try {
    const res = await fetch('/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: descInput.value.trim(),
        priority: prioritySelect.value,
        emoji: selectedEmoji
      })
    });
    if (!res.ok) throw new Error('Failed to add todo');

    titleInput.value = '';
    descInput.value = '';
    titleInput.focus();
    loadTodos();
  } catch (err) {
    todoStatus.textContent = 'Could not add todo.';
  }
});

async function onToggle(e) {
  const id = e.currentTarget.dataset.id;
  const li = e.currentTarget.closest('.todo-item');
  const nowCompleted = !li.classList.contains('completed');
  li.classList.toggle('completed', nowCompleted);
  try {
    await fetch(`/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: nowCompleted })
    });
    loadTodos();
  } catch (err) {
    todoStatus.textContent = 'Could not update todo.';
    loadTodos();
  }
}

async function onDeleteTodo(e) {
  const id = e.currentTarget.dataset.id;
  const li = e.currentTarget.closest('.todo-item');
  li.classList.add('removing');
  setTimeout(async () => {
    try {
      await fetch(`/todos/${id}`, { method: 'DELETE' });
      loadTodos();
    } catch (err) {
      todoStatus.textContent = 'Could not delete todo.';
      loadTodos();
    }
  }, 220);
}

/* =====================================================
   JOURNAL
===================================================== */
const journalForm = document.getElementById('journal-form');
const journalContent = document.getElementById('journal-content');
const journalList = document.getElementById('journal-list');
const journalStatus = document.getElementById('journal-status');

const moodMeta = {
  overwhelmed: { icon: '🌧️', label: 'overwhelmed' },
  meh: { icon: '☁️', label: 'meh' },
  okay: { icon: '🌤️', label: 'okay' },
  happy: { icon: '☀️', label: 'happy' },
  excited: { icon: '⭐', label: 'excited' }
};

let selectedMood = 'okay';
document.querySelectorAll('.mood-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mood-opt').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedMood = btn.dataset.mood;
  });
});

async function loadEntries() {
  journalStatus.textContent = '';
  try {
    const res = await fetch('/journal');
    if (!res.ok) throw new Error();
    const entries = await res.json();
    renderEntries(entries);
  } catch (err) {
    journalStatus.textContent = 'Could not load journal entries. Is the server running?';
  }
}

function renderEntries(entries) {
  journalList.innerHTML = '';

  if (entries.length === 0) {
    journalList.innerHTML = '<div class="empty">no entries yet — write about your day above 📝</div>';
    return;
  }

  entries.forEach(entry => {
    const meta = moodMeta[entry.mood] || moodMeta.okay;
    const div = document.createElement('div');
    div.className = 'journal-entry';
    div.dataset.id = entry.id;
    div.innerHTML = `
      <button class="journal-delete" data-id="${entry.id}" title="delete entry">🗑️</button>
      <div class="journal-entry-head">
        <span class="journal-mood">${meta.icon} ${meta.label}</span>
        <span class="journal-date">${timeAgo(entry.created_at)}</span>
      </div>
      <div class="journal-content">${escapeHtml(entry.content)}</div>
    `;
    journalList.appendChild(div);
  });

  document.querySelectorAll('.journal-delete').forEach(btn => btn.addEventListener('click', onDeleteEntry));
}

journalForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const content = journalContent.value.trim();
  if (!content) return;

  try {
    const res = await fetch('/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, mood: selectedMood })
    });
    if (!res.ok) throw new Error('Failed to save entry');

    journalContent.value = '';
    loadEntries();
  } catch (err) {
    journalStatus.textContent = 'Could not save entry.';
  }
});

async function onDeleteEntry(e) {
  const id = e.currentTarget.dataset.id;
  const div = e.currentTarget.closest('.journal-entry');
  div.classList.add('removing');
  setTimeout(async () => {
    try {
      await fetch(`/journal/${id}`, { method: 'DELETE' });
      loadEntries();
    } catch (err) {
      journalStatus.textContent = 'Could not delete entry.';
      loadEntries();
    }
  }, 220);
}

/* ---------- init ---------- */
loadTodos();
loadEntries();
