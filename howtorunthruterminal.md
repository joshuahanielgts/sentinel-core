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

## 6) If Gemini API is blocked by network policy

If analysis errors with:

```text
Unable to reach Gemini API from the server network
```

your environment is likely blocking direct HTTPS egress to:

```text
generativelanguage.googleapis.com
```

### 6.1 Optional: route backend traffic through corporate proxy

In the same terminal where you run `apps/api`, set proxy variables first:

```powershell
$env:HTTPS_PROXY = "http://your-proxy-host:port"
$env:HTTP_PROXY = "http://your-proxy-host:port"
$env:NO_PROXY = "localhost,127.0.0.1"
```

Then start backend:

```powershell
cd "D:\Projects\Sentinel final\apps\api"
npm run dev
```

Note: backend scripts are configured with Node `--use-env-proxy`, so `HTTPS_PROXY`/`NO_PROXY` are honored automatically.

Important: replace `your-proxy-host:port` with your real corporate proxy address. The placeholder value will always fail.

### 6.2 Connectivity smoke test (PowerShell + Python)

```powershell
cd "D:\Projects\Sentinel final\apps\api"
python -c "import json,urllib.request,urllib.parse,pathlib;key='';
for line in pathlib.Path('.env.local').read_text(encoding='utf-8').splitlines():
	if line.startswith('GEMINI_API_KEY='): key=line.split('=',1)[1].strip(); break
url='https://generativelanguage.googleapis.com/v1beta/models?key='+urllib.parse.quote(key)
print(json.loads(urllib.request.urlopen(url, timeout=20).read().decode('utf-8')).get('models',[{}])[0].get('name','NO_MODELS'))"
```

If this fails with a corporate filter page or 403 from a network appliance, ask IT/security to allow outbound HTTPS to `generativelanguage.googleapis.com`.

## 7) Troubleshooting API dev server

### 7.1 Port 3001 already in use (EADDRINUSE)

```powershell
$conn = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
if ($conn) { Stop-Process -Id $conn.OwningProcess -Force }
cd "D:\Projects\Sentinel final\apps\api"
npm run dev
```

### 7.2 Next.js cache corruption (Cannot find module './200.js')

```powershell
cd "D:\Projects\Sentinel final\apps\api"
npm run dev:clean
npm run dev
```

Or use one command:

```powershell
cd "D:\Projects\Sentinel final\apps\api"
npm run dev:fresh
```

