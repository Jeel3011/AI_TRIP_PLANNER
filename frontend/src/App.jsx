import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from './lib/supabase';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Earth3D from './components/Earth3D';
import ChatInterface from './components/ChatInterface';
import Auth from './components/Auth';
import { LogOut } from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#fdfbf7] overflow-hidden font-sans">
      {/* 3D Background Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <Suspense fallback={null}>
            {/* Reduced stars for light mode or make them faint */}
            <Stars radius={100} depth={50} count={2000} factor={3} saturation={0} fade speed={1} />
            <Earth3D />
            <OrbitControls 
              enableZoom={false} 
              enablePan={false} 
              autoRotate 
              autoRotateSpeed={0.5} 
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Top right sign out button */}
      {session && (
        <button 
          onClick={() => supabase.auth.signOut()}
          className="absolute top-6 right-6 z-30 flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-amber-50 border border-amber-200 rounded-xl text-slate-700 font-medium tracking-wide transition-all shadow-sm backdrop-blur-md"
        >
          <LogOut className="w-4 h-4 text-orange-500" />
          Sign Out
        </button>
      )}

      {/* UI Overlay */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {!session ? (
          <Auth />
        ) : (
          <ChatInterface session={session} />
        )}
      </div>
    </div>
  );
}

export default App;
