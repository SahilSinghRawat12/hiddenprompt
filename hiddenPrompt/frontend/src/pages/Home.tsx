import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Hero from '../components/Hero'



const Home = () => {
  return (
    <div className='bg-background min-h-screen'>
      
    <Header />

    <main>
      <Hero />
    </main>

    <Footer />

    </div>
  )
}

export default Home