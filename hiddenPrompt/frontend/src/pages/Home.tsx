import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import UsernameModal from '../components/UsernameModal'
import { socket } from '../socket/socket'
import { useNavigate } from 'react-router-dom'



const Home = () => {

  const navigate = useNavigate();
  const [showModal , setShowModal] = useState(false);

  useEffect(() => {

    const handleRoomCreate = ({ roomCode }: {roomCode: string}) => {
      setShowModal(false);
      navigate(`/lobby/${roomCode}`)
    }
    
    socket.on("room-created" , handleRoomCreate);

    return () => {
      socket.off("room-created" , handleRoomCreate);
    };

  } , [navigate])  // runs ONCE when page renders (because navigate never changes -> because it is a stable function)

  const handleCreateRoom = (username: string) => {
     socket.emit("create-room" , {
      username
     });      
  }

  return (
    <div className='bg-background min-h-screen'>
      
    <Header />

    <main>
      <Hero 
      onCreateRoom={() => setShowModal(true)}
      />

      {showModal && <UsernameModal 
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      onSubmit= {handleCreateRoom}
      />}

    </main>

    <Footer />

    </div>
  )
}

export default Home