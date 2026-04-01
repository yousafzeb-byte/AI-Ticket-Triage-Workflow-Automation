from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .models import Ticket
from .workflow import triage_ticket, OptionalLLMSummarizer, load_tickets


ROOT_DIR = Path(__file__).resolve().parent.parent
WEB_DIR = ROOT_DIR / "web"
DATA_FILE = ROOT_DIR / "data" / "tickets.json"

app = FastAPI(
    title="AI Ticket Triage Assistant: Full-Stack Workflow Automation",
    description="Full-stack AI workflow app for ticket triage and explainable routing.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TicketInput(BaseModel):
    ticket_id: str = Field(..., min_length=1)
    title: str = Field(..., min_length=3)
    description: str = Field(..., min_length=5)


class BatchTriageRequest(BaseModel):
    tickets: list[TicketInput]


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-ticket-triage-workflow-automation"}


@app.get("/api/tickets/sample")
def get_sample_tickets() -> list[dict[str, str]]:
    tickets = load_tickets(str(DATA_FILE))
    return [ticket.__dict__ for ticket in tickets]


@app.post("/api/triage")
def triage_batch(request: BatchTriageRequest) -> dict[str, list[dict[str, str]]]:
    summarizer = OptionalLLMSummarizer()
    results = []

    for payload in request.tickets:
        ticket = Ticket(**payload.model_dump())
        result = triage_ticket(ticket, summarizer)
        results.append(result.__dict__)

    return {"results": results}


if WEB_DIR.exists():
    app.mount("/assets", StaticFiles(directory=WEB_DIR), name="assets")


@app.get("/")
def index() -> FileResponse:
    return FileResponse(WEB_DIR / "index.html")
