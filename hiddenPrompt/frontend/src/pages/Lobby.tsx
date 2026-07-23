import React from 'react'
import Header from '../components/Header'
import LobbyCard from '../components/LobbyCard'
import Footer from '../components/Footer'

const Lobby = () => {
  return (
    <div className='bg-background min-h-screen'>
      
      <Header />

      <LobbyCard />

      <Footer />
    </div>
  )
}

export default Lobby