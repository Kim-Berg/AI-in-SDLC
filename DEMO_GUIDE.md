# Demo Guide — AI in SDLC with GitHub Copilot Agents

**Session**: 55 min  
**Audience**: Hands-on developers  
**Presenters**: Presenter A + Presenter B  
**Repo**: `zava-storefront`  
**Tech stack**: TypeScript monorepo, Express, Prisma, React, Vite, Vitest

## Session Goal

Demonstrate GitHub Copilot agents across the full SDLC using a realistic e-commerce codebase with enough existing functionality that the live demos extend real code instead of scaffolding from zero.

## Pre-seeded Demo Assets

- Working product listing + products API
- Basic cart flow
- JWT authentication
- 25 passing tests across API and web
- Admin layout stub
- Email service stub
- Custom agents in `.github/agents/`
- Workspace hooks in `.github/hooks/quality.json`

## Session Structure

| # | Demo | Presenter | Duration | SDLC Phase | Agent Type |
|---|------|-----------|----------|------------|------------|
| — | Opening: agent types overview, agent loop concept, permission levels | A | 5 min | Concepts | — |
| 1 | Plan Agent: design a review & rating system | A | 7 min | Requirements → Design | Local — Plan |
| 2 | Agent Loop: hand off plan to Agent, build the feature live | A | 10 min | Implementation | Local — Agent |
| 3 | Custom Agents + Hooks + Subagents: TDD workflow with Red/Green/Refactor subagents, automated quality gates | B | 10 min | Implementation + Quality | Custom agents, Hooks, Subagents |
| 4 | Ask Agent: codebase Q&A and security analysis | B | 5 min | Knowledge / Onboarding | Local — Ask |
| 5 | Copilot CLI: background implementation of admin panel + parallel email notifications | B | 8 min | Parallel Development | Copilot CLI (Background) |
| 6 | Cloud Agent: assign GitHub Issue to Copilot, hand off Plan → Cloud, TODO comment assignment | A | 8 min | Code Review + Collaboration | Cloud |
| — | Closing: SDLC recap, call to action | Both | 2 min | Wrap-up | — |

Presenter A owns the flow arc: plan → implement → collaborate.  
Presenter B owns the advanced toolkit: custom agents, quality gates, background work, and Q&A.

## Deployment Workflow

The app is containerized and deployed from the `live-demo` branch. The `main` branch stays clean so the audience can clone it and run locally.

- **Branch**: `live-demo` — auto-deploys on push via GitHub Actions
- **Pipeline**: push → GitHub Actions builds API + Web Docker images → pushes to ghcr.io → deploys to hosting platform
- **Deploy time**: ~2 minutes — use this as a natural Q&A or recap moment during presenter handoffs
- **Images**: `ghcr.io/<owner>/zava-storefront/api` and `ghcr.io/<owner>/zava-storefront/web`

### Presenter Handoff Protocol

Both presenters work against the same deployed app. When handing off, the outgoing presenter must push their changes so the incoming presenter has them both locally and on the deployed instance.

1. **Commit & push** to `live-demo`
2. **Wait for deploy** (~2 min) — fill with audience Q&A or a recap of what was just built
3. **Incoming presenter pulls** `live-demo` and verifies the deployed app reflects the changes
4. **Continue** with the next demo

## Demo 1 — Plan Agent (Presenter A, 7 min)

**Prompt**

> We need to add a product review & rating system to the Zava storefront. Customers can rate 1-5 stars, write text reviews, see aggregate ratings on product cards. Reviews need moderation before publishing.

**Flow**

1. Select the Plan agent in the Chat view.
2. Let the agent explore the codebase and identify the relevant files: Prisma schema, product routes, shared types, product UI, and product detail page.
3. Answer clarifying questions if the agent asks about moderation rules, anonymous reviews, or aggregate display.
4. Review the generated plan and highlight schema changes, API endpoints, UI components, moderation workflow, and verification steps.

**Talking points**

- Plan before you build.
- The agent researches the actual codebase before producing a plan.
- A useful plan becomes an asset you can hand off to implementation or the cloud.

## Demo 2 — Agent Loop (Presenter A, 10 min)

**Flow**

1. Hand off from Plan to Agent with **Start Implementation**.
2. Show the loop in real time: read plan → edit shared types → add API route → run build/tests → self-correct type errors → add a React component.
3. Pause on inline diffs and checkpoints.
4. Show the tools panel so the audience can see the tool usage pattern.

**Talking points**

- The agent loop is iterative: plan → act → observe → adapt.
- Copilot uses repo context, tool feedback, and errors to self-correct.
- This is not generate-and-paste; it is execution with feedback.

### Handoff A → B

Presenter A commits the review system and pushes to `live-demo`. While the deploy runs (~2 min), recap what the agent built and take audience questions. Presenter B pulls `live-demo` and verifies the deployed app shows the new review features before starting Demo 3.

## Demo 3 — Custom Agents + Hooks + Subagents (Presenter B, 10 min)

### 3a. TDD workflow with subagents

Show `.github/agents/tdd.agent.md` and explain the Red → Green → Refactor orchestration.

