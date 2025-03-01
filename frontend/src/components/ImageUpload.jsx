import React, { useState } from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const ImageUpload = ({ onImageSelect }) => {
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onImageSelect(file);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
        Upload to EatWise
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Let EatWise analyze your food label for smart nutritional insights
      </Typography>
      
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload"
        type="file"
        onChange={handleFileSelect}
      />
      <label htmlFor="image-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUploadIcon />}
          sx={{ mb: 2 }}
        >
          Upload Food Label
        </Button>
      </label>
      
      {preview && (
        <Box sx={{ mt: 2 }}>
          <img 
            src={preview} 
            alt="Food label preview" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '300px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }} 
          />
        </Box>
      )}
    </Paper>
  );
};

export default ImageUpload; 