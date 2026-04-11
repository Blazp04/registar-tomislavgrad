---
name: product-planning
description: '**WORKFLOW SKILL** — Structure a project idea into a product brief and feature list. Generates output in project-planning/ folder.'
argument-hint: 'Describe your project idea — can be vague, a few sentences is enough'
---

# Product Planning Workflow

Structure a project idea into actionable planning documents. Keep everything concise — bullet points over paragraphs.

## Output

All output goes to `project-planning/`:

- `product-brief.md` — Core product definition
- `gemini-research-prompt.md` — Prompt for Gemini Deep Research
- `features.md` — Feature list with priorities
- `epics/[name].md` — Epic breakdowns (post-research)

## Phase 1: Extract the Idea

Use ask-questions tool. Get these from the user (skip what's obvious):

1. **Problem**: What problem? Who has it?
2. **Users**: Primary and secondary users
3. **Key Features**: 3-5 must-haves
4. **Out of Scope**: What's NOT included?
5. **Domain**: Industry, regulations, constraints?

Don't over-interview. If the user gave enough info, move on.

## Phase 2: Product Brief

Create `project-planning/product-brief.md`:

```markdown
# [Product Name]

## Problem
[2-3 sentences max]

## Users
- **Primary**: [who] — [needs]
- **Secondary**: [who] — [needs]

## Core Features
| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | ...     | ...         | Must-have|

## In Scope
- [bullet list]

## Out of Scope
- [bullet list]

## Domain Context
[Only if relevant — regulations, constraints, terminology]
```

## Phase 3: Gemini Research Prompt

Create `project-planning/gemini-research-prompt.md` — a prompt for Gemini Deep Research covering:

1. Domain challenges & regulations
2. Competitors (features, pricing, gaps)
3. User expectations & pain points
4. Technical considerations
5. MVP feature recommendations

Keep the prompt focused. Include product context from the brief.

## Phase 4: Feature List

Create `project-planning/features.md`:

```markdown
# Features: [Product Name]

**P0** = MVP | **P1** = v1.1 | **P2** = Future | **P3** = Wishlist

### [Category]
| ID | Feature | Priority | Complexity |
|----|---------|----------|------------|
| F-001 | ... | P0 | Medium |
```

## Post-Research Phase

After Gemini results come back, user can invoke again to:
1. Update brief with insights
2. Create `project-planning/epics/[name].md`:

```markdown
# Epic: [Name]
**Goal**: [one sentence]
**Priority**: P0
**Depends on**: None

## Stories
- As a [user], I want [action] so that [benefit]

## Acceptance Criteria
- [ ] [Criterion]

## Tasks
| # | Task | Type | Depends On |
|---|------|------|------------|
| 1 | ... | Backend | - |
```

## Principles

- **Concise over thorough** — bullet points, not essays
- **Ask only what's missing** — don't re-ask what the user already said
- **Move fast** — generate docs, let user refine
