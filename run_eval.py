import asyncio
import json
import httpx
import os
from typing import List, Dict, Any

# Load dataset
DATASET_PATH = "evaluation_dataset.json"
API_URL = "http://localhost:8000/mcp"

async def run_eval():
    if not os.path.exists(DATASET_PATH):
        print(f"Error: {DATASET_PATH} not found.")
        return

    with open(DATASET_PATH, "r") as f:
        dataset = json.load(f)

    total = len(dataset)
    passed = 0
    results = []

    print(f"Running evaluation on {total} test cases...\n")

    async with httpx.AsyncClient(timeout=30.0) as client:
        for i, case in enumerate(dataset):
            query = case["query"]
            expected_intent = case.get("expected_intent") # optional
            expected_entities = case.get("expected_entities", {}) # optional
            
            print(f"[{i+1}/{total}] Query: {query}")
            
            try:
                # We analyze the response content primarily, as we can't easily see internal state via API
                # But for advanced MCP, we can check 'tools_used'
                response = await client.post(API_URL, json={"query": query})
                
                if response.status_code != 200:
                    print(f"  ❌ API Error: {response.status_code}")
                    results.append({"query": query, "status": "fail", "reason": "API Error"})
                    continue

                data = response.json()
                answer = data.get("answer", "")
                tools_used = data.get("tools_used", [])
                
                # Check Intent via tools used
                intent_match = True
                if expected_intent:
                    # Map expected_intent to tool names
                    # weather_tool -> weather_api
                    # forecast_tool -> forecast_api
                    mapped_tool = "weather_api" if expected_intent == "weather_tool" else "forecast_api"
                    if mapped_tool not in tools_used:
                         intent_match = False
                         print(f"  ⚠️ Intent Mismatch: Expected {mapped_tool}, got {tools_used}")

                # Check Entities (Heuristic check in answer text)
                # We only strictly enforce location in answer. Date/Activity might be implicit or rephrased.
                entity_match = True
                if "location" in expected_entities:
                    location = expected_entities["location"]
                    if location.lower() not in answer.lower():
                        entity_match = False
                        print(f"  ⚠️ Location Missing: Expected '{location}' in answer.")

                if intent_match and entity_match:
                    passed += 1
                    print("  ✅ Passed")
                    results.append({"query": query, "status": "pass"})
                else:
                    print("  ❌ Failed")
                    results.append({"query": query, "status": "fail"})

            except Exception as e:
                print(f"  ❌ Exception: {str(e)}")
                results.append({"query": query, "status": "error", "reason": str(e)})

    accuracy = (passed / total) * 100
    print(f"\nEvaluation Complete!")
    print(f"Accuracy: {accuracy:.2f}% ({passed}/{total})")

if __name__ == "__main__":
    asyncio.run(run_eval())
