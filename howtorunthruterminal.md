# Run Sentinel AI From Terminal (Frontend + Backend)

## 1) Install dependencies

Open a terminal at the project root and run:

```powershell
cd "D:\Projects\Sentinel final"
npm install
```

Then install backend dependencies:

```powershell
cd "D:\Projects\Sentinel final\apps\api"
npm install
```

## 2) Run backend API (Terminal 1)

```powershell
cd "D:\Projects\Sentinel final\apps\api"
npm run dev
```

Expected backend URL:

- `http://localhost:3001`

## 3) Run frontend Vite app (Terminal 2)

```powershell
cd "D:\Projects\Sentinel final"
npm run dev
```

Expected frontend URL:

- Usually `http://localhost:5173`
- If 5173 is busy, Vite auto-selects the next port (for example `http://localhost:5174`)

## 4) Environment note

Frontend API base URL is read from root `.env.local`:

```env
VITE_API_URL=http://localhost:3001/api
```

## 5) Stop both servers

In each running terminal, press:

```text
Ctrl + C
```

