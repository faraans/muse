# Muse

A music discovery app powered by the Spotify API.

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/faraans/muse.git
cd muse
```

### 2. Install dependencies
```bash
# Frontend
npm install

# Backend
cd backend && npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```

Then fill in your Spotify credentials. You can get these by creating an app at [developer.spotify.com](https://developer.spotify.com/dashboard).

In your Spotify app settings, add the following redirect URI:
```
http://127.0.0.1:8000/callback
```

### 4. Run the app

Open two terminals:

```bash
# Terminal 1 — frontend (from project root)
npm run dev

# Terminal 2 — backend
cd backend && npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.
