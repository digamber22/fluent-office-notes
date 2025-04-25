# LingoMate.AI - Project README

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Local Deployment

To run the full application locally, you need to set up both the Python backend and the React frontend.

**Prerequisites:**

*   [Node.js & npm](https://nodejs.org/) (or pnpm/yarn)
*   [Python 3.x](https://www.python.org/) & pip

**Backend Setup (FastAPI):**

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Create and activate a virtual environment:**
    *   On macOS/Linux:
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```
    *   On Windows:
        ```bash
        python -m venv venv
        .\venv\Scripts\activate
        ```
3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **(Optional) Create a `.env` file:**
    The application might require environment variables. Create a `.env` file inside the `backend` directory based on any required configuration (e.g., database URL, API keys). Refer to `backend/app/config.py` if needed. *Note: `.env` is included in `.gitignore` and should not be committed.*
5.  **Run the backend server:**
    Navigate back to the `backend` directory if you are inside `backend/app`. The `main.py` is inside the `app` subdirectory.
    ```bash
    # Ensure you are in the 'backend' directory
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```
    The backend API should now be running on `http://localhost:8000`.

**Frontend Setup (React/Vite):**

1.  **Navigate to the project root directory (if you were in `backend`):**
    ```bash
    cd ..
    ```
2.  **Install Node.js dependencies:**
    ```bash
    npm install
    # or pnpm install / yarn install
    ```
3.  **Run the frontend development server:**
    ```bash
    npm run dev
    # or pnpm dev / yarn dev
    ```
    The frontend should now be running, typically on `http://localhost:5173` (check the terminal output for the exact URL), and will connect to the backend API running on port 8000.

**Running Both:**

Keep two terminals open: one running the backend server (`uvicorn`) and another running the frontend server (`npm run dev`). Access the application through the frontend URL provided by Vite.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
