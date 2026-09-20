# NFL Swing Dashboard

Publish `index.html` with GitHub Pages. **Highlight Top 4** begins with the four contextual priority games. After **Run AI Second Signal**, it re-ranks using the largest confidence-adjusted model/market gaps.

The static page contains no OpenAI API key. Deploy `api-worker.js` as a Cloudflare Worker and store both `OPENAI_API_KEY` and a long random `DASHBOARD_TOKEN` as encrypted secrets. The Worker accepts browser traffic only from the published GitHub Pages origin, and the paid AI route also requires the private token. Paste the Worker URL and dashboard token into **Data + AI Setup** once; they remain in that browser.

The Worker also provides the dashboard's read-only `/kalshi` route. It fetches the public `KXNFLGAME` series, filters to the eight dashboard games, and requires no Kalshi credentials. Live bid/ask prices refresh every 10 seconds. **Apply Kalshi Odds** normalizes each game's two midpoint prices to 100% and moves the dashboard sliders; manual adjustment remains available afterward.

Each click sends one slate-wide Responses API request using `gpt-5.6-luna`, low reasoning effort, structured JSON, and `store: false`. Nothing recalculates continuously.

