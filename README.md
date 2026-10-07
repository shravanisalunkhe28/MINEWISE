# MineWise ⛏️

### Carbon Intelligence & Decarbonization Platform for Indian Coal Mines

**MineWise** is a web platform designed to help coal mines understand their carbon emissions and explore practical ways to reduce them.

Instead of being just a carbon calculator, MineWise brings **emission tracking, anomaly detection, environmental verification, and decarbonization planning** together in one platform.

🔗 **Live Demo:** https://remix-minewise-carbon-intelligence-decarbonizatio-8865.ai.studio

---

## What is MineWise?

Coal mining involves several sources of emissions, including fuel consumption, electricity usage, transportation, and methane.

The problem is that simply knowing the total emissions is not enough. Mine operators also need to understand **where the emissions are coming from, whether the data can be verified, and what actions can actually reduce them.**

MineWise is built around this idea:

**Measure → Verify → Decide → Simulate → Monitor**

The platform helps turn mine data into information that can support better decarbonization decisions.

---

## What can MineWise do?

### 📊 Carbon Dashboard

The dashboard gives an overview of a mine's carbon footprint and operational data.

It can include:

* Total emissions
* Scope 1, Scope 2 and relevant Scope 3 emissions
* Methane emissions
* Fuel and energy consumption
* Production data
* Emission trends
* Emission intensity

### 🔍 Emission Anomaly Detection

MineWise can look for unusual patterns in operational data.

For example, if fuel consumption increases significantly without a similar increase in production, it can indicate an area that needs investigation.

This helps move beyond simply displaying an emission number.

### 🛰️ Environmental Verification

The platform explores the use of satellite and geospatial data to support environmental monitoring.

Possible indicators include:

* Vegetation changes
* Land-cover changes
* Mine reclamation
* Environmental conditions around mining areas

Technologies such as **Sentinel-2 and NDVI** can be used for this type of analysis.

### 🌱 Decarbonization Recommendations

MineWise can suggest possible strategies based on the characteristics of a mine.

Examples include:

* Renewable energy
* Energy efficiency
* Electrification
* Fleet optimization
* Methane management
* Land reclamation
* Operational improvements

The idea is to help answer:

**What can we change? How much could it reduce emissions? How much could it cost?**

### 📈 Monitoring

After choosing a decarbonization strategy, the platform can be used to track changes over time and monitor progress.

---

## How it works

```text
        Mine Data
            ↓
      Carbon Analysis
            ↓
        Verification
            ↓
    Identify Emission Issues
            ↓
   Decarbonization Options
            ↓
      Impact Simulation
            ↓
        Monitoring
```

This creates a continuous feedback loop instead of treating carbon calculation as a one-time activity.

---

## User Roles

MineWise is designed for different stakeholders involved in mining and environmental monitoring.

| User                  | Purpose                                         |
| --------------------- | ----------------------------------------------- |
| Mine / Factory Owner  | View emissions and explore reduction strategies |
| Citizen               | Access environmental information                |
| Ministry / Government | Monitor mines and regional progress             |

---

## Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* Recharts
* Leaflet
* OpenStreetMap

### Backend

* Node.js
* Express.js
* REST APIs
* JWT Authentication
* Role-Based Access Control

### Database

* PostgreSQL

### Data & Analytics

* Python
* FastAPI
* Carbon-emission calculations
* Anomaly detection
* Satellite / geospatial analysis

---

## Project Structure

```text
MineWise/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   └── package.json
│
├── analytics/
│   ├── carbon/
│   ├── anomaly_detection/
│   └── satellite/
│
├── docs/
│   └── screenshots/
│
├── .gitignore
└── README.md
```

> The structure above should be updated to match the actual folders in the repository.

---

## Getting Started

### Prerequisites

Make sure you have:

* Node.js
* npm
* PostgreSQL
* Python 3.10+ (if using the analytics service)
* Git


### Install dependencies

For the frontend:

```bash
cd frontend
npm install
```

For the backend:

```bash
cd backend
npm install
```



Windows:

```bash
venv\Scripts\activate
```

Then:

```bash
pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file according to the requirements of your project.

Example:

```env
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret
VITE_API_URL=http://localhost:5000
```

Do not commit your actual `.env` file or API keys to GitHub.

You can provide a `.env.example` file instead.

---

MineWise ⛏️
Carbon Intelligence & Decarbonization Platform for Indian Coal Mines

MineWise is a web platform designed to help coal mines understand their carbon emissions and explore practical ways to reduce them.

Instead of being just a carbon calculator, MineWise brings emission tracking, anomaly detection, environmental verification, and decarbonization planning together in one platform.

🔗 Live Demo: https://remix-minewise-carbon-intelligence-decarbonizatio-8865.ai.studio

What is MineWise?

Coal mining involves several sources of emissions, including fuel consumption, electricity usage, transportation, and methane.

The problem is that simply knowing the total emissions is not enough. Mine operators also need to understand where the emissions are coming from, whether the data can be verified, and what actions can actually reduce them.

MineWise is built around this idea:

Measure → Verify → Decide → Simulate → Monitor

The platform helps turn mine data into information that can support better decarbonization decisions.

What can MineWise do?
📊 Carbon Dashboard

The dashboard gives an overview of a mine's carbon footprint and operational data.

It can include:

Total emissions
Scope 1, Scope 2 and relevant Scope 3 emissions
Methane emissions
Fuel and energy consumption
Production data
Emission trends
Emission intensity
🔍 Emission Anomaly Detection

MineWise can look for unusual patterns in operational data.

For example, if fuel consumption increases significantly without a similar increase in production, it can indicate an area that needs investigation.

This helps move beyond simply displaying an emission number.

🛰️ Environmental Verification

The platform explores the use of satellite and geospatial data to support environmental monitoring.

Possible indicators include:

Vegetation changes
Land-cover changes
Mine reclamation
Environmental conditions around mining areas

Technologies such as Sentinel-2 and NDVI can be used for this type of analysis.

🌱 Decarbonization Recommendations

MineWise can suggest possible strategies based on the characteristics of a mine.

Examples include:

Renewable energy
Energy efficiency
Electrification
Fleet optimization
Methane management
Land reclamation
Operational improvements

The idea is to help answer:

What can we change? How much could it reduce emissions? How much could it cost?

📈 Monitoring

After choosing a decarbonization strategy, the platform can be used to track changes over time and monitor progress.

How it works
        Mine Data
            ↓
      Carbon Analysis
            ↓
        Verification
            ↓
    Identify Emission Issues
            ↓
   Decarbonization Options
            ↓
      Impact Simulation
            ↓
        Monitoring

This creates a continuous feedback loop instead of treating carbon calculation as a one-time activity.

User Roles

MineWise is designed for different stakeholders involved in mining and environmental monitoring.

User	Purpose
Mine / Factory Owner	View emissions and explore reduction strategies
Citizen	Access environmental information
Ministry / Government	Monitor mines and regional progress
Tech Stack
Frontend
React
TypeScript
Tailwind CSS
Recharts
Leaflet
OpenStreetMap
Backend
Node.js
Express.js
REST APIs
JWT Authentication
Role-Based Access Control
Database
PostgreSQL
Data & Analytics
Python
FastAPI
Carbon-emission calculations
Anomaly detection
Satellite / geospatial analysis
Project Structure
MineWise/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   └── package.json
│
├── analytics/
│   ├── carbon/
│   ├── anomaly_detection/
│   └── satellite/
│
├── docs/
│   └── screenshots/
│
├── .gitignore
└── README.md
