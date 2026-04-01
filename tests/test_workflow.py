from src.models import Ticket
from src.workflow import infer_priority, infer_team


def test_priority_p0_for_outage():
    ticket = Ticket(
        ticket_id="T-1",
        title="Service outage",
        description="Main API is down for all users.",
    )

    priority, reason = infer_priority(ticket)

    assert priority == "P0"
    assert "P0" in reason


def test_team_billing_for_charge_issue():
    ticket = Ticket(
        ticket_id="T-2",
        title="Wrong payment charge",
        description="Customer asks for refund due to duplicate invoice.",
    )

    team, reason = infer_team(ticket)

    assert team == "Billing"
    assert "Billing" in reason
