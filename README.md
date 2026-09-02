# ALBA US

**Literacy coaching in the classroom, powered by the evidence teachers already generate.**

ALBA is a pedagogical intelligence layer for early literacy. It does not replace the
curriculum a district adopted, and it does not teach children. It sits on top of whatever
program the teacher already uses and answers the question no one else answers: **what do I
do tomorrow with the six students who did not get there today.**

This is the California adaptation. The system it comes from has been running in real
classrooms since 2025.

---

## Why this exists

California passed AB 1454 in October 2025 and put **$480 million** behind early literacy,
including $200 million for teacher professional development. Universal screening for risk
of reading difficulties is now mandatory in K through grade 2.

The policy created the obligation to **detect**. It did not resolve what happens next.
Policy Analysis for California Education, reviewing the rollout, put it plainly:

> "The policy also lacks mechanisms for statewide data collection to monitor effectiveness
> across diverse contexts."

Screeners tell a district which children are at risk. Adopted curricula give teachers a
lesson for the whole class. Professional development programs teach the research in
workshops held outside the classroom. **None of the three talk to each other**, and the
teacher is left to connect them alone, every day.

ALBA is that connection.

---

## What it does

A teacher teaches her lesson, from her own program. Then she does one thing: she marks
which students met the target and which did not. Thirty seconds.

From that single input, ALBA returns:

- **The standard** the lesson maps to, from the California CCSS or the PTKLF for TK
- **Two minutes of teaching guidance** before the lesson: how the skill develops, the
  sequence, the mistake students typically make, and what to watch for during class
- **Small groups already formed**, by the specific skill each child is missing, not by
  general level, following the state guidance that says exactly that
- **A reinforcement activity** per group, with its own micro training and the researcher
  behind it
- **English learner scaffolding** differentiated by proficiency level

And every time an intervention works or fails, that result travels to the network.

---

## How it is built

The design principle is simple and it is enforced in the schema, not in a prompt:

> **Code decides. AI writes.**

The pedagogical territory lives in tables, not in prompt strings. Every activity is
anchored to a real standard through a foreign key: an activity referencing a standard that
does not exist **cannot be inserted**. When a model proposes a classification, the database
either accepts it or rejects it. There is no step where a language model decides what is
pedagogically valid.

Small group formation involves **no AI at all**. Groups come from recorded evidence;
guidance comes from tables.

### Data model

| Table | What it holds |
|---|---|
| `standards` | 96 official standards, TK through grade 3, from CCSS ELA and the California PTKLF |
| `activities` | The pedagogical repertoire, including 10 classroom practices published by the State Board in the ELA/ELD Framework |
| `teaching_guidance` | How each skill is taught: sequence, common errors, what to look for, EL cautions. Covers all 96 standards |
| `seguimiento` | Per-student evidence, recorded by the teacher in the flow of teaching |
| `us_foundational_assessments` | Developmental diagnosis using Ehri's orthographic phases and Scarborough's Reading Rope |

### Stack

Next.js 16, React 19, TypeScript, Tailwind. PostgreSQL on Supabase. Deployed on Vercel.

---

## Where the content comes from

Nothing in the pedagogical layer was invented for this repository. Sources:

- **Common Core State Standards for ELA**, California
- **California Preschool/Transitional Kindergarten Learning Foundations** (PTKLF)
- **ELA/ELD Framework, Chapter 3**, adopted by the California State Board of Education
- **Resource Guide to the Foundational Skills of the California CCSS**, CDE
- **Literacy Content Blocks TK–5**, CDE, 2025

The research base is the one California itself cites: Ehri, Moats, Brady, Spear-Swerling,
Beck and McKeown, Duke, Scarborough, Gibbons, August and Shanahan.

---

## A note on the Spanish in this codebase

Table names, routes and comments are in Spanish. That is not an oversight and we are not
hiding it.

ALBA was built in Buenos Aires and has been in daily use in real classrooms since 2025,
with teachers recording evidence every day and a school paying for it. This repository is
the adaptation of a working system, not a prototype written to look like one. The Spanish
is the fingerprint of an engine that already survived contact with actual teachers, which
is the hardest test any education product faces.

The pedagogical content, the standards and the teaching guidance are fully Californian.
The plumbing kept its accent.

---

## Status

The data layer, the pedagogical territory and the grouping engine are complete and tested.
The interface is being translated. This is an active build.

---

**ALBA · Alfabetización Basada en Acompañamiento**
Founded by Mariana Orgueira, teacher and school principal for nearly thirty years.
