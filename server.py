from __future__ import annotations

import json
import mimetypes
import sqlite3
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "snake_scores.db"
HOST = "127.0.0.1"
PORT = 8000


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_db_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                score INTEGER NOT NULL CHECK(score >= 0),
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


class PortfolioHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802 (stdlib signature)
        if self.path == "/api/scores":
            self.handle_get_scores()
            return
        self.serve_static_file()

    def do_POST(self) -> None:  # noqa: N802 (stdlib signature)
        if self.path == "/api/scores":
            self.handle_post_score()
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Endpoint not found")

    def handle_get_scores(self) -> None:
        with get_db_connection() as conn:
            rows = conn.execute(
                "SELECT score, created_at FROM scores ORDER BY score DESC, id ASC LIMIT 10"
            ).fetchall()

        self.send_json(
            {
                "scores": [
                    {"score": int(row["score"]), "createdAt": row["created_at"]}
                    for row in rows
                ]
            }
        )

    def handle_post_score(self) -> None:
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            self.send_json({"error": "Missing request body"}, status=HTTPStatus.BAD_REQUEST)
            return

        try:
            body = self.rfile.read(length)
            payload = json.loads(body)
            score = int(payload.get("score", -1))
        except (json.JSONDecodeError, TypeError, ValueError):
            self.send_json({"error": "Invalid JSON payload"}, status=HTTPStatus.BAD_REQUEST)
            return

        if score < 0:
            self.send_json({"error": "Score must be non-negative"}, status=HTTPStatus.BAD_REQUEST)
            return

        now = datetime.now(timezone.utc).isoformat()
        with get_db_connection() as conn:
            conn.execute(
                "INSERT INTO scores (score, created_at) VALUES (?, ?)",
                (score, now),
            )
            conn.commit()

        self.send_json({"ok": True}, status=HTTPStatus.CREATED)

    def serve_static_file(self) -> None:
        clean_path = self.path.split("?", 1)[0].split("#", 1)[0]

        if clean_path == "/":
            target = ROOT / "index.html"
        elif clean_path == "/snake":
            target = ROOT / "snake.html"
        else:
            safe_path = clean_path.lstrip("/")
            target = (ROOT / safe_path).resolve()
            if not str(target).startswith(str(ROOT)):
                self.send_error(HTTPStatus.FORBIDDEN, "Forbidden path")
                return

        if not target.exists() or not target.is_file():
            self.send_error(HTTPStatus.NOT_FOUND, "File not found")
            return

        mime_type, _ = mimetypes.guess_type(str(target))
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", mime_type or "application/octet-stream")
        self.end_headers()
        with target.open("rb") as file:
            self.wfile.write(file.read())

    def send_json(self, data: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
        encoded = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def log_message(self, fmt: str, *args: object) -> None:
        # Keep terminal output compact for local dev.
        return


def main() -> None:
    init_db()
    server = ThreadingHTTPServer((HOST, PORT), PortfolioHandler)
    print(f"Portfolio server running at http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
