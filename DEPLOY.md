# Urban Cruise LMS — Backend Deploy to Render (step by step)

The app cannot log in because the backend was only running on your laptop
(`localhost` / a temporary `loca.lt` tunnel). A packaged APK on a phone cannot
reach `localhost`. The fix is to put the backend on a public server (Render) and
point the app at that public URL. Follow these 4 stages.

---

## Stage 1 — Create a free MongoDB database (MongoDB Atlas)

Render does not host MongoDB, so we use Atlas (free tier).

1. Go to https://www.mongodb.com/cloud/atlas/register and sign up.
2. Create a **free M0 cluster** (any region close to India, e.g. Mumbai).
3. **Database Access** → Add a database user (username + password). Save them.
4. **Network Access** → Add IP Address → **Allow access from anywhere**
   (`0.0.0.0/0`). Render's IP changes, so this is required.
5. **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Replace `<user>` and `<password>` with the ones from step 3, and add the
   database name `urbancruise` before the `?`:
   ```
   mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/urbancruise?retryWrites=true&w=majority
   ```
   Keep this string — it is your `MONGO_URI`.

---

## Stage 2 — Push this project to GitHub

Render deploys from a Git repo.

```bash
# from the project root
git add .
git commit -m "Prepare backend for Render deploy"
# create an empty repo on github.com first, then:
git remote add origin https://github.com/<your-username>/urban-cruise.git
git branch -M main
git push -u origin main
```

> `.env` is git-ignored, so your secrets are NOT pushed — that is correct.

---

## Stage 3 — Deploy on Render

1. Go to https://render.com and sign up (log in with GitHub).
2. **New +** → **Web Service** → connect the GitHub repo you just pushed.
3. Fill in the settings:
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. Open **Environment** and add these variables:
   | Key          | Value                                             |
   | ------------ | ------------------------------------------------- |
   | `MONGO_URI`  | the Atlas string from Stage 1                     |
   | `JWT_SECRET` | any long random text, e.g. `urbancruise_secret_2026_x9f` |
   > Do **not** set `PORT` — Render sets it automatically.
5. Click **Create Web Service** and wait for the build to go live.
6. Copy your live URL, e.g. `https://urban-cruise-lms-backend.onrender.com`.
7. Test it in a browser: opening `<your-url>/health` should show
   `{"status":"ok",...}`. The server auto-seeds two logins on first boot:
   - `admin@urbancruise.com` / `AdminPassword123`
   - `agent@urbancruise.com` / `Password123`

> Free Render services sleep after ~15 min idle; the first request after that
> takes ~30–50s to wake. That is normal on the free tier.

---

## Stage 4 — Point the app at the live backend and rebuild the APK

1. Open `src/config/apiConfig.ts` and set `PRODUCTION_API_HOST` to your Render
   URL (no trailing slash, no `/api`):
   ```ts
   export const PRODUCTION_API_HOST = 'https://urban-cruise-lms-backend.onrender.com';
   ```
2. Rebuild the APK:
   ```bash
   npx eas build -p android --profile preview
   ```
3. Install the new APK and log in with the seeded admin account above.

Done — login will now work against the public backend.
