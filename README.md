# NFL Swing Dashboard

Publish `index.html` with GitHub Pages. **Highlight Top 4** begins with the four contextual priority games. After **Run AI Second Signal**, it re-ranks using the largest confidence-adjusted model/market gaps.

The static page contains no OpenAI API key. Deploy `api-worker.js` as a Cloudflare Worker, store `OPENAI_API_KEY` as an encrypted secret, and restrict `ALLOWED_ORIGIN` to the final Pages origin. Paste the Worker URL into **AI Setup** once.

Each click sends one slate-wide Responses API request using `gpt-5.6-luna`, low reasoning effort, structured JSON, and `store: false`. Nothing recalculates continuously.

