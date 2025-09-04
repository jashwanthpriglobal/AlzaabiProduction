


import React, { useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Typography, Dialog, DialogTitle, DialogContent, DialogContentText } from '@mui/material';
import axios from 'axios';

import config from '../../config';

// const API_BASE_URL = "http://127.0.0.1:8000";
const API_BASE_URL = config.API_BASE_URL;

const ViewMapping = () => {
  const [mapping, setMapping] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sqlPreview, setSqlPreview] = useState('');
  const [openSqlDialog, setOpenSqlDialog] = useState(false);

  const loadMapping = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch last submitted mapping file from backend
      // const response = await axios.get('http://127.0.0.1:8000/api/get-latest-submitted-mapping');
      const response = await axios.get(`${API_BASE_URL}/api/get-latest-submitted-mapping`);

      
      setMapping(response.data);
    } catch (err) {
      console.error("Error loading mapping:", err);
      setError('Failed to load mapping');
    }
    setLoading(false);
  };

  const generateSql = () => {
    const caseStatements = mapping.map(row => `    WHEN ${row.condition} THEN '${row.channel_assigned}'`).join("\n");
    const sql = `CREATE OR REPLACE VIEW vw_filtered_documentsummary AS\nSELECT *,\n  CASE\n${caseStatements}\n    ELSE 'OTHERS'\n  END AS CHANNEL\nFROM VW_Filtered_DocumentSummary_Static;`;
    setSqlPreview(sql);
    setOpenSqlDialog(true);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" fontWeight={600} mb={1}>
        📋 View Current Channel Mapping
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        This shows the most recently submitted version of your channel mapping logic.
      </Typography>

      <Box display="flex" gap={2}>
        <Button variant="contained" onClick={loadMapping} disabled={loading}>
          {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Load Mapping Table'}
        </Button>
        {/* <Button variant="outlined" color="secondary" onClick={generateSql} disabled={mapping.length === 0}>
          Show SQL Query
        </Button> */}
      </Box>

      {error && <Typography color="error" mt={2}>{error}</Typography>}

      {mapping.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 3, maxHeight: 500, borderRadius: 2 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {Object.keys(mapping[0]).map((key) => (
                  <TableCell key={key} sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>
                    {key}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {mapping.map((row, index) => (
                <TableRow key={index}>
                  {Object.values(row).map((value, i) => (
                    <TableCell key={i}>{value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openSqlDialog} onClose={() => setOpenSqlDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Generated SQL Preview</DialogTitle>
        <DialogContent>
          <DialogContentText component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {sqlPreview}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ViewMapping;
