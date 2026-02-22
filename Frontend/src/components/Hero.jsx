import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Hero({ children, hasStarted }) {
    const ref = useRef(null);

    return (
        <section
            ref={ref}
            className={`relative flex flex-col items-center ${hasStarted ? 'justify-start pt-32' : 'justify-center'} min-h-screen bg-deep-forest overflow-x-hidden transition-all duration-1000 ease-in-out`}
        >
            {/* Background Aurora */}
            <motion.div
                animate={{ opacity: hasStarted ? 0.3 : 1 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 bg-gradient-to-b from-[#0a2f20] via-[#051a14] to-black z-0 pointer-events-none"
            />

            <motion.div
                animate={{
                    opacity: hasStarted ? 0.1 : 0.2,
                    scale: hasStarted ? 1.5 : 1,
                    y: hasStarted ? -200 : 0
                }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh] bg-gradient-to-r from-aurora-green via-vibrant-lime to-aurora-green blur-[150px] rounded-full animate-pulse-slow pointer-events-none"
            />

            {/* Content */}
            <div className={`relative z-10 flex flex-col items-center gap-12 w-full max-w-5xl mx-auto px-4 transition-all duration-1000 ${hasStarted ? 'flex-1 text-left' : 'text-center'}`}>

                {/* Giant Typography */}
                <motion.h1
                    initial={{ y: 50, opacity: 0, filter: 'blur(10px)' }}
                    animate={{
                        y: hasStarted ? -50 : 0,
                        opacity: hasStarted ? 0 : 1,
                        filter: 'blur(0px)',
                        scale: hasStarted ? 0.5 : 1
                    }}
                    transition={{ duration: 0.8 }}
                    className="text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[12rem] leading-none font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20 select-none pb-4 font-display pointer-events-none"
                >
                    Wbot
                </motion.h1>

                {/* Brand Header for Chat Mode */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: hasStarted ? 1 : 0, y: hasStarted ? 0 : -20 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none"
                >
                    {/* Small subtle logo if needed, but nav bar handles it */}
                </motion.div>

                {/* Floating Chat Interface */}
                <motion.div
                    animate={{
                        marginTop: hasStarted ? "-12rem" : "-4rem",
                        width: "100%",
                        height: "auto"
                    }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="flex justify-center flex-1"
                >
                    {children}
                </motion.div>
            </div>
        </section >
    );
}
