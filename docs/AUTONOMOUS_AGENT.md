# Autonomous Agent — Architecture & Staged Rollout

> **Mission**: prevention > reaction. Early-warning system aligned with crisis-management principles.
> **Owner**: Costin Muraru (crisis management specialist → founder expertise drives design)
> **Status**: Stage 1 infrastructure in flight; Stages 2-4 planned post-beta
> **Companion docs**: `docs/GDPR/BreachNotification_Runbook.md`, `docs/DASHBOARD_SPEC.md` (§5.8 Crisis Room), `docs/CONTINUOUS_AUDIT.md`

---

## 🎯 Principles (non-negotiable)

The agent inherits our ecosystem principles + explicit crisis-management additions:

| Principle | What it means for the agent |
|---|---|
| **Fail-safe default** | When agent fails, escalates silently to human. Never makes things worse. |
| **Non-destructive** | Cannot delete data, rollback prod, cancel subscriptions without explicit human approval. |
| **Graduated response** | 5 severity levels; each unlocks progressively more action. Most events = log-only. |
| **Antifragile** | Every incident teaches it. Remediation playbook grows from real data, not speculation. |
| **Transparent** | Every action logged to `remediation_log` + Telegram. Human can audit anything. |
| **Human-in-loop (for destructive)** | Auto-actions only on proven patterns with reversible effects. Destructive = always human. |
| **Circuit-breaker** | If agent makes 3 errors in 1 hour → disables self + escalates. |
| **Observable** | Exposes status via `admin.archicore.eu` dashboard + Telegram commands. |

**Crisis-management alignment**: classic 4-phase crisis model (Prevention → Preparation → Response → Recovery) maps directly to agent stages:

```
Stage 1 = Prevention     (passive monitoring, early signals)
Stage 2 = Preparation    (classified alerts, human-assisted response)
Stage 3 = Response       (auto-remediation on known patterns)
Stage 4 = Recovery + Learning (post-incident analysis, pattern library growth)
```

---

## 🏗️ Architecture overview

```
┌───────────────────────────────────────────────────────────────┐
│  DATA SOURCES (the 5 senses of the agent)                      │
├───────────────────────────────────────────────────────────────┤
│  1. ops-check health  2. Sentry errors   3. Stripe webhooks    │
│  4. Supabase query latency  5. Vercel deploy status            │
│  6. User signup rate (anomaly)  7. AI engine success rate      │
│  8. External status pages (Supabase/Vercel/Stripe own incidents)│
└───────────────────────────┬───────────────────────────────────┘
                            │ polled every 1-15 min
                            ▼
┌───────────────────────────────────────────────────────────────┐
│  COLLECTOR (scripts/monitor-collect.mjs — Stage 1)             │
│  - Polls sources, writes to monitoring_signals table           │
│  - Deduplicates noisy signals                                  │
│  - Stateless — safe to run multiple instances                  │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────┐
│  CLASSIFIER (scripts/agent-classify.mjs — Stage 2)             │
│  Rules first (fast, deterministic):                            │
│    - error_rate > 5% AND duration > 5min → 🟠                  │
│    - site_down > 60s → 🔴                                      │
│  LLM fallback (for ambiguous patterns, Stage 2+):              │
│    - New error type never seen → LLM classifies                │
│  Outputs: signal → severity assignment                         │
└───────────────────────────┬───────────────────────────────────┘
                            │
          ┌─────────────────┼──────────────────┐
          │                 │                  │
          ▼                 ▼                  ▼
     ┌────────┐        ┌──────────┐     ┌──────────────┐
     │ LOG    │        │ NOTIFY   │     │ REMEDIATE    │
     │ (DB)   │        │ (Telegram│     │ (Stage 3+)   │
     │ always │        │  + email │     │ auto-actions │
     │        │        │  staged) │     │ from playbook│
     └────────┘        └──────────┘     └──────────────┘
                            │                  │
                            │                  │
                            ▼                  ▼
              Consolidates into `incidents` and `remediation_log`.
              Both readable by admin dashboard + dashboard Crisis Room tile.
```

