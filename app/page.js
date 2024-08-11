"use client";
import { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Stack, TextField, Typography, Paper, Button } from '@mui/material';
import { SendOutlined, ContentCopy } from '@mui/icons-material'; // Using SendOutlined icon from Material UI
import ReactMarkdown from 'react-markdown';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Text copied to clipboard!');
      })
      .catch(err => {
        console.error('Error copying text: ', err);
      });
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#f5f5f5',
      }}
    >
      <Paper elevation={3} sx={{ width: '70%', minWidth: '350px', height: '100%', display: 'flex', flexDirection: 'column', p: 3, borderRadius: 3, bgcolor: '#e0e0e0' }}>
        <Typography variant="h5" align="center" gutterBottom sx={{ color: '#333' }}>
          <strong>Headstarter AI Customer Support</strong>
        </Typography>
        <Stack spacing={2} sx={{ flexGrow: 1, overflowY: 'auto', padding: '10px', borderRadius: 2, bgcolor: '#f2f2f2' }}>
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
              <Box
                component="div"
                sx={{
                  bgcolor: message.role === 'assistant' ? '#d0e0e0' : '#e0d0e0', 
                  color: '#333',
                  borderRadius: 2,
                  p: 2,
                  maxWidth: '90%',
                  wordWrap: 'break-word',
                }}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
                {message.role === 'assistant' && (
                  <Button variant="text" size="small" onClick={() => handleCopy(message.content)} sx={{ textTransform: 'none', padding: 0 }}>
                    <ContentCopy />
                  </Button>
                )}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction="row" spacing={2} mt={2}>
          <TextField
            label={<Typography sx={{ color: '#333' }}>Type your message...</Typography>}
            variant="filled"
            margin="dense"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            InputProps={{
              style: {
                backgroundColor: '#f2f2f2', // Match background color
                color: '#333',
              },
            }}
          />
          <IconButton color="primary" onClick={sendMessage}>
            <SendOutlined />
          </IconButton>
        </Stack>
      </Paper>
      <ToastContainer />
    </Box>
  );
}
