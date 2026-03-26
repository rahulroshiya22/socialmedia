# 🚀 SnapGrab - Social Media Downloader

![SnapGrab Hero](https://img.shields.io/badge/UI-Claymorphism-FF7E5F?style=for-the-badge) ![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet) ![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react) ![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)

A modern, fast, and fully-featured Social Media Downloader built with **ASP.NET Core 8**, **React (Vite)**, and the awesome power of **yt-dlp** & **FFmpeg**. Featuring a beautiful, interactive **Claymorphism** UI, real-time download progress streaming, and built-in bypasses for bot detection.

---

## ✨ Features

- **🎯 100+ Supported Platforms:** Download from YouTube, Instagram, TikTok, Twitter/X, Facebook, Reddit, Pinterest, Vimeo, and dozens more.
- **🎨 Stunning Claymorphism UI:** A sleek, modern user interface with soft 3D shadows, smooth gradients, and interactive micro-animations.
- **⚡ Super-Fast Downloads:** Utilizes `yt-dlp` with `--concurrent-fragments 8` to download large videos up to 8x faster.
- **📡 Real-Time Progress Bar:** Uses Server-Sent Events (SSE) to stream live download progress (% percent, speed, ETA) directly to the UI.
- **🎛️ Quality Selection:** Discover available formats before downloading (1080p, 4K, Audio-only, MP4, WebM).
- **🛡️ Admin Dashboard:** Protected by JWT authentication. Toggle Maintenance Mode across the site instantly.
- **🐳 Docker & Render Ready:** Includes a highly optimized multi-stage `Dockerfile` designed to run natively and monolithic on **Render's Free Tier**, complete with Linux binaries.
- **🤖 Anti-Bot Bypassing:** Built-in support for `cookies.txt` and Rotating Proxies to easily bypass strict datacentre blocking from YouTube and Instagram.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite**
- **Vanilla CSS** (Custom Claymorphism Design System)
- **Lucide React** (SVG Icons)
- **Axios** (API Requests)

### Backend
- **ASP.NET Core 8 Web API**
- **CliWrap** (For executing command-line binaries securely)
- **JWT Authentication** (For the Admin Panel)
- **yt-dlp** (Video Extraction Engine)
- **FFmpeg** (Video/Audio Merging)

---

## 🚀 How to Run Locally

### Prerequisites
1. Install [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0).
2. Install [Node.js](https://nodejs.org/) (v18+).
3. Download `yt-dlp.exe` and `ffmpeg.exe` and place them in the `MonolithicDownloader/binaries/` folder (Windows only).

### 1. Start the Backend (.NET)
```bash
cd MonolithicDownloader
dotnet run
```
*The API will start on `http://localhost:5235`.*

### 2. Start the Frontend (React)
```bash
cd MonolithicDownloader/frontend
npm install
npm run dev
```
*The UI will start on `http://localhost:5173`.*

---

## 🐳 How to Deploy to Render (Free Tier)

This application is designed as a **Monolithic Docker App**—meaning the React frontend is built and served directly out of the .NET Core API's `wwwroot` folder, all wrapped into a single, lightweight Linux container.

1. Fork or push this repository to GitHub.
2. Create an account on [Render.com](https://render.com).
3. Click **New +** -> **Web Service**.
4. Select your GitHub repository.
5. Choose **Docker** as the Runtime environment.
6. Select the **Free** tier.
7. Under "Root Directory", ensure it is set to the root (where the `Dockerfile` is).
8. Click **Deploy Web Service**!

### 🔑 Default Admin Credentials
By default, you can access the Admin Dashboard at `/admin/login`:
- **Username:** `admin`
- **Password:** `password123`
*(You can change these in `appsettings.json` or by setting Render Environment Variables: `AdminCredentials__Username` / `AdminCredentials__Password`).*

---

## 🛑 Bypassing YouTube "Bot Detection"

Because Render uses datacenter IPs (AWS/Google Cloud), strict sites like YouTube may throw an error: `Sign in to confirm you're not a bot`.

### Method 1: The 100% Free Way (Cookies)
To bypass this entirely without paying for proxies:
1. Install the [Get cookies.txt LOCALLY](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc) extension in Google Chrome.
2. Go to `youtube.com` (logged in) and export your cookies.
3. Rename the downloaded file to exactly **`cookies.txt`**.
4. Place the file directly in your source code folder alongside `Dockerfile` and `Program.cs`.
5. Push to GitHub! The backend automatically detects `cookies.txt` and uses it to bypass bot checks.

### Method 2: Usage of Proxies
If you have access to Residential HTTP proxies to mask your server IP:
1. Go to your Render Dashboard -> Environment Variables.
2. Add a new variable: 
   - **Key:** `DownloaderSettings__Proxies__0`
   - **Value:** `http://username:password@IP:PORT`
The backend will automatically start routing traffic through your proxy!

---

## ⚠️ Disclaimer

This tool is built for **educational and personal use only**. Please respect copyright laws and the terms of service of each platform. Do not use this tool to redistribute or commercially exploit downloaded content. The developers are not responsible for any misuse.
