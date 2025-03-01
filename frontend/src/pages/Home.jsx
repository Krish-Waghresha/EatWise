import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Alert, 
  Paper,
  Fade,
  Backdrop,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import ImageUpload from '../components/ImageUpload';
import AnalysisResult from '../components/AnalysisResult';
import History from '../components/History';
import LoadingSpinner from '../components/LoadingSpinner';
import { analyzeImage } from '../services/api';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const Home = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('analysisHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    localStorage.setItem('analysisHistory', JSON.stringify(history));
  }, [history]);

  const handleImageSelect = async (file) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzeImage(file);
      setAnalysis(result);
      
      // Add to history
      const historyItem = {
        ...result,
        timestamp: new Date().toISOString(),
        imageUrl: URL.createObjectURL(file)
      };
      setHistory(prev => [historyItem, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (item) => {
    setAnalysis(item);
  };

  const handleDeleteHistory = (index) => {
    setHistory(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            color: 'white',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%)',
            }
          }}
        >
          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center" 
            justifyContent="center" 
            sx={{ mb: 2 }}
          >
            <RestaurantIcon sx={{ fontSize: 40 }} />
            <Typography 
              variant={isMobile ? "h4" : "h3"} 
              sx={{ 
                fontWeight: 700,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'relative',
                fontFamily: theme.typography.logoText.fontFamily,
                letterSpacing: '1px'
              }}
            >
              EatWise
            </Typography>
          </Stack>
          
          <Typography 
            variant="h6" 
            textAlign="center" 
            sx={{ 
              opacity: 0.9,
              maxWidth: '600px',
              margin: '0 auto',
              position: 'relative'
            }}
          >
            Make smarter food choices with AI-powered label analysis
          </Typography>
        </Paper>

        <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { md: '1fr 2fr' } }}>
          <Box>
            <History 
              history={history}
              onSelectHistory={handleSelectHistory}
              onDeleteHistory={handleDeleteHistory}
            />
            <ImageUpload onImageSelect={handleImageSelect} />
          </Box>

          <Box>
            {loading && (
              <Backdrop open={true} sx={{ color: '#fff', zIndex: 1 }}>
                <LoadingSpinner />
              </Backdrop>
            )}
            
            {error && (
              <Fade in={true}>
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              </Fade>
            )}
            
            {analysis && analysis.success && (
              <Fade in={true}>
                <Box>
                  <AnalysisResult analysis={analysis.analysis} />
                </Box>
              </Fade>
            )}
          </Box>
        </Box>
      </Box>
      
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          textAlign: 'center',
          color: 'text.secondary',
          mt: 4 
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} EatWise. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
};

export default Home; 