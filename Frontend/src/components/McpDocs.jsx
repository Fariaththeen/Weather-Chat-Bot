import { motion } from 'framer-motion';
import { Blocks, Database, Globe, Lightbulb, TerminalSquare } from 'lucide-react';

export default function McpDocs() {
    return (
        <div className="min-h-screen bg-[#051a14] text-white pt-24 px-4 pb-12 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-aurora-green via-white to-vibrant-lime font-display mb-4">
                            Model Context Protocol
                        </h1>
                        <p className="text-white/60 text-lg max-w-xl">
                            Extending our Agent's capabilities through standardized tool-calling. Learn how to run MCP servers locally and connect them to AI.
                        </p>
                    </div>
                </div>

                {/* What is MCP? */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <Blocks className="text-vibrant-lime w-8 h-8 mb-4" />
                        <h3 className="text-xl font-bold mb-2">What is MCP?</h3>
                        <p className="text-white/50 text-sm leading-relaxed">
                            The Model Context Protocol (MCP) is an open standard that allows AI agents to securely connect to local and remote data sources. It acts as a universal bridge, standardizing how AI interacts with files, databases, APIs, and tools.
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <Globe className="text-aurora-green w-8 h-8 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Why It Matters</h3>
                        <p className="text-white/50 text-sm leading-relaxed">
                            Instead of hardcoding APIs into every AI agent, you can write an MCP server once. Any MCP-compatible agent can immediately consume its tools and context dynamically, decoupling the agent's core smarts from its integrations.
                        </p>
                    </div>
                </div>

                {/* How to run locally */}
                <div className="space-y-10">
                    <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                            <TerminalSquare size={24} className="text-vibrant-lime" />
                            Running an MCP Server Locally
                        </h2>

                        <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden shadow-2xl mb-6">
                            <div className="p-6">
                                <p className="text-white/80 text-sm mb-4">
                                    You can easily spin up an MCP server locally using <code>npx</code> or Python to give your LLM agent secure access to your development machine. The official Anthropic team provides several pre-built servers!
                                </p>

                                <h4 className="text-sm text-white/50 mb-2 uppercase tracking-wide font-semibold">1. Start the SQLite MCP Server</h4>
                                <pre className="bg-[#020b08] p-4 rounded-lg border border-white/5 text-sm font-mono text-teal-300 mb-6 overflow-x-auto">
                                    {`# This command runs an isolated MCP server that acts as a bridge to a local DB
npx -y @modelcontextprotocol/server-sqlite --db-path ~/my-database.db`}
                                </pre>

                                <h4 className="text-sm text-white/50 mb-2 uppercase tracking-wide font-semibold">2. Start the Local File System Server</h4>
                                <pre className="bg-[#020b08] p-4 rounded-lg border border-white/5 text-sm font-mono text-teal-300 overflow-x-auto">
                                    {`# This allows the AI agent to securely read AND write files only in specified directories
npx -y @modelcontextprotocol/server-filesystem /Users/my_user/Desktop/projects`}
                                </pre>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                            <Database size={24} className="text-aurora-green" />
                            Connecting MCP to an Agent
                        </h2>
                        <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                            <div className="p-6">
                                <p className="text-white/80 text-sm mb-6">
                                    Once the MCP server is running on stdio (standard input/output), an Agent (like Claude Desktop, or our custom Python LangGraph Agent) can be configured to spawn the server process and listen to its available tools.
                                </p>

                                <h4 className="text-sm text-white/50 mb-2 uppercase tracking-wide font-semibold">Example Claude Desktop Configuration (claude_desktop_config.json)</h4>
                                <pre className="bg-[#020b08] p-4 rounded-lg border border-white/5 text-sm font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                                    {`{
  "mcpServers": {
    "local-filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/Desktop/workspace"
      ]
    },
    "sqlite": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sqlite",
        "--db-path",
        "/Users/Desktop/data.db"
      ]
    }
  }
}`}
                                </pre>
                            </div>
                            <div className="bg-white/5 p-4 border-t border-white/10 flex items-start gap-3">
                                <Lightbulb className="text-vibrant-lime w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-white/60 text-sm">
                                    <strong>Pro Tip:</strong> When the agent starts up, it automatically queries the MCP server using JSON-RPC messages (like <code>tools/list</code>). The MCP Server responds with exactly what tools it offers ("read_file", "query_db"), and the Agent dynamically passes those capabilities to the LLM!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
