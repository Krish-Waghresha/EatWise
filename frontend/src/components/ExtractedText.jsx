import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const ExtractedText = ({ text }) => {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Extracted Text
      </Typography>
      <Box 
        component="pre"
        sx={{
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          backgroundColor: '#f5f5f5',
          p: 2,
          borderRadius: 1,
          maxHeight: '500px',
          overflow: 'auto'
        }}
      >
        {text}
      </Box>
    </Paper>
  );
};

export default ExtractedText; 