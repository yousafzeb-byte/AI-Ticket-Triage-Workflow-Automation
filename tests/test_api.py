from fastapi.testclient import TestClient

from src.api import app


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_triage_endpoint():
    payload = {
        "tickets": [
            {
                "ticket_id": "T-500",
                "title": "Critical outage in payments API",
                "description": "Production API is down and causing checkout failures.",
            }
        ]
    }

    response = client.post("/api/triage", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert "results" in body
    assert len(body["results"]) == 1
    assert body["results"][0]["priority"] == "P0"
