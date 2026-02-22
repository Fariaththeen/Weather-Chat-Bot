import asyncio
from langchain_mcp_adapters.tools import load_mcp_tools
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def run():
    server_params = StdioServerParameters(
        command="npx",
        args=["-y", "@modelcontextprotocol/server-memory"]
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            # Load tools using Langchain adapter
            tools = await load_mcp_tools(session)
            print("LangChain Tools loaded:")
            for tool in tools:
                print(f"- {tool.name}: {tool.description}")

if __name__ == "__main__":
    asyncio.run(run())
