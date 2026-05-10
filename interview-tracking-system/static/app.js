const statuses = ["Applied", "Screening", "Technical", "HR", "Offered", "Hired", "Rejected"];
const candidateList = document.querySelector("#candidateList");
const metrics = document.querySelector("#metrics");
const template = document.querySelector("#candidateTemplate");

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function renderMetrics(data) {
  const cards = [
    ["Total", data.total],
    ["Active", data.active],
    ["Hired", data.hired],
    ["Rejected", data.rejected],
  ];

  metrics.innerHTML = cards
    .map(([label, value]) => `<article class="metric"><span>${label}</span><strong>${value}</strong></article>`)
    .join("");
}

function renderCandidates(candidates) {
  candidateList.innerHTML = "";

  if (!candidates.length) {
    candidateList.innerHTML = '<p class="candidate-meta">No candidates yet. Add the first profile to begin.</p>';
    return;
  }

  candidates.forEach((candidate) => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".candidate-card");
    const title = node.querySelector("h3");
    const meta = node.querySelector(".candidate-meta");
    const statusSelect = node.querySelector(".status-select");
    const feedbackList = node.querySelector(".feedback-list");
    const feedbackForm = node.querySelector(".feedback-form");

    title.textContent = candidate.name;
    meta.textContent = `${candidate.role} • ${candidate.experience || 0} years • ${candidate.email}`;

    statuses.forEach((status) => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      option.selected = candidate.status === status;
      statusSelect.append(option);
    });

    statusSelect.addEventListener("change", async () => {
      await requestJson(`/api/candidates/${candidate.id}/status/`, {
        method: "PATCH",
        body: JSON.stringify({ status: statusSelect.value }),
      });
      await loadDashboard();
    });

    feedbackList.innerHTML = candidate.feedback.length
      ? candidate.feedback
          .map((item) => `<div class="feedback-item"><strong>${item.round_name}</strong> by ${item.interviewer} — ${item.rating}/5<br>${item.comments || ""}</div>`)
          .join("")
      : '<p class="candidate-meta">No feedback recorded.</p>';

    feedbackForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await requestJson(`/api/candidates/${candidate.id}/feedback/`, {
        method: "POST",
        body: JSON.stringify(formToObject(feedbackForm)),
      });
      feedbackForm.reset();
      await loadAll();
    });

    card.dataset.status = candidate.status;
    candidateList.append(node);
  });
}

async function loadDashboard() {
  const data = await requestJson("/api/dashboard/");
  renderMetrics(data);
}

async function loadAll() {
  const [dashboard, candidates] = await Promise.all([
    requestJson("/api/dashboard/"),
    requestJson("/api/candidates/"),
  ]);
  renderMetrics(dashboard);
  renderCandidates(candidates);
}

document.querySelector("#candidateForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  await requestJson("/api/candidates/", {
    method: "POST",
    body: JSON.stringify(formToObject(form)),
  });
  form.reset();
  await loadAll();
});

document.querySelector("#refreshBtn").addEventListener("click", loadAll);

loadAll();
