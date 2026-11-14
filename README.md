# Best Cars Dealership — Full-Stack Cloud Development Capstone Project

A full-stack web application for browsing car dealerships across the United States, viewing customer reviews with automated sentiment analysis, and submitting new dealership reviews.

## Architecture & Tech Stack
- **Frontend:** React (`server/frontend/src`), HTML/CSS/Bootstrap static pages (`About.html`, `Contact.html`, `Home.html`)
- **Backend / Proxy:** Django (`server/djangoapp`, `server/djangoproj`) with SQLite for user authentication and CarMake/CarModel management
- **Database Service:** Node.js + Express (`server/database/app.js`) serving dealership and review records
- **Sentiment Analyzer Microservice:** Python Flask + NLTK VADER (`server/djangoapp/microservices/app.py`)
- **CI/CD:** GitHub Actions linting and build checks (`.github/workflows/main.yml`)
