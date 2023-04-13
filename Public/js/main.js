console.log("connected to main.js");
// Get elements
const chatForm = document.getElementById("chat-form");
const chatMessage = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name")
const roomUsers = document.getElementById("users")


// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// initiate socket.io client
const socket = io();

socket.emit("joinRoom", { username, room });

// Message from server
socket.on("message", (message) => {
  console.log(message);
  // Display message
  outputMessages(message);

  //   Auto Scroll messages
  chatMessage.scrollTop = chatMessage.scrollHeight;
});

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputRoomUsers(users);
});

chatForm.onsubmit = (e) => {
  e.preventDefault();
  //   Get messages from user
  const msg = e.target.elements.msg.value;

  // send message to server
  socket.emit("chatMessage", msg);

  //   clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
};

function outputMessages(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class='meta'>${message.username} <span>${message.time}</span> </p>
    <p class='text'>
        ${message.text}
    </p>
    `;
  document.querySelector(".chat-messages").appendChild(div);
}

// Add room to DOM 
function  outputRoomName(room){
 roomName.innerHTML = room
};

// Add users to DOM

function outputRoomUsers(users){
roomUsers.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`
}
