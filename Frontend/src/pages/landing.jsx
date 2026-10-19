import { Link , useNavigate } from "react-router-dom";
import "../App.css";


export default function LandingPage()
{
    const router = useNavigate();
    return (
        <div className="landingPageContainer">

            <nav className="navBar">

                <div className="navHeader">
                    <h2 style={{fontWeight : "600"}}><i className="fa-solid fa-video" style={{marginRight : "1rem" , color : "#246BFD"}}></i>Konnect<span style={{color : "#246BFD"}}>Me</span></h2>
                </div>

                <div className="navList">

                    <p onClick={() => {router("/abc")}}>Join as Guest</p>

                    <p onClick={() => {router("/auth")}}> Register</p>

                    <div role="button" onClick={() => {router("/auth")}}>
                        <p>Login</p>
                    </div>

                </div>

            </nav>


            <div className="landingMainContainer">

                <div className="mainContent">
                    <h1>Connect Face-to-Face,</h1>
                    <h1 style={{color : "#246BFD"}}>From Anywhere.</h1>
                    <p>Bridge the distance with effortless video calls.</p>

                    <div role="button">
                        <a href="/auth">Get Started</a>
                    </div>

                </div>
                <div className="mainPhoto">
                    <img src="/phoneImg.png" alt="Phones" />
                </div>
            </div>
        </div>
    )
}