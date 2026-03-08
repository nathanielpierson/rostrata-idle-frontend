import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import WoodcuttingPage from './pages/WoodcuttingPage'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/play" element={<WoodcuttingPage />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
