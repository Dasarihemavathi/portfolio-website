PROJECTS = [
    {
        "title": "Student Performance Predictor",
        "domain": "Data Science",
        "difficulty": "Intermediate",
        "skills": {"python", "machine learning", "pandas", "data analysis"},
        "interests": {"education", "prediction", "analytics"},
        "summary": "Predict student scores using academic history and study patterns.",
    },
    {
        "title": "Personal Finance Tracker",
        "domain": "Web Development",
        "difficulty": "Beginner",
        "skills": {"python", "html", "css", "javascript", "flask"},
        "interests": {"finance", "dashboard", "budgeting"},
        "summary": "Track income, expenses, budgets, and monthly spending trends.",
    },
    {
        "title": "AI Resume Screening Assistant",
        "domain": "AI",
        "difficulty": "Advanced",
        "skills": {"python", "nlp", "machine learning", "flask"},
        "interests": {"recruitment", "automation", "text analysis"},
        "summary": "Rank resumes against job descriptions using text similarity.",
    },
    {
        "title": "E-Commerce Product Catalog",
        "domain": "Web Development",
        "difficulty": "Intermediate",
        "skills": {"html", "css", "javascript", "python", "sql"},
        "interests": {"shopping", "products", "inventory"},
        "summary": "Build product listing, search, filters, and admin inventory screens.",
    },
    {
        "title": "Crop Disease Detection Guide",
        "domain": "AI",
        "difficulty": "Advanced",
        "skills": {"python", "deep learning", "image processing"},
        "interests": {"agriculture", "computer vision", "health"},
        "summary": "Classify plant leaf images and suggest disease care steps.",
    },
    {
        "title": "Library Management System",
        "domain": "Database",
        "difficulty": "Beginner",
        "skills": {"python", "sql", "html", "css"},
        "interests": {"books", "records", "management"},
        "summary": "Manage books, borrowers, issue dates, returns, and fines.",
    },
]


def normalize_terms(value):
    if isinstance(value, list):
        terms = value
    else:
        terms = str(value or "").split(",")
    return {term.strip().lower() for term in terms if term.strip()}


def recommend_projects(profile, limit=4):
    user_skills = normalize_terms(profile.get("skills"))
    user_interests = normalize_terms(profile.get("interests"))
    domain = str(profile.get("domain", "")).strip().lower()
    difficulty = str(profile.get("difficulty", "")).strip().lower()

    scored = []
    for project in PROJECTS:
        skill_matches = user_skills & project["skills"]
        interest_matches = user_interests & project["interests"]
        domain_match = domain and domain == project["domain"].lower()
        difficulty_match = difficulty and difficulty == project["difficulty"].lower()

        score = len(skill_matches) * 3 + len(interest_matches) * 2
        score += 4 if domain_match else 0
        score += 2 if difficulty_match else 0

        if score:
            scored.append(format_project(project, score, skill_matches, interest_matches))

    scored.sort(key=lambda item: item["score"], reverse=True)
    return scored[:limit] or fallback_projects(domain, difficulty, limit)


def fallback_projects(domain, difficulty, limit):
    filtered = [
        project
        for project in PROJECTS
        if (not domain or project["domain"].lower() == domain)
        and (not difficulty or project["difficulty"].lower() == difficulty)
    ]
    return [format_project(project, 0, [], []) for project in filtered[:limit]]


def format_project(project, score, matched_skills, matched_interests):
    return {
        "title": project["title"],
        "domain": project["domain"],
        "difficulty": project["difficulty"],
        "skills": sorted(project["skills"]),
        "interests": sorted(project["interests"]),
        "summary": project["summary"],
        "score": score,
        "matched_skills": sorted(matched_skills),
        "matched_interests": sorted(matched_interests),
    }
