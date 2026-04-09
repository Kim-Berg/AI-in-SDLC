# Demo Guide — AI in the SDLC with GitHub Copilot Agents

**Session**: 45-60 min | **Audience**: Developers | **Level**: Advanced  
**Presenters**: You + your co-presenter  
**Tech stack**: TypeScript, Node.js, React, Prisma

---

## Setup checklist (before the session)

- [ ] Clone the repo and run `npm install`
- [ ] Run `npx prisma generate && npx prisma db push && npx prisma db seed` (in `apps/api`)
- [ ] Start API: `cd apps/api && npm run dev`
- [ ] Start web: `cd apps/web && npm run dev`
- [ ] Open VS Code with the repo root as workspace
- [ ] Verify Copilot Chat is enabled (Agent, Plan, and Ask modes visible)
- [ ] Have GitHub Issues #42 (product search) and #43 (wishlist) ready
- [ ] Set VS Code font size to 16+ for projector visibility

---

## Narrative arc

| # | Phase | SDLC Stage | Demo | Agent type shown | Time |
|---|-------|-----------|------|-----------------|------|
| 1 | Intro | — | Slides: What are Copilot agents? Agent loop explained | — | 5 min |
| 2 | Demo 1 | Planning | Use **Plan** agent to break down Issue #42 | Built-in (Plan) | 7 min |
| 3 | Demo 2 | Coding | Use **@tdd** custom agent for product reviews feature | Custom agent + subagents | 10 min |
| 4 | Demo 3 | Coding | Use **Agent mode** to add discount code to cart | Built-in (Agent) | 8 min |
| 5 | Demo 4 | Testing & Review | Use **@reviewer** agent + hooks in action | Custom agent + hooks | 7 min |
| 6 | Demo 5 | Full feature | Use **@feature-builder** for admin dashboard scaffold | Custom coordinator agent | 8 min |
| 7 | Demo 6 | CI/CD | Show **Copilot coding agent** (cloud) handling a PR | Cloud agent | 5 min |
| 8 | Wrap-up | — | Recap: agent types, customisation, SDLC coverage | — | 5 min |

---

## Demo 1 — Planning with Plan Agent (7 min)

**SDLC stage**: Requirements → Planning  
**Agent type**: Built-in Plan agent  
**Presenter**: A

### Steps

1. Open Copilot Chat → switch to **Plan** mode.
2. Paste: _"Plan the implementation of GitHub Issue #42: Add product search to the storefront. The search should work across product names and descriptions, with a search bar in the header."_
3. Walk through the generated plan — highlight how it identifies files to create/modify.
4. Show plan editing — add or remove a step.
5. Point out: "This is the **Planning** stage of the SDLC, powered by an AI agent."

### Talking points
- Plan agent creates a step-by-step implementation plan without writing code.
- Plans can be edited, shared, and executed later.
- Great for breaking down issues before a sprint.

---

## Demo 2 — TDD with Custom Subagents (10 min)

**SDLC stage**: Development (test-first)  
**Agent type**: Custom agents with subagent orchestration  
**Presenter**: B

### Steps

1. Show the `.github/agents/` folder — explain the 4 TDD agents.
2. Open Copilot Chat → type: _"@tdd Add a product reviews feature. Customers can submit a 1-5 star rating and text review for any product. Reviews appear on the product detail page."_
3. Watch the orchestration:
   - **TDD agent** plans the slices.
   - **Red agent** writes a failing test (e.g., `GET /api/products/:id/reviews` returns 200).
   - **Green agent** implements the Prisma model + route to pass the test.
   - **Refactor agent** cleans up.
4. Show the terminal output — tests going red → green.
5. Show the generated code: Prisma schema change, new route, new test.

### Talking points
- Custom agents are defined in `.agent.md` files — version-controlled with your repo.
- Subagents enable **separation of concerns** in AI workflows.
- The `user-invocable: false` flag keeps internal agents hidden from the chat UI.
- TDD is a natural fit for agent orchestration: each phase has clear boundaries.

---

## Demo 3 — Agent Mode for Feature Implementation (8 min)

**SDLC stage**: Development (feature work)  
**Agent type**: Built-in Agent mode  
**Presenter**: A

### Steps

1. Switch Copilot Chat to **Agent** mode.
2. Prompt: _"Add a discount code field to the cart page. The API should validate codes against a hardcoded list: ZAVA10 (10% off), ZAVA20 (20% off). Show the discount and updated total on the cart page."_
3. Let the agent work — it will:
   - Create a discount validation route.
   - Modify the cart API to accept a discount code.
   - Add a text input + "Apply" button to `CartPage.tsx`.
   - Update the total calculation.
4. Accept/reject individual changes as they appear.
5. Run `npm test` to show existing tests still pass.

