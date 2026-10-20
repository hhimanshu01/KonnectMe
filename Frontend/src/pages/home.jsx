import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';


function HomeComponent() {


    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");

    const {addToUserHistory} = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }


    return (
        <>

            <div className="navBar">

                <div >
                    <h1 onClick={() => {navigate("/")}} style={{cursor : "pointer"}}><i className="fa-solid fa-video" style={{marginRight : "1rem" , color : "#246BFD"}}></i>Konnect<span style={{color : "#246BFD"}}>Me</span></h1>
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={ () => {
                            navigate("/history")
                        }}>

                        <RestoreIcon />

                    </IconButton>
                    <p>History</p>
                    &nbsp;&nbsp;&nbsp;
                    <Button variant='contained' onClick={() => {
                        localStorage.removeItem("token")
                        navigate("/")
                    }}>
                        Logout
                    </Button>
                </div>


            </div>



             <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2>Providing Quality Video Call Just Like Quality Education</h2>
                        <br />
                        <div style={{ display: 'flex', gap: "10px" }}>

                            <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined" /> &nbsp;
                            <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>

                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img srcSet='/logo3.svg' alt="" />
                </div>
            </div>


            </>
            );
            }

export default withAuth(HomeComponent);