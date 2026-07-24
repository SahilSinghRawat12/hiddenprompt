import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import LobbyCard from '../components/LobbyCard'
import Footer from '../components/Footer'
import { socket } from '../socket/socket'
import { Navigate, useParams } from 'react-router-dom'


interface Players {
  username: string;
  socketId: string;
}


const Lobby = () => {

  const { roomCode } = useParams();
  const [players , setPlayers] = useState<Players[]> ([]);

  if(!roomCode)
  {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    
    const handleRoomUpdated = ({ players } : { players: Players[] }) => {
      setPlayers(players);
    }

    socket.on("room-updated" , handleRoomUpdated);

    return () => {
      socket.off("room-updated", handleRoomUpdated);
    }
  }, [])

  return (
    <div className='bg-background min-h-screen'>
      
      <Header />

      <main className='flex justify-center items-center py-18'> 
        <LobbyCard 
        roomCode= {roomCode}
        players= {players} />
      </main>

      <Footer />
    </div>
  )
}

export default Lobby