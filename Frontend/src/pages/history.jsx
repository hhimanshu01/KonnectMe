import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import Typography from '@mui/material/Typography';

import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState , useContext , useEffect} from 'react';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { IconButton } from '@mui/material';


export default function History()
{
    const { getHistoryOfUser } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([])


    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch(e) {
                // IMPLEMENT SNACKBAR
            }
        }

        fetchHistory();
    }, [])

    let formatDate = (dateString) => {

        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();

        return `${day}/${month}/${year}`

    }


    return (
        <div>

            <IconButton onClick={ () => {routeTo("/home")}}>
                <HomeRoundedIcon/>
            </IconButton>

            {
                (meetings.length != 0) ? meetings.map((e,i) => {

                    return (

                        <>
                            <Card key={i} variant="outlined">

                                <CardContent>

                                    <Typography >
                                        Code : {e.meetingCode}
                                    </Typography>

                                    <Typography >
                                        Date : {formatDate(e.date)}
                                    </Typography>

                                </CardContent>

                            </Card>
                        </>
                    )
                    
                }) : <></>
            }


        </div>
    );
}