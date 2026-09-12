# 🌤️ Weather Dashboard Application

A full-stack weather dashboard built with **Node.js + Express** (backend) and
**HTML/CSS/JavaScript** (frontend). Users can search for any city and see
its current weather conditions, powered by the free **Open-Meteo** public API
(no API key required).

---

## ✅ Requirements Covered

| Requirement | How it's implemented |
|---|---|
| Public weather API | [Open-Meteo](https://open-meteo.com/) Geocoding + Forecast APIs |
| Display current weather | Temperature, condition, wind speed/direction, last updated time |
| Search by city | Search form → backend `/api/weather?city=` endpoint |
| Error handling for invalid inputs | Empty input, invalid characters, city not found, API/network failures — all handled with clear messages on both frontend and backend |
| Async programming | `async/await` + `fetch()` used on both backend (calling Open-Meteo) and frontend (calling our backend) |

---

## 🗂️ Project Structure

```
weather-dashboard/
├── backend/
│   ├── server.js        # Express server + API proxy + error handling
│   └── package.json
├── frontend/
│   ├── index.html        # UI structure (used with backend, run locally)
│   ├── style.css          # Styling
│   └── script.js         # Fetch logic -> calls OUR backend /api/weather
├── docs/                  # Static version for GitHub Pages (no backend)
│   ├── index.html
│   ├── style.css
│   └── script.js         # Fetch logic -> calls Open-Meteo API directly
├── COMMIT_MESSAGES.md    # Sample AI-assisted commit message documentation
├── .gitignore
└── README.md
```

---

## ▶️ How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher (has built-in `fetch`)
- npm (comes with Node.js)

### Steps

1. **Unzip** the project and open a terminal inside the `weather-dashboard` folder.

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   You should see:
   ```
   Weather Dashboard server running at http://localhost:5000
   ```

4. **Open the app in your browser:**
   ```
   http://localhost:5000
   ```
   The backend also serves the frontend automatically — you don't need a
   separate frontend server.

5. **Search any city** (e.g. "Chennai", "London", "Tokyo") and press
   **Search** to see live weather data. Try an invalid input (empty box, or
   something like `12345`) to see the error handling in action.

> Change the port by setting an environment variable: `PORT=3000 npm start`

---

## 🧪 Testing Error Handling

| Try this input | Expected result |
|---|---|
| Empty search box | "Please enter a city name." |
| `12345` or symbols | "City name can only contain letters..." |
| `Xyzzzqwerty` (fake city) | "Couldn't find a city named..." (404) |
| Turn off internet, then search | "Unable to reach the server..." |

---

## 🤖 AI-Assisted Development (per assignment requirements)

This project was built with AI assistance in the following ways:

1. **AI-assisted API integration** — AI helped scaffold the Express route
   that chains two Open-Meteo calls (geocoding → forecast) using
   `async/await`, and mapped WMO weather codes to readable descriptions.
2. **AI-supported debugging and error analysis** — AI reviewed the
   request/response flow to identify edge cases: empty city input, invalid
   characters, city-not-found, upstream API failures, and network errors —
   and suggested the corresponding HTTP status codes (400, 404, 502, 500).
3. **AI-generated commit messages and documentation** — See
   [`COMMIT_MESSAGES.md`](./COMMIT_MESSAGES.md) for a sample commit history
   with AI-generated messages, and this README itself was drafted with AI
   assistance.

---

## 🚀 Pushing to GitHub

From inside the `weather-dashboard` folder:

```bash
# 1. Initialize git (skip if already a repo)
git init

# 2. Add all files
git add .

# 3. Make your first commit
git commit -m "Initial commit: Weather Dashboard with Express backend and vanilla JS frontend"

# 4. Create a new empty repository on GitHub (via github.com → New repository)
#    Do NOT initialize it with a README there — copy its remote URL, then:
git remote add origin https://github.com/<your-username>/weather-dashboard.git

# 5. Push
git branch -M main
git push -u origin main
```

For subsequent changes:
```bash
git add .
git commit -m "your message here"
git push
```

See [`COMMIT_MESSAGES.md`](./COMMIT_MESSAGES.md) for example commit messages
you can reuse as you build on this project.

---

## 🌐 Deploying to GitHub Pages

> **Important:** GitHub Pages only serves **static files** (HTML/CSS/JS) —
> it cannot run the Node.js/Express `backend/`. For this reason, the
> `docs/` folder contains a **static version** of the app where the same
> API-integration logic (geocoding → forecast, error handling) runs
> **directly in the browser** instead of through the Express server.
> Open-Meteo's APIs support CORS, so this works without any backend.
>
> The `backend/` + `frontend/` folders remain in the repo to demonstrate
> the full-stack (client-server) version when run locally (see "How to
> Run Locally" above). `docs/` is only for the live public demo.

### Steps

1. Push your project to GitHub (see below if not done yet).
2. On GitHub, go to your repository → **Settings** → **Pages** (left
   sidebar, under "Code and automation").
3. Under **Build and deployment** → **Source**, choose **"Deploy from a
   branch"**.
4. Under **Branch**, select **`main`** and folder **`/docs`** → click
   **Save**.
5. Wait 1–2 minutes. GitHub will show a green banner with your live URL:
   ```
   https://<your-username>.github.io/weather-dashboard/
   ```
6. Open that URL — your Weather Dashboard is now live for anyone to use.

### Updating the live site later

Any time you edit files inside `docs/`, commit and push — GitHub Pages
redeploys automatically:
```bash
git add docs/
git commit -m "docs: update static site for GitHub Pages"
git push
```

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, native `fetch`
- **Frontend:** HTML5, CSS3, vanilla JavaScript (`async/await`, `fetch`)
- **External API:** Open-Meteo (Geocoding + Forecast), free & keyless
- **Learning outcomes:** asynchronous programming, REST API integration,
  client-server architecture, error handling