### Talking points
- Agent mode has full tool access: file editing, terminal, search.
- The **agent loop**: plan → tool call → observe → plan → repeat.
- `copilot-instructions.md` guides the agent's coding style.
- Show how the Vite proxy and API work together seamlessly.

---

## Demo 4 — Code Review & Hooks (7 min)

**SDLC stage**: Review & Quality  
**Agent type**: Custom agent + lifecycle hooks  
**Presenter**: B

### Steps

1. Show `.github/hooks/quality.json` — explain the three hooks:
   - **PostToolUse**: Auto-format with Prettier after each file edit.
   - **PreToolUse**: Block destructive terminal commands.
   - **Stop**: Run full test suite before agent completes.
2. Prompt: _"@reviewer Review the changes made in the last two demos (product reviews and discount codes)."_
3. Show the reviewer output: file-by-file feedback with severity labels (🔴🟡🟢).
4. If the reviewer finds issues → fix them, demonstrating the feedback loop.
5. Try typing `rm -rf /` in a terminal step to show the PreToolUse hook blocking it.

### Talking points
- Hooks are **guardrails** — prevent mistakes before they happen.
- Custom review agents encode your team's quality standards.
- Hooks run automatically in the agent loop — no manual intervention.
- This is the **Code Review** stage of the SDLC, automated and consistent.

---

## Demo 5 — Full Feature with Feature Builder (8 min)

**SDLC stage**: End-to-end delivery  
**Agent type**: Custom coordinator agent (multi-agent)  
**Presenter**: A

### Steps

1. Prompt: _"@feature-builder Build an admin dashboard at /admin that shows: total products, total users, recent orders (last 5). Include an API route GET /api/admin/stats (admin-only) and a simple React page."_
2. Watch the feature-builder orchestrate:
   - Plans the vertical slices.
   - Delegates to **@tdd** for each slice.
   - Calls **@reviewer** for quality gate.
3. Show the result: new API route, new admin page, tests, all passing.

### Talking points
- Coordinator agents can compose other agents into workflows.
- The `agents:` field in the frontmatter declares dependencies.
- This is the closest to an **autonomous developer** — plans, builds, tests, reviews.
- In real projects, this pattern scales to complex features.

---

## Demo 6 — Copilot Coding Agent (Cloud) (5 min)

**SDLC stage**: CI/CD & Maintenance  
**Agent type**: Cloud agent (Copilot coding agent)  
**Presenter**: B

### Steps

1. Open GitHub in the browser → navigate to Issue #43 (wishlist feature).
2. Assign the issue to **Copilot**.
3. Show Copilot creating a branch and working in a cloud environment.
4. Switch to the PR that Copilot creates — show the diff.
5. Point out: it runs in a **firewalled VM**, uses the repo's `.github/copilot-instructions.md` and agents.

### Talking points
- Cloud agents work **asynchronously** — assign and walk away.
- They use the same customisation files as local agents.
- Great for well-scoped issues: bug fixes, refactors, feature additions.
- The agent creates a PR, runs CI, and you review the result.

---

## Wrap-up (5 min)

### Key messages

1. **Agent types recap**:
   - **Built-in** (Agent, Plan, Ask) — general-purpose, no setup needed.
   - **Custom** (`.agent.md`) — encode team workflows, version-controlled.
   - **Cloud** (Copilot coding agent) — async PR generation.
   - **Third-party** (Claude Code, OpenAI Codex) — bring other models in.

2. **Agent loop**: Every agent follows the same loop: understand → plan → act (tool use) → observe → repeat.

3. **Customisation layers**:
   - `copilot-instructions.md` — coding standards.
   - `.agent.md` files — specialised workflows.
   - `hooks/` — guardrails and automation.
   - Subagents — composable agent architectures.

4. **SDLC coverage**: Planning → Development → Testing → Review → Deployment — agents touch every stage.

### Call to action
- Start with `copilot-instructions.md` — immediate value, zero risk.
- Add one custom agent for your team's most common workflow.
- Experiment with hooks for automated formatting and quality gates.

---

## Fallback prompts (if demos go wrong)

| Demo | Fallback |
|------|----------|
| Plan agent hangs | Switch to Ask mode and manually outline the plan |
| TDD agent confusion | Run the Red/Green/Refactor prompts manually in Agent mode |
| Hook doesn't trigger | Show the JSON config and explain what it would do |
| Cloud agent slow | Show a pre-recorded GIF or screenshot of the PR |

---

## Repo state after all demos

```
git log --oneline
abc1234 feat(web): add admin dashboard (Demo 5)
def5678 feat(api): add discount codes (Demo 3)
ghi9012 feat(api): add product reviews with TDD (Demo 2)
jkl3456 chore: initial Zava storefront setup
```
