🌍 CubeSatellite


<p align="center">
  A futuristic real-time satellite tracking and Earth visualization platform.
</p>

<p align="center">
  <a href="https://cube-satellite-cdxb-adbh7kw5e-surathchakraborty05s-projects.vercel.app">
    <img src="https://img.shields.io/badge/Launch%20Orbital%20Tracker-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-Enabled-blue?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Leaflet-Maps-green?style=flat-square&logo=leaflet" />
  <img src="https://img.shields.io/badge/Status-Live-success?style=flat-square" />
</p>

A futuristic real-time satellite tracking and Earth visualization platform built with Next.js, interactive maps, orbital mechanics, and live environmental overlays.


🚀 Features
🛰 Real-Time Satellite Tracking
Live orbital telemetry
NORAD satellite data integration
Dynamic orbit calculations using satellite.js
Altitude, inclination, orbital period, and range calculations
🌎 Interactive Earth Visualization
Heatmap visualization
Wind flow simulation
Ocean current velocity rendering
Smooth animated overlays using Leaflet
📡 Telemetry System
Real-time battery monitoring
Signal strength simulation
Temperature tracking
Animated telemetry gauges
🎨 Modern UI/UX
Fully responsive interface
Dark/Light mode support
Glassmorphism inspired panels
Animated loaders & transitions
Skeleton loading states
Instrument-panel styled controls
⚡ Performance Optimizations
Lazy loading
Dynamic imports
Optimized rendering
Reduced bundle size
Map-specific loading states
🛠 Tech Stack
Frontend
Next.js
React
TypeScript
Tailwind CSS
Framer Motion
Maps & Visualization
Leaflet
Canvas-based particle systems
Weather overlays
Dynamic environmental rendering
Satellite & Space Data
satellite.js
NORAD TLE propagation
Orbital vector calculations
Backend / Services
Firebase
Firestore
📸 Preview
🌡 Heatmap View
🌬 Wind Simulation


📂 Project Structure
app/
 ┣ components/
 ┃ ┣ orbital/
 ┃ ┣ ui/
 ┣ utils/
 ┣ context/
 ┣ lib/
 ┣ public/
 ┗ page.tsx
⚙ Installation
1️⃣ Clone Repository
git clone <repo-link>
cd orbital-tracker
2️⃣ Install Dependencies
npm install
3️⃣ Create Environment Variables

Create a .env.local file:

NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_PROJECT_ID=your_project_id
NEXT_PUBLIC_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_APP_ID=your_app_id
NEXT_PUBLIC_MEASUREMENT_ID=your_measurement_id
4️⃣ Run Development Server
npm run dev
🌌 Core Functionalities
📍 Orbital Calculations

Using TLE (Two-Line Element) data:

Position propagation
Geodetic conversion
Inclination calculation
Orbital period determination
🌦 Environmental Data

Integrated weather systems:

Temperature mapping
Wind speed visualization
Ocean current simulation
🧠 Smart UI Systems
Adaptive theme engine
Responsive layouts
Dynamic loaders
Smooth transitions
🔥 Performance Improvements
Dynamic imports
Lazy loaded maps
Skeleton loaders
Reduced re-renders
Optimized particle rendering
Efficient animation loops
📈 Future Roadmap
🛰 Live ISS tracking
🌍 3D globe rendering
📡 Real satellite APIs
☁ Cloud synchronization
🧭 Ground station visualization
🚀 Satellite pass prediction
🔔 Notification system
📱 PWA support
🤝 Contributing

Contributions are welcome.

fork → clone → create branch → commit → push → pull request
📜 License

📜 Data Sources

- NASA APIs
- NORAD TLE Data
- OpenStreetMap

👨‍💻 Developer

Built with passion for space, orbital mechanics, and futuristic visualization systems.

⭐ Support

If you like this project:

Star the repository
Share it with others
Contribute improvements
🌠 “Exploring Earth through orbital intelligence.”
