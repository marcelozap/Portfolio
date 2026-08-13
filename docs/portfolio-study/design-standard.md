# Design Standard

This file defines the working design standard for the portfolio.

## Site Character

The portfolio should feel:

- Professional
- Systems-oriented
- Calm but alive
- Technically credible
- Personal without becoming overly casual
- Project-forward instead of self-promotional

Avoid:

- Generic SaaS hero styling
- Overly large marketing cards
- Excess decoration that does not explain the work
- One-note color themes
- Claims that sound bigger than the project proof

## Layout

Use compact, structured sections.

Preferred patterns:

- Fixed top nav
- Wide but constrained content
- Dense project cards
- Modal detail views for project depth
- Code/data/product language supported by concrete project details

Rules:

- Do not let modal content sit under the fixed navbar.
- Do not let text touch crop boundaries.
- Keep buttons and tags stable in size.
- Use responsive constraints rather than viewport-scaled text.
- Avoid nested cards unless the inner card is a repeated item or modal detail.

## Typography

Use the current font system and Tailwind classes.

Guidelines:

- Big display type belongs to hero and project titles.
- Small mono tags are for metadata, systems labels, and project status.
- Body copy should stay direct, readable, and restrained.
- Avoid negative letter spacing.
- Keep button text short.

## Color

Base:

- Blue-black background
- White or near-white ink
- Muted blue-gray secondary text
- Cyan accent
- Warm amber accent for Rally

Use accent colors to explain project identity, not just decorate.

## Motion

Motion should show systems, signals, paths, or practice loops.

Good motion:

- Rally ball/path movement
- GATEKPT.AI learning-path movement
- Subtle hover lifting or border activation
- Slow moving data/system signals

Avoid:

- Motion that causes layout shift
- Decorative motion with no meaning
- Fast animation near text-heavy areas

## Project Visuals

Small card visuals live in:

`src/components/projects/ProjectCard.tsx`

Large modal visuals live in:

`src/components/projects/ProjectVisual.tsx`

Rally visual standard:

- Warm amber practice surface
- Clear court or movement path
- Animated practice signal
- HUD text must be fully visible

GATEKPT.AI visual standard:

- AI learning map from infrastructure to deployment
- Cyan/blue base with violet secondary signal
- Movement path similar in energy to Rally
- Public label must read `GATEKPT.AI`

Green Machine visual standard:

- Research terrain, evidence, review, risk
- Green signal language
- No implication of financial advice or trade execution

## Public Copy

Copy should emphasize:

- Software engineering
- Data systems
- Research workflows
- QA automation
- Product thinking
- AI learning and evaluation
- Sound/music as a serious creative systems layer

Avoid:

- Employer confidential details
- Unsupported metrics
- Financial recommendations
- Claims that imply managed accounts or production trading execution
