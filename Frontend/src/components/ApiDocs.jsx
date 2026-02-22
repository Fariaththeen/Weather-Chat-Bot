import { motion } from 'framer-motion';
import { Terminal, Code, Cpu, Shield, Zap, X } from 'lucide-react';

export default function ApiDocs({ onClose }) {
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
                            Wbot API
                        </h1>
                        <p className="text-white/60 text-lg max-w-xl">
                            Integrate our agentic intelligence into your applications with our robust streaming architecture.
                        </p>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <Zap className="text-vibrant-lime w-8 h-8 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Realtime Streaming</h3>
                        <p className="text-white/50 text-sm">Server-Sent Events (SSE) deliver agent reasoning and data instantly.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <Cpu className="text-aurora-green w-8 h-8 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Native Tool Calling</h3>
                        <p className="text-white/50 text-sm">Graph-based execution allows autonomous multi-step reasoning.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <Shield className="text-teal-400 w-8 h-8 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Stateless Security</h3>
                        <p className="text-white/50 text-sm">Manage persistent sessions easily via the requested thread ID.</p>
                    </div>
                </div>

                {/* API Reference */}
                <div className="space-y-10">
                    <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                            <Terminal size={24} className="text-vibrant-lime" />
                            Stream Endpoint
                        </h2>

                        <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                            <div className="flex items-center gap-2 bg-white/5 px-4 py-3 border-b border-white/10">
                                <span className="bg-vibrant-lime text-black text-xs font-bold px-2 py-1 rounded">POST</span>
                                <code className="text-white/80 font-mono text-sm">/chat/stream?x_user_id=&#123;thread_id&#125;</code>
                            </div>
                            <div className="p-6">
                                <h4 className="text-sm text-white/50 mb-2 uppercase tracking-wide font-semibold">Request Body</h4>
                                <pre className="bg-[#020b08] p-4 rounded-lg border border-white/5 text-sm font-mono text-teal-300 mb-6 overflow-x-auto">
                                    {`{
  "query": "will it rain in Tokyo tomorrow?"
}`}
                                </pre>

                                <h4 className="text-sm text-white/50 mb-2 uppercase tracking-wide font-semibold">Response (SSE Stream)</h4>
                                <pre className="bg-[#020b08] p-4 rounded-lg border border-white/5 text-sm font-mono text-green-300 overflow-x-auto">
                                    {`data: {"type": "tool_start", "tool": "get_forecast"}

data: {"type": "weather_data", "data": {"location": "Tokyo", "forecast": [...]}}

data: {"type": "final_response", "content": "Yes, it is expected to rain in Tokyo tomorrow..."}

data: [DONE]`}
                                </pre>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                            <Code size={24} className="text-aurora-green" />
                            Integration Example
                        </h2>
                        <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                            <div className="flex items-center bg-white/5 px-4 py-3 border-b border-white/10">
                                <span className="text-white/70 text-sm">JavaScript (Fetch)</span>
                            </div>
                            <pre className="p-6 text-sm font-mono text-white/80 overflow-x-auto leading-relaxed">
                                <span className="text-purple-400">const</span> response = <span className="text-purple-400">await</span> <span className="text-blue-400">fetch</span>(<span className="text-green-400">'https://api.wbot.com/chat/stream?x_user_id=user123'</span>, &#123;{'\n'}
                                method: <span className="text-green-400">'POST'</span>,{'\n'}
                                headers: &#123; <span className="text-green-400">'Content-Type'</span>: <span className="text-green-400">'application/json'</span> &#125;,{'\n'}
                                body: <span className="text-blue-400">JSON</span>.<span className="text-yellow-200">stringify</span>(&#123; query: <span className="text-green-400">'weather update'</span> &#125;){'\n'}
                                &#125;);{'\n\n'}
                                <span className="text-purple-400">const</span> reader = response.body.<span className="text-yellow-200">getReader</span>();{'\n'}
                                <span className="text-purple-400">const</span> decoder = <span className="text-purple-400">new</span> <span className="text-yellow-200">TextDecoder</span>();{'\n\n'}
                                <span className="text-purple-400">while</span> (<span className="text-orange-400">true</span>) &#123;{'\n'}
                                <span className="text-purple-400">const</span> &#123; done, value &#125; = <span className="text-purple-400">await</span> reader.<span className="text-yellow-200">read</span>();{'\n'}
                                <span className="text-purple-400">if</span> (done) <span className="text-purple-400">break</span>;{'\n'}
                                <span className="text-blue-400">console</span>.<span className="text-yellow-200">log</span>(decoder.<span className="text-yellow-200">decode</span>(value));{'\n'}
                                &#125;
                            </pre>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
