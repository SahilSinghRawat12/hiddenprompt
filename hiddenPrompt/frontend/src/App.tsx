import './App.css'
import { useEffect, useState } from 'react'
import { socket } from "./socket/socket";
import toast from 'react-hot-toast';

function App() {
  
  const [user , setUser] = useState("");
  const [userInput , setUserInput] = useState("");
  const [roomInput , setRoomInput] = useState("");
  const [room , setCurrentRoom] = useState("");

  const [joinedUser , setJoinedUser] = useState<string[]> ([])

  useEffect(() => {
      socket.on("connect" , () => {
        console.log("Connected to Server" , socket.id);
      });

      socket.on("disconnect", ()=> {
        console.log("Disconnected");
      });
  
      const handleUserJoined = (msg: string) => {
           setJoinedUser((prev) => [...prev , msg ]);
      }

      socket.on("join-error" , (msg) => {
        toast.error(msg);
      });

      socket.on("user-joined" , handleUserJoined);

      socket.on("user-left" , (msg) => {
        console.log(msg);
        toast(msg);
      })

      //this runs when the component unmounts
      //It removes the event listeners to prevent -> memory leaks , duplicate listener if component mount again
      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("user-joined" , handleUserJoined);
      }
  } , []);

  const handleClick = () => {
    setJoinedUser([]);

    socket.emit("join-room" , {user:userInput , room: roomInput});

    setCurrentRoom(roomInput);

    setUserInput("");
    setRoomInput("");
  }

  return (
    <>
    <div >
      HiddenPrompt
    </div>

    <div className='bg-red-400'>
      <label>Username</label>
        <input 
        placeholder='username'
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}/>

        <label>Room Code</label>
        <input 
        placeholder='Enter Room Code'
        value={roomInput}
        onChange={(e) => setRoomInput(e.target.value)}/>

        <button onClick={handleClick} className='bg-yellow-400'>Join Room</button>
    </div>

    <div className='bg-yellow-300 max-w-4xl'>
      {
        joinedUser.map((user, index) => (
            <h1 key={index}>{user}</h1>
        ))
      }
    </div>
    </>  
  )
}

export default App
