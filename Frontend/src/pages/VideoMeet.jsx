import React , {useEffect, useRef, useState} from "react";
import { Button , TextField , IconButton, Badge} from '@mui/material';
import  io  from "socket.io-client";

import "../styles/VideoMeet.css"



import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import VideocamOffRoundedIcon from '@mui/icons-material/VideocamOffRounded';
import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import ScreenShareRoundedIcon from '@mui/icons-material/ScreenShareRounded';
import StopScreenShareRoundedIcon from '@mui/icons-material/StopScreenShareRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import { useNavigate } from "react-router-dom";
import server from "../environment";
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';


const server_url = server;

let connections = {};

const peerConfigConnections = {
    iceServers: [
      {
        urls: "stun:stun.relay.metered.ca:80",
      },
      {
        urls: "turn:global.relay.metered.ca:80",
        username: "9008819c20e29da6bf3defd6",
        credential: "ZfUrz0zWCtcaQk82",
      },
      {
        urls: "turn:global.relay.metered.ca:80?transport=tcp",
        username: "9008819c20e29da6bf3defd6",
        credential: "ZfUrz0zWCtcaQk82",
      },
      {
        urls: "turn:global.relay.metered.ca:443",
        username: "9008819c20e29da6bf3defd6",
        credential: "ZfUrz0zWCtcaQk82",
      },
      {
        urls: "turns:global.relay.metered.ca:443?transport=tcp",
        username: "9008819c20e29da6bf3defd6",
        credential: "ZfUrz0zWCtcaQk82",
      },
  ],
}

