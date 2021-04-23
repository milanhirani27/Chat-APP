const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser,userLeave, getRoomUsers} = require('./utils/users')

//port init
const port = process.env.PORT || 3000

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'chat-APP';

//set static folder
app.use(express.static(path.join(__dirname, 'public')))


//run when client connect
io.on('connection', socket=>{

    socket.on('joinRoom', ({username , room})=>{

        const user = userJoin(socket.id, username,room);

        socket.join(user.room);

        //welcome
        socket.emit('message', formatMessage('chat-APP','Welcome to chat'));

        //boardcost to user connects
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,` ${user.username } has joined the chat`));

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    })

    //client disconnect
    socket.on('disconnect', ()=>{

        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} has dis-connect the network`))

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }

    });

        socket.on('chatMessage', (msg)=>{

        const user= getCurrentUser(socket.id);

        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })
})

server.listen(port, (req,res)=>{
    console.log(`Server listen on ${port}`);
})