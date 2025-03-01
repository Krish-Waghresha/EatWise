import React, { useState } from 'react';
import {
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Chip,
  TextField,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { format } from 'date-fns';

const History = ({ history, onSelectHistory, onDeleteHistory, onNameEdit }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState('');

  const handleEditStart = (index, currentName) => {
    setEditingIndex(index);
    setEditingName(currentName);
  };

  const handleEditComplete = (index) => {
    if (editingName.trim()) {
      onNameEdit(index, editingName.trim());
    }
    setEditingIndex(null);
  };

  const getVerdict = (item) => {
    try {
      const sections = item.analysis.split('\n');
      return sections[0].replace('Verdict:', '').trim();
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Analysis History
        <Chip label={`${history.length} items`} size="small" color="primary" sx={{ ml: 1 }} />
      </Typography>
      <List sx={{ maxHeight: 300, overflow: 'auto' }}>
        {history.map((item, index) => {
          const verdict = getVerdict(item);
          const isHealthy = verdict.toLowerCase() === 'healthy';
          
          return (
            <ListItem 
              key={index}
              sx={{
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                flexWrap: 'wrap',
                gap: 1,
                pr: 8,
                position: 'relative'
              }}
              onClick={() => onSelectHistory(item)}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: isHealthy ? 'success.main' : 'error.main' }}>
                  <FastfoodIcon />
                </Avatar>
              </ListItemAvatar>
              
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                {editingIndex === index ? (
                  <TextField
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    size="small"
                    fullWidth
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleEditComplete(index)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <ListItemText 
                    primary={item.productName}
                    secondary={format(new Date(item.timestamp), 'MMM dd, yyyy HH:mm')}
                    sx={{ mr: 1 }}
                  />
                )}
              </Box>

              <Chip 
                label={verdict}
                size="small"
                color={isHealthy ? 'success' : 'error'}
                sx={{ flexShrink: 0 }}
              />

              <Box 
                sx={{ 
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  gap: 0.5
                }}
              >
                {editingIndex === index ? (
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditComplete(index);
                    }}
                  >
                    <CheckIcon />
                  </IconButton>
                ) : (
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStart(index, item.productName);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                )}
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHistory(index);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};

export default History; 