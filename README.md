# AI Ticket Triage Assistant: Full-Stack Workflow Automation

Production-grade full-stack AI workflow project for support operations.

The system ingests unstructured support tickets, predicts priority, recommends routing team, and produces concise summaries with optional LLM enhancement. It is designed as a portfolio project that demonstrates practical AI engineering, backend/API design, frontend delivery, testing, and deployment readiness.

## Creator

- Yousaf Zeb

## Project Goal

Support triage is often slow and inconsistent when handled manually. This project automates the first-pass triage decision while keeping outputs explainable for trust and human audit.

Key outcomes:

- Faster triage turnaround for incoming ticket queues
- More consistent priority and routing decisions
- Better handoff quality through structured rationale and summaries

## End-to-End AI Workflow

1. Input ingestion

- Source tickets can be loaded from JSON (`data/tickets.json`) or submitted from the frontend UI.
- Each ticket includes `ticket_id`, `title`, and `description`.

2. Priority inference

- The workflow applies urgency keyword signals to map tickets to `P0`, `P1`, `P2`, or `P3`.
- Priority mapping is deterministic and transparent, which makes it easy to explain to stakeholders.

3. Team routing

- Domain keyword scoring routes the ticket to the best-fit team:
  `Security`, `Billing`, `Auth`, `Platform`, or `Support`.
- If no signal is found, routing defaults safely to `Support`.

4. AI summary augmentation (optional)

- If `OPENAI_API_KEY` is configured, the backend asks the model for a one-sentence summary.
- If no API key is configured or LLM call fails, the system falls back to deterministic summary text.

5. Explainable output generation

- Every result includes:
  - predicted `priority`
  - predicted `team`
  - combined `rationale` from inference logic
  - final `ai_summary`
- Outputs can be returned via API or exported as `triage_report.json` in CLI mode.

## Full-Stack Architecture

1. Frontend (`web/`)

- Interactive single-page app for:
  - loading sample ticket payloads
  - submitting custom JSON ticket batches
  - visualizing triage cards with priority/team badges and rationale

2. Backend API (`src/api.py`)

- FastAPI service exposing:
  - `GET /api/health`
  - `GET /api/tickets/sample`
  - `POST /api/triage`
- Serves frontend assets and API docs from the same service.

3. AI Engine (`src/workflow.py`)

- Core triage rules
- Optional OpenAI summarizer with graceful fallback
- Reusable for both API and CLI execution modes

4. Data model layer (`src/models.py`)

- Typed dataclass models for input and output consistency

5. Quality and delivery

- Unit and API tests in `tests/`
- CI workflow in `.github/workflows/ci.yml`
- Docker and platform deployment configuration included

## Tech Stack

- Python 3.11+
- FastAPI + Uvicorn
- OpenAI SDK (optional)
- Pytest + FastAPI TestClient
- Docker + Docker Compose
- GitHub Actions CI

## Repository Structure

```text
AI-Ticket-Triage_Assistant/
  src/
    api.py
    main.py
    models.py
    workflow.py
  web/
    index.html
    styles.css
    app.js
  data/
    tickets.json
  tests/
    test_workflow.py
    test_api.py
  .github/workflows/ci.yml
  .vscode/settings.json
  .env.example
  .dockerignore
  .gitignore
  Dockerfile
  docker-compose.yml
  render.yaml
  requirements.txt
  README.md
```

## Local Development Setup

1. Create virtual environment and activate it.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure environment values:

```bash
copy .env.example .env
```

Optional values in `.env`:

- `OPENAI_API_KEY` for LLM summaries
- `OPENAI_MODEL` (default is `gpt-4.1-mini`)

## Run the Application (Frontend + Backend)

```bash
uvicorn src.api:app --reload
```

Open:

- UI: `http://127.0.0.1:8000/`
- Interactive API docs: `http://127.0.0.1:8000/docs`

## Run CLI Batch Mode

```bash
python -m src.main
```

This processes `data/tickets.json` and writes `triage_report.json`.

## API Contract

### POST `/api/triage`

Request body:

```json
{
  "tickets": [
    {
      "ticket_id": "T-101",
      "title": "Payments API outage",
      "description": "Checkout calls are failing in production."
    }
  ]
}
```

Response body:

```json
{
  "results": [
    {
      "ticket_id": "T-101",
      "priority": "P0",
      "team": "Platform",
      "rationale": "Matched 1 P0 urgency keyword(s). Matched 1 keyword(s) for Platform.",
      "ai_summary": "Payments API outage: routed to Platform with priority P0."
    }
  ]
}
```

## Testing

Run all tests:

```bash
pytest -q
```

Coverage includes:

- workflow logic tests for priority and team inference
- API endpoint tests for health and triage behavior

## Deployment

### Option A: Docker

```bash
docker build -t ai-ticket-triage-workflow-automation .
docker run -p 8000:8000 --env-file .env ai-ticket-triage-workflow-automation
```

### Option B: Docker Compose

```bash
docker compose up --build
```

### Option C: Render

Repository already contains `render.yaml`.

1. Push code to GitHub.
2. Create Render Blueprint from the repo.
3. Add `OPENAI_API_KEY` as secret env var (optional).
4. Deploy service.

## GitHub Publish

```bash
git remote add origin https://github.com/<your-username>/ai-ticket-triage-workflow-automation.git
git push -u origin main
```

## Portfolio Value and Job-Ready Skills Demonstrated

- Applied AI workflow design for operations automation
- Explainable inference with rationale-first outputs
- Hybrid deterministic + generative AI architecture
- Backend API engineering with typed request/response contracts
- Frontend implementation for real user interaction
- Automated testing and CI for reliability
- Containerization and deployment configuration

## Future Enhancements

- Confidence scoring per triage decision
- Human feedback loop and continuous rule/model tuning
- Jira/Slack integrations for auto-assignment
- Monitoring dashboard for triage quality trends
