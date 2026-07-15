import './App.css'
import { useEffect, useState } from 'react'
import { socket } from "./socket/socket";

function App() {
  
  const [msg , setMsg] = useState<string[]> ([]);

  useEffect(() => {
      socket.on("connect" , () => {
        console.log("Connected to Server" , socket.id);
      });

      socket.on("disconnect", ()=> {
        console.log("Disconnected");
      });
  
      socket.on("pong" , (msg)=> {
        console.log(msg);
        setMsg((prev) => [...prev , msg]);
      });

      //this runs when the component unmounts
      //It removes the event listeners to prevent -> memory leaks , duplicate listener if component mount again
      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("pong");
      }
  } , []);

  const handleClick = () => {
    socket.emit("ping" , "PING");
  }

  return (
    <>
    <div >
      HiddenPrompt
    </div>

    <button onClick={handleClick} className='bg-red-400'>Send</button>
     <div> {msg.map((m, index) => (
      <h1 key={index}>{m}</h1>
     ))} </div>
    </>  
  )
}

export default App
