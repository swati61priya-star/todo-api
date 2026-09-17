cd G:\todo-api\todo-apicd G:\todo-api\todo-api# 🌸 Daily Planner — Todos + Journal

A cozy, pastel, animated to-do list **and** daily journal, in one app:

- A **web page** with two tabs — ✅ To‑dos and 📔 Journal
- Pastel "aesthetic journal" styling: soft colors, tape/paper details, mood picker, emoji tags, progress bar, smooth add/remove animations
- A **REST API** underneath for both todos and journal entries (curl/Postman/your own frontend all still work)
- **SQLite** storage — everything persists in a local `todos.db` file, no external database needed

## Run it in VS Code (or anywhere with Python)

1. **Open the folder in VS Code**
   `File → Open Folder...` → select the `todo-api` folder.

2. **Open a terminal in VS Code**
   `Terminal → New Terminal` (or `` Ctrl+` ``).

3. **Create a virtual environment** (recommended, keeps dependencies isolated)
   ```bash
   python -m venv venv
   ```
   Activate it:
   - macOS/Linux: `source venv/bin/activate`
   - Windows: `venv\Scripts\activate`

   In VS Code, if it asks "Select a Python Interpreter", pick the one inside `venv`.

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the app**
   ```bash
   python app.py
   ```
   You'll see it start on `http://127.0.0.1:5000`.

6. **Use it**
   - Open **http://127.0.0.1:5000** in your browser.
   - Switch between the **to‑dos** and **journal** tabs at the top.
   - Or hit the JSON API directly (see below) with curl/Postman/your own frontend.

That's it — press the ▶ Run button in VS Code (top right, with `app.py` open) instead of the terminal command if you prefer.

## "Everywhere" — a few notes

- **Same machine, any browser**: just go to `http://127.0.0.1:5000`.
- **Other devices on your Wi‑Fi**: the app already binds to `0.0.0.0`, so from your phone/laptop on the same network go to `http://<your-computer's-LAN-IP>:5000` (find your IP with `ipconfig` on Windows or `ifconfig`/`ip addr` on Mac/Linux).
- **Hosted online (accessible from anywhere on the internet)**: deploy it to a service like Render, Railway, PythonAnywhere, or Fly.io — they all support Flask apps like this one with minimal changes.
- **The `todos.db` file** is created automatically the first time you run the app, right next to `app.py`, and stores both your todos and journal entries.

## What's new in this version

- 🎨 **Pastel redesign** — blush pink, sage green, buttery yellow, soft cream paper, hand-lettered script accents, washi‑tape header
- ✨ **More interactive todos** — pick a little emoji tag and a priority (low/medium/high, shown as a colored stripe) when adding a task, animated check‑off and delete, a live progress bar showing how many tasks are done
- 📔 **New: Journal tab** — pick your mood for the day (overwhelmed / meh / okay / happy / excited), write a free-form entry, and save it; entries are listed newest-first with their mood and timestamp, and can be deleted
- 💾 Both todos and journal entries are saved permanently to SQLite, so nothing is lost on refresh or restart

## Project structure

```
todo-api/
├── app.py               # Flask app: serves the page + the Todo & Journal APIs
├── requirements.txt
├── templates/
│   └── index.html        # the browser UI (tabs: todos / journal)
├── static/
│   ├── style.css          # pastel theme + animations
│   └── script.js          # tabs, todo CRUD, journal CRUD
└── todos.db              # created automatically on first run
```

## API Endpoints

### Todos
| Method | Endpoint      | Description        |
|--------|---------------|---------------------|
| GET    | /api          | Health check        |
| POST   | /todos        | Create a new todo (title, description, priority, emoji) |
| GET    | /todos        | Get all todos        |
| GET    | /todos/<id>   | Get a single todo     |
| PUT    | /todos/<id>   | Update a todo        |
| DELETE | /todos/<id>   | Delete a todo        |

```bash
curl -X POST http://127.0.0.1:5000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Flask", "description": "Build a REST API", "priority": "high", "emoji": "📚"}'
```

### Journal
| Method | Endpoint        | Description             |
|--------|-----------------|--------------------------|
| POST   | /journal        | Create a new entry (mood, content) |
| GET    | /journal        | Get all entries           |
| GET    | /journal/<id>   | Get a single entry        |
| PUT    | /journal/<id>   | Update an entry           |
| DELETE | /journal/<id>   | Delete an entry           |

```bash
curl -X POST http://127.0.0.1:5000/journal \
  -H "Content-Type: application/json" \
  -d '{"mood": "happy", "content": "Had a really good day today."}'
```

## Future Improvements
- Add user authentication (JWT)
- Add pagination for large lists
- Add filtering (completed / pending, mood filter, search)
- Write unit tests
