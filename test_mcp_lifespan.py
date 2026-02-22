import asyncio
from app.agent.mcp_client import mcp_server_lifespan

async def main():
    print("starting lifespan")
    async with mcp_server_lifespan():
        print("Inside lifespan context! Sleeping...")
        await asyncio.sleep(2)
        print("Waking up!")
    print("exited lifespan")

asyncio.run(main())
