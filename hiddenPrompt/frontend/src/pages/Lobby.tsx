import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import LobbyCard from '../components/LobbyCard'
import Footer from '../components/Footer'
import { socket } from '../socket/socket'
import { Navigate, useParams } from 'react-router-dom'


type RoomUser = {
    username: string;
    socketId: string;
}

interface RoomData {
  hostSocketId: string;
    players: RoomUser[];
    rounds: number;
    guessTime: number;
}


const Lobby = () => {

  const { roomCode } = useParams();
  const [roomData , setRoomData] = useState<RoomData | null>(null);

  if(!roomCode)
  {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    
    const handleRoomUpdated = (data : RoomData) => {
      setRoomData(data);
    }

    // LISTEN for the server's response event ("room-updated")
    socket.on("room-updated" , handleRoomUpdated);
    
    // EMIT the request event ("get-room-state") to ask the server for data
    socket.emit("get-room-state" ,roomCode);

    return () => {
      socket.off("room-updated", handleRoomUpdated);
    }
  }, [roomCode])

  return (
    <div className='bg-background min-h-screen'>
      
      <Header />

      <main className='flex justify-center items-center py-18'> 
        <LobbyCard 
        roomCode= {roomCode}
        players={roomData?.players || []} />
      </main>

      <Footer />
    </div>
  )
}

export default Lobby