# AI Ticket Triage Assistant

A portfolio project that demonstrates an end-to-end AI workflow:

- Ingest support tickets
- Classify priority
- Recommend team routing
- Produce concise AI summaries
- Export a final triage report

This project is intentionally practical and explainable, so you can showcase both AI design thinking and software engineering execution.

## One-Page Showcase

Read the one-page narrative crafted for portfolio and interview prompts:

- `ONE_PAGE_OVERVIEW.md`

## Why this is a good AI showcase

- Clear workflow design (input -> analysis -> decision -> output)
- Hybrid approach: deterministic logic + optional LLM augmentation
- Test coverage for core triage behavior
- CI pipeline for reliability
- Production-style repository structure

## Tech Stack

- Python 3.11+
- Optional OpenAI API integration
- Pytest for tests
- GitHub Actions for CI

## Project Structure

```text
AI-Ticket-Triage_Assistant/
  src/
    main.py
    models.py
    workflow.py
  data/
    tickets.json
  tests/
    test_workflow.py
  .github/workflows/ci.yml
  .env.example
  .gitignore
  requirements.txt
  README.md
```

## Quick Start

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. (Optional) Enable LLM support:

```bash
copy .env.example .env
# Add your OPENAI_API_KEY in .env
```

4. Run the workflow:

```bash
python -m src.main
```

5. Check output:

- Console summary
- `triage_report.json` generated in project root

## How the AI Workflow Works

1. Ingestion: Load incoming tickets from `data/tickets.json`.
2. Scoring: Keyword-based urgency and domain scoring.
3. Decision: Determine `priority`, `team`, and `rationale`.
4. AI summary (optional): If `OPENAI_API_KEY` is set, generate concise summaries using an LLM.
5. Export: Save all triage decisions to `triage_report.json`.

## Running Tests

```bash
pytest -q
```

## GitHub Setup

Initialize and push:

```bash
git init
git add .
git commit -m "Initial commit: AI Ticket Triage Assistant"
git branch -M main
git remote add origin https://github.com/<your-username>/ai-ticket-triage-assistant.git
git push -u origin main
```

If the repository already exists on GitHub, only run the last three commands after setting `origin`.

## Portfolio Tips

In your GitHub description and README intro, mention:

- workflow orchestration
- prompt + rule hybrid strategy
- observability through structured report output
- test-driven confidence for triage behavior
