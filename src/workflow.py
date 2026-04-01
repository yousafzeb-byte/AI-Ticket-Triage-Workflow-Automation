import json
import os
from typing import Iterable

from dotenv import load_dotenv

from .models import Ticket, TriageResult


PRIORITY_KEYWORDS = {
    "P0": ["outage", "down", "breach", "security incident", "data loss"],
    "P1": ["payment failed", "cannot login", "login issue", "timeout", "error 500"],
    "P2": ["bug", "slow", "degraded", "incorrect", "broken"],
}

TEAM_KEYWORDS = {
    "Security": ["breach", "vulnerability", "security", "phishing"],
    "Billing": ["invoice", "refund", "payment", "charge"],
    "Auth": ["login", "signin", "password", "mfa"],
    "Platform": ["api", "timeout", "latency", "error", "outage"],
    "Support": [],
}


class OptionalLLMSummarizer:
    def __init__(self) -> None:
        load_dotenv()
        self.api_key = os.getenv("OPENAI_API_KEY", "").strip()
        self.model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini").strip()
        self.enabled = bool(self.api_key)

    def summarize(self, ticket: Ticket, fallback_text: str) -> str:
        if not self.enabled:
            return fallback_text

        try:
            from openai import OpenAI

            client = OpenAI(api_key=self.api_key)
            response = client.responses.create(
                model=self.model,
                input=[
                    {
                        "role": "system",
                        "content": "You summarize support tickets in one crisp sentence.",
                    },
                    {
                        "role": "user",
                        "content": (
                            f"Ticket title: {ticket.title}\n"
                            f"Description: {ticket.description}\n"
                            "Return one sentence only."
                        ),
                    },
                ],
                max_output_tokens=80,
            )
            text = (response.output_text or "").strip()
            return text or fallback_text
        except Exception:
            return fallback_text


def load_tickets(file_path: str) -> list[Ticket]:
    with open(file_path, "r", encoding="utf-8") as f:
        raw = json.load(f)
    return [Ticket(**item) for item in raw]


def _keyword_hits(text: str, keywords: Iterable[str]) -> int:
    lowered = text.lower()
    return sum(1 for keyword in keywords if keyword in lowered)


def infer_priority(ticket: Ticket) -> tuple[str, str]:
    combined = f"{ticket.title} {ticket.description}".lower()

    for level in ["P0", "P1", "P2"]:
        hits = _keyword_hits(combined, PRIORITY_KEYWORDS[level])
        if hits > 0:
            return level, f"Matched {hits} {level} urgency keyword(s)."

    return "P3", "No urgency keywords matched; defaulting to P3."


def infer_team(ticket: Ticket) -> tuple[str, str]:
    combined = f"{ticket.title} {ticket.description}".lower()

    best_team = "Support"
    best_score = 0

    for team, keywords in TEAM_KEYWORDS.items():
        score = _keyword_hits(combined, keywords)
        if score > best_score:
            best_team = team
            best_score = score

    if best_score == 0:
        return "Support", "No domain keywords matched; routed to Support."

    return best_team, f"Matched {best_score} keyword(s) for {best_team}."


def triage_ticket(ticket: Ticket, summarizer: OptionalLLMSummarizer) -> TriageResult:
    priority, priority_reason = infer_priority(ticket)
    team, team_reason = infer_team(ticket)

    fallback_summary = f"{ticket.title}: routed to {team} with priority {priority}."
    summary = summarizer.summarize(ticket, fallback_summary)

    return TriageResult(
        ticket_id=ticket.ticket_id,
        priority=priority,
        team=team,
        rationale=f"{priority_reason} {team_reason}",
        ai_summary=summary,
    )


def run_workflow(input_file: str, output_file: str) -> list[TriageResult]:
    tickets = load_tickets(input_file)
    summarizer = OptionalLLMSummarizer()
    results = [triage_ticket(ticket, summarizer) for ticket in tickets]

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump([result.__dict__ for result in results], f, indent=2)

    return results
