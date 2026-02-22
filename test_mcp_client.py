import httpx
import asyncio
import sys

async def main():
    url = "http://localhost:8000/mcp"
    query = "What's the weather in San Francisco?"
    
    if len(sys.argv) > 1:
        query = sys.argv[1]
        
    print(f"Testing MCP Endpoint: {url}")
    print(f"Query: {query}")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json={"query": query})
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
            
    except httpx.ConnectError:
        print("Error: Could not connect to localhost:8000. Is the server running?")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(main())
