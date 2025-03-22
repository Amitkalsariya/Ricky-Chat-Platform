import {Server} from "socket.io"
import http from "http"
import express from "express"

 const app =express()
 const server=http.createServer(app)
 const io= new Server (server,{
    cors:{
        origin  :["http://localhost:5173"]
    }
 })

 export function  getReceiverSocketId(userId){
    return userSocket[userId]
 }

 const userSocket={}
 io.on("connection",(socket)=>{
    console.log("User Has Been Connected ",socket.id);
    const userId=socket.handshake.query.userId
    if(userId) userSocket[userId]=socket.id

    io.emit("getOnlineUsers",Object.keys(userSocket))

    socket.on("disconnect",()=>{
        console.log("User Has been Disconnected",socket.id);
        delete userSocket[userId]
    io.emit("getOnlineUsers",Object.keys(userSocket))

        
    })
    
 })

 export {io,server,app}