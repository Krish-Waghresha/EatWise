import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Stack,
  Typography,
  MenuItem,
  Alert,
  Divider
} from '@mui/material';

const UserProfileForm = ({ open, onClose, onSubmit, initialData }) => {
  const [profile, setProfile] = useState({
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    hasDiabetes: false,
    hasHighCholesterol: false,
    hasHeartCondition: false,
    hasThyroidDisease: false,
    hasKidneyDisease: false,
    hasLiverDisease: false,
    allergies: '',
    dietaryRestrictions: ''
  });

  useEffect(() => {
    if (initialData) {
      setProfile(initialData);
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(profile);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        fontFamily: "'Poppins', sans-serif"
      }}>
        {initialData ? 'Edit Your Health Profile' : 'Your Health Profile'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This information helps us provide personalized nutrition recommendations
          </Alert>
          <Stack spacing={3}>
            {/* Basic Information */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                fullWidth
                label="Gender"
                name="gender"
                value={profile.gender}
                onChange={handleChange}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={profile.age}
                onChange={handleChange}
                inputProps={{ min: 0, max: 120 }}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Weight (kg)"
                name="weight"
                type="number"
                value={profile.weight}
                onChange={handleChange}
                inputProps={{ step: 0.1 }}
              />
              <TextField
                fullWidth
                label="Height (cm)"
                name="height"
                type="number"
                value={profile.height}
                onChange={handleChange}
              />
            </Stack>

            <Divider />

            {/* Health Conditions */}
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Health Conditions
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={profile.hasDiabetes}
                    onChange={handleChange}
                    name="hasDiabetes"
                  />
                }
                label="Diabetes"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={profile.hasHighCholesterol}
                    onChange={handleChange}
                    name="hasHighCholesterol"
                  />
                }
                label="High Cholesterol"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={profile.hasHeartCondition}
                    onChange={handleChange}
                    name="hasHeartCondition"
                  />
                }
                label="Heart Condition"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={profile.hasThyroidDisease}
                    onChange={handleChange}
                    name="hasThyroidDisease"
                  />
                }
                label="Thyroid Disease"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={profile.hasKidneyDisease}
                    onChange={handleChange}
                    name="hasKidneyDisease"
                  />
                }
                label="Kidney Disease"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={profile.hasLiverDisease}
                    onChange={handleChange}
                    name="hasLiverDisease"
                  />
                }
                label="Liver Disease"
              />
            </Stack>

            <Divider />

            {/* Allergies and Dietary Restrictions */}
            <TextField
              fullWidth
              label="Allergies"
              name="allergies"
              multiline
              rows={2}
              value={profile.allergies}
              onChange={handleChange}
              placeholder="List any food allergies"
            />

            <TextField
              fullWidth
              label="Dietary Restrictions"
              name="dietaryRestrictions"
              multiline
              rows={2}
              value={profile.dietaryRestrictions}
              onChange={handleChange}
              placeholder="E.g., Vegetarian, Vegan, Gluten-free"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained"
            sx={{ minWidth: 100 }}
          >
            {initialData ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserProfileForm; 