# NFL Swing Dashboard

Publish `index.html` with GitHub Pages. **Highlight Top 4** begins with the four contextual priority games. After **Run AI Second Signal**, it re-ranks using the largest confidence-adjusted model/market gaps.

The static page contains no OpenAI API key. Deploy `api-worker.js` as a Cloudflare Worker, store `OPENAI_API_KEY` as an encrypted secret, and restrict `ALLOWED_ORIGIN` to the final Pages origin. Paste the Worker URL into **Data + AI Setup** once.

The Worker also provides the dashboard's read-only `/kalshi` route. It fetches the public `KXNFLGAME` series, filters to the eight dashboard games, and requires no Kalshi credentials. Live bid/ask prices refresh every 10 seconds. **Apply Kalshi Odds** normalizes each game's two midpoint prices to 100% and moves the dashboard sliders; manual adjustment remains available afterward.

Each click sends one slate-wide Responses API request using `gpt-5.6-luna`, low reasoning effort, structured JSON, and `store: false`. Nothing recalculates continuously.

