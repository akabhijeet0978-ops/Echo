# EchoBot Chatbot 🤖

A full-stack AI chatbot powered by Claude, built with Flask (backend) and vanilla JS (frontend).

---

## 📁 Project Structure

```
echobot/
├── backend/
│   ├── app.py                  ← Flask app factory & entry point
│   ├── config.py               ← Environment config (API key, model)
│   ├── data/
│   │   └── conversations.json  ← Auto-created; stores chat history
│   ├── models/
│   │   └── conversation.py     ← Conversation persistence (JSON store)
│   ├── routes/
│   │   ├── chat.py             ← POST /api/chat/send & /stream
│   │   └── history.py          ← GET/DELETE /api/history/
│   └── services/
│       └── claude_service.py   ← Anthropic API wrapper
│
├── frontend/
│   ├── templates/
│   │   └── index.html          ← Main HTML (served by Flask)
│   └── static/
│       ├── css/
│       │   └── style.css       ← All styles
│       └── js/
│           ├── api.js          ← Backend API client
│           ├── ui.js           ← DOM rendering helpers
│           └── app.js          ← Main app logic
│
├── .env                        ← Your API key goes here (never commit!)
├── .gitignore
├── requirements.txt
└── README.md
```

---

## 🚀 Setup in VS Code (Step by Step)

### Step 1 — Prerequisites

Make sure you have installed:
- **Python 3.10+** → https://www.python.org/downloads/
- **VS Code** → https://code.visualstudio.com/
- **Python extension for VS Code** (search "Python" by Microsoft in Extensions)

---

### Step 2 — Open the Project in VS Code

1. Copy the `echobot` folder to wherever you keep your projects (e.g. `C:\Projects\` or `~/Projects/`)
2. Open VS Code
3. Go to **File → Open Folder** and select the `echobot` folder
4. You should see the full folder tree in the Explorer panel

---

### Step 3 — Create a Virtual Environment

Open the **VS Code Terminal** (`Ctrl + `` ` `` ` or **View → Terminal**) and run:

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` at the start of your terminal prompt.

> **VS Code tip:** Press `Ctrl+Shift+P` → "Python: Select Interpreter" → choose the `venv` one.

---

### Step 4 — Install Dependencies

With the venv active, run:

```bash
pip install -r requirements.txt
```

This installs Flask, flask-cors, anthropic SDK, and python-dotenv.

---

### Step 5 — Add Your API Key

1. Open the `.env` file in VS Code
2. Replace `your_api_key_here` with your real Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxx
```


---

### Step 6 — Run the Server

From the terminal (with venv active), navigate to the backend folder and start Flask:

```bash
cd backend
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

---

### Step 7 — Open the App

Open your browser and go to:

```
http://localhost:5000
```

EchoBot is live! 🎉

---

## 🔌 API Endpoints

| Method | Endpoint               | Description                        |
|--------|------------------------|------------------------------------|
| GET    | `/`                    | Serve the frontend                 |
| POST   | `/api/chat/send`       | Send a message, get a reply        |
| POST   | `/api/chat/stream`     | Streaming reply (SSE)              |
| GET    | `/api/history/`        | List all conversations             |
| GET    | `/api/history/<id>`    | Get one conversation with messages |
| DELETE | `/api/history/<id>`    | Delete one conversation            |
| DELETE | `/api/history/`        | Delete all conversations           |

### Example request — `/api/chat/send`
```json
POST /api/chat/send
{
  "messages": [
    { "role": "user", "content": "What is Python?" }
  ],
  "conversation_id": null
}
```

### Example response
```json
{
  "reply": "Python is a high-level, interpreted programming language...",
  "conversation_id": "uuid-here"
}
```

---

## ✨ Features

- 💬 Full multi-turn conversation with Claude (memory preserved per session)
- 📂 Persistent conversation history (saved to `data/conversations.json`)
- 🔁 Regenerate last AI response
- 📋 One-click copy for any AI message
- 🌙 Dark / Light theme toggle
- 📱 Mobile responsive with slide-in sidebar
- ⚡ Suggestion chips on the welcome screen
- 🏗️ Clean separation: routes / services / models / frontend

---

## 🛠️ VS Code Tips

- **Run without terminal:** Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Flask",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/backend/app.py",
      "env": { "FLASK_DEBUG": "1" },
      "jinja": true
    }
  ]
}
```
Then press **F5** to start.

- **Recommended extensions:**
  - Python (Microsoft)
  - Pylance
  - REST Client (test API endpoints from `.http` files)
  - Thunder Client (Postman-like API tester built into VS Code)

---

## 🔒 Security Notes

- Never commit your `.env` file (it's in `.gitignore`)
- `conversations.json` is also gitignored (contains your chat data)
- The API key is only used server-side; the browser never sees it
