import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
      <CircularProgress size={40} />
      <Typography variant="body1" sx={{ mt: 2 }}>
        Analyzing food label...
      </Typography>
    </Box>
  );
};

export default LoadingSpinner; 