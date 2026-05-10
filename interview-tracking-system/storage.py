import os
import sqlite3
from contextlib import contextmanager

try:
    import mysql.connector
except ImportError:  # Local tests can still run without the optional MySQL driver.
    mysql = None


STATUSES = ["Applied", "Screening", "Technical", "HR", "Offered", "Hired", "Rejected"]


class CandidateStore:
    def __init__(self):
        self.use_mysql = all(os.getenv(key) for key in ["DB_HOST", "DB_USER", "DB_NAME"])
        self.sqlite_path = os.path.join(os.path.dirname(__file__), "interview_tracker.db")

    @contextmanager
    def connect(self):
        if self.use_mysql:
            connection = mysql.connector.connect(
                host=os.getenv("DB_HOST"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD", ""),
                database=os.getenv("DB_NAME"),
            )
        else:
            connection = sqlite3.connect(self.sqlite_path)
            connection.row_factory = sqlite3.Row

        try:
            yield connection
            connection.commit()
        finally:
            connection.close()

    def initialize(self):
        with self.connect() as connection:
            cursor = connection.cursor()
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS candidates (
                    id INTEGER PRIMARY KEY AUTO_INCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    phone TEXT,
                    role TEXT NOT NULL,
                    experience REAL DEFAULT 0,
                    status TEXT DEFAULT 'Applied',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """.replace("INTEGER PRIMARY KEY AUTO_INCREMENT", "INTEGER PRIMARY KEY AUTOINCREMENT")
                if not self.use_mysql
                else """
                CREATE TABLE IF NOT EXISTS candidates (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(120) NOT NULL,
                    phone VARCHAR(30),
                    role VARCHAR(100) NOT NULL,
                    experience DECIMAL(4, 1) DEFAULT 0,
                    status VARCHAR(40) DEFAULT 'Applied',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS feedback (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    candidate_id INTEGER NOT NULL,
                    round_name TEXT NOT NULL,
                    interviewer TEXT NOT NULL,
                    rating INTEGER NOT NULL,
                    comments TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
                )
                """
                if not self.use_mysql
                else """
                CREATE TABLE IF NOT EXISTS feedback (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    candidate_id INT NOT NULL,
                    round_name VARCHAR(80) NOT NULL,
                    interviewer VARCHAR(100) NOT NULL,
                    rating INT NOT NULL,
                    comments TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
                )
                """
            )

    def list_candidates(self):
        with self.connect() as connection:
            candidates = self._fetch_all(connection, "SELECT * FROM candidates ORDER BY created_at DESC")
            for candidate in candidates:
                candidate["feedback"] = self._fetch_all(
                    connection,
                    "SELECT * FROM feedback WHERE candidate_id = %s ORDER BY created_at DESC",
                    (candidate["id"],),
                )
            return candidates

    def create_candidate(self, data):
        query = """
            INSERT INTO candidates (name, email, phone, role, experience, status)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        values = (
            data["name"],
            data["email"],
            data.get("phone", ""),
            data["role"],
            data.get("experience", 0),
            data.get("status", "Applied"),
        )
        with self.connect() as connection:
            cursor = self._execute(connection, query, values)
            candidate_id = cursor.lastrowid
            return self.get_candidate(connection, candidate_id)

    def update_status(self, candidate_id, status):
        if status not in STATUSES:
            raise ValueError("Unsupported candidate status")

        with self.connect() as connection:
            self._execute(connection, "UPDATE candidates SET status = %s WHERE id = %s", (status, candidate_id))
            return self.get_candidate(connection, candidate_id)

    def add_feedback(self, candidate_id, data):
        query = """
            INSERT INTO feedback (candidate_id, round_name, interviewer, rating, comments)
            VALUES (%s, %s, %s, %s, %s)
        """
        values = (
            candidate_id,
            data["round_name"],
            data["interviewer"],
            int(data["rating"]),
            data.get("comments", ""),
        )
        with self.connect() as connection:
            cursor = self._execute(connection, query, values)
            return self._fetch_one(connection, "SELECT * FROM feedback WHERE id = %s", (cursor.lastrowid,))

    def dashboard(self):
        with self.connect() as connection:
            counts = {status: 0 for status in STATUSES}
            rows = self._fetch_all(connection, "SELECT status, COUNT(*) AS total FROM candidates GROUP BY status")
            for row in rows:
                counts[row["status"]] = row["total"]
            return {
                "total": sum(counts.values()),
                "active": sum(counts[status] for status in STATUSES if status not in ["Hired", "Rejected"]),
                "hired": counts["Hired"],
                "rejected": counts["Rejected"],
                "pipeline": counts,
            }

    def get_candidate(self, connection, candidate_id):
        return self._fetch_one(connection, "SELECT * FROM candidates WHERE id = %s", (candidate_id,))

    def _execute(self, connection, query, values=()):
        cursor = connection.cursor()
        cursor.execute(self._query(query), values)
        return cursor

    def _fetch_one(self, connection, query, values=()):
        cursor = connection.cursor()
        cursor.execute(self._query(query), values)
        row = cursor.fetchone()
        return self._row_to_dict(cursor, row) if row else None

    def _fetch_all(self, connection, query, values=()):
        cursor = connection.cursor()
        cursor.execute(self._query(query), values)
        return [self._row_to_dict(cursor, row) for row in cursor.fetchall()]

    def _query(self, query):
        return query.replace("%s", "?") if not self.use_mysql else query

    def _row_to_dict(self, cursor, row):
        if isinstance(row, sqlite3.Row):
            return dict(row)
        columns = [column[0] for column in cursor.description]
        return dict(zip(columns, row))

