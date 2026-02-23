# Agentic Weather Assistant: Tech Stack

## 1. AI & Agent Intelligence 🧠
* **LangGraph & LangChain:** The core framework used to build our autonomous AI "Agent" workflow. It allows the model to interpret queries, execute external tools, format the output, and handle state/retries.
* **Groq API (Llama-3.1-8b-instant):** The ultra-fast, cloud-hosted Large Language Model (LLM) doing the actual "thinking" and text generation natively in real-time.
* **Model Context Protocol (MCP):** A standardized protocol we are using locally via an SQLite background server. This empowers the agent to permanently memorize and search through facts told to it across entirely separate chat threads.

## 2. Frontend (The User Interface) 🖥️
* **React:** The core JavaScript structure handling the complex, stateful user interface.
* **Vite:** An unbelievably fast, modern build tool and development server used to bundle the React code into production-ready static assets.
* **Tailwind CSS:** A utility-first CSS framework natively driving the gorgeous dark-mode aesthetics, custom gradients (like `vibrant-lime` and `aurora-green`), and sleek layout structure.
* **Framer Motion:** The animation physics library powering the fluid, organic slide-ins, spring-based popups, and hover effects across the interface.
* **Lucide React:** A clean, modern SVG icon library used for UI buttons.

## 3. Backend (The Application Server) ⚙️
* **Python (v3.14.2):** The robust programming language orchestrating all the raw backend logic.
* **FastAPI:** A high-performance, asynchronous web framework natively powering the backend API and securely serving the compiled React frontend static files in production.
* **Uvicorn:** The lightning-fast ASGI web server hosting the FastAPI Python application.
* **SSE (Server-Sent Events) via Starlette:** The underlying streaming protocol we built into the backend that allows the AI to "type out" its answers to the frontend dynamically token-by-token.
* **Pydantic:** Strictly validates and enforces the data structure models natively.

## 4. External APIs 🌍
* **OpenWeatherMap API:** The real-time external data source the Agent actively calls out to (using raw coordinate geocoding) to autonomously fetch live temperature and weather condition matrices.

## 5. Deployment & Containerization 🐳
* **Docker & Docker Compose:** Containerization tools natively configured in the repository to ensure this app can boot up identically on any operating system securely.
* **Render:** The seamless cloud application hosting provider deployed natively via the synced GitHub repository.
