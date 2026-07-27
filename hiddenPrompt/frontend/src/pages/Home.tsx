import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import UsernameModal from '../components/UsernameModal'
import { socket } from '../socket/socket'
import { useNavigate } from 'react-router-dom'
import JoinRoomModal from '../components/JoinRoomModal'



const Home = () => {

  const navigate = useNavigate();
  const [showCreateModal , setShowCreateModal] = useState(false);
  const [showJoinModal , setShowJoinModal] = useState(false);

  useEffect(() => {

    const handleRoomCreate = ({ roomCode }: {roomCode: string}) => {
      setShowCreateModal(false);
      navigate(`/lobby/${roomCode}`)
    }

    const handleRoomJoin = ({ success , roomCode}: {success: boolean , roomCode: string}) => {
      if(success === true)
      {
        setShowJoinModal(false);
        navigate(`/lobby/${roomCode}`)
      }
    }
    
    socket.on("room-created" , handleRoomCreate);
    socket.on("join-success", handleRoomJoin);

    return () => {
      socket.off("room-created" , handleRoomCreate);
      socket.off("user-joined", handleRoomJoin);
    };

  } , [navigate])  // runs ONCE when page renders (because navigate never changes -> because it is a stable function)

  const handleCreateRoom = (username: string) => {
     socket.emit("create-room" , {
      username
     });      
  };

  const handleJoinRoom = ({roomCode , username}: {roomCode: string , username: string}) =>
  {
    socket.emit("join-room" , { username , room: roomCode });
  };

  const handleSwitchToCreate = () => {
    setShowJoinModal(false);
    setShowCreateModal(true);
  }

  return (
    <div className='bg-background min-h-screen'>
      
    <Header />

    <main>
      <Hero 
      onCreateRoom={() => setShowCreateModal(true)}
      onJoinRoom={() => setShowJoinModal(true)}
      />

      {showCreateModal && <UsernameModal 
      isOpen={showCreateModal}
      onClose={() => setShowCreateModal(false)}
      onSubmit= {handleCreateRoom}
      />}

      {showJoinModal && <JoinRoomModal 
      isOpen={showJoinModal}
      onClose={() => setShowJoinModal(false)}
      onSubmit= {handleJoinRoom}
      onSwitchToCreate={handleSwitchToCreate}
      />}

    </main>

    <Footer />

    </div>
  )
}

export default Home