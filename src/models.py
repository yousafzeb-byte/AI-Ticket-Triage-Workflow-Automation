from dataclasses import dataclass


@dataclass
class Ticket:
    ticket_id: str
    title: str
    description: str


@dataclass
class TriageResult:
    ticket_id: str
    priority: str
    team: str
    rationale: str
    ai_summary: str
