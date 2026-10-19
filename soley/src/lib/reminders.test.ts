import { describe, expect, it } from "vitest";
import { dueLeadReminders, dueQuoteReminders } from "./reminders";

const now = new Date("2026-10-20T12:00:00Z");

describe("reminders", () => {
  it("reminds installers once about leads unanswered for a day", () => {
    const due = dueLeadReminders(
      [
        {
          id: "old",
          status: "offered",
          offered_at: "2026-10-19T10:00:00Z",
          reminder_sent_at: null,
        },
        {
          id: "fresh",
          status: "offered",
          offered_at: "2026-10-20T08:00:00Z",
          reminder_sent_at: null,
        },
        {
          id: "sent",
          status: "offered",
          offered_at: "2026-10-18T10:00:00Z",
          reminder_sent_at: "2026-10-19T10:00:00Z",
        },
        {
          id: "answered",
          status: "accepted",
          offered_at: "2026-10-18T10:00:00Z",
          reminder_sent_at: null,
        },
      ],
      now,
    );
    expect(due.map((a) => a.id)).toEqual(["old"]);
  });

  it("reminds households once, five days after the latest quote", () => {
    const requests = [
      { id: "waiting", status: "quoted", quote_reminder_sent_at: null },
      { id: "recent", status: "quoted", quote_reminder_sent_at: null },
      { id: "chosen", status: "chosen", quote_reminder_sent_at: null },
      {
        id: "done",
        status: "quoted",
        quote_reminder_sent_at: "2026-10-19T00:00:00Z",
      },
    ];
    const quotes = [
      { quote_request_id: "waiting", created_at: "2026-10-10T00:00:00Z" },
      { quote_request_id: "recent", created_at: "2026-10-10T00:00:00Z" },
      { quote_request_id: "recent", created_at: "2026-10-19T00:00:00Z" },
      { quote_request_id: "chosen", created_at: "2026-10-01T00:00:00Z" },
      { quote_request_id: "done", created_at: "2026-10-01T00:00:00Z" },
    ];
    expect(dueQuoteReminders(requests, quotes, now).map((r) => r.id)).toEqual([
      "waiting",
    ]);
  });
});