---

## 📊 Signal classification matrix

6 severity levels (extends our standard traffic-light system):

| Icon | Level | Trigger example | Response |
|---|---|---|---|
| ⚪ | **not-assessed** | New signal type before rules exist | Log only; flag for rule creation |
| 🟢 | **normal** | Health check OK, error rate <0.5%, latency <p95 | Log only |
| 🔵 | **info** | Milestone hit (100 users), new content published, normal deploy | Log + daily digest |
| 🟡 | **watch** | Error rate 0.5-2%, latency p95 2-5s, one-off 503 | Log + trend tracking; notify if persists >15 min |
| 🟠 | **warn** | Error rate 2-5%, failed payment, queue backlog, AI engine fallback | Notify user immediately; suggest action |
| 🔴 | **critical** | Site down >60s, auth broken, data breach signal, >10% error rate | Instant alert + auto-remediation (if playbook exists) + escalate |

### Classification rules (Stage 2 baseline)

```yaml
# Source: ops-check
- match: "status=green"
  severity: normal
- match: "warnings>=1 AND fails=0"
  severity: watch
- match: "fails>=1 AND fails<3"
  severity: warn
- match: "fails>=3 OR site_down"
  severity: critical

# Source: Sentry
- match: "new_error_type"
  severity: info
- match: "error_rate>0.5% AND error_rate<=2% for 15min"
  severity: watch
- match: "error_rate>2% AND error_rate<=5% for 5min"
  severity: warn
- match: "error_rate>5% OR sentry_issue_p0"
  severity: critical

# Source: Stripe webhooks
- match: "webhook_delivery_fail 1x"
  severity: watch
- match: "webhook_delivery_fail 3x in 10min"
  severity: warn
- match: "checkout.session.completed did not trigger tier upgrade"
  severity: critical  # silent billing bug — worst kind

# Source: User signups anomaly
- match: "signup_rate > 10x baseline"
  severity: info  # could be viral OR attack — investigate
- match: "signup_rate < 0.1x baseline for 6h (peak hours)"
  severity: warn  # something broken in signup flow?
```

All rules live in `config/agent-rules.yml` (created in Stage 2). Version-controlled, tweakable without code deploy.

---

## 🔔 Notification channels

| Channel | Use for | Delivery speed |
|---|---|---|
| **Telegram bot (primary)** | 🟠 + 🔴 immediate; 🔵 daily digest 08:00 EET | Sub-second |
| **Email** | 🟠 + 🔴 backup (in case Telegram down); weekly report Fri 18:00 | <5 min |
| **Sentry dashboard** | All errors automatically captured (already live) | Real-time |
| **Admin dashboard Crisis tile** | Live state overview (built Faza 1) | Live |
| **SMS / phone call** | 🔴 only, if Telegram + email silent for 5 min | <30 sec (future) |

Quiet hours: 22:00-07:00 EET batched into morning digest EXCEPT 🔴 critical which escalates 24/7.

---

## 📚 Remediation playbook format

Each playbook = YAML file in `config/playbooks/`:

```yaml
# config/playbooks/ai-engine-fallback.yml
name: AI Engine Fallback
trigger:
  source: "ai-render"
  pattern: "engine_error_rate > 20% for engine X in 10min window"
severity: warn
actions:
  - type: config_change
    what: "Mark engine X as degraded in creditManager"
    reversible: true  # auto-un-degrades after 1h of green
    requires_approval: false
  - type: fallback
    what: "Route new requests to Pollinations (primary free fallback)"
    reversible: true
    requires_approval: false
verification:
  - check: "render success rate returns to baseline within 30min"
  - on_failure: "escalate to critical, notify human"
post_mortem:
  required: true
  template: "templates/post-mortem-ai-engine.md"
```

**Stage 3 starts empty playbook** — we write new ones ONLY after seeing the real incident. This is antifragile: every real problem becomes a future automated response.

