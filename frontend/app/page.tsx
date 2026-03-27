'use client'

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { useState, SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function Home() {
  const router = useRouter();

  const [value, setValue] = useState(0);

  const initialNewUserState = {
    email: '',
    password: '',
    cPassword: ''
  };

  const initialExistingUserState = {
    email: '',
    password: ''
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  const [newUserData, setNewUserData] = useState(initialNewUserState);
  const [existingUserData, setExistingUserData] = useState(initialExistingUserState);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  function toggleCPasswordVisibility() {
    setShowCPassword(!showCPassword);
  }

  function handleNewUserDataChange(event: any) {
    const { name, value } = event.target;
    setNewUserData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleExistingUserDataChange(event: any) {
    const { name, value } = event.target;
    setExistingUserData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleClose() {
    setErrorDialogOpen(false);
  }

  async function registerUser() {
    if (!(newUserData.password === newUserData.cPassword)) {
      setErrorDialogOpen(true);
      setNewUserData(initialNewUserState);
      return;
    }
    try {
      const response = await fetch("http://localhost:3001/register", {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUserData)
      });
      if (!response.ok) {
        throw new Error(`Error Status: ${response.status}`);
      }
      setNewUserData(initialNewUserState);
      if (response.status === 201) {
        try {
          router.push("/home");
        } catch (err) {
          console.log(err);
        }
      }
    } catch (err) {
      console.log(err);
    }

  }

  async function loginUser() {
    try {
      const response = await fetch("http://localhost:3001/login", {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(existingUserData)
      });
      if (!response.ok) {
        throw new Error(`Error Status: ${response.status}`);
      }
      setExistingUserData(initialExistingUserState);
      if (response.status === 200) {
        try {
          router.push("/home");
        } catch (err) {
          console.log(err);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange}>
            <Tab label="Register" {...a11yProps(0)} />
            <Tab label="Login" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <Box
            component="form"
            sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
            noValidate
            autoComplete="off"
          >
            <TextField id="email" name="email" label="Email" value={newUserData.email} onChange={handleNewUserDataChange} variant="outlined" InputProps={{ sx: { borderRadius: "20px" } }} />
            <TextField id="password" name="password" type={showPassword ? 'text' : 'password'} label="Password" value={newUserData.password} onChange={handleNewUserDataChange} variant="outlined" InputProps={{ sx: { borderRadius: "20px" } }} slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end" onClick={togglePasswordVisibility}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </InputAdornment>
                ),
              },
            }} />
            <TextField id="confirm-password" name="cPassword" type={showCPassword ? 'text' : 'password'} value={newUserData.cPassword} onChange={handleNewUserDataChange} label="Confirm Password" variant="outlined" InputProps={{ sx: { borderRadius: "20px" } }} slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end" onClick={toggleCPasswordVisibility}>
                    {showCPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </InputAdornment>
                ),
              },
            }} />
            <Button variant="contained" onClick={registerUser}>Sign Up</Button>
          </Box>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <Box
            component="form"
            sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
            noValidate
            autoComplete="off"
          >
            <TextField id="email" name="email" type='email' value={existingUserData.email} onChange={handleExistingUserDataChange} label="Email" variant="outlined" InputProps={{ sx: { borderRadius: "20px" } }} />
            <TextField id="password" name="password" type={showPassword ? 'text' : 'password'} value={existingUserData.password} onChange={handleExistingUserDataChange} label="Password" variant="outlined" InputProps={{ sx: { borderRadius: "20px" } }} slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end" onClick={togglePasswordVisibility}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </InputAdornment>
                ),
              },
            }} />
            <Button variant="contained" onClick={loginUser}>Login</Button>
          </Box>
        </CustomTabPanel>
        <Dialog
          open={errorDialogOpen}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Your passwords do not match!"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Please check your passwords. It looks like you have not entered the same passwords.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Got it!</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}