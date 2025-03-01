import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Collapse,
  Button,
  Chip,
  Stack
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoIcon from '@mui/icons-material/Info';
import RecommendIcon from '@mui/icons-material/Recommend';
import AnalysisIcon from '@mui/icons-material/Analytics';

const AnalysisResult = ({ analysis }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  if (!analysis || !analysis.analysis) return null;

  const sections = analysis.analysis.split('\n');
  const verdict = sections[0].replace('Verdict:', '').trim();
  const confidence = sections[1].replace('Confidence:', '').trim();
  
  // Extract explanation points (they start with •)
  const explanationPoints = sections
    .filter(line => line.trim().startsWith('•'))
    .map(point => point.trim());
  
  // Find health impact and recommended consumption
  const healthImpactIndex = sections.findIndex(line => line.includes('Health Impact:'));
  const recommendedConsumptionIndex = sections.findIndex(line => line.includes('Recommended Consumption:'));
  
  const healthImpact = healthImpactIndex !== -1 ? 
    sections[healthImpactIndex + 1] : '';
  const recommendedConsumption = recommendedConsumptionIndex !== -1 ? 
    sections[recommendedConsumptionIndex + 1] : '';

  return (
    <Paper elevation={3} sx={{ p: 3, position: 'relative' }}>
      {/* Verdict Section */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          {verdict.toLowerCase() === 'healthy' ? (
            <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
          ) : (
            <WarningIcon color="error" sx={{ fontSize: 40 }} />
          )}
          <Box>
            <Typography variant="h5" gutterBottom>
              {analysis.productName || 'Food Item'}
            </Typography>
            <Typography 
              variant="h6" 
              color={verdict.toLowerCase() === 'healthy' ? 'success.main' : 'error.main'}
            >
              {verdict}
            </Typography>
            <Chip 
              label={`Confidence: ${confidence}`} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          </Box>
        </Stack>
      </Stack>

      {/* Main Sections */}
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" />
            Health Impact
          </Typography>
          <Typography variant="body1">
            {healthImpact}
          </Typography>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RecommendIcon color="primary" />
            Recommendation
          </Typography>
          <Typography variant="body1">
            {recommendedConsumption}
          </Typography>
        </Box>

        {/* Expandable Analysis Details */}
        <Box>
          <Button
            onClick={() => setShowDetails(!showDetails)}
            endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            fullWidth
            variant="outlined"
          >
            {showDetails ? 'Hide Analysis Details' : 'View Analysis Details'}
          </Button>
          
          <Collapse in={showDetails}>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AnalysisIcon color="primary" />
                Detailed Analysis
              </Typography>
              {explanationPoints.map((point, index) => (
                <Typography key={index} variant="body1" sx={{ mb: 1 }}>
                  {point}
                </Typography>
              ))}
            </Box>
          </Collapse>
        </Box>
      </Stack>
    </Paper>
  );
};

export default AnalysisResult; 