
// import React, { useEffect, useState } from 'react';
// import { Typography, Button, Menu, MenuItem, IconButton, Dialog, DialogTitle, DialogContent,
//   DialogActions, Button as MUIButton, ListItemText, TextField } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import { v4 as uuidv4 } from 'uuid';
// import { useAuth0 } from "@auth0/auth0-react";
// import Chatbot from './Chatbot';
// import DeleteIcon from '@mui/icons-material/Delete';
// import Tooltip from '@mui/material/Tooltip';
// import AddIcon from '@mui/icons-material/Add';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import './styles/Dashboard.css';
// import config from '../config';

// const Dashboard = () => {
//   const [isIframeVisible, setIframeVisible] = useState(false);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const navigate = useNavigate();
//   const { logout, user } = useAuth0();
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const [selectedTableauTab, setSelectedTableauTab] = useState('');
//   const [customDashboards, setCustomDashboards] = useState([]);
//   const [newDashboardName, setNewDashboardName] = useState('');
//   const [newDashboardUrl, setNewDashboardUrl] = useState('');
//   const [menuAnchor, setMenuAnchor] = useState(null);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [dashboardToDelete, setDashboardToDelete] = useState(null);
//   const [addDialogOpen, setAddDialogOpen] = useState(false);




//   // State to trigger re-render on window resize
//   const [resizeKey, setResizeKey] = useState(0);
 
//   useEffect(() => {
//     const handleResize = () => setResizeKey((key) => key + 1);
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);
// //   }, [resizeKey]);





//   useEffect(() => {
//     fetch(`${config.API_BASE_URL}/api/dashboards`)
//       .then(res => res.json())
//       .then(data => {
//         const validDashboards = data.filter(d => d.id && d.name && d.url);
//         setCustomDashboards(validDashboards);
//         if (validDashboards.length > 0) {
//           setSelectedTableauTab(validDashboards[0].id);
//         }
//       });
//   }, []);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) setIframeVisible(true);
//       },
//       { threshold: 0.1 }
//     );
//     const vizContainer = document.querySelector('.bi-tableau-section');
//     if (vizContainer) observer.observe(vizContainer);
//     return () => observer.disconnect();
//   }, []);

//   useEffect(() => {
//     if (isIframeVisible) {
//       const scriptId = 'tableau-embed-api';
//       if (!document.getElementById(scriptId)) {
//         const script = document.createElement('script');
//         script.id = scriptId;
//         script.type = 'module';
//         script.src = 'https://us-east-1.online.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js';
//         document.body.appendChild(script);
//       }
//     }
//   }, [isIframeVisible]);

//   const handleAIAdvisorClick = () => {
//     let sessionId = sessionStorage.getItem('session_id');
//     if (!sessionId) {
//       sessionId = uuidv4();
//       sessionStorage.setItem('session_id', sessionId);
//     }
//     navigate(`/ai-advisor/${sessionId}`);
//   };

//   const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
//   const handleMenuClose = () => setAnchorEl(null);

//   return (
//     <div className="dashboard-wrapper">
//       <div className={`dashboard-container ${isChatOpen ? 'shrink-dashboard' : ''}`}>
//         <div className="dashboard-header">
//           <div className="header-left">
//             <MUIButton
//               variant="outlined"
//               onClick={(e) => setMenuAnchor(e.currentTarget)}
//               endIcon={<ExpandMoreIcon />}
//               sx={{ textTransform: 'none', fontWeight: 500, padding: '6px 12px' }}
//             >
//               {customDashboards.find(d => d.id === selectedTableauTab)?.name || "Select Dashboard"}
//             </MUIButton>
//             <Tooltip title="Add Dashboard">
//               <IconButton
//                 onClick={() => setAddDialogOpen(true)}
//                 sx={{ color: '#1976d2', border: '1px solid #1976d2', borderRadius: '6px', padding: '6px', marginLeft: '8px', '&:hover': { backgroundColor: '#e3f2fd' } }}
//               >
//                 <AddIcon />
//               </IconButton>
//             </Tooltip>
//           </div>

//           <Typography variant="h4" className="main-title-fixed">
//             Al Zaabi Construction Management
//           </Typography>

//           <div className="header-right-container">
//             <Button variant="contained" color="primary" onClick={handleAIAdvisorClick}>Chat with AI Advisor</Button>
//             <Button variant="outlined" color="secondary" onClick={() => navigate('/channel-allocation')} style={{ marginLeft: '10px' }}>⚙️ Channel Allocation</Button>
//             <div className="header-right" onClick={handleMenuOpen} style={{ cursor: 'pointer' }}>
//               <img src={user.picture} alt={user.name} className="avatar" />
//             </div>
//             <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
//               <MenuItem onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Logout</MenuItem>
//             </Menu>
//           </div>
//         </div>

