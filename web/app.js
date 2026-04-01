const ticketInput = document.getElementById("ticketInput");
const loadSampleBtn = document.getElementById("loadSampleBtn");
const runBtn = document.getElementById("runBtn");
const statusEl = document.getElementById("status");
const cardsEl = document.getElementById("cards");

function setStatus(message) {
  statusEl.textContent = message;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderResults(results) {
  if (!results.length) {
    cardsEl.innerHTML = "<p class='meta'>No results yet.</p>";
    return;
  }

  cardsEl.innerHTML = results
    .map((item) => {
      const priorityClass = `priority-${item.priority}`;
      return `
        <article class="card">
          <strong>${escapeHtml(item.ticket_id)}</strong>
          <div class="badges">
            <span class="badge ${priorityClass}">${escapeHtml(item.priority)}</span>
            <span class="badge team">${escapeHtml(item.team)}</span>
          </div>
          <p class="meta">${escapeHtml(item.rationale)}</p>
          <p class="summary">${escapeHtml(item.ai_summary)}</p>
        </article>
      `;
    })
    .join("");
}

async function loadSampleData() {
  setStatus("Loading sample tickets...");
  try {
    const response = await fetch("/api/tickets/sample");
    if (!response.ok) {
      throw new Error("Failed to load sample tickets.");
    }

    const tickets = await response.json();
    ticketInput.value = JSON.stringify(tickets, null, 2);
    setStatus("Sample data loaded.");
  } catch (error) {
    setStatus(error.message);
  }
}

async function runTriage() {
  let tickets;

  try {
    tickets = JSON.parse(ticketInput.value || "[]");
    if (!Array.isArray(tickets) || tickets.length === 0) {
      throw new Error("Provide at least one ticket in JSON array format.");
    }
  } catch (error) {
    setStatus(`Invalid JSON: ${error.message}`);
    return;
  }

  setStatus("Running AI triage...");
  runBtn.disabled = true;

  try {
    const response = await fetch("/api/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickets }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Triage failed (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    renderResults(data.results || []);
    setStatus(`Completed triage for ${tickets.length} ticket(s).`);
  } catch (error) {
    setStatus(error.message);
  } finally {
    runBtn.disabled = false;
  }
}

loadSampleBtn.addEventListener("click", loadSampleData);
runBtn.addEventListener("click", runTriage);

loadSampleData();
