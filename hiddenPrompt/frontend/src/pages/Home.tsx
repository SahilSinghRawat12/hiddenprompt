import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import UsernameModal from '../components/UsernameModal'
import { socket } from '../socket/socket'
import { useNavigate } from 'react-router-dom'
import JoinRoomModal from '../components/JoinRoomModal'
import toast from 'react-hot-toast'



const Home = () => {

  const navigate = useNavigate();
  const [showCreateModal , setShowCreateModal] = useState(false);
  const [showJoinModal , setShowJoinModal] = useState(false);

  useEffect(() => {

    const handleRoomCreate = ({ roomCode }: {roomCode: string}) => {
      setShowCreateModal(false);
      navigate(`/lobby/${roomCode}`)
    }

    const handleRoomJoin = ({ success , roomCode, gameStarted , message}: {success: boolean , roomCode?: string, gameStarted?: boolean, message?:string}) => {
      if(success && roomCode)
      {
        setShowJoinModal(false);

        // If game has ALREADY started, jump directly to Game page
        if (gameStarted) {
          navigate(`/game/${roomCode}`);
        } else {
          // Otherwise, go to Lobby page
          navigate(`/lobby/${roomCode}`);
        }
      } else {
        toast.error(message || "Failed to Join the Room");
      }
    }
    
    socket.on("room-created" , handleRoomCreate);
    socket.on("join-success", handleRoomJoin);

    return () => {
      socket.off("room-created" , handleRoomCreate);
      socket.off("join-success", handleRoomJoin);
    };

  } , [navigate])  // runs ONCE when page renders (because navigate never changes -> because it is a stable function)

  const handleCreateRoom = (username: string) => {
    localStorage.setItem("username" , username);

     socket.emit("create-room" , {
      username
     });      
  };

  const handleJoinRoom = ({roomCode , username}: {roomCode: string , username: string}) =>
  {
    if (!username.trim() || !roomCode.trim()) return;

    // Save username to localStorage before emitting
    localStorage.setItem("username" , username);

    // If game has ALREADY started, jump straight to /game/:roomCode

    socket.emit("join-room" , { username: username.trim() , room: roomCode.trim().toUpperCase() });
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