//         <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
//           PaperProps={{ style: { maxHeight: 400, width: 300, borderRadius: 10, padding: '4px 0' } }}
//           MenuListProps={{ sx: { padding: 0 } }}
//         >
//           {customDashboards.filter(d => d?.id && d?.name && d?.url).map((dashboard) => (
//             <MenuItem
//               key={dashboard.id}
//               onClick={() => { setSelectedTableauTab(dashboard.id); setMenuAnchor(null); }}
//               sx={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #f0f0f0', '&:hover': { backgroundColor: '#f5f5f5' } }}
//             >
//               <ListItemText
//                 primary={dashboard.name}
//                 primaryTypographyProps={{ style: { fontWeight: selectedTableauTab === dashboard.id ? 'bold' : 'normal', color: '#333' } }}
//               />
//               <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDashboardToDelete(dashboard); setDeleteDialogOpen(true); }} sx={{ color: '#888', '&:hover': { color: 'red' } }}>
//                 <DeleteIcon fontSize="small" />
//               </IconButton>
//             </MenuItem>
//           ))}
//         </Menu>

//         <div className="bi-tableau-section" style={{ marginTop: '20px' }}>
//           {isIframeVisible && (
//               <tableau-viz
//                 key={resizeKey} // Trigger re-render on window resize
//                 id="tableau-viz"
//                 src={customDashboards.find(d => d.id === selectedTableauTab)?.url || ''}
//                 style={{ width: '100%', height: '100%' }}
//                 hide-tabs
//                 toolbar="hidden"
//               ></tableau-viz>
//           )}
//         </div>
//       </div>

//       {isChatOpen && (
//         <div className="floating-chat-window">
//           <Chatbot onClose={() => setIsChatOpen(false)} />
//         </div>
//       )}

//       {!isChatOpen && (
//         <div className="floating-chat-container">
//           <div className="tooltip">Chat with Assistant</div>
//           <button className="floating-chat-toggle" onClick={() => {
//             const newSessionId = uuidv4();
//             sessionStorage.setItem('session_id', newSessionId);
//             setIsChatOpen(true);
//           }}>💬</button>
//         </div>
//       )}

//       <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
//         <DialogTitle>Delete Dashboard</DialogTitle>
//         <DialogContent>Do you want to delete <strong>{dashboardToDelete?.name}</strong>?</DialogContent>
//         <DialogActions>
//           <MUIButton onClick={() => setDeleteDialogOpen(false)}>Cancel</MUIButton>
//           <MUIButton color="error" onClick={() => {
//             fetch(`${config.API_BASE_URL}/api/dashboards/delete/${dashboardToDelete.id}`, { method: 'DELETE' })
//               .then(() => fetch(`${config.API_BASE_URL}/api/dashboards`))
//               .then(res => res.json())
//               .then(data => {
//                 setCustomDashboards(data);
//                 setSelectedTableauTab(data[0]?.id || '');
//               });
//             setDeleteDialogOpen(false);
//           }}>Delete</MUIButton>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={addDialogOpen} onClose={() => { setAddDialogOpen(false); setNewDashboardName(''); setNewDashboardUrl(''); }}>
//         <DialogTitle>Add New Dashboard</DialogTitle>
//         <DialogContent>
//           <TextField autoFocus margin="dense" label="Dashboard Name" fullWidth variant="outlined" value={newDashboardName} onChange={(e) => setNewDashboardName(e.target.value)} />
//           <TextField margin="dense" label="Dashboard URL" fullWidth variant="outlined" value={newDashboardUrl} onChange={(e) => setNewDashboardUrl(e.target.value)} />
//         </DialogContent>
//         <DialogActions>
//           <MUIButton onClick={() => { setAddDialogOpen(false); setNewDashboardName(''); setNewDashboardUrl(''); }}>Cancel</MUIButton>
//           <MUIButton variant="contained" onClick={() => {
//             if (!newDashboardName || !newDashboardUrl) {
//               alert("Please enter both name and URL.");
//               return;
//             }
//             const newDashboard = { id: newDashboardName.toLowerCase().replace(/\s+/g, '-'), name: newDashboardName, url: newDashboardUrl };
//             fetch(`${config.API_BASE_URL}/api/dashboards/add`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify(newDashboard)
//             })
//               .then(res => res.json())
//               .then(() => fetch(`${config.API_BASE_URL}/api/dashboards`))
//               .then(res => res.json())
//               .then(data => {
//                 setCustomDashboards(data);
//                 setSelectedTableauTab(newDashboard.id);
//                 setNewDashboardName('');
//                 setNewDashboardUrl('');
//                 setAddDialogOpen(false);
//               });
//           }}>Add</MUIButton>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default Dashboard;





