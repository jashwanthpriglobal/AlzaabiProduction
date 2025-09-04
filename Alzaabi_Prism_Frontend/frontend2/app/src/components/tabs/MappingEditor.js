

// --- React Mapping Editor: Simplified Condition-Channel Version ---
// --- React Mapping Editor: Simplified Condition-Channel Version ---

import React, { useEffect, useState, useCallback } from 'react';
import { Box, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Typography, Backdrop } from '@mui/material';
import axios from 'axios';
import '../styles/MappingEditor.css';
import config from '../../config';

// const API_BASE_URL = "http://127.0.0.1:8000";
const API_BASE_URL = config.API_BASE_URL;


// 🗺️ Mapping for labels to field keys (useful for exporting/importing if needed later)
const fieldMap = {
  "SQL Condition": "condition",
  "Channel": "channel_assigned"
};

const MappingRow = React.memo(({ row, index, onChange, onRemove, onInsert }) => (
  <TableRow>
    <TableCell>{index + 1}</TableCell>

    <TableCell sx={{ minWidth: 600 }}>
      <TextField
        value={row.condition || ''}
        onChange={(e) => onChange(index, 'condition', e.target.value)}
        size="small"
        variant="outlined"
        fullWidth
        multiline
        minRows={2}
        inputProps={{ style: { fontSize: 13, padding: 8 } }}
      />
    </TableCell>

    <TableCell sx={{ minWidth: 200 }}>
      <TextField
        value={row.channel_assigned || ''}
        onChange={(e) => onChange(index, 'channel_assigned', e.target.value)}
        size="small"
        variant="outlined"
        fullWidth
        inputProps={{ style: { fontSize: 13, padding: 6 } }}
      />
    </TableCell>

    <TableCell>
      <Box display="flex" gap={1}>
        <Button variant="outlined" size="small" onClick={() => onInsert(index)}>+</Button>
        <Button variant="outlined" color="error" size="small" onClick={() => onRemove(index)}>🗑️</Button>
      </Box>
    </TableCell>
  </TableRow>
));

const MappingEditor = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading mapping...');
  const [submitMessage, setSubmitMessage] = useState('');
  const [lastEdited, setLastEdited] = useState('');

  const showLoading = (message) => {
    setLoadingMessage(message);
    setLoading(true);
  };

  useEffect(() => {
    fetchMappingFile();
  }, []);

  const fetchMappingFile = async () => {
    showLoading('Fetching default mapping...');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/get-mapping-file`);



      if (Array.isArray(res.data)) {
        const cleanRows = res.data.map(row => ({
          condition: row.condition || '',
          channel_assigned: row.channel_assigned || ''
        }));
        setRows(cleanRows);
      } else {
        setRows([]);
      }
      setLastEdited(new Date().toLocaleString());
    } catch (err) {
      console.error("Failed to load mapping file:", err);
      setRows([]);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handleChange = useCallback((index, field, value) => {
    setRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const removeRow = useCallback((index) => {
    setRows(prev => prev.filter((_, i) => i !== index));
  }, []);

  const insertRow = useCallback((index) => {
    setRows(prev => {
      const newRow = { condition: '', channel_assigned: '' };
      return [...prev.slice(0, index + 1), newRow, ...prev.slice(index + 1)];
    });
  }, []);

  const handleSaveToFile = async () => {
    showLoading('Saving changes...');
    try {
      await axios.post(`${API_BASE_URL}/api/save-mapping-file`, rows);
      setLastEdited(new Date().toLocaleString());
      setSubmitMessage("Saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      setSubmitMessage("Error saving file");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMapping = async () => {
    showLoading('Submitting mapping...');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/submit-mapping`, rows);
      setSubmitMessage(res.data.message || "Submitted successfully!");
      setLastEdited(new Date().toLocaleString());
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitMessage("Error submitting mapping");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="channel-mapping-container">
      <Backdrop open={loading} sx={{ zIndex: 9999, color: '#fff' }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress size={50} thickness={5} />
          <Typography fontWeight={600} fontSize={16}>{loadingMessage}</Typography>
        </Box>
      </Backdrop>

      {!loading && (
        <>
          <Typography variant="h6" align="center" fontWeight={600} gutterBottom>
            {lastEdited ? `Last Edited: ${lastEdited}` : 'No edits yet'}
          </Typography>

          <TableContainer component={Paper} sx={{ maxHeight: 500, border: '1px solid #ccc', borderRadius: 2 }}>
            <Table stickyHeader size="small" className="mapping-table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>SQL Condition</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Channel</TableCell>
                  <TableCell sx={{ backgroundColor: '#f5f5f5' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <MappingRow
                    key={index}
                    row={row}
                    index={index}
                    onChange={handleChange}
                    onRemove={removeRow}
                    onInsert={insertRow}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={2} display="flex" gap={2} flexWrap="wrap">
            <Button variant="outlined" onClick={fetchMappingFile}>Fetch Default Mapping</Button>
            <Button variant="outlined" color="primary" onClick={handleSaveToFile}>Save Changes</Button>
            <Button variant="contained" color="success" onClick={handleSubmitMapping}>Submit Mapping</Button>
          </Box>

          {submitMessage && (
            <Box mt={2} color="green" fontWeight="bold">
              {submitMessage}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default MappingEditor;
