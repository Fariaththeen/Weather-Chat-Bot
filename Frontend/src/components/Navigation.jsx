import { motion } from 'framer-motion';
import { ArrowRightCircle } from 'lucide-react';

export default function Navigation({ onViewChange, currentView, onContactClick }) {
    const links = ['Tools & Tech', 'API', 'MCP', 'About Project'];

    return (
        <motion.nav
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed top-8 left-0 right-0 flex justify-center z-50 pointer-events-none px-4"
        >
            <div className="flex items-center gap-4 md:gap-8 bg-glass-white backdrop-blur-xl border border-white/10 rounded-full px-4 md:px-6 py-2 md:py-3 pointer-events-auto shadow-lg shadow-black/20 overflow-x-auto max-w-full no-scrollbar">
                {/* Logo */}
                <button onClick={() => onViewChange('chat')} className="font-extrabold text-xl md:text-2xl text-white tracking-tight hover:text-vibrant-lime transition-colors pr-2 md:pr-0">Wbot</button>

                {/* Links */}
                <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
                    {links.map((link) => (
                        <button
                            key={link}
                            onClick={(e) => {
                                e.preventDefault();
                                if (link === 'API') onViewChange('api');
                                else if (link === 'MCP') onViewChange('mcp');
                                else if (link === 'Tools & Tech') onViewChange('tools');
                                else if (link === 'About Project') onViewChange('about');
                                else onViewChange('chat'); // Reset others to home for now
                            }}
                            className={`text-sm font-medium transition-colors duration-200 whitespace-nowrap ${(link === 'API' && currentView === 'api') || (link === 'MCP' && currentView === 'mcp') || (link === 'Tools & Tech' && currentView === 'tools') || (link === 'About Project' && currentView === 'about') ? 'text-vibrant-lime' : 'text-white/70 hover:text-white'
                                }`}
                        >
                            {link}
                        </button>
                    ))}
                    <div className="w-[1px] h-6 bg-white/20 mx-2 hidden sm:block"></div>
                    <button
                        onClick={onContactClick}
                        className="flex items-center gap-2 bg-black/80 text-white px-4 py-2 rounded-full font-medium text-sm hover:scale-105 transition-transform border border-white/10 whitespace-nowrap"
                    >
                        <ArrowRightCircle size={16} />
                        Contact
                    </button>
                </div>
            </div>
        </motion.nav>
    );
}
