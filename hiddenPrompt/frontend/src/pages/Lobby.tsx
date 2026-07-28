import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import LobbyCard from '../components/LobbyCard'
import Footer from '../components/Footer'
import { socket } from '../socket/socket'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import type { RoomData } from '../types/socket'
import toast from 'react-hot-toast'


const Lobby = () => {

  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [roomData , setRoomData] = useState<RoomData | null>(null);

  const username = localStorage.getItem("username");


  useEffect(() => {

    if(!roomCode) return;

    if(!username)
    {
      toast.error("Please enter a username first.");
      navigate("/", { replace: true });
      return;
    }

    const handleRoomUpdated = (data : RoomData) => {
      setRoomData(data);
    }

    // LISTEN for the server's response event ("room-updated")
    socket.on("room-updated" , handleRoomUpdated);

    // Emit reconnect event so server links this new socket.id with the existing user/room
    socket.emit("reconnect-room" , { username , roomCode });

    return () => {
      socket.off("room-updated", handleRoomUpdated);
    }
  }, [roomCode, username, navigate]);


  // If URL has no roomCode or localStorage has no username
  if (!roomCode || !username) {
    return <Navigate to="/" replace />;
  }

  // Loading state until server emits room-updated
  if (!roomData) {
    return (
      <div className='bg-background min-h-screen'>
        <Header />
        <main className='flex justify-center items-center py-18 font-mono text-stone-800'>
          <span>LOADING CASE FILE...</span>
        </main>
        <Footer />
      </div>
    );
  }


  return (
    <div className='bg-background min-h-screen'>
      
      <Header />

      <main className='flex justify-center items-center py-18'> 
        <LobbyCard 
        roomCode= {roomCode}
        // players={roomData?.players || []
          roomData= {roomData}
        />
      </main>

      <Footer />
    </div>
  )
}

export default Lobby