# MealSwitch Project Information

Comprehensive guide for Gemini CLI to understand and manage the MealSwitch codebase.

## Project Overview
MealSwitch is an AI-powered nutrition application that helps users find healthier food alternatives (swaps), generate meal plans, and track macros.

## Tech Stack
### Backend
- **Framework:** FastAPI (Python 3.10+)
- **Data Processing:** `pandas`, `numpy`, `openpyxl`, `scikit-learn` (TF-IDF for food search)
- **AI Integration:** `google-generativeai` (Gemini API)
- **Server:** `uvicorn`
- **Environment Management:** `.venv` (Python virtual environment)

### Frontend
- **Framework:** React 19 (Vite)
- **Styling:** Styled Components, TailwindCSS (for some components), Vanilla CSS
- **Visualization:** Three.js (for 3D elements in Hero), Lucide React (icons)
- **API Communication:** Axios/Fetch (managed in `src/services/api.js`)

## Directory Structure
```
MealSwitch/
├── backend/                # FastAPI Backend
│   ├── api/               # API routes and endpoints (endpoints.py)
│   ├── core/              # Configuration and core logic (config.py)
│   ├── data/              # Dataset files (Excel/CSV)
│   ├── models/            # Pydantic schemas (schemas.py)
│   ├── services/          # Business logic (nutrition_service.py, usda_service.py)
│   ├── main.py            # Entry point
│   └── .env               # Backend environment variables
├── meal-switch-app/        # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── services/      # API service layer (api.js)
│   │   ├── App.jsx        # Main application component
│   │   └── main.jsx       # Frontend entry point
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
└── GEMINI.md               # This file
```

## Core Workflows

### 1. Running the Backend
- Navigate to `backend/`
- Activate virtual environment: `..\.venv\Scripts\activate`
- Run server: `python main.py` or `uvicorn backend.main:app --reload`
- API Docs: `http://localhost:8000/docs`

### 2. Running the Frontend
- Navigate to `meal-switch-app/`
- Install dependencies: `npm install`
- Start development server: `npm run dev`

### 3. Adding New Features
- **Backend:** 
  1. Define schema in `models/schemas.py`.
  2. Implement logic in `services/`.
  3. Add endpoint in `api/endpoints.py`.
- **Frontend:**
  1. Add API call in `services/api.js`.
  2. Create/update components in `components/`.
  3. Integrate in `App.jsx`.

## Coding Conventions
- **Python:** PEP 8, use type hints, async/await for endpoints.
- **React:** Functional components, hooks, Styled Components for layout/styling.
- **Naming:** 
  - Python: `snake_case` for variables/functions, `PascalCase` for classes.
  - JS/React: `camelCase` for variables/functions, `PascalCase` for components.

## Current State & Known Info
- The project uses a TF-IDF vectorizer for food recommendations based on nutrient similarity.
- Gemini API is used for AI-driven meal planning and chatbot functionality.
- USDA API integration is available in `usda_service.py`.

## Gemini Mandates
- Always check `backend/main.py` for correct package imports (it uses `backend.api` etc.).
- Maintain consistency with Styled Components in the frontend.
- When fixing bugs, verify with `test_api.py` if available or create a new test script.
