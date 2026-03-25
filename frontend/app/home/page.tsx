'use client'

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';


import { useState } from 'react';

export default function Page() {
    const [initialChat, setInitialChat] = useState(true);
    const [prompt, setPrompt] = useState('');
    const [promptResponse, setPromptResponse] = useState('');

    function handlePromptChange(event: any) {
        setPrompt(event.target.value);
    }

    async function sendPrompt() {
        if (!prompt) {
            setPrompt("Tell me a funny joke");
        }

        try {
            const response = await fetch("http://localhost:3001/query", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({userPrompt: prompt})
            });
            if (! await response.ok) {
                throw new Error(`Error Status: ${response.status}`);
            }
            const data = await response.json();

            setPromptResponse(data.response);
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            QueryPi
                        </Typography>
                        <Button color="inherit">Logout</Button>
                    </Toolbar>
                </AppBar>
            </Box>

            <Box>
                {initialChat ?
                    <Container>
                        <Typography variant="h6" component="div">What would you like to do?</Typography>
                        <TextField id="outlined-basic" label="Your prompt" variant="outlined" onChange={handlePromptChange} />
                        <IconButton aria-label="delete" color='primary' onClick={sendPrompt}>
                            <SendIcon />
                        </IconButton>
                        {!promptResponse ? <></> : <textarea value={promptResponse} readOnly />}
                    </Container>
                    :
                    <p>Done</p>}
            </Box>
        </>
    );
}