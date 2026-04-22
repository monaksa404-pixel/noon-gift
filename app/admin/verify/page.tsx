"use client";

import { useEffect, useState } from "react";

type Session = {
  id: string;
  phone: string;
  code?: string;
  status: string;
  updatedAt: number;
};

export default function AdminVerifyPage() {
  const [token, setToken] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadSessions() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/verify", {
        headers: { "x-admin-token": token },
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Failed to load sessions");
      }
      setSessions(payload.sessions || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function decide(sessionId: string, action: "approve" | "reject") {
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ sessionId, action }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Failed to update session");
      }
      await loadSessions();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    }
  }

  useEffect(() => {
    if (!token) return;
    loadSessions();
    const timer = setInterval(loadSessions, 2000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Admin Verification</h1>
      <p>Enter admin token to review pending code submissions.</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="password"
          placeholder="Admin token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{ flex: 1, padding: 10 }}
        />
        <button onClick={loadSessions} style={{ padding: "10px 14px" }}>
          Load
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#b00020" }}>{error}</p>}

      {sessions.length === 0 ? (
        <p>No pending verifications.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {sessions.map((s) => (
            <div
              key={s.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div>
                <div><strong>Phone:</strong> {s.phone}</div>
                <div><strong>Code:</strong> {s.code || "-"}</div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {new Date(s.updatedAt).toLocaleString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => decide(s.id, "approve")} style={{ padding: "8px 12px" }}>
                  Accept
                </button>
                <button onClick={() => decide(s.id, "reject")} style={{ padding: "8px 12px" }}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
