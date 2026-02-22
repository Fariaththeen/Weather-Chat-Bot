import { useState } from 'react'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import ChatInterface from './components/ChatInterface'
import ApiDocs from './components/ApiDocs'
import McpDocs from './components/McpDocs'
import ToolsDocs from './components/ToolsDocs'
import AboutDocs from './components/AboutDocs'
import ContactModal from './components/ContactModal'

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentView, setCurrentView] = useState('chat');
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <Navigation onViewChange={setCurrentView} currentView={currentView} onContactClick={() => setIsContactOpen(true)} />

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      {currentView === 'chat' && (
        <Hero hasStarted={hasStarted}>
          <ChatInterface onStart={() => setHasStarted(true)} hasStarted={hasStarted} />
        </Hero>
      )}

      {currentView === 'api' && (
        <ApiDocs onClose={() => setCurrentView('chat')} />
      )}

      {currentView === 'mcp' && (
        <McpDocs onClose={() => setCurrentView('chat')} />
      )}

      {currentView === 'tools' && (
        <ToolsDocs onClose={() => setCurrentView('chat')} />
      )}

      {currentView === 'about' && (
        <AboutDocs onClose={() => setCurrentView('chat')} />
      )}

      {currentView === 'chat' && (
        <div className={`fixed inset-x-0 bottom-0 py-4 bg-black/80 backdrop-blur-xl text-center text-white/30 text-[10px] uppercase tracking-widest border-t border-white/5 transition-opacity duration-1000 ${hasStarted ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          &copy; 2026 Wbot AI. All Rights Reserved.
        </div>
      )}
    </>
  )
}

export default App
