# MCA-DOC-GITHUB-SECRETS-2026-11-19

**Purpose**: Configure 6 GitHub Actions secrets so the 2 new cron workflows run in CI  
**Owner**: Costin (user action — needs GitHub login)  
**Est. time**: 3 minutes  
**Priority**: Medium — cron workflows run weekly, not blocking launch  
**Related**: Chat 3 handoff `MCA-HANDOFF-1-MAIN-2026-11-19.md` ITEM-2

---

## Why this matters

Chat 3 (AI Engines) added 2 GitHub Actions cron workflows:
- **Mon 08:00 UTC** — `engines-audit.yml` — billing audit of all AI providers
- **Sun 07:00 UTC** — `engines-model-check.yml` — checks for deprecated/renamed models

Both need API keys to call AI providers programmatically from GitHub's CI environment. The keys exist in your local `.env.local` but GitHub Actions can't read local files — they need the values added as **repository secrets**.

Without these:
- Cron workflows will fail silently every week
- You won't get notified when a provider deprecates a model (which is exactly what caused the Groq `llama-3.3-70b-versatile` → 404 bug Chat 3 just fixed)

---

## The 6 secrets to add

| # | Secret name | Where to copy the value from |
|---|---|---|
| 1 | `GROQ_API_KEY` | Line in `.env.local` starting with `GROQ_API_KEY=` |
| 2 | `GEMINI_API_KEY` | Line in `.env.local` starting with `GEMINI_API_KEY=` |
| 3 | `ANTHROPIC_API_KEY` | Line in `.env.local` starting with `ANTHROPIC_API_KEY=` |
| 4 | `DEEPSEEK_API_KEY` | ⚠️ May not exist yet in `.env.local` — see §4 below |
| 5 | `CLOUDFLARE_ACCOUNT_ID` | Line in `.env.local` starting with `CLOUDFLARE_ACCOUNT_ID=` |
| 6 | `CLOUDFLARE_API_TOKEN` | Line in `.env.local` starting with `CLOUDFLARE_API_TOKEN=` |

---

## Step-by-step

### Step 1 — Get values ready

Open `.env.local` on your machine:
```powershell
notepad C:\Users\Costin\Documents\modulca\.env.local
```

Keep it open — you'll copy from here into GitHub, one value at a time.

### Step 2 — Open GitHub Secrets page

Go to: https://github.com/TCSN161/modulca/settings/secrets/actions

(Direct link to the Secrets & variables → Actions page for your repo.)

If prompted to log in, do so. You must be the repo owner or admin.

### Step 3 — Add each secret

For each of the 6 secrets:

1. Click **"New repository secret"** (green button, top right)
2. **Name**: paste the exact secret name from the table above (e.g., `GROQ_API_KEY`)
3. **Secret**: paste the VALUE from `.env.local` (everything after `=`, no quotes, no spaces)
4. Click **"Add secret"**
5. Repeat for all 6

**⚠️ Be careful**:
- Secret names must match EXACTLY — case-sensitive. `Groq_Api_Key` won't work.
- Values should have NO leading/trailing spaces. GitHub trims some, but don't rely on it.
- Once saved, GitHub NEVER shows the value again. If you make a typo, delete and recreate.

### Step 4 — Verify

Go to the Actions tab: https://github.com/TCSN161/modulca/actions

You should see both workflows listed:
- `engines-audit`
- `engines-model-check`

Click one → **"Run workflow"** (manual trigger to test now, don't wait for Mon/Sun):
- Choose branch: `master`
- Click green **"Run workflow"** button
- Wait 1-2 min

**Success**: workflow turns green ✅. Secrets are working.  
**Fail**: workflow red ❌. Click into the failed run to see which secret is missing/wrong → go back to §3 and fix.

---

## 4. DEEPSEEK_API_KEY — if not in `.env.local` yet

DeepSeek is new to our stack (adopted per `MCA-STRAT-AI-DELEGATION-2026-11-19`). You may not have signed up yet.

**Option A — Skip for now** (recommended if you're busy):
- Still add the other 5 secrets
- Add `DEEPSEEK_API_KEY=placeholder-skip` to the secrets so workflows don't fail
- When you sign up for real, come back and update it

**Option B — Sign up now** (5 min):
1. Go to https://platform.deepseek.com/
2. Sign up with Google or email
3. Verify email
4. API Keys → Create new key → copy
5. Add to both `.env.local` AND GitHub secrets
6. Bonus: new accounts get $5 trial credit (enough for ~30M tokens of experimentation)

---

## 5. Security notes

**While adding secrets**:
- 🚫 DON'T screenshare or stream your screen (secrets appear in plaintext as you type)
- 🚫 DON'T paste values into chat (including this chat, email, Slack) — GitHub UI only
- 🚫 DON'T commit `.env.local` to git (already gitignored, but double-check with `git status` — should not list `.env.local`)
- ✅ DO use the GitHub UI exclusively for Settings → Secrets

**After adding**:
- GitHub stores them encrypted at rest
- Only GitHub Actions workflows can read them (not visible to repo collaborators unless they modify a workflow)
- If a key leaks, immediately rotate it at the provider + update both `.env.local` and GitHub secret

---

## 6. When done

Zi-mi "GitHub secrets done" aici în chat, sau fă un commit gol de notificare:

```powershell
git commit --allow-empty -m "chore(ci): github secrets configured for engines-audit + engines-model-check"
git push
```

Chat 3 va vedea commitul și va ști că cron-urile sunt active. Nu mai trebuie să faci nimic după.

---

## 7. Fallback dacă nu reușești acum

Nu-i blocant pentru lansare. Cron-urile verifică starea engine-urilor săptămânal — dacă nu rulează 1-2 săptămâni, nu se strică nimic. Doar că Chat 3 nu primește alertele automate și trebuie să mai facem manual `npm run engines:audit` periodic.

Dacă ești obosit, fă doar primele 3 secrete (GROQ, GEMINI, ANTHROPIC) — alea fac să ruleze majoritatea workflow-ului. Cloudflare + DeepSeek pot aștepta 1-2 zile.

---

*Generated by MAIN chat 2026-11-19. Chat 3 kicked ITEM-2 to MAIN; MAIN kicks to Costin via this doc.*
