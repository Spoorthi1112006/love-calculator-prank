# Love Calculator Prank 💖😜

A full-stack prank application.

## Directory Structure

- **backend/**: Node.js Express server, API routes, and database models.
- **frontend/**: Static HTML/CSS/JS files for the application.
  - **an-unusual-hero/**: Template folder provided (Next.js project). *Note: This requires a separate build process or integration if you intend to use it.*

## Installation

1.  Navigate to `backend`:
    ```bash
    cd backend
    npm install
    ```
2.  Start the server:
    ```bash
    node server.js
    ```
3.  Open `http://localhost:5000`.

## Notes

- The app uses an In-Memory MongoDB by default if a local MongoDB is not found.
- Twilio integration requires valid credentials in `.env`.
