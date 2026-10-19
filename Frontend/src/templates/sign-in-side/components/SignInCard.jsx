import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';

import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

import { AuthContext } from '../../../contexts/AuthContext';
import Snackbar from '@mui/material/Snackbar';


const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

export default function SignInCard() {

  const [username, setUsername] = React.useState();
  const [password, setPassword] = React.useState();
  const [name, setName] = React.useState();
  const [error, setError] = React.useState();
  const [message, setMessage] = React.useState();


  const [formState, setFormState] = React.useState(0);
  

  const [open, setOpen] = React.useState(false);

  const {handleRegister , handleLogin} = React.useContext(AuthContext);

  let handleAuth = async () => {
    try
    {
      if(formState === 0)
      {
        let result = await handleLogin(username , password);
        console.log(result);
      }
      if(formState === 1)
      {
        let result = await handleRegister(name , username , password);
        console.log(result);
        setMessage(result);
        setOpen(true);
        setError("");
        setUsername("");
        setFormState(0);
        setPassword("");
      }
    }
    catch(err)
    {
      let message = err.response.data.message;
      setError(message);
    }
  }
  

  return (
    <Card variant="outlined">
      <Box sx={{ display: { xs: 'flex', md: 'none' } }}>

      </Box>

      <div>
        <Button variant={formState === 0 ? "contained" : ""} onClick={() => {setFormState(0)}}>SignIn</Button>
        <Button variant={formState === 1 ? "contained" : ""} onClick={() => {setFormState(1)}}>SignUP</Button>
      </div>

      <Box
        component="form"
        noValidate
        sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
      >

        {formState === 1 ? <FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <FormLabel htmlFor="name">Full Name</FormLabel>
            
          </Box>
          <TextField
            
            name="name"
            placeholder="Enter Full Name"
            type="text"
            id="name"
            value={name}
            autoFocus
            required
            fullWidth

            onChange={(e) => setName(e.target.value)}
            
          />
        </FormControl> : <></>}
        

        <FormControl>
          
          <FormLabel htmlFor="username">Username</FormLabel>
          <TextField
            
            id="username"
            type="text"
            name="username"
            placeholder="Enter Username..."
            value={username}
            autoFocus
            required
            fullWidth

            onChange={(e) => setUsername(e.target.value)}
            
          />
        </FormControl>
        <FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <FormLabel htmlFor="password">Password</FormLabel>
            
          </Box>
          <TextField
            
            name="password"
            placeholder="••••••"
            type="password"
            id="password"
            value={password}
            autoFocus
            required
            fullWidth

            onChange={(e) => setPassword(e.target.value)}
            
          />
        </FormControl>

        <p style={{color : "red"}}>{error}</p>
        
        <Button type="button" fullWidth variant="contained" onClick={handleAuth}>
          {formState === 0 ? "Login" : "Register"}
        </Button>
  
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        
      </Box>


      <Snackbar open={open} autoHideDuration={4000} message={message}/>
    </Card>
  );
}