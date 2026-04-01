# AI Ticket Triage Assistant: Full-Stack Workflow Automation

[![CI](https://github.com/yousafzeb-byte/AI-Ticket-Triage-Workflow-Automation/actions/workflows/ci.yml/badge.svg)](https://github.com/yousafzeb-byte/AI-Ticket-Triage-Workflow-Automation/actions/workflows/ci.yml)
![Deployment Setup](https://img.shields.io/badge/Deployment-Docker%20%2B%20Render%20Setup-blue)

This app helps teams handle support tickets faster.

You paste tickets, click run, and the app gives:

- urgency level (P0 to P3)
- suggested team to handle the issue
- short plain summary
- clear reason for each decision

## Creator

- Yousaf Zeb

## What This Project Solves

Manual ticket triage is slow and often inconsistent.
This project gives a fast first decision so teams can respond sooner and stay aligned.

Main benefits:

- Faster first response
- More consistent routing
- Easier handoff between teams

## How It Works (Simple)

1. You add tickets

- You can use the example data or paste your own list.

2. The app checks urgency

- It marks each ticket as P0, P1, P2, or P3.

3. The app suggests an owner team

- It picks Security, Billing, Auth, Platform, or Support.

4. It writes a short summary

- If AI is available, it writes a better one-line summary.
- If not, it still gives a safe fallback summary.

5. You get clear results

- Priority
- Team
- Reason
- Summary

## User Experience

- Clean dashboard
- Easy action buttons
- Copy and download results
- Mobile-friendly layout

## Quick Start

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Optional: add your AI key for richer summaries:

```bash
copy .env.example .env
```

3. Start the app:

```bash
uvicorn src.api:app --reload
```

Open:

- UI: `http://127.0.0.1:8000/`

## Deployment

This project includes deployment setup for:

- Docker
- Docker Compose
- Render

Use Docker locally:

```bash
docker build -t ai-ticket-triage-workflow-automation .
docker run -p 8000:8000 --env-file .env ai-ticket-triage-workflow-automation
```

## For Developers

API docs:

- `http://127.0.0.1:8000/docs`

Run tests:

```bash
pytest -q
```

Run in command-line mode:

```bash
python -m src.main
```
