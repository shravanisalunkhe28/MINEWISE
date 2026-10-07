# ⛏️ MineWise — Carbon Intelligence & Decarbonization Platform

> **A unified carbon intelligence and decarbonization platform for Indian coal mines.**

**MineWise** helps coal-mine stakeholders measure carbon emissions, understand emission sources, identify anomalies, explore suitable decarbonization strategies, and monitor environmental progress through a single platform.

🔗 **Live Demo:** [MineWise](https://remix-minewise-carbon-intelligence-decarbonizatio-8865.ai.studio)

---

## 🌱 Overview

Indian coal mines generate emissions through several interconnected activities such as fuel consumption, electricity usage, transportation, mining operations, and methane release.

Traditional carbon calculators mainly answer:

> **"How much carbon are we emitting?"**

MineWise goes further by helping answer:

> **"Where are the emissions coming from, can the information be verified, what should we change, and what could be the impact of those changes?"**

The platform follows a continuous:

**Measure → Verify → Decide → Simulate → Monitor**

approach.

---

## 🎯 Problem Statement

Indian coal mines lack a unified system for measuring, verifying, understanding, and reducing their carbon footprint across different mine types and operational activities.

MineWise addresses this by bringing together:

* Carbon-footprint measurement
* Scope 1, Scope 2 and relevant Scope 3 analysis
* Methane-emission awareness
* Emission anomaly detection
* Environmental verification
* Satellite-based monitoring concepts
* Personalized decarbonization recommendations
* Impact simulation
* Mine and regional monitoring

---

# 🚀 Key Features

## 1. 🏭 Mine Registration

Mine operators can register their mine and provide relevant operational information.

Supported mine types include:

* Open-cast
* Underground
* Mixed

The collected information is used to create a mine-specific carbon and decarbonization profile.

---

## 2. 📊 Carbon Footprint Dashboard

MineWise provides a centralized dashboard for understanding emissions.

The dashboard can present:

* Total emissions
* Scope-wise emissions
* Methane emissions
* Emission trends
* Energy consumption
* Fuel consumption
* Production information
* Emission intensity
* Decarbonization progress

Interactive charts make complex environmental information easier to interpret.

---

## 3. 🌍 Scope-Based Emission Analysis

MineWise organizes emissions into recognized greenhouse-gas accounting categories:

### Scope 1

Direct emissions from sources controlled by the mine.

### Scope 2

Indirect emissions associated with purchased electricity or energy.

### Scope 3

Relevant indirect value-chain emissions.

### Methane

Special attention to methane emissions associated with mining operations.

---

## 4. 🔍 Emission Anomaly Detection

MineWise is designed to identify unusual relationships between operational activity and emissions.

For example:

```text
Fuel Consumption
       +
Production
       +
Operational Activity
       ↓
Expected Emission Pattern
       ↓
Actual Emission Pattern
       ↓
Anomaly Detection
```

An unusual increase in fuel consumption compared with production can be flagged for investigation.

This changes the platform from a simple calculator into an **emission intelligence system**.

---

## 5. 🛰️ Environmental & Satellite Verification

MineWise incorporates satellite-based environmental verification.

Potential indicators include:

* Vegetation changes
* Land-cover changes
* Reclamation progress
* Mine-area environmental conditions

Technologies and data sources that can support this module include:

* Sentinel-2
* NDVI
* Open geospatial data
* Indian geospatial resources

The goal is to provide an additional layer of evidence rather than relying exclusively on manually reported information.

---

## 6. 🌱 Personalized Decarbonization Pathways

Different mines have different operational characteristics.

MineWise therefore aims to recommend strategies based on the mine's specific situation.

Possible pathways include:

* Renewable energy integration
* Energy-efficiency improvements
* Electrification
* Fleet optimization
* Methane management
* Land reclamation
* Operational optimization

The platform focuses on:

**Emission Reduction + Cost + Time + Feasibility**

rather than simply listing generic green technologies.

---

## 7. 🧮 Decarbonization Simulation

Before implementing an intervention, MineWise can be used to explore its potential effect.

Conceptually:

```text
Current Mine State
       ↓
Select Intervention
       ↓
Estimate Reduction
       ↓
Estimate Cost
       ↓
Estimate Implementation Time
       ↓
Compare Pathways
       ↓
Select Suitable Strategy
```

This allows decision-makers to compare different pathways before committing resources.

---

## 8. 🗺️ Interactive Monitoring

MineWise uses interactive data visualizations and mapping concepts to support:

* Mine-level monitoring
* Regional analysis
* Environmental indicators
* Emission trends
* Comparative analysis

This can provide government and organizational stakeholders with a broader view of decarbonization progress.

---

## 9. 👥 Role-Based Experience

MineWise is designed around multiple stakeholders.

| Role                      | Main Purpose                          |
| ------------------------- | ------------------------------------- |
| 🏭 Mine / Factory Owner   | Measure emissions and plan reductions |
| 👤 Citizen                | Access environmental information      |
| 🏛️ Ministry / Government | Monitor mines and regional progress   |

Role-based access can be implemented using authentication and authorization mechanisms such as **JWT + RBAC**.

---

# 🔄 MineWise Framework

```text
             ┌──────────────┐
             │   MEASURE    │
             │              │
             │ Carbon Data  │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │   VERIFY     │
             │              │
             │ Data +       │
             │ Satellite   │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │    DECIDE    │
             │              │
             │ Identify     │
             │ Priorities   │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │   SIMULATE   │
             │              │
             │ Compare      │
             │ Pathways     │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │   MONITOR    │
             │              │
             │ Track        │
             │ Progress     │
             └──────┬───────┘
                    │
                    └──────→ Continuous Improvement
```

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │       MineWise      │
                         │      Frontend       │
                         └──────────┬──────────┘
                                    │
                                    ↓
                         ┌─────────────────────┐
                         │     Backend API     │
                         │   Node / Express    │
                         └──────────┬──────────┘
                                    │
                   ┌────────────────┼────────────────┐
                   ↓                ↓                ↓
             ┌───────────┐    ┌───────────┐    ┌────────────┐
             │ PostgreSQL│    │ Analytics │    │ External / │
             │ Database  │    │ & Models  │    │ Geo Data   │
             └───────────┘    └───────────┘    └────────────┘
                                    │
                                    ↓
                             ┌─────────────┐
                             │   Insights  │
                             └─────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

| Technology    | Purpose                   |
| ------------- | ------------------------- |
| React         | User interface            |
| TypeScript    | Type-safe development     |
| Tailwind CSS  | Styling and responsive UI |
| Recharts      | Data visualization        |
| Leaflet       | Interactive maps          |
| OpenStreetMap | Map data                  |

## Backend

| Technology | Purpose                  |
| ---------- | ------------------------ |
| Node.js    | Backend runtime          |
| Express.js | REST API                 |
| JWT        | Authentication           |
| RBAC       | Role-based authorization |

## Database

| Technology | Purpose                       |
| ---------- | ----------------------------- |
| PostgreSQL | Mine, emissions and user data |

## Data & Intelligence

| Technology          | Purpose                            |
| ------------------- | ---------------------------------- |
| Python              | Data processing and analytics      |
| FastAPI             | Python-based services              |
| Anomaly Detection   | Identify unusual emission patterns |
| Carbon Calculations | Emission estimation                |
| Satellite Analytics | Environmental verification         |

---

# 📁 Project Structure

A recommended full-stack structure for MineWise is:

```text
minewise/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── charts/
│   │   ├── maps/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── services/
│   │   └── app.ts
│   │
│   ├── package.json
│   └── .env.example
│
├── analytics/
│   ├── carbon/
│   ├── anomaly_detection/
│   ├── satellite/
│   └── requirements.txt
│
├── docs/
│   ├── architecture/
│   └── screenshots/
│
├── .gitignore
├── README.md
└── LICENSE
```

> Update this structure to exactly match the folders in your repository before publishing the final README.

---

# ⚙️ Getting Started

## Prerequisites

Make sure the following are installed:

* **Node.js 18+**
* **npm**
* **PostgreSQL**
* **Python 3.10+** if the analytics services are enabled
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/minewise.git

cd minewise
```

---

## 2. Install Frontend Dependencies

```bash
cd frontend

npm install
```

---

## 3. Configure Frontend Environment Variables

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:5000
```

Use your actual backend URL when deploying.

---

## 4. Start the Frontend

```bash
npm run dev
```

The development server will normally be available at:

```text
http://localhost:5173
```

---

## 5. Install Backend Dependencies

Open another terminal:

```bash
cd backend

npm install
```

---

## 6. Configure Backend Environment Variables

Create:

```text
backend/.env
```

Example:

```env
PORT=5000

DATABASE_URL=postgresql://username:password@localhost:5432/minewise

JWT_SECRET=your_secret_key

NODE_ENV=development
```

**Never commit `.env` files or API keys to GitHub.**

Use `.env.example` to document required variables.

---

## 7. Start the Backend

```bash
npm run dev
```

The API should then be available at:

```text
http://localhost:5000
```

---

# 🐍 Analytics Service

If the Python analytics service is included:

```bash
cd analytics

python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI service:

```bash
uvicorn main:app --reload
```

---

# 🔐 Environment Variables

Do not upload secrets to GitHub.

Example `.env.example`:

```env
# Backend
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=

# Authentication
JWT_SECRET=

# Frontend
VITE_API_URL=

# Optional external services
SATELLITE_API_KEY=
```

Replace the empty values with your local/deployment configuration.

---

# 📸 Screenshots

Add screenshots of the actual application inside:

```text
docs/screenshots/
```

Recommended screenshots:

### Landing Page

```text
docs/screenshots/home.png
```

![MineWise Landing Page](docs/screenshots/home.png)

### Dashboard

```text
docs/screenshots/dashboard.png
```

![MineWise Dashboard](docs/screenshots/dashboard.png)

### Carbon Analysis

```text
docs/screenshots/carbon-analysis.png
```

![Carbon Analysis](docs/screenshots/carbon-analysis.png)

### Decarbonization Pathways

```text
docs/screenshots/decarbonization.png
```

![Decarbonization Pathways](docs/screenshots/decarbonization.png)

### Mine Monitoring

```text
docs/screenshots/monitoring.png
```

![Mine Monitoring](docs/screenshots/monitoring.png)

> Replace these image paths with the screenshots you actually add to your repository.

---

# 🧪 Development

Run the frontend:

```bash
npm run dev
```

Run the backend:

```bash
npm run dev
```

Build the frontend:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

If tests are configured:

```bash
npm test
```

---

# 🚀 Deployment

The frontend can be deployed using platforms such as:

* Vercel
* Netlify
* Cloud hosting

The backend can be deployed using:

* Render
* Railway
* AWS
* Other Node.js-compatible cloud platforms

For production deployment, update:

```env
VITE_API_URL=<production-backend-url>
```

and configure the production database and secrets through the hosting provider's environment-variable settings.

---

# 📊 Data & Methodology

MineWise is designed around recognized greenhouse-gas accounting concepts and environmental monitoring approaches.

The platform can incorporate:

* Scope 1 / Scope 2 / Scope 3 classification
* Methane emissions
* Emission factors
* Operational activity data
* Production data
* Energy and fuel consumption
* Satellite-derived environmental indicators
* NDVI-based vegetation monitoring

All production calculations should be validated against the applicable official methodology and emission-factor sources before being used for regulatory reporting.

---

# 💡 What Makes MineWise Different?

MineWise is designed as an **intelligence and decision-support platform**, rather than only an emissions calculator.

### Traditional approach

```text
Input Data
    ↓
Carbon Calculator
    ↓
Emission Number
```

### MineWise approach

```text
Operational Data
       ↓
Carbon Measurement
       ↓
Verification
       ↓
Anomaly Detection
       ↓
Emission Hotspots
       ↓
Decarbonization Options
       ↓
Impact Simulation
       ↓
Monitoring
```

This creates a complete feedback loop for continuous improvement.

---

# 🗺️ Roadmap

Future improvements can include:

* [ ] Real-time IoT sensor integration
* [ ] Automated mine-data ingestion
* [ ] Advanced methane monitoring
* [ ] AI-based emission forecasting
* [ ] Digital twin of mining operations
* [ ] Predictive maintenance
* [ ] Advanced satellite analytics
* [ ] Automated carbon reports
* [ ] Carbon-credit tracking
* [ ] Government-data integration
* [ ] National coal-sector monitoring
* [ ] Mobile application
* [ ] Advanced AI decarbonization advisor

---

# 🎯 Project Goals

MineWise aims to help stakeholders move from:

> **Measure emissions**

to:

> **Understand → Verify → Reduce → Monitor**

The long-term goal is to support a more **data-driven, transparent, and actionable approach to decarbonization in the Indian coal-mining sector.**

---

# 👥 Contributors

Add your team members here:

| Name        | Role                      |
| ----------- | ------------------------- |
| Your Name   | Full-Stack / Project Lead |
| Team Member | Frontend                  |
| Team Member | Backend                   |
| Team Member | Data / AI                 |

---

# 📄 License

This project is currently developed as a **hackathon / academic prototype**.

Add an appropriate open-source license if you intend to distribute the source code publicly.

---

# ⭐ Acknowledgements

MineWise builds upon concepts and methodologies related to:

* Greenhouse Gas accounting
* Carbon-footprint assessment
* Environmental monitoring
* Satellite remote sensing
* Mine reclamation monitoring
* Data analytics
* Decarbonization planning

---

## 🌿 MineWise

**Measure. Verify. Decide. Simulate. Monitor.**

> Building a smarter pathway toward sustainable Indian coal mining.
