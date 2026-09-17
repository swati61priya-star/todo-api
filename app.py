from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    completed = db.Column(db.Boolean, default=False)
    priority = db.Column(db.String(20), default='medium')  # low / medium / high
    emoji = db.Column(db.String(10), default='✨')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "completed": self.completed,
            "priority": self.priority,
            "emoji": self.emoji,
            "created_at": self.created_at.isoformat()
        }


class JournalEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    mood = db.Column(db.String(20), default='okay')
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "mood": self.mood,
            "content": self.content,
            "created_at": self.created_at.isoformat()
        }


with app.app_context():
    db.create_all()


# ---------- FRONTEND (browser UI) ----------
@app.route('/', methods=['GET'])
def home():
    # Serves the todo list + journal web page (templates/index.html)
    return render_template('index.html')


@app.route('/api', methods=['GET'])
def api_health():
    return jsonify({"message": "Todo + Journal API is running"}), 200


# ---------- TODO API (JSON) ----------

# CREATE
@app.route('/todos', methods=['POST'])
def create_todo():
    data = request.get_json()
    if not data or 'title' not in data or not data['title'].strip():
        return jsonify({"error": "Title is required"}), 400

    todo = Todo(
        title=data['title'].strip(),
        description=data.get('description', ''),
        completed=data.get('completed', False),
        priority=data.get('priority', 'medium'),
        emoji=data.get('emoji', '✨')
    )
    db.session.add(todo)
    db.session.commit()
    return jsonify(todo.to_dict()), 201


# READ ALL
@app.route('/todos', methods=['GET'])
def get_todos():
    todos = Todo.query.order_by(Todo.created_at.desc()).all()
    return jsonify([todo.to_dict() for todo in todos]), 200


# READ ONE
@app.route('/todos/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    todo = Todo.query.get(todo_id)
    if not todo:
        return jsonify({"error": "Todo not found"}), 404
    return jsonify(todo.to_dict()), 200


# UPDATE
@app.route('/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    todo = Todo.query.get(todo_id)
    if not todo:
        return jsonify({"error": "Todo not found"}), 404

    data = request.get_json() or {}
    todo.title = data.get('title', todo.title)
    todo.description = data.get('description', todo.description)
    todo.completed = data.get('completed', todo.completed)
    todo.priority = data.get('priority', todo.priority)
    todo.emoji = data.get('emoji', todo.emoji)

    db.session.commit()
    return jsonify(todo.to_dict()), 200


# DELETE
@app.route('/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    todo = Todo.query.get(todo_id)
    if not todo:
        return jsonify({"error": "Todo not found"}), 404

    db.session.delete(todo)
    db.session.commit()
    return jsonify({"message": "Todo deleted successfully"}), 200


# ---------- JOURNAL API (JSON) ----------

# CREATE
@app.route('/journal', methods=['POST'])
def create_entry():
    data = request.get_json()
    if not data or 'content' not in data or not data['content'].strip():
        return jsonify({"error": "Content is required"}), 400

    entry = JournalEntry(
        mood=data.get('mood', 'okay'),
        content=data['content'].strip()
    )
    db.session.add(entry)
    db.session.commit()
    return jsonify(entry.to_dict()), 201


# READ ALL
@app.route('/journal', methods=['GET'])
def get_entries():
    entries = JournalEntry.query.order_by(JournalEntry.created_at.desc()).all()
    return jsonify([entry.to_dict() for entry in entries]), 200


# READ ONE
@app.route('/journal/<int:entry_id>', methods=['GET'])
def get_entry(entry_id):
    entry = JournalEntry.query.get(entry_id)
    if not entry:
        return jsonify({"error": "Entry not found"}), 404
    return jsonify(entry.to_dict()), 200


# UPDATE
@app.route('/journal/<int:entry_id>', methods=['PUT'])
def update_entry(entry_id):
    entry = JournalEntry.query.get(entry_id)
    if not entry:
        return jsonify({"error": "Entry not found"}), 404

    data = request.get_json() or {}
    entry.mood = data.get('mood', entry.mood)
    entry.content = data.get('content', entry.content)

    db.session.commit()
    return jsonify(entry.to_dict()), 200


# DELETE
@app.route('/journal/<int:entry_id>', methods=['DELETE'])
def delete_entry(entry_id):
    entry = JournalEntry.query.get(entry_id)
    if not entry:
        return jsonify({"error": "Entry not found"}), 404

    db.session.delete(entry)
    db.session.commit()
    return jsonify({"message": "Entry deleted successfully"}), 200


if __name__ == '__main__':
    # host='0.0.0.0' so it's reachable from other devices on your network too
    app.run(debug=True, host='0.0.0.0', port=5000)
