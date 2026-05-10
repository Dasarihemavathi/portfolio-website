from flask import Flask, jsonify, render_template, request

from storage import CandidateStore

app = Flask(__name__)
store = CandidateStore()


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/api/candidates")
def list_candidates():
    return jsonify(store.list_candidates())


@app.post("/api/candidates")
def create_candidate():
    data = request.get_json(force=True)
    candidate = store.create_candidate(data)
    return jsonify(candidate), 201


@app.patch("/api/candidates/<int:candidate_id>/status")
def update_status(candidate_id):
    data = request.get_json(force=True)
    return jsonify(store.update_status(candidate_id, data["status"]))


@app.post("/api/candidates/<int:candidate_id>/feedback")
def add_feedback(candidate_id):
    data = request.get_json(force=True)
    return jsonify(store.add_feedback(candidate_id, data)), 201


@app.get("/api/dashboard")
def dashboard():
    return jsonify(store.dashboard())


if __name__ == "__main__":
    store.initialize()
    app.run(debug=True, port=5001)