---

## 🚨 Circuit breakers (prevent agent from making things worse)

The agent disables itself if:
- 3 errors in its own execution in 1 hour (script crashes, SQL fails, etc.)
- Made 3 remediation actions that required human rollback in 24h
- Health of its own infrastructure (monitoring DB, Telegram bot) degrades
- Manual kill switch: `agent:disable` command via Telegram bot

When disabled:
- Sends "AGENT DISABLED" notification to user with reason
- All events continue to be logged (just no action)
- Human re-enables via `agent:enable` once root cause addressed

---

## 🗂️ Data model (migration 010 schema)

```sql
-- monitoring_signals: raw events from data sources
CREATE TABLE monitoring_signals (
  id uuid PRIMARY KEY,
  created_at timestamptz,
  source text,              -- 'ops-check' | 'sentry' | 'stripe' | 'vercel' | etc.
  severity text,            -- 'not-assessed' | 'normal' | 'info' | 'watch' | 'warn' | 'critical'
  message text,
  details jsonb,
  fingerprint text,         -- dedup key (same-type events collapse)
  incident_id uuid NULL     -- linked to incidents if consolidated
);

-- incidents: consolidated events that need tracking
CREATE TABLE incidents (
  id uuid PRIMARY KEY,
  opened_at timestamptz,
  closed_at timestamptz,
  severity text,
  title text,
  description text,
  status text,              -- 'open' | 'acknowledged' | 'remediated' | 'closed' | 'post-mortem'
  resolution text NULL,
  human_ack_by text NULL,
  post_mortem_path text NULL
);

-- remediation_log: every auto-action the agent took
CREATE TABLE remediation_log (
  id uuid PRIMARY KEY,
  created_at timestamptz,
  incident_id uuid REFERENCES incidents,
  playbook_name text,
  action_type text,
  action_details jsonb,
  success boolean,
  human_reversed boolean DEFAULT false,  -- critical: did we have to undo it?
  notes text
);
```

RLS: service_role read/write only. No public access. No anon access.

---

## 📅 Staged rollout plan

### Stage 1 — Passive Monitoring (this week, pre-launch)

**Goal**: see everything. Act on nothing. Build muscle memory for reading signals.

**Deliverables**:
- ✅ `docs/AUTONOMOUS_AGENT.md` (this file)
- ⏳ `supabase/migrations/010_monitoring_signals.sql`
- ⏳ `scripts/monitor-collect.mjs` — collector skeleton
- ⏳ `.github/workflows/ops-check-cron.yml` — 6h GitHub Actions cron
- ⏳ Telegram bot with read-only commands (`/status`, `/health`, `/blockers`)

**NOT in Stage 1**: classification logic, auto-remediation, LLM calls, SMS.

