# Interview Tracking and Candidate Management System

A web-based hiring workflow app for managing candidates, interview rounds, feedback, and hiring status.

## Features

- Add and view candidate profiles
- Track interview stages from Applied to Hired or Rejected
- Record interview round feedback and ratings
- View a dashboard summary of the hiring pipeline
- Run locally with SQLite or connect to MySQL using environment variables

## Tech Stack

- Python
- Flask
- HTML
- CSS
- JavaScript
- MySQL
- SQLite for local demo mode

## Run Locally

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Then open:

```text
http://127.0.0.1:5001
```

## MySQL Setup

Create the database tables with:

```bash
mysql -u root -p < schema.sql
```

Then set these environment variables before running the app:

```powershell
$env:DB_HOST="localhost"
$env:DB_USER="root"
$env:DB_PASSWORD="your_password"
$env:DB_NAME="interview_tracker"
python app.py
```

