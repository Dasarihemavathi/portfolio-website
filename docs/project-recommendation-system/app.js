const projects = [
  {
    title: "Student Performance Predictor",
    domain: "Data Science",
    difficulty: "Intermediate",
    skills: ["python", "machine learning", "pandas", "data analysis"],
    interests: ["education", "prediction", "analytics"],
    summary: "Predict student scores using academic history and study patterns.",
  },
  {
    title: "Personal Finance Tracker",
    domain: "Web Development",
    difficulty: "Beginner",
    skills: ["python", "html", "css", "javascript", "django"],
    interests: ["finance", "dashboard", "budgeting"],
    summary: "Track income, expenses, budgets, and monthly spending trends.",
  },
  {
    title: "AI Resume Screening Assistant",
    domain: "AI",
    difficulty: "Advanced",
    skills: ["python", "nlp", "machine learning", "django"],
    interests: ["recruitment", "automation", "text analysis"],
    summary: "Rank resumes against job descriptions using text similarity.",
  },
  {
    title: "E-Commerce Product Catalog",
    domain: "Web Development",
    difficulty: "Intermediate",
    skills: ["html", "css", "javascript", "python", "sql", "django"],
    interests: ["shopping", "products", "inventory"],
    summary: "Build product listing, search, filters, and admin inventory screens.",
  },
  {
    title: "Crop Disease Detection Guide",
    domain: "AI",
    difficulty: "Advanced",
    skills: ["python", "deep learning", "image processing"],
    interests: ["agriculture", "computer vision", "health"],
    summary: "Classify plant leaf images and suggest disease care steps.",
  },
  {
    title: "Library Management System",
    domain: "Database",
    difficulty: "Beginner",
    skills: ["python", "sql", "html", "css", "django"],
    interests: ["books", "records", "management"],
    summary: "Manage books, borrowers, issue dates, returns, and fines.",
  },
];

const form = document.querySelector("#recommendForm");
const results = document.querySelector("#results");

function normalizeTerms(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function scoreProject(project, profile) {
  const userSkills = new Set(normalizeTerms(profile.skills));
  const userInterests = new Set(normalizeTerms(profile.interests));
  const skillMatches = project.skills.filter((skill) => userSkills.has(skill));
  const interestMatches = project.interests.filter((interest) => userInterests.has(interest));
  const domainMatch = project.domain.toLowerCase() === profile.domain.toLowerCase();
  const difficultyMatch = project.difficulty.toLowerCase() === profile.difficulty.toLowerCase();
  const score = skillMatches.length * 3 + interestMatches.length * 2 + (domainMatch ? 4 : 0) + (difficultyMatch ? 2 : 0);

  return {
    ...project,
    score,
    matchedSkills: skillMatches,
    matchedInterests: interestMatches,
  };
}

function recommend(profile) {
  const scored = projects
    .map((project) => scoreProject(project, profile))
    .filter((project) => project.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.length ? scored.slice(0, 4) : projects.filter((project) => project.domain === profile.domain).slice(0, 4);
}

function formToObject(formElement) {
  return Object.fromEntries(new FormData(formElement).entries());
}

function chip(label) {
  return `<span class="chip">${label}</span>`;
}

function renderProjects(recommendations) {
  if (!recommendations.length) {
    results.innerHTML = '<div class="empty">No matching project ideas found. Try adding more skills or changing the domain.</div>';
    return;
  }

  results.innerHTML = recommendations
    .map((project) => {
      const matches = [...(project.matchedSkills || []), ...(project.matchedInterests || [])];
      return `
        <article class="project-card">
          <h2>${project.title}</h2>
          <p class="summary">${project.summary}</p>
          <div class="meta">
            ${chip(project.domain)}
            ${chip(project.difficulty)}
            ${chip(`Score ${project.score || 0}`)}
          </div>
          <div class="matches">
            ${matches.length ? matches.map((item) => chip(`Matched: ${item}`)).join("") : chip("Suggested from filters")}
          </div>
        </article>
      `;
    })
    .join("");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  renderProjects(recommend(formToObject(form)));
});

form.dispatchEvent(new Event("submit"));

