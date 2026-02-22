import asyncio
import json
import httpx

async def test():
    user = "web_user_" + "test1"
    url = "http://127.0.0.1:8000/chat/stream?x_user_id=" + user
    qs = [
        "Yes in cuddalore what is the forecast in feb 23",
        "do I need an umbrella in London tomorrow?",
        "what about the temperature in Chicago right now?"
    ]
    
    async with httpx.AsyncClient() as client:
        for q in qs:
            print(f"> {q}")
            res = await client.post(url, json={"query": q}, timeout=15)
            # Parse the SSE
            lines = res.text.split("\n")
            for line in lines:
                if line.startswith("data: "):
                    d = line[6:]
                    if d != "[DONE]":
                        j = json.loads(d)
                        if j["type"] == "final_response":
                            print(f"< {j['content']}")
            print()

asyncio.run(test())
