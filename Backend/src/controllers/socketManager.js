import {Server} from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
    const io = new Server(server , {
        cors : {
            origin : "*",
            methods : ["GET" , "POST"],
            allowedHeaders : ["*"],
            credetials : true
        }
    }); // SERVER  - NODE acdp server

    io.on("connection" , (socket) => {

        console.log("Something Connected");

        socket.on("join-call" , (path)=>{
            if(connections[path] === undefined)
            {
                connections[path] = [];
            }
            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();

            // to tell all new user joined
            for(let i = 0 ; i <connections[path].length ; i++)
            {
                io.to(connections[path][i]).emit("user-joined" , socket.id , connections[path]);
            }

            //to show prev msgs to new user
            if(messages[path] !== undefined)
            {
                for(let i = 0 ; i <messages[path].length ; ++i)
                    io.to(socket.id).emit("chat-message" , messages[path][i]["data"] , 
                        messages[path][i]["sender"] , messages[path][i]["socket-id-sender"])
            }
        });

        socket.on("signal" , (toId , message)=> {

            io.to(toId).emit("signal" , socket.id , message)

        });

        socket.on("chat-message" , (data,sender)=> {

            const [matchingRoom , found] = Object.entries(connections)
            .reduce(([room , isFound] , [roomKey , roomValue]) => {
                
                if(!isFound && roomValue.includes(socket.id))
                {
                    return [roomKey , true];
                }

                return [room , isFound];
            } ,  [ "", false]) ;


            if(found === true)
            {
                if(messages[matchingRoom] === undefined)
                {
                    messages[matchingRoom] = [];
                }

                messages[matchingRoom].push({
                    "sender" : sender,
                    "data" : data,
                    "socket-id-sender" : socket.id
                });

                console.log("message" , matchingRoom , ":" , sender , data);

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message" , data , sender , socket.id);
                });
            }

        });

        socket.on("disconnect" , ()=> {

            let diffTime = Math.abs(timeOnline[socket.id] - new Date());

            let finalRoom

            for(const [room,person] of JSON.parse(JSON.stringify(Object.entries(connections))) )
            {
                for(let i=0 ; i<person.length ; i++)
                {
                    if(person[i] === socket.id)
                    {
                        finalRoom = room;

                        for(let i=0 ; i<connections[finalRoom].length ; i++)
                        {
                            io.to(connections[finalRoom][i]).emit("user-left" , socket.id);
                        }

                        let index = connections[finalRoom].indexOf(socket.id);

                        connections[finalRoom].splice(index , 1);

                        if(connections[finalRoom].length === 0)
                        {
                            delete connections[finalRoom];
                        }

                    }


                }
            }

        });


    })

    return io;
}


