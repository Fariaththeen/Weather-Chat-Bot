import { motion } from 'framer-motion';
import { Layers, Rocket, Code2, Database, ShieldCheck, Settings } from 'lucide-react';

export default function AboutDocs({ onClose }) {
    return (
        <div className="min-h-screen bg-[#051a14] text-white pt-24 px-4 pb-12 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto relative"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-12 relative">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-aurora-green via-white to-vibrant-lime font-display mb-4">
                            About This Project
                        </h1>
                        <p className="text-white/60 text-lg max-w-xl">
                            A detailed breakdown of the complete journey and architecture behind the Agentic Weather Assistant upgrade.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-12">

                    {/* Phase 1-3 */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-aurora-green/10 rounded-full blur-3xl group-hover:bg-aurora-green/20 transition-colors"></div>
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <Layers className="text-vibrant-lime" />
                            Core Intelligence & Foundation
                        </h3>
                        <ul className="space-y-3 text-white/70">
                            <li><strong className="text-white">State Management:</strong> Upgraded the core <code>AgentState</code> to natively support persistent conversation histories using LangGraph's in-memory Checkpointer.</li>
                            <li><strong className="text-white">Data Integration:</strong> The <code>WeatherClient</code> was completely overhauled to fetch dynamic, multi-day 5-day forecasts with built-in Tenacity retry decorators for resilience.</li>
                            <li><strong className="text-white">Reasoning Engine:</strong> We replaced static regex routing with a dynamic LangGraph <code>ReasoningNode</code>. The agent can now intuitively evaluate complex multi-step queries like "Is it safe to go for a run?".</li>
                        </ul>
                    </div>

                    {/* Phase 4-9 */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-vibrant-lime/10 rounded-full blur-3xl group-hover:bg-vibrant-lime/20 transition-colors"></div>
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <Rocket className="text-aurora-green" />
                            Reliability & Streaming UX
                        </h3>
                        <ul className="space-y-3 text-white/70">
                            <li><strong className="text-white">Realtime Streaming:</strong> Hooked deep into LangGraph's <code>astream_events</code>, we built a custom FastAPI Server-Sent Events (SSE) endpoint to stream thoughts, JSON Tool payload outputs, and text concurrently.</li>
                            <li><strong className="text-white">Location Intelligence:</strong> Integrated a <code>GeocodingClient</code> that resolves ambiguous cities directly into exact latitude/longitude coordinates to avoid weather API errors.</li>
                            <li><strong className="text-white">Automated Eval Pipeline:</strong> Built a standalone <code>run_eval.py</code> system to test the agent against a curated dataset, ensuring pass/fail accuracy across edge cases.</li>
                        </ul>
                    </div>

                    {/* Phase 10-14 */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl group-hover:bg-emerald-400/20 transition-colors"></div>
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <Code2 className="text-emerald-300" />
                            Full Stack & MCP Memory
                        </h3>
                        <ul className="space-y-3 text-white/70">
                            <li><strong className="text-white">Vite/React Frontend:</strong> Designed and integrated a premium, glassmorphic UI capable of un-packing the SSE stream to render interactive <code>WeatherCard</code> and <code>ForecastCard</code> components dynamically inline with chat messages.</li>
                            <li><strong className="text-white">Pure Tool-Calling:</strong> Ripped out standard LLM routing specifically to adopt the native `tools_condition` paradigm in LangGraph, binding the Llama-3.1 model directly to Python functions.</li>
                            <li><strong className="text-white">Persistent Server Memory:</strong> Connected the standard <code>@modelcontextprotocol/server-memory</code> node package straight into the Python loop using <code>langchain-mcp-adapters</code>. The AI agent now autonomously recalls facts across sessions.</li>
                        </ul>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}
