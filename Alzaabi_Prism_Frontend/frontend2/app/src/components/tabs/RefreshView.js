


import React, { useState } from 'react';
import { Box, Button, CircularProgress, Typography, Fade } from '@mui/material';
import axios from 'axios';

import config from '../../config';

// const API_BASE_URL = "http://127.0.0.1:8000";
const API_BASE_URL = config.API_BASE_URL;

const RefreshView = () => {
  const [loading, setLoading] = useState(false);
  const [backendMessage, setBackendMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  const refreshView = async () => {
    setLoading(true);
    setBackendMessage('');
    setShowCelebration(false);
    try {
      // 1. Get latest submitted mapping from file
      // const mappingRes = await axios.get('http://127.0.0.1:8000/api/get-latest-submitted-mapping');
      const mappingRes = await axios.get((`${API_BASE_URL}/api/get-latest-submitted-mapping`));

      const mapping = mappingRes.data;

      // 2. Convert conditions into SQL CASE WHEN logic
      const caseBlock = mapping.map(row => `    WHEN ${row.condition} THEN '${row.channel_assigned}'`).join("\n");
      const sqlQuery = `CREATE OR REPLACE VIEW vw_filtered_documentsummary AS\nSELECT *,\n  CASE\n${caseBlock}\n    ELSE 'OTHERS'\n  END AS CHANNEL\nFROM VW_Filtered_DocumentSummary_Static;`;

      // 3. Submit this SQL to backend for execution
      // const response = await axios.post('http://127.0.0.1:8000/api/refresh-view', { query: sqlQuery });
      const response = await axios.post(`${API_BASE_URL}/api/refresh-view`, { query: sqlQuery });


      const msg = response.data.message || 'Final view refreshed successfully.';
      setBackendMessage(msg);
      if (!msg.toLowerCase().includes('error')) {
        setShowCelebration(true);
      }
    } catch (error) {
      console.error('Refresh error:', error);
      setBackendMessage('❌ Error refreshing final view. Please try again.');
      setShowCelebration(false);
    }
    setLoading(false);
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        🔄 Refresh Final View
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Click below to update the final view with the latest channel mapping logic.
        This will reflect in the AAA AI Advisor and connected dashboards.
      </Typography>

      <Button variant="contained" color="primary" onClick={refreshView} disabled={loading}>
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Refresh Final View'}
      </Button>

      {showCelebration && (
        <Fade in={showCelebration}>
          <Box mt={4} textAlign="center">
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2ECC71', animation: 'pop 0.5s ease-out' }}>
              🎊 Channel Logic Updated!
            </Typography>
          </Box>
        </Fade>
      )}

      {backendMessage && (
        <Box mt={2} textAlign="center">
          <Typography variant="subtitle2" color={backendMessage.startsWith('❌') ? 'error' : 'text.primary'} fontWeight={backendMessage.startsWith('❌') ? 600 : 500}>
            {backendMessage}
          </Typography>
        </Box>
      )}

      <style>
        {`
          @keyframes pop {
            0% { transform: scale(0.9); opacity: 0; }
            60% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </Box>
  );
};

export default RefreshView;