export function VideoMeet() {

    let socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoRef = useRef();

    let [videoAvailable , setVideoAvailable] = useState(true);
    let [audioAvailable , setAudioAvailable] = useState(true);
    let [screenAvailable , setScreenAvailable] = useState();


    let [video , setVideo] = useState([]);
    let [audio , setAudio] = useState();
    let [screen , setScreen] = useState();

    let [showModal , setModal] = useState(false);


    let [messages , setMessages] = useState([]);
    let [message , setMessage] = useState("");
    let [newMessages , setNewMessages] = useState(0);

    let [askForUsername , setAskForUsername] = useState(true);
    let [username , setUsername] = useState("");

    const videoRef = useRef([]);

    let [videos , setVideos] = useState([]);




    const getPermissions = async () => {
        try
        {
            const videoPermission = await navigator.mediaDevices.getUserMedia({video : true});

            if(videoPermission)
            {
                setVideoAvailable(true);
            }
            else
            {
                setVideoAvailable(false);
            }


            const audioPermission = await navigator.mediaDevices.getUserMedia({audio : true});

            if(audioPermission)
            {
                setAudioAvailable(true);
            }
            else
            {
                setAudioAvailable(false);
            }



            if(navigator.mediaDevices.getDisplayMedia)
            {
                setScreenAvailable(true);
            }
            else
            {
                setScreenAvailable(false);
            }



            if(videoAvailable || audioAvailable)
            {
                console.log("Video available:", videoAvailable);
                console.log("Audio available:", audioAvailable);

                const userMediaStream = await navigator.mediaDevices.getUserMedia({video : videoAvailable , audio : audioAvailable})

                if(userMediaStream)
                {
                    window.localStream = userMediaStream;
                    if(localVideoRef.current)
                    {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }

        }
        catch(e)
        {
            console.log(e);
        }
    }



    useEffect(()=>{
        getPermissions();
    } , [])



    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }



    let getUserMediaSuccess = (stream)=>{

       try
        {
            window.localStream.getTracks().forEach(track => track.stop());
        }
       catch(e) 
        {
            console.log(e)
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for(let id in connections)
        {
            if(id === socketIdRef.current) continue

            connections[id].addStream(window.localStream);

            connections[id].createOffer()
            .then((description) => {
                connections[id].setLocalDescription(description)
                .then(() => {
                    socketRef.current.emit("signal" , id, JSON.stringify({"sdp" : connections[id].localDescription}));
                })
                .catch(e => {console.log(e); }) 
                
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoRef.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }

    })

}




    let getUserMedia = ()=>{    // mute/video on off button in call
        if((video && videoAvailable ) || (audio && audioAvailable))
        {
            navigator.mediaDevices.getUserMedia({video : video , audio : audio}) // curr state kya h audio video ki
            .then(getUserMediaSuccess) // getUserSuccessMedia
            .then((stream) => {})
            .catch((err) => {console.log(err)});
        }
        else
        {
            try
            {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
            catch(e)
            {
                console.log(e);
            }
        }
    }





    useEffect(()=>{
        if(video !== undefined && audio !== undefined) // jse hi koi on off kr ra h 
        {
            getUserMedia();
        }
    } , [video , audio])




    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoRef.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoRef.current.srcObject = window.localStream

            getUserMedia();

        })
    }


    
    let gotMessageFromServer = (fromId , message) => {

        let signal = JSON.parse(message)
        
        
        if(fromId !== socketIdRef.current)
        {
            if(signal.sdp)
            {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
                .then(() => {
                    if(signal.sdp.type === "offer")
                    {
                        connections[fromId].createAnswer()
                        .then((description) => {
                            connections[fromId].setLocalDescription(description)
                            .then(() => {
                                socketRef.current.emit("signal" , fromId , JSON.stringify({"sdp" : connections[fromId].localDescription}))
                            })
                            .catch((e) => {console.log(e)})
                        })
                        .catch((e) => {console.log(e)})
                    }
                })
                .catch((e) => {console.log(e)});
            }

            if(signal.ice)
            {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch((e) => {console.log(e)});
            }
        }

    }



    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };






    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {

                console.log("USER JOINED:", id);
                console.log("CLIENTS:", clients);


                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
                    

                    console.log("PEER CONNECTION CREATED:", socketListId);

                    console.log("CONNECTION STATE:", connections[socketListId].connectionState);    

                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    // connections[socketListId].onaddstream = (event) => {
                    //     console.log("REMOTE STREAM RECEIVED:", socketListId);

                    //     console.log("STREAM:", event.stream);

                    //     let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                    //     if (videoExists) {
                    //         console.log("FOUND EXISTING");

                    //         // Update the stream of the existing video
                    //         setVideos(videos => {
                    //             const updatedVideos = videos.map(video =>
                    //                 video.socketId === socketListId ? { ...video, stream: event.stream } : video
                    //             );
                    //             videoRef.current = updatedVideos;
                    //             return updatedVideos;
                    //         });
                    //     } else {
                    //         // Create a new video
                    //         console.log("CREATING NEW");
                    //         let newVideo = {
                    //             socketId: socketListId,
                    //             stream: event.stream,
                    //             autoplay: true,
                    //             playsinline: true
                    //         };

                    //         setVideos(videos => {
                    //             const updatedVideos = [...videos, newVideo];
                    //             videoRef.current = updatedVideos;
                    //             return updatedVideos;
                    //         });
                    //     }
                    // };

                    // Receive remote video and audio streams
                    //     connections[socketListId].ontrack = (event) => {
                    
                    //     const remoteStream = event.streams[0];

                    //     console.log("REMOTE STREAM ACTIVE:", remoteStream?.active);
                    //     console.log("REMOTE VIDEO TRACKS:", remoteStream?.getVideoTracks());
                    //     console.log("REMOTE AUDIO TRACKS:", remoteStream?.getAudioTracks());

                    //     if (!remoteStream) {
                    //         console.log("No remote stream received");
                    //         return;
                    //     }

                    //     const videoExists = videoRef.current.find(
                    //         video => video.socketId === socketListId
                    //     );

                    //     if (videoExists) {

                    //         console.log("UPDATING EXISTING VIDEO");

                    //         setVideos(prevVideos => {
                    //             const updatedVideos = prevVideos.map(video =>
                    //                 video.socketId === socketListId
                    //                     ? { ...video, stream: remoteStream }
                    //                     : video
                    //             );

                    //             videoRef.current = updatedVideos;
                    //             return updatedVideos;
                    //         });

                    //     } else {

                    //         console.log("ADDING NEW VIDEO");

                    //         const newVideo = {
                    //             socketId: socketListId,
                    //             stream: remoteStream,
                    //             autoplay: true,
                    //             playsinline: true
                    //         };

                    //         setVideos(prevVideos => {
                    //             const updatedVideos = [...prevVideos, newVideo];
                    //             videoRef.current = updatedVideos;
                    //             return updatedVideos;
                    //         });

                    //     }
                    // };

connections[socketListId].ontrack = (event) => {
    const remoteStream = event.streams[0];

    if (!remoteStream) return;

    setVideos(prevVideos => {
        const existingVideo = prevVideos.some(
            video => video.socketId === socketListId
        );

        const updatedVideos = existingVideo
            ? prevVideos.map(video =>
                video.socketId === socketListId
                    ? { ...video, stream: remoteStream }
                    : video
            )
            : [
                ...prevVideos,
                {
                    socketId: socketListId,
                    stream: remoteStream
                }
            ];

        videoRef.current = updatedVideos;
        return updatedVideos;
    });
};



                    if(window.localStream !== undefined && window.localStream !== null)
                    {
                        connections[socketListId].addStream(window.localStream);
                    }
                    else
                    {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }


                })

                if(id === socketIdRef.current)
                {

                    console.log("ENTERED OFFER GENERATION");

                    for(let id2 in connections)
                    {
                        console.log("CHECKING CONNECTION:", id2);
                        if(id2 === socketIdRef.current)
                            {
                                console.log("SKIPPING MY OWN CONNECTION");
                                continue;
                            } 

                        try
                        {
                             console.log("CREATING OFFER FOR:", id2);
                            connections[id2].addStream(window.localStream);
                        }
                        catch(e) { }

                        connections[id2].createOffer().then((description) => {
                             console.log("OFFER CREATED:", description);
                            connections[id2].setLocalDescription(description)
                            .then(() => {
                                console.log("LOCAL DESCRIPTION SET");
                                socketRef.current.emit("signal" , id2 , JSON.stringify({"sdp" : connections[id2].localDescription}))
                            })
                            
                            .catch((e) => {console.log(e)});
                            console.log("SIGNAL EMITTED TO:", id2);
                        })
                    }

                }
            })

        })
    }



    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }



    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }





    let connect = ()=> {
        setAskForUsername(false);
        getMedia();
    }


    let handleVideo = () => {
        setVideo(!video);
    }

    let handleAudio = () => {
        setAudio(!audio);
    }

     useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])


    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleChat = () => {
        if (showModal) {

        closeChat();

    } else {

        openChat();
    }
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }

    let sendMessage = () => {
        socketRef.current.emit("chat-message" , message , username);
        setMessage("");
    }


    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }


    return (
        <div>
            {askForUsername === true ? 
            <div style={{marginBlock : "5rem" , textAlign : "center"}}>
                <h1>Enter Into Lobby</h1>
                <br />
                <TextField id="outlined-basic" value={username} label="Enter Username" variant="outlined" onChange={e => setUsername(e.target.value)}/> &nbsp;&nbsp;
                <Button variant="contained" onClick={connect}>Connect</Button>
                <br />
                <br />
                <div>
                    <video ref={localVideoRef} autoPlay muted style={{ transform: "scaleX(-1)" , borderRadius : "20px"}}></video>
                </div>
            </div> 
            
            : <div className="meetVideoContainer">


                {showModal ?  

                <div className="chatRoom">


                    <div className="chatContainer">
                        <h2 style={{textAlign : "center"}}>Messages</h2>
                        <br />

                        <div className="chatDisplay">

                                {messages.length !== 0 ? messages.map((item, index) => {

                                    return (
                                        <div key={index} className="displayMsg">
                                            <span style={{ fontWeight: "bold" , color : "white" , fontStyle : "italic"}}> ~ {item.sender} </span>
                                               
                                                <span style={{  color : "#f5f5f5" }}>{item.data}</span>
                                            
                                        </div>
                                    );
                                }) : <p>No Messages Yet</p>}
                        </div>

                        

                    </div>

                          <div className="chattingArea">
                            <input className="inputBox" value={message} onChange={e => setMessage(e.target.value)} placeholder="Enter your message" />
                            <SendRoundedIcon onClick={sendMessage}/>
                        </div>      
                    
                </div>
                 : <></>

                }
               

                <div className="buttonContainer">

                    <IconButton onClick={handleVideo} style={{color: "white"}}>
                        {(video === true) ? <VideocamRoundedIcon /> : <VideocamOffRoundedIcon />}
                    </IconButton>


                    <IconButton onClick={handleAudio} style={{color: "white"}}>
                        {(audio === true) ? <MicRoundedIcon /> : <MicOffRoundedIcon />}
                    </IconButton>

               
                    <IconButton onClick={handleEndCall} style={{color: "white" , backgroundColor:"red"}}>
                        <CallEndRoundedIcon style={{fontSize: "2rem"}}/>
                    </IconButton>
                    &nbsp;
                    

                    {screenAvailable === true ?

                    <IconButton onClick={handleScreen} style={{color: "white"}}>
                        {(screen === true) ? <ScreenShareRoundedIcon /> : <StopScreenShareRoundedIcon />}
                    </IconButton> : <></>}

                    <IconButton onClick={handleChat} style={{color: "white"}}>
                    <Badge badgeContent={newMessages} max={999} color="primary">
                        
                            <ChatRoundedIcon/>
                        
                    </Badge>
                    </IconButton>
                    
                </div>

                        
                <video className="meetUserVideo" ref={localVideoRef} autoPlay muted style={{ transform: "scaleX(-1)" }}></video>
                <div className="noVideo">
                        <VideocamOffRoundedIcon style={{ color : "white" , fontSize : "5rem" , padding : "auto"}} />
                </div>

                    <div className="conferenceView">

                    {videos.map((video) => 

                            (
                                <div key={video.socketId}>

                                    <video data-socket={video.socketId} ref={ref => 
                                        {
                                            if(ref && video.stream)
                                            {
                                                ref.srcObject = video.stream;
                                            }
                                            }} 
                                    autoPlay playsInline>

                                    </video>
                            </div>
                            )

                    )
                    }
                    </div>
                    
            </div>
            }
        </div>
        
    );
}



