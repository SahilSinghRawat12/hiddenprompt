// import './App.css'
// import { useEffect, useState } from 'react'
// import { socket } from "./socket/socket";
// import toast from 'react-hot-toast';

// // Define this on your React Frontend:
// type RoomUser = {
//     username: string;
//     socketId: string;
// };

// type JoinSuccessPayload = {
//     success: boolean;
//     room: string;
// }

// function App() {
  
//   const [userInput , setUserInput] = useState("");
//   const [roomInput , setRoomInput] = useState("");

//   const [room , setCurrentRoom] = useState("");

//   const [players , setPlayers] = useState<RoomUser[]>([]);

//   const [joinedUser , setJoinedUser] = useState<string[]> ([])

//   useEffect(() => {
//       socket.on("connect" , () => {
//         console.log("Connected to Server" , socket.id);
//       });

//       socket.on("disconnect", ()=> {
//         console.log("Disconnected");
//       });
  
//       const handleUserJoined = (msg: string) => {
//            setJoinedUser((prev) => [...prev , msg ]);      
//       }
      
//       const handleJoinSuccess = (data: JoinSuccessPayload) => {
//          if(data.success)
//           {
//             setCurrentRoom(data.room);
//           }      
//       };

//       const handleJoinError = (msg:string) => {
//         toast.error(msg);
//       };

//       socket.on("user-joined" , handleUserJoined);
//       socket.on("join-success" , handleJoinSuccess);
//       socket.on("join-error", handleJoinError);

//       socket.on("user-left" , (msg) => {
//         console.log(msg);
//         toast(msg);
//       });

//       socket.on("room-updated" , (data: {roomCode: string; players: RoomUser[]}) => {
//           setPlayers(data.players)
//       })

//       //this runs when the component unmounts
//       //It removes the event listeners to prevent -> memory leaks , duplicate listener if component mount again
//       return () => {
//         socket.off("connect");
//         socket.off("disconnect");
//         socket.off("join-success",handleJoinSuccess);
//         socket.off("join-error", handleJoinError);
//         socket.off("user-joined" , handleUserJoined);
//         socket.off("user-left");
//         socket.off("room-updated");
//       }
//   } , []);

//   const submitHandler = (e: React.SubmitEvent<HTMLFormElement>) => {

//     e.preventDefault();

//     setJoinedUser([]);

//     socket.emit("join-room" , {user:userInput , room: roomInput});

//     setUserInput("");
//     setRoomInput("");
//   }

//   return (
//     <>
//     <div className='text-center p-8 bg-gray-300 flex flex-col gap-3'>
//       <h1>HiddenPrompt</h1>
//       <h1>ROOM CODE: {room}</h1>
//     </div>

//     <form onSubmit={submitHandler} className='flex flex-col items-center justify-center p-8 bg-gray-400 gap-3 '>
//       <label>Username</label>
//         <input 
//         placeholder='username'
//         value={userInput}
//         onChange={(e) => setUserInput(e.target.value)}
//         className='outline-1'/>

//         <label>Room Code</label>
//         <input 
//         placeholder='Enter Room Code'
//         value={roomInput}
//         onChange={(e) => setRoomInput(e.target.value)}
//         className='outline-1'/>

//         <button className='bg-white'>Join Room</button>
//     </form>

//     <div className='bg-gray-500 text-center p-8'>
//       {
//         joinedUser.map((user, index) => (
//             <h1 key={index}
//             className='p-3'>{user}</h1>
//         ))
//       }
//     </div>

//     <div>
//       {
//         players.map((p) => (
//           <h1 key={p.socketId}>{p.username}</h1>
//         ))
//       }
//     </div>
//     </>  
//   )
// }

// export default App
