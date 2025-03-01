import React from 'react';
import {
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import { format } from 'date-fns';

const History = ({ history, onSelectHistory, onDeleteHistory }) => {
  const getVerdict = (item) => {
    try {
      const sections = item.analysis.split('\n');
      return sections[0].replace('Verdict:', '').trim();
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        mb: 3,
        borderRadius: 2,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}
      >
        Analysis History
        <Chip 
          label={`${history.length} items`} 
          size="small" 
          color="primary" 
          sx={{ ml: 1 }} 
        />
      </Typography>
      <List sx={{ maxHeight: 300, overflow: 'auto' }}>
        {history.map((item, index) => {
          const verdict = getVerdict(item);
          const isHealthy = verdict.toLowerCase() === 'healthy';
          
          return (
            <ListItem 
              key={index}
              secondaryAction={
                <Tooltip title="Delete">
                  <IconButton 
                    edge="end" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistory(index);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              }
              sx={{
                cursor: 'pointer',
                '&:hover': { 
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                  transform: 'translateX(5px)',
                  transition: 'all 0.3s ease'
                },
                borderRadius: 2,
                mb: 1,
                transition: 'all 0.3s ease'
              }}
              onClick={() => onSelectHistory(item)}
            >
              <ListItemAvatar>
                <Avatar sx={{ 
                  bgcolor: isHealthy ? '#2196f3' : '#ff9800',
                  transition: 'all 0.3s ease'
                }}>
                  <FastfoodIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary={item.productName || 'Food Item'}
                secondary={format(new Date(item.timestamp), 'MMM dd, yyyy HH:mm')}
                primaryTypographyProps={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 500
                }}
              />
              <Chip 
                label={verdict}
                size="small"
                color={isHealthy ? 'info' : 'warning'}
                sx={{ 
                  mr: 2,
                  fontWeight: 500
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};

export default History; 