# Mentor Connect (prototype)

A working prototype of a platform that helps students get unstuck in their careers by matching them with the right mentor.

**Flow:** a student describes a career problem to an assistant → gets mentors from the Mesa mentor list → requests a call → the call happens outside the app → the student adds notes and gets a clear write-up with next steps.

## Run it

Static site plus one serverless function, no build step.

```bash
npm i -g netlify-cli
cp .env.example .env        # add your GEMINI_API_KEY
netlify dev                 # http://localhost:8888
```

Opening `index.html` directly also works, but without the function the app uses its non-AI fallbacks (keyword matching, and an organised copy of the student's notes).

## Deploy (Netlify)

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import an existing project**, pick the repo. Build settings are read from `netlify.toml`.
3. **Project configuration → Environment variables:** add `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`). Get a key free from Google AI Studio.
4. Redeploy. Keep an eye on usage, since the site is public.

## Structure

```
index.html                  the whole app (HTML, CSS, JS) incl. curated mentor data
netlify/functions/ai.js     server-side proxy to the AI model
netlify.toml                Netlify config
```

## Key decisions

- **AI proposes, code verifies.** The model sees the mentor list and returns mentor IDs. Every ID is validated against the list, "matched on" tags are kept only if the value really exists on that profile, and cards are rendered from data, never from model text. The model cannot invent a mentor or a credential.
- **Say "unknown", don't guess.** Missing fields show as not in list. Thin profiles carry a "Limited profile" tag and are down-weighted.
- **Booking is a request.** The list has no availability data, so students offer up to 3 times; the mentor confirms and shares the call link. Confirmation is simulated by the dashed prototype controls.
- **Write-up only from the student's notes.** The call is off-platform, so there is no transcript. AI-suggested actions are labelled, a confidence level is shown, and unanswered questions are listed.
- **Privacy.** Mentor emails, phones and LinkedIn URLs from the source sheet are not loaded into the app. Chat text is not stored.

## Awkward cases handled

Vague input (max 2 clarifying questions per round, 2 rounds) · no mentor fits (stated plainly, at most one caveated "closest") · off-topic requests · distress or self-harm (keyword check before any AI call, helpline pointer, no matching) · prompt injection and contact-detail requests · thin or duplicated mentor data · mentor doesn't confirm · call didn't happen · notes too thin · AI unavailable (non-AI fallbacks).

## Mentor data

Curated from `Mentor_Sample_50_Anonymised`: 52 rows, 50 unique mentors (M013 and M023 were repeated). City spellings and TRUE/Yes/Y variants were normalised. Some cells were ambiguous in the export, so a few fields (for example AI-native status) may need checking against the original sheet.

## Left out / next

Accounts and roles, a Mesa team dashboard, real availability and calendar sync, reminders, a mentor-side view, an eval set for matching, and richer mentor data.

## How AI was used to build this

_Add your own account: what you asked, what you changed or rejected, what you verified by hand._
