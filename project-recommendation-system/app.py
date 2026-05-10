from flask import Flask, jsonify, render_template, request

from recommender import recommend_projects

app = Flask(__name__)


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/api/recommend")
def recommend():
    data = request.get_json(force=True)
    return jsonify({"recommendations": recommend_projects(data)})


if __name__ == "__main__":
    app.run(debug=True, port=5002)

