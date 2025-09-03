import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import WaveBackground from './components/WaveBackground';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <div className="relative min-h-screen bg-[#0B192C]">{/* match deep blue */}
        {/* Decorative background spanning the full viewport */}
        <WaveBackground className="absolute inset-0 w-full h-screen z-0 pointer-events-none" />

        {/* Page content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24 md:pt-28 lg:pt-32 pb-10">
          <Outlet />
        </div>
      </div>
    </AuthProvider>
  )
}

export default App
