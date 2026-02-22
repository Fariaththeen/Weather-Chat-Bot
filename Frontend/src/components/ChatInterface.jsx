import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, User, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import WeatherCard from './WeatherCard';
import ForecastCard from './ForecastCard';

export default function ChatInterface({ onStart, hasStarted }) {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]); // Array of { role: 'user' | 'agent', content: string, reasoning?: string, data?: any }
    const [isStreaming, setIsStreaming] = useState(false);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim() || isStreaming) return;

        if (!hasStarted && onStart) {
            onStart();
        }

        const userMsg = { role: 'user', content: query };
        const agentMsgId = Date.now();

        // Optimistic Update
        setMessages(prev => [...prev, userMsg, { role: 'agent', content: '', reasoning: '', id: agentMsgId, isLoading: true }]);
        const currentQuery = query;
        setQuery('');

        setIsStreaming(true);
        setLoading(true);

        try {
            const response = await fetch('/chat/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: currentQuery }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            setLoading(false);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value);
                const lines = text.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '').trim();
                        if (dataStr === '[DONE]') {
                            setIsStreaming(false);
                            setMessages(prev => prev.map(msg =>
                                msg.id === agentMsgId ? { ...msg, isLoading: false } : msg
                            ));
                            break;
                        }

                        try {
                            const data = JSON.parse(dataStr);

                            if (data.type === 'tool_start') {
                                setMessages(prev => prev.map(msg =>
                                    msg.id === agentMsgId ? { ...msg, reasoning: `Processing: ${data.tool.replace('_node', '').replace('_', ' ')}...` } : msg
                                ));
                            } else if (data.type === 'weather_data') {
                                setMessages(prev => prev.map(msg =>
                                    msg.id === agentMsgId ? { ...msg, data: data.data } : msg
                                ));
                            } else if (data.type === 'final_response') {
                                setMessages(prev => prev.map(msg =>
                                    msg.id === agentMsgId ? { ...msg, content: msg.content + data.content, reasoning: '' } : msg
                                ));
                            }
                        } catch (e) {
                            console.error('Error parsing SSE:', e);
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Stream error:', err);
            setMessages(prev => prev.map(msg =>
                msg.id === agentMsgId ? { ...msg, content: 'Sorry, an error occurred.', isLoading: false } : msg
            ));
            setIsStreaming(false);
            setLoading(false);
        }
    };

    return (
        <div className={`flex flex-col w-full max-w-4xl mx-auto transition-all duration-1000 ${hasStarted ? 'pb-32' : 'h-auto'}`}>

            {/* Messages Area */}
            {hasStarted && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="flex-1 px-4 py-4 space-y-6"
                >
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            <div className={`flex items-start gap-4 max-w-[95%] md:max-w-[85%] w-full ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-white/10 text-white' : 'bg-vibrant-lime text-black'
                                    }`}>
                                    {msg.role === 'user' ? <User size={14} /> : <Terminal size={14} />}
                                </div>

                                {/* Bubble */}
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed text-left min-w-0 overflow-hidden ${msg.role === 'user'
                                    ? 'bg-white/10 text-white backdrop-blur-md border border-white/5'
                                    : 'bg-deep-forest/80 backdrop-blur-xl border border-white/10 text-white/90 shadow-2xl'
                                    }`}>
                                    {/* Reasoning Indicator */}
                                    {msg.reasoning && msg.isLoading && (
                                        <div className="flex items-center gap-2 mb-2 text-xs font-mono text-aurora-green/70 uppercase tracking-wider">
                                            <div className="w-2 h-2 bg-aurora-green rounded-full animate-pulse" />
                                            {msg.reasoning}
                                        </div>
                                    )}

                                    {msg.content && (
                                        <div className="font-light max-w-prose prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-li:my-0 pb-2">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    )}

                                    {/* Rich Data Visualization */}
                                    {msg.data && (
                                        <div className="mt-4 w-full">
                                            {msg.data.forecast
                                                ? <ForecastCard data={msg.data} />
                                                : <WeatherCard data={msg.data} />
                                            }
                                        </div>
                                    )}

                                    {msg.role === 'agent' && !msg.content && !msg.reasoning && !msg.data && msg.isLoading && (
                                        <div className="flex gap-1 h-4 items-center">
                                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </motion.div>
            )}

            {/* Input Area */}
            <div className={hasStarted ? "fixed bottom-0 left-0 right-0 px-4 pb-4 md:pb-8 pt-24 bg-gradient-to-t from-[#051a14] via-[#051a14]/90 to-transparent z-50 pointer-events-none" : "w-full px-4 mt-auto"}>
                <motion.form
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    onSubmit={handleSubmit}
                    className={`relative group flex-shrink-0 w-full max-w-4xl mx-auto ${hasStarted ? 'pointer-events-auto' : ''}`}
                >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-aurora-green via-vibrant-lime to-aurora-green rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>

                    <div className="relative flex items-center bg-deep-forest/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask anything..."
                            className="flex-1 bg-transparent px-4 text-base text-white placeholder-white/40 outline-none font-medium"
                            disabled={isStreaming}
                            autoFocus
                        />

                        <button
                            type="submit"
                            disabled={!query.trim() || isStreaming}
                            className={`p-2 rounded-xl transition-all duration-300 ${query.trim()
                                ? 'bg-vibrant-lime text-black hover:scale-105'
                                : 'bg-white/5 text-white/20'
                                }`}
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}
