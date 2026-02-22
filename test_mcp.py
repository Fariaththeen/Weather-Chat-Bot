import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def run():
    # Use the memory server
    server_params = StdioServerParameters(
        command="npx",
        args=["-y", "@modelcontextprotocol/server-memory"]
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize the connection
            await session.initialize()
            print("Initialized!")

            # List available tools
            tools = await session.list_tools()
            print("Tools available:")
            for tool in tools.tools:
                print(f"- {tool.name}: {tool.description}")
            
            # Call the read_graph tool just to test
            try:
                result = await session.call_tool("read_graph", {})
                print("read_graph result:", result)
            except Exception as e:
                print("Error calling tool:", e)

if __name__ == "__main__":
    asyncio.run(run())