**Success criteria**: 1 week post-launch with 0 missed incidents (if incident happens, we saw it in the monitoring stream even if we didn't act automatically).

### Stage 2 — Smart Classification (week 2 post-launch)

**Goal**: reduce noise. Only 🟠+ hits Telegram; 🟢🔵 aggregate to digest.

**Deliverables**:
- `config/agent-rules.yml` with ~15 classification rules
- `scripts/agent-classify.mjs` — applies rules to signals
- Telegram commands expand: `/incidents`, `/trends`, `/silence <topic> <duration>`
- Daily digest at 08:00 with yesterday's summary

**NOT yet**: auto-remediation, LLM classification.

### Stage 3 — Auto-Remediation Limited (month 2-3 post-launch)

**Goal**: handle known patterns without waking human.

**Deliverables**:
- First 5 playbooks based on real Stage 1-2 incidents:
  - AI engine fallback
  - Cache purge on 503 cascade
  - Rate limit adjust on signup spike
  - Stripe webhook replay on missed delivery
  - Supabase connection pool flush on query latency
- `scripts/agent-remediate.mjs` — executes playbook actions
- All auto-actions reversible + logged
- Circuit breaker active

**NOT yet**: destructive actions, LLM-driven decisions without rules.

### Stage 4 — LLM + Learning (month 3-6+)

**Goal**: agent recognizes novel patterns, proposes new playbooks, humans approve.

**Deliverables**:
- LLM-assisted classification for unknown signal types (cheap Haiku calls)
- Post-mortem auto-draft from incident timeline
- Playbook suggestion engine ("I saw X happen 3 times this month, propose playbook?")
- Pattern library with confidence scores

**Human always approves** new playbooks before they run. Agent never self-authorizes destructive actions.

---

## 🧭 Operational model

| Role | Who | Responsibilities |
|---|---|---|
| **Agent** | Automated (this system) | Collect, classify, notify, remediate (within playbooks) |
| **On-call human** | Costin (primary), expanding to team | Respond to Telegram 🟠+, approve new playbooks, post-mortems |
| **Playbook author** | Main chat (with Costin approval) | Write new playbooks from real incident data |
| **Circuit-breaker operator** | Costin | Manual disable/enable, rule tuning |

---

## 🔗 Integration with existing systems

- **Sentry**: agent reads Sentry API for error rates + new issue detection (Sentry MCP when live)
- **Stripe**: agent reads Stripe webhook delivery stats + failed payments (Stripe MCP when live)
- **Supabase**: agent queries monitoring_signals via service_role (no new infrastructure)
- **Vercel**: agent reads deploy status via Vercel API (stored token in env)
- **Admin dashboard**: Crisis Room tab reads directly from incidents + remediation_log
- **Breach Runbook** (`docs/GDPR/BreachNotification_Runbook.md`): agent severity 🔴 auto-triggers breach procedure checklist for human

---

## 💰 Cost envelope

- Stage 1: ~$0 — uses GitHub Actions free tier + Supabase free tier
- Stage 2: ~$2-5/month — Telegram bot hosted on Vercel Hobby tier (free) + classification logic is rule-based
- Stage 3: ~$10-20/month — remediation actions may trigger API calls (Stripe, Supabase)
- Stage 4: ~$30-50/month — LLM classification (Haiku is cheap; budgeted at ~5 calls/day)

Budgeted monitoring line item in docs/ECOSYSTEM_ARCHITECTURE.md financial projections.

---

## 🎚️ Kill switch / safety

At any point, Costin can:
- `agent:disable` in Telegram bot → agent stops all actions immediately
- Git revert the collector cron → agent stops collecting
- Drop the playbook file → agent stops remediation for that pattern
- DELETE FROM monitoring_signals (truncate) → reset state

No state persists outside the DB tables + scripts. Reversible at any step.

---

## 📖 Reading order for understanding this agent

1. This doc (architecture)
2. `docs/GDPR/BreachNotification_Runbook.md` (human procedure agent augments)
3. `supabase/migrations/010_monitoring_signals.sql` (data model)
4. `scripts/monitor-collect.mjs` (Stage 1 collector)
5. `config/agent-rules.yml` (Stage 2+ rules) — does not exist yet
6. `config/playbooks/*.yml` (Stage 3+ remediation) — does not exist yet

---

## 🔄 Decision log

| Date | Decision | Rationale |
|---|---|---|
| 2026-04-20 | Stage 1 starts pre-beta (passive only) | Monitoring infrastructure must exist before we have real users to monitor |
| 2026-04-20 | No LLM in Stage 1 | Cost control + reliability — rules-based is predictable |
| 2026-04-20 | Telegram as primary alert channel | Cross-device, instant, free, internationally accessible |
| 2026-04-20 | Playbook library starts empty | Antifragile — only write playbooks from real incidents, not speculation |
| 2026-04-20 | Circuit breaker mandatory from Stage 3 | Prevent agent-caused incidents from compounding |
| 2026-04-20 | Human approves all new playbooks | Keep destructive actions behind human judgment until pattern proven |

---

*The agent's purpose: let Costin sleep. Every automation is a night of peace earned.*