import React, { useEffect, useState, useRef  } from 'react';
import { Typography, Button, Menu, MenuItem, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Button as MUIButton, ListItemText, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAuth0 } from "@auth0/auth0-react";
import Chatbot from './Chatbot';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './styles/Dashboard.css';
import config from '../config';
 
const Dashboard = () => {
  const [isIframeVisible, setIframeVisible] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth0();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTableauTab, setSelectedTableauTab] = useState('');
  const [customDashboards, setCustomDashboards] = useState([]);
  const [newDashboardName, setNewDashboardName] = useState('');
  const [newDashboardUrl, setNewDashboardUrl] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const tableauRef = useRef(null);
 
 
 
 
 
  // State to trigger re-render on window resize
  const [resizeKey, setResizeKey] = useState(0);
 
  useEffect(() => {
    const handleResize = () => setResizeKey((key) => key + 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
//   }, [resizeKey]);
 
 
 
 
 
 
 
 
  useEffect(() => {
    fetch(`${config.API_BASE_URL}/api/dashboards`)
      .then(res => res.json())
      .then(data => {
        const validDashboards = data.filter(d => d.id && d.name && d.url);
        setCustomDashboards(validDashboards);
        if (validDashboards.length > 0) {
          setSelectedTableauTab(validDashboards[0].id);
        }
      });
  }, []);
 
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIframeVisible(true);
      },
      { threshold: 0.1 }
    );
    const vizContainer = document.querySelector('.bi-tableau-section');
    if (vizContainer) observer.observe(vizContainer);
    return () => observer.disconnect();
  }, []);
 
  useEffect(() => {
    if (isIframeVisible) {
      const scriptId = 'tableau-embed-api';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.type = 'module';
        script.src = 'https://us-east-1.online.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js';
        document.body.appendChild(script);
      }
    }
  }, [isIframeVisible]);
 
  const handleAIAdvisorClick = () => {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem('session_id', sessionId);
    }
    navigate(`/ai-advisor/${sessionId}`);
  };
 
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
 
 
  const handleRefreshDashboard = async () => {
  const tableauElement = tableauRef.current;
 
  if (tableauElement) {
    try {
      const viz = await tableauElement.getViz(); // ✅ correct way in API v3
 
      if (viz) {
        await viz.refreshDataAsync(); // 🚀 refresh data
        console.log("Dashboard refreshed successfully.");
      } else {
        console.warn("Viz object not ready.");
      }
    } catch (err) {
      console.error("Error refreshing Tableau dashboard:", err);
    }
  }
};
 
 
  return (
    <div className="dashboard-wrapper">
      <div className={`dashboard-container ${isChatOpen ? 'shrink-dashboard' : ''}`}>
        <div className="dashboard-header">
          <div className="header-left">
            <MUIButton
              variant="outlined"
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              endIcon={<ExpandMoreIcon />}
              sx={{ textTransform: 'none', fontWeight: 500, padding: '6px 12px' }}
            >
              {customDashboards.find(d => d.id === selectedTableauTab)?.name || "Select Dashboard"}
            </MUIButton>
            <Tooltip title="Add Dashboard">
              <IconButton
                onClick={() => setAddDialogOpen(true)}
                sx={{ color: '#1976d2', border: '1px solid #1976d2', borderRadius: '6px', padding: '6px', marginLeft: '8px', '&:hover': { backgroundColor: '#e3f2fd' } }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Button variant="outlined" onClick={handleRefreshDashboard} sx={{ marginLeft: '8px', textTransform: 'none' }}>
      🔄 Refresh Dashboard
    </Button>
          </div>
 
          <Typography variant="h4" className="main-title-fixed">
            Al Zaabi Construction Management
          </Typography>
 
          <div className="header-right-container">
            <Button variant="contained" color="primary" onClick={handleAIAdvisorClick}>Chat with AI Advisor</Button>
            <Button variant="outlined" color="secondary" onClick={() => navigate('/channel-allocation')} style={{ marginLeft: '10px' }}>⚙️ Channel Allocation</Button>
            <div className="header-right" onClick={handleMenuOpen} style={{ cursor: 'pointer' }}>
              <img src={user.picture} alt={user.name} className="avatar" />
            </div>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Logout</MenuItem>
            </Menu>
          </div>
        </div>
 
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
          PaperProps={{ style: { maxHeight: 400, width: 300, borderRadius: 10, padding: '4px 0' } }}
          MenuListProps={{ sx: { padding: 0 } }}
        >
          {customDashboards.filter(d => d?.id && d?.name && d?.url).map((dashboard) => (
            <MenuItem
              key={dashboard.id}
              onClick={() => { setSelectedTableauTab(dashboard.id); setMenuAnchor(null); }}
              sx={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #f0f0f0', '&:hover': { backgroundColor: '#f5f5f5' } }}
            >
              <ListItemText
                primary={dashboard.name}
                primaryTypographyProps={{ style: { fontWeight: selectedTableauTab === dashboard.id ? 'bold' : 'normal', color: '#333' } }}
              />
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDashboardToDelete(dashboard); setDeleteDialogOpen(true); }} sx={{ color: '#888', '&:hover': { color: 'red' } }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </MenuItem>
          ))}
        </Menu>
 
        <div className="bi-tableau-section" style={{ marginTop: '20px' }}>
          {isIframeVisible && (
              <tableau-viz
                key={resizeKey} // Trigger re-render on window resize
                ref={tableauRef}
                id="tableau-viz"
                src={customDashboards.find(d => d.id === selectedTableauTab)?.url || ''}
                style={{ width: '100%', height: '100%' }}
                hide-tabs
                toolbar="hidden"
              ></tableau-viz>
          )}
        </div>
      </div>
 
      {isChatOpen && (
        <div className="floating-chat-window">
          <Chatbot onClose={() => setIsChatOpen(false)} />
        </div>
      )}
 
      {!isChatOpen && (
        <div className="floating-chat-container">
          <div className="tooltip">Chat with Assistant</div>
          <button className="floating-chat-toggle" onClick={() => {
            const newSessionId = uuidv4();
            sessionStorage.setItem('session_id', newSessionId);
            setIsChatOpen(true);
          }}>💬</button>
        </div>
      )}
 
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Dashboard</DialogTitle>
        <DialogContent>Do you want to delete <strong>{dashboardToDelete?.name}</strong>?</DialogContent>
        <DialogActions>
          <MUIButton onClick={() => setDeleteDialogOpen(false)}>Cancel</MUIButton>
          <MUIButton color="error" onClick={() => {
            fetch(`${config.API_BASE_URL}/api/dashboards/delete/${dashboardToDelete.id}`, { method: 'DELETE' })
              .then(() => fetch(`${config.API_BASE_URL}/api/dashboards`))
              .then(res => res.json())
              .then(data => {
                setCustomDashboards(data);
                setSelectedTableauTab(data[0]?.id || '');
              });
            setDeleteDialogOpen(false);
          }}>Delete</MUIButton>
        </DialogActions>
      </Dialog>
 
      <Dialog open={addDialogOpen} onClose={() => { setAddDialogOpen(false); setNewDashboardName(''); setNewDashboardUrl(''); }}>
        <DialogTitle>Add New Dashboard</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Dashboard Name" fullWidth variant="outlined" value={newDashboardName} onChange={(e) => setNewDashboardName(e.target.value)} />
          <TextField margin="dense" label="Dashboard URL" fullWidth variant="outlined" value={newDashboardUrl} onChange={(e) => setNewDashboardUrl(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <MUIButton onClick={() => { setAddDialogOpen(false); setNewDashboardName(''); setNewDashboardUrl(''); }}>Cancel</MUIButton>
          <MUIButton variant="contained" onClick={() => {
            if (!newDashboardName || !newDashboardUrl) {
              alert("Please enter both name and URL.");
              return;
            }
            const newDashboard = { id: newDashboardName.toLowerCase().replace(/\s+/g, '-'), name: newDashboardName, url: newDashboardUrl };
            fetch(`${config.API_BASE_URL}/api/dashboards/add`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newDashboard)
            })
              .then(res => res.json())
              .then(() => fetch(`${config.API_BASE_URL}/api/dashboards`))
              .then(res => res.json())
              .then(data => {
                setCustomDashboards(data);
                setSelectedTableauTab(newDashboard.id);
                setNewDashboardName('');
                setNewDashboardUrl('');
                setAddDialogOpen(false);
              });
          }}>Add</MUIButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};
 
export default Dashboard;