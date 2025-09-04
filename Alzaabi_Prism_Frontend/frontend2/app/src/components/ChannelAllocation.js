import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Button, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MappingEditor from './tabs/MappingEditor';
import ViewMapping from './tabs/ViewMapping';
import RefreshView from './tabs/RefreshView';
import PreprocessingTabs from './tabs/PreprocessingTabs'; // Import your PreprocessingTabs component
 
const ChannelAllocation = () => {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
 
  const handleBack = () => {
    navigate('/dashboard');
  };
 
  return (
    // <Box sx={{ width: '98%', padding: 4, overflowX: 'hidden' }}>
    <Box
      sx={{
        width: '100vw', // Full viewport width
        maxWidth: '100%', // Prevent horizontal overflow
        padding: 1,
        overflowX: 'hidden',
        overflowY: 'scroll',
        height: '100vh',
        boxSizing: 'border-box',
        scrollbarWidth: 'none', // Firefox
        '&::-webkit-scrollbar': {
          display: 'none', // Chrome, Safari, Edge
        },
      }}
    >
    
      <Box
        sx={{
          backgroundColor: '#fff',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          px: 4,
          py: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left side: Emoji + Heading + Subtext */}
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1ABC9C',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '1.6rem', marginRight: '0.5rem' }}>🚀</span>
            Channel Mapping Platform
          </Typography>
          <Typography variant="body2" sx={{ color: '#7f8c8d', mt: 0.5 }}>
            Define. Map. Activate. Intelligent channel logic editor powered by AAA Platform.
          </Typography>
        </Box>
 
        {/* Right side: Button */}
        <Button
          variant="outlined"
          onClick={handleBack}
          sx={{
            fontWeight: 500,
            textTransform: 'none',
            borderColor: '#5D6D7E',
            color: '#2C3E50',
            fontSize: '0.9rem',
            px: 2,
            py: 0.5,
            '&:hover': {
              backgroundColor: '#f4f6f8',
            },
          }}
        >
          Back to Dashboard
        </Button>
      </Box>
 
      {/* Divider Line */}
      <Box sx={{ height: '2px', backgroundColor: '#D5D8DC', borderRadius: 1, mb: 3 }} />
 
      {/* How Platform Works Accordion */}
      <Accordion
        sx={{
          mb: 3,
          backgroundColor: '#FAFAFA',
          borderRadius: 2,
          border: '1px solid #E0E0E0',
          boxShadow: 'none',
          '&::before': { display: 'none' }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: '#2C3E50' }} />}
          aria-controls="info-content"
          id="info-header"
          sx={{
            px: 2,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: '#2C3E50',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <InfoOutlinedIcon sx={{ color: '#1ABC9C' }} />
          <Typography variant="subtitle2" fontWeight={600}   sx={{
        fontSize: '1rem', // or try '1.1rem' / '16px' / '18px'
        letterSpacing: 0.5,         // optional for spacing
      }}>
            How the Channel Allocation Platform Works
          </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{
                                px: 3,
                                pb: 2,
                                backgroundColor: '#FCFCFC',
                                borderTop: '1px solid #E0E0E0',
                              }}
                            >
          <Typography gutterBottom>
            📝 <strong>Edit & Submit Mapping</strong>: Define logic using SQL-like conditions. Add ➕ or delete 🗑️ rows as needed.
          </Typography>
          <Typography gutterBottom>
            💾 <strong>Save Changes</strong>: Save your draft logic for later review or updates.
          </Typography>
          <Typography gutterBottom>
            📤 <strong>Submit Mapping</strong>: Finalize and push your logic to the system.
          </Typography>
          <Typography gutterBottom>
            📋 <strong>View Current Mapping</strong>: Check the most recently submitted logic.
          </Typography>
          <Typography gutterBottom>
            🔄 <strong>Refresh Final View</strong>: Apply the logic to dashboards and the AI Advisor.
          </Typography>
          {/* <Typography gutterBottom>
            🛡️ <strong>Safe & Trackable</strong>: All logic is versioned and timestamped. You can always revisit or revise. */}
          {/* </Typography> */}
        </AccordionDetails>
      </Accordion>
 


      <Accordion
  sx={{
    mb: 3,
    backgroundColor: '#FCFCFC',
    borderRadius: 2,
    border: '1px solid #E0E0E0',
    boxShadow: 'none',
    '&::before': { display: 'none' },
  }}
>
  <AccordionSummary
    expandIcon={<ExpandMoreIcon sx={{ color: '#2C3E50' }} />}
    aria-controls="logic-content"
    id="logic-header"
    sx={{
      px: 2,
      py: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      color: '#2C3E50',
    }}
  >



    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
    <InfoOutlinedIcon sx={{ color: '#1ABC9C' }} />
    <Typography variant="subtitle2" fontWeight={600} sx={{
        fontSize: '1rem', // or try '1.1rem' / '16px' / '18px'
        letterSpacing: 0.5,         // optional for spacing
      }}>

    Applied Static Filters
    </Typography>
    </Box>
  </AccordionSummary>

  <AccordionDetails>
    <PreprocessingTabs />
  </AccordionDetails>
</Accordion>


 
      <Tabs value={tab} onChange={(e, v) => setTab(v)} centered sx={{ marginTop: 4 }}>
        <Tab label="📝 Edit & Submit Mapping" />
        <Tab label="📋 View Current Mapping" />
        <Tab label="🔄 Refresh Final View" />
      </Tabs>
 
      <Box sx={{ marginTop: 3 }}>
        {tab === 0 && <MappingEditor />}
        {tab === 1 && <ViewMapping />}
        {tab === 2 && <RefreshView />}
      </Box>
    </Box>
  );
};
 
export default ChannelAllocation;