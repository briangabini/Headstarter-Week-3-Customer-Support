'use client'
import { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Stack, TextField, Typography, Paper } from '@mui/material';
import { LuSendHorizonal } from "react-icons/lu";

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi, I'm the Headstarter Support AI Agent. How can I assist you today?`
  }]);

  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' }
    ]);
    
    setMessage('');

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }])
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let result = '';
    reader.read().then(function processText({ done, value }) {
      if (done) return result;

      const text = decoder.decode(value || new Int8Array(), { stream: true });
      setMessages((messages) => {
        const updatedMessages = [...messages];
        updatedMessages[updatedMessages.length - 1].content += text;
        return updatedMessages;
      });

      return reader.read().then(processText);
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="#1c1c28" 
    >
      <Paper elevation={5} sx={{ width:"70%", minWidth:"350px", height: '100%', display: 'flex', flexDirection: 'column', p: 3, borderRadius: 3 }}>
        <Typography variant="h5" align="center" gutterBottom sx={{ color: '#000000'}}>
        <strong>Headstarter AI Support</strong>
        </Typography>
        <Stack spacing={2} sx={{ flexGrow: 1, overflowY: 'auto', padding: '10px', bgcolor: '#2a2a40', borderRadius: 2 }}>
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
              <Box
                component="div"
                sx={{
                  bgcolor: message.role === 'assistant' ? '#3b3b52' : '#4b4b6b',
                  color: 'white',
                  borderRadius: 2,
                  p: 2,
                  maxWidth: '75%',
                  wordWrap: 'break-word'
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction="row" spacing={2} mt={2}>
        <TextField
            label={<Typography sx={{ color: 'white' }}>Type your message...</Typography>}
            variant="filled"
            margin="dense"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            InputProps={{
              style: {
                backgroundColor: '#3b3b52',
                color: 'white',
              },
            }}
          />
          <IconButton color="primary" onClick={sendMessage}>
            <LuSendHorizonal size={24} />
          </IconButton>
        </Stack>
      </Paper>
    </Box>
  );
}
