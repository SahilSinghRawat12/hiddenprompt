# HiddenPrompt Developer Diary

---

## Day 1

Date:
July 13, 2026

Goal:
Set up the project architecture.

Completed:
- Created PRD
- Designed architecture
- Planned folder structure

Challenges:
- Unsure whether MongoDB was needed.

Decision:
Skipped MongoDB for MVP because game state only needs to exist while the room is active.

What I Learned:
Real-time games don't always require a database.

Next Goal:
Learn Socket.IO fundamentals.


## Day 2

Date:
July 15, 2026

Goal:
Setting up socket io and exploring socket io fundamentals.

Completed:
- Created client and server connection in socket
- sending message from client to server and server to client

Challenges:
- Problem with best practice for setting up the socket.

Decision:
created a separate folder for socket inside src to keep the structre clean.

What I Learned:
How to communicate between client and server through socket io and about web sockets.

Next Goal:
step by step adding more socket functions.


## Day 3

Date:
July 16, 2026

Goal:
Creating game room system using socket.

Completed:
- player can join rooms.
- if player joins or exit the room the notification will be shown to other players in the room.
- Player cant use the username if the username already exists in the room.

Challenges:
- Problem with updating the player list when someone join or exit the room.

Decision:
Used map data structure to store room and player username and socketId.

What I Learned:
How room system work , how to create room , join room , leave room.

Next Goal:
Showing player list in the Lobby -> Creating Lobby.


## Day 4

Date:
July 17, 2026

Goal:
Creating game Lobby system.

Completed:
- Player list -> showing the names of players that joined the room.

Challenges:
- Problem with updating the player list when someone join or exit the room.

Decision:
Used map data structure to store room and player username and socketId.

What I Learned:
How to make use of helper functions to write clean code.

Next Goal:
chat , canvas , game system planning etc.




## Day 5

Date:
July 19, 2026

Goal:
Designing the Home and Lobby UI.

Completed:
- COmpleted the design for Home and Lobby.

Challenges:
- Structuring and Designing of the page.

Decision:
Using a dark noir theme for the page.

Next Goal:
Full creation of the lobby and home page.


## Day 7

Date:
July 23, 2026

Goal:
Finished the home ui and create room.

Completed:
- COmpleted the home ui and create room.

Challenges:
- using socket for creatnig the room.


Next Goal:
completing the lobby and canvas.


