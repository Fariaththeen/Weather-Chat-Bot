import { motion } from 'framer-motion';
import { X, Code2, Database, BrainCircuit, Globe, Zap, Network, Server } from 'lucide-react';

export default function ToolsDocs({ onClose }) {
    const techStack = [
        {
            title: "Frontend Experience",
            icon: <Code2 className="w-6 h-6 text-vibrant-lime" />,
            description: "Built with React and Vite for blazing fast development. Styled with Tailwind CSS for glassmorphic, premium interfaces, and animated with Framer Motion for buttery-smooth transitions."
        },
        {
            title: "Reasoning Engine",
            icon: <BrainCircuit className="w-6 h-6 text-aurora-green" />,
            description: "Powered by LangGraph and Groq. The agent uses Llama-3.1-8b-instant to evaluate queries natively, routing to specific tool calls or engaging in direct conversation without rigid prompt structures."
        },
        {
            title: "Backend Infrastructure",
            icon: <Server className="w-6 h-6 text-teal-400" />,
            description: "A Python FastAPI server that uses asynchronous processing and Server-Sent Events (SSE) to stream both structured data payloads (like UI weather cards) and natural language text synchronously."
        },
        {
            title: "Memory & Context (MCP)",
            icon: <Network className="w-6 h-6 text-emerald-300" />,
            description: "Integrated with the Model Context Protocol (MCP) using a local Knowledge Graph SQLite server. The agent securely recalls facts about you across sessions."
        },
        {
            title: "Data Sources",
            icon: <Globe className="w-6 h-6 text-green-400" />,
            description: "Leverages the OpenWeatherMap API and Geocoding API to resolve locations intelligently and fetch accurate, worldwide 5-day forecasts in real time."
        }
    ];

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
                            Tools & Technologies
                        </h1>
                        <p className="text-white/60 text-lg max-w-xl">
                            A deep dive into the modern stack powering the Wbot Agentic Weather Assistant.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {techStack.map((tech, idx) => (
                        <div
                            key={idx}
                            className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors"
                        >
                            <div className="bg-black/50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-white/5">
                                {tech.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{tech.title}</h3>
                            <p className="text-white/50 leading-relaxed text-sm">
                                {tech.description}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
