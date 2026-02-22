import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Sparkles } from 'lucide-react';

export default function ContactModal({ isOpen, onClose }) {
    const team = [
        { name: "Fariaththeen", delay: 0.2, pos: "top-[32%] md:top-[15%] left-[5%] md:left-[10%]", rot: "-rotate-6" },
        { name: "Ragesh", delay: 0.3, pos: "top-[35%] md:top-[20%] right-[3%] md:right-[15%]", rot: "rotate-6" },
        { name: "Karthikeyan", delay: 0.4, pos: "bottom-[35%] md:top-[45%] left-[5%] md:left-[5%]", rot: "rotate-2" },
        { name: "Vannila", delay: 0.5, pos: "bottom-[32%] md:bottom-[20%] right-[5%] md:right-[20%]", rot: "-rotate-3" },
        { name: "Thamizh", delay: 0.6, pos: "bottom-[26%] md:bottom-[15%] left-[15%] md:left-[25%]", rot: "rotate-12" },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                        className="relative w-full max-w-5xl h-[85vh] md:h-[70vh] md:aspect-video bg-[#051a14]/60 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex items-center justify-center p-4 md:p-8"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-4 text-white/50 hover:text-white bg-black/40 hover:bg-white/10 rounded-full transition-all border border-white/5 z-50 hover:rotate-90 hover:scale-110"
                        >
                            <X size={24} />
                        </button>

                        {/* Interactive Background Gradient */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-tr from-aurora-green via-vibrant-lime to-teal-500 blur-[120px] rounded-full opacity-15 pointer-events-none animate-pulse-slow" />

                        <div className="absolute inset-0 border-[1px] border-white/5 rounded-[3rem] pointer-events-none" />

                        {/* Central Highlighted Company Name */}
                        <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none w-full h-full">
                            <motion.div
                                initial={{ y: -30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-2 text-sm sm:text-xl md:text-2xl font-medium text-white/50 mb-2 font-display uppercase tracking-[0.2em] md:tracking-[0.3em]"
                            >
                                <Sparkles className="text-vibrant-lime w-6 h-6" />
                                Proudly Crafted By
                                <Sparkles className="text-vibrant-lime w-6 h-6" />
                            </motion.div>

                            <motion.div
                                initial={{ scale: 0.5, opacity: 0, filter: "blur(10px)" }}
                                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                                transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                                className="relative group mt-4 mb-8"
                            >
                                <div className="absolute -inset-8 bg-gradient-to-r from-aurora-green via-vibrant-lime to-aurora-green rounded-full blur-3xl opacity-20 group-hover:opacity-60 transition duration-700 pointer-events-auto"></div>
                                <h1 className="relative text-6xl sm:text-8xl md:text-[12rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/30 drop-shadow-2xl">
                                    CITPL
                                </h1>
                            </motion.div>
                        </div>

                        {/* Scattered Names */}
                        {team.map((member, i) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, scale: 0, rotate: 0 }}
                                animate={{ opacity: 1, scale: 1, rotate: parseFloat(member.rot.replace('rotate-', '')) || (member.rot.includes('-rotate') ? -parseFloat(member.rot.replace('-rotate-', '')) : 0) }}
                                transition={{ delay: member.delay, type: "spring", stiffness: 80, bounce: 0.5 }}
                                className={`absolute ${member.pos} ${member.rot} z-20`}
                            >
                                <div className="group relative px-3 sm:px-6 py-1.5 sm:py-3 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/20 shadow-[-10px_10px_30px_rgba(0,0,0,0.5)] hover:border-vibrant-lime/50 transition-colors cursor-default overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-vibrant-lime/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative text-xs sm:text-lg md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                                        {member.name}
                                    </span>
                                </div>
                            </motion.div>
                        ))}

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="absolute bottom-8 left-0 right-0 flex justify-center text-white/30 text-xs md:text-sm uppercase tracking-[0.2em] items-center gap-2 pointer-events-none"
                        >
                            Made with <Heart size={16} className="text-aurora-green animate-pulse" /> for the future of AI
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
