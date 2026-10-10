# HeatSafe

HeatSafe is a full-stack heat-risk assessment and outdoor activity planning system. It helps supervisors plan outdoor work, retrieve weather conditions, calculate heat-risk levels, compare safer time windows, reschedule activities, and review historical risk data.

The project uses a React frontend, Django REST Framework backend, weather data integration, and a rule-based heat-risk engine.

## Features

### Supervisor

- Register and sign in
- Plan outdoor activities
- Select activity type, duration, sun exposure, water availability, rest-area availability, and worker category
- Automatically retrieve weather data for the planned activity
- Assess heat risk
- View overall risk score and risk level
- View individual risk factors
- Receive safety recommendations
- Compare available time slots and their heat-risk levels
- Reschedule activities to safer times
- View activity history and individual activity details
- View dashboard statistics, risk trends, and risk distribution
- View weather information, alerts, reports, and profile

### Administrator

- Administrator dashboard
- Manage users
- Manage activity types
- Manage risk rules
- Access system-level reporting and management features

## Heat Risk Assessment

HeatSafe evaluates outdoor activities using factors including:

- Temperature
- Feels-like temperature
- Humidity
- UV index
- Activity intensity
- Activity duration

The rule-based risk engine combines these factors into a risk score and classifies the result as:

- Low
- Moderate
- High
- Very High

The assessment also generates safety recommendations and identifies safer time windows when appropriate.

## Technology Stack

### Frontend

- React
- Vite
- Material UI
- Axios
- React Router
- Recharts

### Backend

- Python
- Django
- Django REST Framework
- Token authentication

### Weather

Weather data is retrieved through the weather service used by the backend and stored as weather records for risk assessment.

## Project Structure

```text
HeatSafe/
├── backend/
│   ├── accounts/
│   ├── activities/
│   ├── risk_engine/
│   ├── weather_data/
│   ├── reports/
│   └── manage.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── theme/
│   ├── package.json
│   └── vite.config.js
│
├── requirements.txt
└── README.md
```

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Swarup-Valvi/HeatSafe.git
cd HeatSafe
```

### 2. Backend Setup

Create a virtual environment:

```bash
python3 -m venv venv
```

Activate it on macOS/Linux:

```bash
source venv/bin/activate
```

On Windows:

```bash
venv\Scripts\activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Move into the backend:

```bash
cd backend
```

Run database migrations:

```bash
python manage.py migrate
```

Check the Django configuration:

```bash
python manage.py check
```

Start the backend:

```bash
python manage.py runserver
```

The API will run locally on port `8000`.

### 3. Frontend Setup

Open another terminal:

```bash
cd HeatSafe/frontend
```

Install frontend dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will display the local frontend address in the terminal.

## Environment Configuration

The frontend can use an environment variable to configure the API base URL.

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Do not commit `.env` files containing secrets or environment-specific credentials.

## Main API Endpoints

Examples of the backend endpoints used by HeatSafe:

```text
/api/auth/
/api/activity-types/
/api/activities/
/api/activities/<id>/assess/
/api/activities/<id>/safer-times/
/api/activities/<id>/reschedule/
/api/reports/dashboard/
/api/reports/trends/
/api/reports/distribution/
```

Protected endpoints use token authentication.

## Core Workflow

```text
Login
  ↓
Plan Activity
  ↓
Retrieve Weather
  ↓
Assess Heat Risk
  ↓
Assessment Results
  ↓
Compare Safer Time Slots
  ↓
Reschedule if Required
  ↓
Activity History / Dashboard
```

## Risk Assessment Example

For a planned activity, HeatSafe retrieves weather conditions such as temperature, humidity, UV index, and wind speed.

The risk engine combines environmental conditions with activity factors such as intensity and duration to calculate a heat-risk score.

The supervisor receives:

- Risk score
- Risk level
- Risk-factor breakdown
- Safety recommendation
- Recommended safer time windows
- Alternative time slots and their risk levels

This allows the supervisor to compare conditions before deciding whether to continue or reschedule the activity.

## Development

Backend check:

```bash
cd backend
python manage.py check
```

Frontend development:

```bash
cd frontend
npm run dev
```

Frontend production build:

```bash
npm run build
```

## Security

Sensitive values should not be committed to the repository.

Keep files such as the following ignored:

```text
.env
.env.*
venv/
node_modules/
__pycache__/
*.pyc
db.sqlite3
```

Authentication tokens should never be hardcoded in frontend or backend source files.

## Future Improvements

Potential extensions include:

- More advanced heat-risk prediction models
- Historical weather analysis
- Location-based alerts
- Automated notifications
- Improved reporting and analytics
- Expanded worker safety recommendations
- Deployment for production use

## Author

**Swarup Valvi**

GitHub: `Swarup-Valvi`