import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import PlayPage from './pages/PlayPage'
import WoodcuttingPage from './pages/WoodcuttingPage'
import SkillsPage from './pages/SkillsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import FishingPage from './pages/FishingPage'
import MiningPage from './pages/MiningPage'

function App() {
  return (
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/play/woodcutting" element={<WoodcuttingPage />} />
        <Route path="/play/fishing" element={<FishingPage />} />
        <Route path="/play/mining" element={<MiningPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
      <Footer />
    </AuthProvider>
  )
}

export default App
