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
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import ImageUpload from '../components/ImageUpload';
import AnalysisResult from '../components/AnalysisResult';
import History from '../components/History';
import LoadingSpinner from '../components/LoadingSpinner';
import { analyzeImage } from '../services/api';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import UserProfileForm from '../components/UserProfileForm';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PersonalizedIcon from '@mui/icons-material/Person';
import TimelineIcon from '@mui/icons-material/Timeline';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PsychologyIcon from '@mui/icons-material/Psychology';
import InsightsIcon from '@mui/icons-material/Insights';

const Home = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('analysisHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : null;
  });
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [newFoodName, setNewFoodName] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    localStorage.setItem('analysisHistory', JSON.stringify(history));
    if (userProfile) {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
  }, [history, userProfile]);

  const handleProfileSubmit = (profile) => {
    setUserProfile(profile);
    setShowProfileForm(false);
    setShowAnalysis(true);
  };

  const handleImageSelect = async (file) => {
    setTempImage(file);
    setNewFoodName('');
    setShowNameDialog(true);
  };

  const processAnalysis = async (file, foodName) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzeImage(file, userProfile);
      const analysisWithName = {
        ...result,
        productName: foodName,
        timestamp: new Date().toISOString(),
        imageUrl: URL.createObjectURL(file)
      };
      
      setAnalysis(analysisWithName);
      setHistory(prev => [analysisWithName, ...prev]);
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

  const handleNameEdit = (index, newName) => {
    setHistory(prev => prev.map((item, i) => 
      i === index ? { ...item, productName: newName } : item
    ));
    
    if (analysis && analysis.timestamp === history[index].timestamp) {
      setAnalysis(prev => ({ ...prev, productName: newName }));
    }
  };

  const handleAnalyzeClick = () => {
    if (!userProfile) {
      setShowProfileForm(true);
    } else {
      setShowAnalysis(true);
    }
  };

  const features = [
    {
      icon: <HealthAndSafetyIcon sx={{ fontSize: 40 }} />,
      title: "Health-Focused Analysis",
      description: "Get detailed insights about the nutritional value and health impact of your food choices."
    },
    {
      icon: <SearchIcon sx={{ fontSize: 40 }} />,
      title: "Smart Label Reading",
      description: "Our AI technology reads and interprets food labels, making it easy to understand what's in your food."
    },
    {
      icon: <AutoAwesomeIcon sx={{ fontSize: 40 }} />,
      title: "Instant Results",
      description: "Receive immediate analysis and recommendations about your food choices."
    },
    {
      icon: <PersonalizedIcon sx={{ fontSize: 40 }} />,
      title: "Personalized Recommendations",
      description: "Get tailored advice based on your health profile and dietary requirements."
    }
  ];

  return (
    <Container maxWidth="lg">
      {showProfileForm && (
        <UserProfileForm 
          open={showProfileForm} 
          onClose={() => setShowProfileForm(false)}
          onSubmit={handleProfileSubmit}
          initialData={userProfile}
        />
      )}

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
          <Box sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16,
            zIndex: 1 
          }}>
            <Tooltip title="Edit Profile">
              <IconButton 
                onClick={() => setShowProfileForm(true)}
                sx={{ 
                  color: 'white',
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.1)' 
                  }
                }}
              >
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>
          </Box>

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

        <Dialog open={showNameDialog} onClose={() => setShowNameDialog(false)}>
          <DialogTitle>Enter Food Name</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Food Name"
              fullWidth
              value={newFoodName}
              onChange={(e) => setNewFoodName(e.target.value)}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowNameDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => {
                if (newFoodName.trim()) {
                  processAnalysis(tempImage, newFoodName.trim());
                  setShowNameDialog(false);
                }
              }}
              variant="contained"
            >
              Analyze
            </Button>
          </DialogActions>
        </Dialog>

        {!showAnalysis ? (
          <Box sx={{ py: 8 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 6, 
                mb: 6, 
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                color: 'white',
                borderRadius: 3,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    mb: 3,
                    fontWeight: 700,
                    fontFamily: theme.typography.logoText.fontFamily,
                  }}
                >
                  Welcome to EatWise
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
                  Make informed decisions about your food with AI-powered 
                  label analysis and personalized health recommendations
                </Typography>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={handleAnalyzeClick}
                  sx={{ 
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                    },
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                  }}
                >
                  Analyze My Food
                </Button>
              </Box>
            </Paper>

            <Typography 
              variant="h4" 
              textAlign="center" 
              sx={{ 
                mb: 4,
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              Why Choose EatWise?
            </Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                      <Box sx={{ 
                        color: 'primary.main',
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'center'
                      }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Paper sx={{ p: 4, mb: 6, bgcolor: 'grey.50' }}>
              <Typography 
                variant="h4" 
                textAlign="center" 
                sx={{ mb: 4, fontWeight: 600 }}
              >
                How It Works
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={4}>
                    <Box>
                      <Typography variant="h6" gutterBottom color="primary" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1 
                      }}>
                        <PhotoCameraIcon />
                        1. Upload Your Food Label
                      </Typography>
                      <Typography variant="body1">
                        Simply take a photo of any food label or packaging. Our system accepts
                        clear images of nutrition facts and ingredient lists.
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="h6" gutterBottom color="primary" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1 
                      }}>
                        <PsychologyIcon />
                        2. AI Analysis
                      </Typography>
                      <Typography variant="body1">
                        Our advanced AI technology processes the image, extracting and analyzing
                        ingredients and nutritional information with high accuracy.
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="h6" gutterBottom color="primary" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1 
                      }}>
                        <InsightsIcon />
                        3. Get Personalized Insights
                      </Typography>
                      <Typography variant="body1">
                        Receive detailed health insights and recommendations tailored to your
                        specific health profile and dietary requirements.
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 3, 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'center',
                      background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                    }}
                  >
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <TimelineIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom color="primary">
                        Smart Analysis Process
                      </Typography>
                    </Box>
                    
                    <Stack 
                      spacing={2} 
                      sx={{ 
                        maxWidth: '400px', 
                        mx: 'auto', 
                        width: '100%' 
                      }}
                    >
                      <Paper 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'primary.main', 
                          color: 'white',
                          textAlign: 'center',
                        }}
                      >
                        Image Recognition
                      </Paper>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        color: 'primary.main' 
                      }}>
                        ↓
                      </Box>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'secondary.main', 
                          color: 'white',
                          textAlign: 'center',
                        }}
                      >
                        Nutritional Analysis
                      </Paper>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        color: 'primary.main' 
                      }}>
                        ↓
                      </Box>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'success.main', 
                          color: 'white',
                          textAlign: 'center',
                        }}
                      >
                        Health Recommendations
                      </Paper>
                    </Stack>

                    <Box sx={{ 
                      mt: 3, 
                      p: 2, 
                      bgcolor: 'rgba(33, 150, 243, 0.1)', 
                      borderRadius: 1,
                      textAlign: 'center' 
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        Our AI-powered system processes your food label in seconds,
                        providing accurate and personalized health insights.
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { md: '1fr 2fr' } }}>
            <Box>
              <History 
                history={history}
                onSelectHistory={handleSelectHistory}
                onDeleteHistory={handleDeleteHistory}
                onNameEdit={handleNameEdit}
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
                    <AnalysisResult analysis={analysis} />
                  </Box>
                </Fade>
              )}
            </Box>
          </Box>
        )}
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