**Prompt**

> @tdd Add input validation for review text — min 10 chars, max 2000, no HTML tags.

**Expected flow**

1. Red subagent writes a failing test.
2. Green subagent implements the minimum validation.
3. Refactor subagent cleans up.
4. Tool calls appear as nested, collapsible subagent activity in chat.

### 3b. Hooks and quality gates

Show `.github/hooks/quality.json` and explain the three hooks:

- `PostToolUse`: runs Prettier after file edits
- `PreToolUse`: blocks dangerous terminal commands
- `Stop`: prevents the agent from finishing before tests pass

**Live action**

1. Trigger a normal edit so the formatting hook runs.
2. Try a clearly dangerous terminal command to show the block.
3. Let the session hit the Stop hook and continue until tests pass.

**Talking point**

Instructions guide. Hooks enforce.

## Demo 4 — Ask Agent (Presenter B, 5 min)

**Prompt 1**

> How does the cart system work? Walk me through the data flow from add-to-cart click to API persistence.

**Prompt 2**

> What are the security considerations for the review system we just built?

**Talking points**

- Ask mode behaves like an always-available senior developer who reads the code.
- Good answers follow imports, routes, shared types, and data flow.
- Security analysis is more useful when it references the real implementation.

## Demo 5 — Copilot CLI (Presenter B, 8 min)

Run two background sessions with worktree isolation.

**CLI Prompt A**

> Add a review moderation admin panel — list pending reviews, approve/reject buttons, filter by product.

**CLI Prompt B**

> Add email notification when a review is approved.

**Talking points**

- Background agents work while you keep coding.
- Parallel sessions are useful when the work is independent.
- Worktree isolation keeps the experiments reviewable.

### Handoff B → A

Presenter B commits and pushes to `live-demo`. While the deploy runs (~2 min), recap the custom agents and CLI workflow. Presenter A pulls `live-demo` and verifies the deployed app before starting Demo 6.

## Demo 6 — Cloud Agent (Presenter A, 8 min)

### 6a. Assign GitHub Issue #1 to Copilot

Use the prewritten issue template for product search. Show Copilot picking up the issue, creating a branch, implementing the work, and opening a PR.

### 6b. Plan → Cloud handoff for wishlist

Start with a new local Plan session for the wishlist feature, then continue in Cloud so the audience sees the local-to-cloud handoff.

### 6c. TODO assignment

Use the inline comment sentinel in the review flow and show how a `TODO(copilot)` comment can be handed off directly from the editor.

**Talking points**

- Cloud agents are a team multiplier.
- Plan locally, execute in the cloud, and review via PR.
- Repo customizations apply to both local and cloud execution.

## Preparation Checklist

### Repository & Local Setup

- Create the GitHub repo and add both presenters as collaborators.
- Run `npm install`.
- Run `npm run db:push` and `npm run db:seed`.
- Start the API with `npm run dev:api`.
- Start the web app with `npm run dev:web`.
- Verify Chat modes are available: Ask, Plan, and Agent.
- Verify hooks are enabled in VS Code.
- Use the seeded GitHub issues: #1 for product search and #2 for wishlist.

### Deployment Setup

- Create the `live-demo` branch from `main`.
- Set up the deployment platform and configure auto-deploy from `live-demo`.
- Seed the production PostgreSQL database: `docker compose exec api npx prisma db seed --schema=prisma/schema.docker.prisma`.
- Verify the deployed app is accessible from both presenters' machines.
- Test the full push → deploy → verify cycle at least once from each presenter's machine.
- Share the deployed app URL with both presenters.

### Rehearsal

- Dry-run each demo at least three times.
- Practice the handoff protocol (push → deploy → pull → verify) between presenters.
- Record fallback videos for each live demo.
- Keep browser tabs open to: the deployed app, the repo, GitHub Actions, issues, and PR view.

## Verification

- All 6 demos can be executed sequentially from a clean checkout.
- Plan agent produces a meaningful plan for the review feature.
- Agent loop creates at least one API route and one React component.
- TDD subagent cycle is visibly orchestrated in chat.
- Hooks fire visibly: formatting after edit, Stop hook blocks until tests pass.
- Ask agent explains cart flow with correct file references.
- Copilot CLI runs in background with worktree isolation.
- Cloud agent picks up assigned issues and opens a PR.

## Decisions

- Mention third-party agents in the opening only; keep live demos focused on Copilot-native experiences.
- Use Autopilot permission in Demos 2 and 5 for smoother flow.
- Use Default Approvals in Demo 3 so the audience can see approval UX.
- Keep the pre-seeded monorepo; it is the point of the demo.

## Audience Handout

- The `main` branch contains the clean starting point — audience members clone this to run locally.
- Local setup: `npm install` → `npm run db:push` → `npm run db:seed` → `npm run dev`.
- The deployed version URL can be shared for reference, but the audience should use `main` to experiment.
- The `live-demo` branch contains all changes made during the session.

## Further Considerations

- If time allows, add a short MCP bonus demo.
- Consider making the repo public after the session.
- A small opening/closing slide deck helps anchor the narrative.
