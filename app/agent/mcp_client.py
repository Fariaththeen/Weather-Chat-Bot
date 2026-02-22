import contextlib
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from langchain_mcp_adapters.tools import load_mcp_tools

# Global state to hold the tools dynamically loaded from the MCP server
mcp_tools = []

@contextlib.asynccontextmanager
async def mcp_server_lifespan(app):
    """Context manager to handle the lifecycle of the local MCP Server."""
    global mcp_tools
    
    server_params = StdioServerParameters(
        command="npx",
        args=["-y", "@modelcontextprotocol/server-memory"]
    )

    print("Starting MCP Memory Server...")
    # Open the stdio connection to the local npx process
    async with stdio_client(server_params) as (read, write):
        # Open the active session protocol
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            # Load tools using Langchain adapter and store globally
            loaded_tools = await load_mcp_tools(session)
            mcp_tools.clear()
            mcp_tools.extend(loaded_tools)
            
            print(f"MCP Server started. Loaded {len(mcp_tools)} tools.")
            for tool in mcp_tools:
                print(f"  - {tool.name}")
                
            # Yield control back to the FastAPI app
            # The session and stdio connection will stay open as long as FastAPI is running.
            yield

    print("MCP Server shut down cleanly.")
    mcp_tools.clear()
