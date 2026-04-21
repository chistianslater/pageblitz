import mysql from "mysql2/promise";

let _pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!_pool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL env var is required");
    _pool = mysql.createPool(url);
  }
  return _pool;
}

export interface ExperimentRow {
  id: number;
  baselineVariant: string;
  challengerVariant: string;
  startedAt: Date;
  endedAt: Date | null;
  winner: string | null;
  status: "running" | "completed" | "aborted";
  hypothesis: string | null;
  baselineSends: number;
  challengerSends: number;
  baselineOpens: number;
  challengerOpens: number;
  baselineReplies: number;
  challengerReplies: number;
  createdAt: Date;
}

export interface MetricsResult {
  sends: number;
  opens: number;
  replies: number;
  openRate: number;
  replyRate: number;
}

export async function getActiveExperiment(): Promise<ExperimentRow | null> {
  const pool = getPool();
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT * FROM outreach_experiments WHERE status = 'running' LIMIT 1"
  );
  return (rows[0] as ExperimentRow) ?? null;
}

export async function getExperimentByVariant(variant: string): Promise<ExperimentRow | null> {
  const pool = getPool();
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    "SELECT * FROM outreach_experiments WHERE (baselineVariant = ? OR challengerVariant = ?) ORDER BY createdAt DESC LIMIT 1",
    [variant, variant]
  );
  return (rows[0] as ExperimentRow) ?? null;
}

export async function getMetrics(variant: string): Promise<MetricsResult> {
  const pool = getPool();
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT
      COUNT(*) AS sends,
      SUM(status IN ('opened', 'replied')) AS opens,
      SUM(status = 'replied') AS replies
     FROM outreach_emails
     WHERE variant = ?`,
    [variant]
  );
  const row = rows[0] ?? {};
  const sends = Number(row.sends ?? 0);
  const opens = Number(row.opens ?? 0);
  const replies = Number(row.replies ?? 0);
  return {
    sends,
    opens,
    replies,
    openRate: sends > 0 ? opens / sends : 0,
    replyRate: sends > 0 ? replies / sends : 0,
  };
}

export async function markExperimentCompleted(id: number, winner: string): Promise<void> {
  const pool = getPool();
  await pool.query(
    "UPDATE outreach_experiments SET status = 'completed', winner = ?, endedAt = NOW() WHERE id = ?",
    [winner, id]
  );
}

export async function createNewExperiment(
  baseline: string,
  challenger: string,
  hypothesis: string
): Promise<number> {
  const pool = getPool();
  const [result] = await pool.query<mysql.ResultSetHeader>(
    `INSERT INTO outreach_experiments
       (baselineVariant, challengerVariant, hypothesis, status, startedAt, createdAt)
     VALUES (?, ?, ?, 'running', NOW(), NOW())`,
    [baseline, challenger, hypothesis]
  );
  return result.insertId;
}

export interface BusinessRow {
  id: number;
  name: string;
  email: string;
  address: string | null;
  phone: string | null;
  category: string | null;
}

export async function getUncontactedBusinesses(limit: number): Promise<BusinessRow[]> {
  const pool = getPool();
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT b.id, b.name, b.email, b.address, b.phone, b.category
     FROM businesses b
     WHERE b.email IS NOT NULL
       AND b.email != ''
       AND b.id NOT IN (SELECT DISTINCT businessId FROM outreach_emails)
     LIMIT ?`,
    [limit]
  );
  return rows as BusinessRow[];
}

export async function recordEmailSent(
  businessId: number,
  email: string,
  subject: string,
  body: string,
  variant: string,
  resendEmailId: string
): Promise<number> {
  const pool = getPool();
  const [result] = await pool.query<mysql.ResultSetHeader>(
    `INSERT INTO outreach_emails
       (businessId, recipientEmail, subject, body, status, variant, resendEmailId, sentAt, createdAt)
     VALUES (?, ?, ?, ?, 'sent', ?, ?, NOW(), NOW())`,
    [businessId, email, subject, body, variant, resendEmailId]
  );
  return result.insertId;
}

export async function updateExperimentCounts(
  experimentId: number,
  variant: "baseline" | "challenger",
  field: "sends" | "opens" | "replies"
): Promise<void> {
  const pool = getPool();
  const col =
    variant === "baseline"
      ? field === "sends"
        ? "baselineSends"
        : field === "opens"
        ? "baselineOpens"
        : "baselineReplies"
      : field === "sends"
      ? "challengerSends"
      : field === "opens"
      ? "challengerOpens"
      : "challengerReplies";
  await pool.query(
    `UPDATE outreach_experiments SET \`${col}\` = \`${col}\` + 1 WHERE id = ?`,
    [experimentId]
  );
}

export async function closePool(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}
