const ticketInput = document.getElementById("ticketInput");
const loadSampleBtn = document.getElementById("loadSampleBtn");
const formatBtn = document.getElementById("formatBtn");
const clearBtn = document.getElementById("clearBtn");
const runBtn = document.getElementById("runBtn");
const statusEl = document.getElementById("status");
const cardsEl = document.getElementById("cards");
const rawOutputEl = document.getElementById("rawOutput");
const copyResultsBtn = document.getElementById("copyResultsBtn");
const downloadResultsBtn = document.getElementById("downloadResultsBtn");
const statTotalEl = document.getElementById("statTotal");
const statP0El = document.getElementById("statP0");
const statTopTeamEl = document.getElementById("statTopTeam");
const statLastRunEl = document.getElementById("statLastRun");

let latestResults = [];

function setStatus(message) {
  statusEl.textContent = message;
}

function updateStats(results) {
  const total = results.length;
  const p0 = results.filter((item) => item.priority === "P0").length;
  const teamCounts = {};
  for (const item of results) {
    teamCounts[item.team] = (teamCounts[item.team] || 0) + 1;
  }

  let topTeam = "-";
  let best = 0;
  for (const [team, count] of Object.entries(teamCounts)) {
    if (count > best) {
      topTeam = team;
      best = count;
    }
  }

  statTotalEl.textContent = String(total);
  statP0El.textContent = String(p0);
  statTopTeamEl.textContent = topTeam;
  statLastRunEl.textContent = total
    ? new Date().toLocaleTimeString()
    : "Not run";
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
  latestResults = results;
  rawOutputEl.textContent = JSON.stringify(results, null, 2);
  updateStats(results);

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

function ticketsToPlainText(tickets) {
  return tickets.map((t) => `${t.title}\n${t.description}`).join("\n\n");
}

async function loadSampleData() {
  setStatus("Loading example tickets...");
  try {
    const response = await fetch("/api/tickets/sample");
    if (!response.ok) {
      throw new Error("Could not load example tickets.");
    }

    const tickets = await response.json();
    ticketInput.value = ticketsToPlainText(tickets);
    setStatus("Example loaded — click Run to process.");
    cardsEl.innerHTML = "<p class='meta'>Ready to run.</p>";
  } catch (error) {
    setStatus(error.message);
  }
}

function formatPlainText() {
  const blocks = ticketInput.value
    .trim()
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  ticketInput.value = blocks.join("\n\n");
  setStatus("Input cleaned up.");
}

function clearInputAndResults() {
  ticketInput.value = "";
  latestResults = [];
  cardsEl.innerHTML = "<p class='meta'>No results yet.</p>";
  rawOutputEl.textContent = "";
  updateStats([]);
  setStatus("Cleared input and results.");
}

function parsePlainTextTickets(text) {
  const blocks = text
    .trim()
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (!blocks.length) throw new Error("Please type at least one ticket.");

  return blocks.map((block, index) => {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const title = lines[0] || "";
    const description = lines.slice(1).join(" ") || title;

    if (!title) {
      throw new Error(`Ticket #${index + 1} is missing a title.`);
    }

    return {
      ticket_id: `T-${String(index + 1).padStart(4, "0")}`,
      title,
      description,
    };
  });
}

async function copyResults() {
  if (!latestResults.length) {
    setStatus("No results available to copy.");
    return;
  }

  try {
    await navigator.clipboard.writeText(JSON.stringify(latestResults, null, 2));
    setStatus("Results copied to clipboard.");
  } catch (error) {
    setStatus(`Copy failed: ${error.message}`);
  }
}

function downloadResults() {
  if (!latestResults.length) {
    setStatus("No results available to download.");
    return;
  }

  const data = JSON.stringify(latestResults, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "triage-results.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus("Results downloaded.");
}

async function runTriage() {
  let tickets;

  try {
    tickets = parsePlainTextTickets(ticketInput.value || "");
  } catch (error) {
    setStatus(`Input issue: ${error.message}`);
    return;
  }

  setStatus("Running...");
  runBtn.disabled = true;

  try {
    const response = await fetch("/api/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickets }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Something went wrong (${response.status}): ${errorBody}`,
      );
    }

    const data = await response.json();
    renderResults(data.results || []);
    setStatus(`Done. Processed ${tickets.length} ticket(s).`);
  } catch (error) {
    setStatus(error.message);
  } finally {
    runBtn.disabled = false;
  }
}

loadSampleBtn.addEventListener("click", loadSampleData);
formatBtn.addEventListener("click", formatPlainText);
clearBtn.addEventListener("click", clearInputAndResults);
runBtn.addEventListener("click", runTriage);
copyResultsBtn.addEventListener("click", copyResults);
downloadResultsBtn.addEventListener("click", downloadResults);

updateStats([]);

loadSampleData();
