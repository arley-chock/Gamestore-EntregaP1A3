import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Usuario from './pages/Usuario'
import Checkout from './pages/Checkout'
import Classicos from './pages/Classicos'
import Suporte from './pages/Suporte'
import './index.css'
import './pages.css'

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Header />
        <main className="conteudo-principal">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/usuario" element={<Usuario />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/classicos" element={<Classicos />} />
            <Route path="/suporte" element={<Suporte />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App