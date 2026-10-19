import { useNavigate } from "react-router-dom";
import SignInSide from "../templates/sign-in-side/SignInSide";
import { IconButton } from "@mui/material";
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

export default function Authentication() {

  const routeTo = useNavigate();

  return (
  

        <div style={{paddingInline : "auto" , height : "90vh"}}>
          <IconButton onClick={ () => {routeTo("/")}}>
                <HomeRoundedIcon />
            </IconButton>
          <SignInSide />
          </div>

  );

}
