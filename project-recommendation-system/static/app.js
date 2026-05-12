const form = document.querySelector("#recommendForm");
const results = document.querySelector("#results");

function formToObject(formElement) {
  return Object.fromEntries(new FormData(formElement).entries());
}

function chip(label) {
  return `<span class="chip">${label}</span>`;
}

function renderProjects(projects) {
  if (!projects.length) {
    results.innerHTML = '<div class="empty">No matching project ideas found. Try adding more skills or changing the domain.</div>';
    return;
  }

  results.innerHTML = projects
    .map((project) => {
      const matches = [...project.matched_skills, ...project.matched_interests];
      return `
        <article class="project-card">
          <h2>${project.title}</h2>
          <p class="summary">${project.summary}</p>
          <div class="meta">
            ${chip(project.domain)}
            ${chip(project.difficulty)}
            ${chip(`Score ${project.score}`)}
          </div>
          <div class="matches">
            ${matches.length ? matches.map((item) => chip(`Matched: ${item}`)).join("") : chip("Suggested from filters")}
          </div>
        </article>
      `;
    })
    .join("");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const response = await fetch("/api/recommend/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formToObject(form)),
  });
  const data = await response.json();
  renderProjects(data.recommendations);
});

form.dispatchEvent(new Event("submit"));
