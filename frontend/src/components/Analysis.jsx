import React from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';

const Analysis = ({ analysisData }) => {
  if (!analysisData) return null;

  const {
    success,
    extracted_text,
    analysis,
  } = analysisData;

  if (!success) {
    return (
      <Typography color="error">
        Analysis failed. Please try again with a clearer image.
      </Typography>
    );
  }

  const sections = analysis.split('\n');
  const verdict = sections[0].replace('Verdict:', '').trim();
  const confidence = sections[1].replace('Confidence:', '').trim();
  const explanation = sections.slice(3, 6).join('\n');
  const healthImpact = sections[7];
  const consumption = sections[9];

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom color={verdict === 'Healthy' ? 'success.main' : 'error.main'}>
        {verdict}
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom>
        Confidence: {confidence}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="h6" gutterBottom>
        Analysis
      </Typography>
      <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
        {explanation}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="h6" gutterBottom>
        Health Impact
      </Typography>
      <Typography variant="body1">
        {healthImpact}
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Recommended Consumption
      </Typography>
      <Typography variant="body1">
        {consumption}
      </Typography>
    </Paper>
  );
};

export default Analysis; 