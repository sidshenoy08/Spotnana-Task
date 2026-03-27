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
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import DeleteIcon from '@mui/icons-material/Delete';


import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Chat {
    chatId?: string,
    userPrompt: string,
    queryResponse: string
};

export default function Page() {
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [chatHistory, setChatHistory] = useState<Chat[]>([]);
    const [chatId, setChatId] = useState('');

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    const DrawerList = (
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
            <List>
                {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    useEffect(() => {
        if (chatHistory.length > 0) {
            const saveChat = async () => {
                const chat = chatHistory.at(-1);
                chat.chatId = chatId;

                try {
                    const response = await fetch("http://localhost:3001/save", {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(chat)
                    });

                    if (!response.ok) {
                        throw new Error(`Error Status: ${response.status}`);
                    }

                    const data = await response.json();
                    setChatId(data.message);
                } catch (err) {
                    console.log(err);
                }
            };
            saveChat();
        }
    }, [chatHistory]);

    function handlePromptChange(event: any) {
        setPrompt(event.target.value);
    }

    async function sendPrompt() {
        let finalPrompt = "";

        if (!prompt) {
            finalPrompt = "Tell me a funny joke";
        } else {
            finalPrompt = prompt;
        }
        // const finalPrompt = prompt || "Tell me a funny joke"

        try {
            const response = await fetch("http://localhost:3001/query", {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userPrompt: finalPrompt })
            });
            if (!response.ok) {
                throw new Error(`Error Status: ${response.status}`);
            }
            const data = await response.json();
            setChatHistory([...chatHistory, { userPrompt: finalPrompt, queryResponse: data.response }]);
            setPrompt("");
        } catch (err) {
            console.log(err);
        }
    }

    function clearChat() {
        setChatHistory([]);
    }

    async function logout() {
        try {
            const response = await fetch("http://localhost:3001/logout", {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error Status: ${response.status}`);
            }
            router.push("/");
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
                            onClick={toggleDrawer(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Drawer open={open} onClose={toggleDrawer(false)}>
                            {DrawerList}
                        </Drawer>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            QueryPi
                        </Typography>
                        <Button color="inherit" onClick={logout}>Logout</Button>
                    </Toolbar>
                </AppBar>
            </Box>

            <Box>
                {chatHistory.length == 0 ?
                    <Container sx={{ height: '70vh', overflowY: 'auto' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <Typography variant="h6" component="div">What would you like to do?</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                <TextField
                                    id="outlined-basic"
                                    label="Your prompt"
                                    variant="outlined"
                                    InputProps={{ sx: { borderRadius: "20px" } }}
                                    sx={{ flexGrow: 1 }}
                                    value={prompt}
                                    onChange={handlePromptChange} />
                                <IconButton aria-label="send" color='primary' onClick={sendPrompt}>
                                    <SendIcon />
                                </IconButton>
                            </Box>
                            {/* {!promptResponse ? <></> : <textarea value={promptResponse} readOnly />} */}
                        </Box>
                    </Container>
                    :
                    <Container sx={{ height: '70vh', overflowY: 'auto' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            {chatHistory.map((chat, index) => (
                                <Box key={index}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Box
                                            sx={{
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                px: 2,
                                                py: 1,
                                                borderRadius: '16px',
                                                maxWidth: '70%',
                                            }}
                                        >
                                            {chat.userPrompt}
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
                                        <Box
                                            sx={{
                                                bgcolor: 'grey.200',
                                                px: 2,
                                                py: 1,
                                                borderRadius: '16px',
                                                maxWidth: '70%',
                                            }}
                                        >
                                            {chat.queryResponse}
                                        </Box>
                                    </Box>
                                </Box>
                            ))}

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                <TextField
                                    id="outlined-basic"
                                    label="Your prompt"
                                    variant="outlined"
                                    InputProps={{ sx: { borderRadius: "20px" } }}
                                    sx={{ flexGrow: 1 }}
                                    value={prompt}
                                    onChange={handlePromptChange} />
                                <IconButton aria-label="send" color='primary' onClick={sendPrompt}>
                                    <SendIcon />
                                </IconButton>
                                <IconButton aria-label="clear" color='error' onClick={clearChat}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </Container>
                }
            </Box>
        </>
    );
}