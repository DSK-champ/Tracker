# Tracker

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your MongoDB URI
Open `.env` and replace `YOUR_MONGODB_ATLAS_URI_HERE` with your Atlas connection string:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tracker
PORT=3000
```

### 3. Run the server
```bash
npm start
```

Then open `http://localhost:3000` in your browser.

### 4. Access from phone
Find your laptop's local IP (e.g. `192.168.1.5`) and open `http://192.168.1.5:3000` on your phone while on the same WiFi.

### 5. Deploy (for cross-device sync anywhere)
Deploy to **Railway** (free):
1. Push this folder to a GitHub repo
2. Go to railway.app → New Project → Deploy from GitHub
3. Add `MONGO_URI` as an environment variable in Railway dashboard
4. Done — get a public URL that works on any device

---

## MongoDB Collections
- `tasks` — daily task blocks with subtasks, by date
- `sleeps` — sleep log (bedtime, wake time, duration, quality)
- `stresses` — daily stress score + triggers
- `reflections` — end-of-day reflection answers + productivity score

## Academic subcollections (via `collection` field in tasks)
- DSA
- MERN
- Cybersecurity
- Codeforces

## Health subcollections
- gym
- looksmax
- voicemax
- bible
