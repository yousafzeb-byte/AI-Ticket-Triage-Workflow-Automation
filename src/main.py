from pathlib import Path

from .workflow import run_workflow


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    input_file = str(root / "data" / "tickets.json")
    output_file = str(root / "triage_report.json")

    results = run_workflow(input_file, output_file)

    print("AI Ticket Triage complete.")
    print(f"Processed tickets: {len(results)}")
    print(f"Report written to: {output_file}")


if __name__ == "__main__":
    main()
