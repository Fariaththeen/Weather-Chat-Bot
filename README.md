# Agentic Weather Assistant

An intelligent weather assistant powered by LangGraph, FastAPI, and MCP (Model Context Protocol).

## Features
- **Natural Language Understanding**: Uses LangGraph to route queries.
- **Weather API Integration**: Fetches real-time weather and 5-day forecasts.
- **Advanced Capabilities**:
    - **Multi-step Reasoning** ("Can I go jogging?")
    - **Streaming Responses** (SSE)
    - **Conversation Memory**
    - **Geocoding & Location Intelligence**
- **Robustness**: Automatic retries, caching, and error handling.
- **MCP Support**: Exposes functionality as an MCP tool with rich metadata.
- **FastAPI Backend**: robust HTTP API.
- **Evaluation**: Automated accuracy testing script.

## Setup

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Copy `.env.example` to `.env` and add your API key:
    ```bash
    cp .env.example .env
    ```
4.  Run the application:
    ```bash
    uvicorn app.main:app --reload
    ```
