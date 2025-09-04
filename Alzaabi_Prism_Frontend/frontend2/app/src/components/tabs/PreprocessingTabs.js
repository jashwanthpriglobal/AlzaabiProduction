import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const PreprocessingTabs = () => {
  const [value, setValue] = useState(0);

  const columns = [
    { no: 1, name: 'DSTRAC_FYCODE', role: 'Key' },
    { no: 2, name: 'DSTRAC_DOCTYPE', role: 'Key' },
    { no: 3, name: 'DSTRAC_DOCNO', role: 'Key' },
    { no: 4, name: 'DSTRAC_DOCSRNO', role: 'Key' },
    { no: 5, name: 'DSTRAC_DOCDATE', role: 'Date' },
    { no: 6, name: 'DSTRAC_SUBLEDGER_DESC', role: 'Customer' },
    { no: 7, name: 'DSTRAC_SMAN_DESC', role: 'Salesman' },
    { no: 8, name: 'DSTRAC_AREA_DESC', role: 'Region' },
    { no: 9, name: 'DSTRAC_DIVN_DESC', role: 'Branch' },
    { no: 10, name: 'DSTRAC_STOCK_DESC', role: 'Product' },
    { no: 11, name: 'DSTRAC_QTY', role: 'Quantity' },
    { no: 12, name: 'DSTRAC_UNIT_DOCNO', role: 'Unit' },
    { no: 13, name: 'DSTRAC_RATE', role: 'Selling Price' },
    { no: 14, name: 'DSTRAC_BC_ITEM_GROSS_AMOUNT', role: 'Revenue' },
    { no: 15, name: 'DSTRAC_COST_RATE', role: 'Cost Price' },
    { no: 16, name: 'DSTRAC_COST_VALUE', role: 'COGS' },
    { no: 17, name: 'DSTRAC_STTYPE_DESC', role: 'Category' },
    { no: 18, name: 'DSTRAC_GRP2_DESC', role: 'Sub Category' },
    { no: 19, name: 'DSTRAC_GRP3_DESC', role: 'Brand' },
    { no: 20, name: 'DSTRAC_PROFIT_VALUE', role: 'Gross Profit' },
    { no: 21, name: 'DSTRAC_ACGRP4_DESC', role: 'Payment Method' },
    { no: 22, name: 'DSTRAC_PAY_MODE', role: 'Payment Method' },
    { no: 23, name: 'CHANNEL', role: 'Channels' },
  ];

  return (
    <Box>
      <Tabs
        value={value}
        onChange={(e, newValue) => setValue(newValue)}
        aria-label="documentation tabs"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="📘 Documentation" />
        <Tab label="🧠 SQL Code" />
        <Tab label="📋 Column & Roles" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {value === 0 && (
          <Paper sx={{ p: 3, backgroundColor: '#F9F9F9' }}>
            <Typography variant="h6" gutterBottom>
              🧩 Static Exclusions & Conversions - Preprocessing Overview
            </Typography>
            <Typography gutterBottom><strong>I. Static Filters:</strong></Typography>
            <Typography gutterBottom sx={{ ml: 2 }}>1. Excluded customers where <code>DSTRAC_SUBLEDGER_DESC</code> matches one of the following names:</Typography>
            <Accordion sx={{ backgroundColor: '#fff', ml: 4, mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Click to view all excluded customer names</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography component="ul" sx={{ pl: 3 }}>
                <li>SAEED AL ZAABI BUILDING MATERIALS LLC</li>
                <li>ROYAL PRINCE HOLDING LLC DUBAI BRANCH</li>
                <li>SAEED AL ZAABI GENERAL TRADING LLC BRANCH 1 - MW4</li>
                <li>SAEED AL ZAABI TYRE FACORY LLC</li>
                <li>AL MASSA AL JANOOBI BUILDING MATERIALS LLC</li>
                <li>ROYAL PRINCE HOLDING LLC DUBAI BRANCH - DEIRA</li>
                <li>AL MASSA AL JANOOBI BUILDING MATERIALS LLC BRANCH 1</li>
                <li>SAEED AL ZAABI GENERAL TRADING LLC - SZB2B</li>
                <li>SAEED AL ZAABI GENERAL TRADING LLC - M38</li>
                <li>EMIRATES ROYAL HOLDING L.L.C.</li>
                <li>SAEED AL ZAABI TYRE FACTORY</li>
                <li>EMIRATES ROYAL HOLDING LLC</li>
                <li>SUPER ALOMDA BUILDING MATERIALS LLC</li>
                <li>ROYAL PRINCE HOLDING LLC - DUBAI BRANCH</li>
                <li>AL BURJ AL THAHBI BUILDING MATERIALS</li>
                <li>SAEED AL ZAABI AUTO CARE CENTER LLC</li>
                <li>SAEED AL ZAABI GEN TRADING MAIN -M 38</li>
                <li>AL MASSA AL JANOOBI BUILDING MATERIALS</li>
                <li>SAEED AL ZAABI BUILDING MATERIALS</li>
                <li>SAEED AL ZAABI TYRES</li>
                <li>SANDHI TRANSPORT LLC</li>
                <li>EXODUS CEMENT PRODUCT TRADING LLC</li>
                <li>SAEED AL ZAABI AUTO CARE CENTER L.L.C.</li>
                <li>SAEED AL ZAABI GENERAL TRANSPORT</li>
                <li>FIRST ROYAL GROUP LLC</li>
                <li>ROYAL PRINCE GENERAL TRADING LLC - DUBAI BRANCH</li>
                <li>SUPER ALOMDA BUILDING MATERIALS</li>
                <li>EXODUS CEMENT PRODUCT TRADING</li>
                <li>ROYAL PRINCE HOLDING LLC</li>
                <li>SAEED AL ZAABI GENERAL TRADING LLC</li>
                <li>ROYAL PRINCE HOLDING LLC -DUBAI BRANCH</li>
                <li>SAEED AL ZAABI BUILDING MATERIALS L.L.C</li>
                <li>FEPY.COM E-COMMERCE - SOLE PROPRIETORSHIP L.L.C.</li>
                <li>SAEED AL ZAABI BUILDING MATERIALS LLC BRANCH</li>
                <li>SATNAM SINGH TRANSPORTS LLC</li>
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Typography gutterBottom sx={{ ml: 2 }}>2. Excluded document types using <code>DSTRAC_DOCTYPE</code>:</Typography>
            <Typography sx={{ ml: 4 }}>
              ITO101, ITO102, ITO103, ITO104, ITO105, ITO106,<br />
              ITO107, ITO501, ITO701, ITO801, ITO901
            </Typography>

            <Typography gutterBottom sx={{ ml: 2, mt: 2 }}>3. Excluded divisions using <code>DSTRAC_DIVN_DESC</code>:</Typography>
            <Typography sx={{ ml: 4 }}>
              ERH-TYR<br />
              FRG-TYR<br />
              RP-TRS<br />
              RP-TYR
            </Typography>

            <Typography gutterBottom sx={{ mt: 4 }}><strong>II. Converting Values from Positive to Negative:</strong></Typography>
            <Typography sx={{ ml: 2 }}>
              If <code>DSTRAC_DOCTYPE</code> starts with <code>CSR</code> or <code>SR</code>, it indicates a credit or return.<br />
              In that case, the <code>DSTRAC_BC_ITEM_GROSS_AMOUNT</code> is converted to a negative value using <code>-ABS(...)</code>.<br />
              For other document types, the value remains unchanged.
            </Typography>

            {/* <Typography gutterBottom sx={{ mt: 4 }}><strong>III. Final Output:</strong></Typography>
            <Typography sx={{ ml: 2 }}>
              A cleaned view <code>VW_Filtered_DocumentSummary_Static</code> is generated which feeds into the Channel Mapping Platform.
            </Typography> */}
          </Paper>
        )}

        {value === 1 && (
          <Paper sx={{ p: 3, backgroundColor: '#F4F4F4' }}>
            <Typography variant="h6" gutterBottom>
              🧠 SQL Code with Static Exclusions & Conversions
            </Typography>
            <Typography component="pre" sx={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
{`%sql


-- STEP 1 & 2 create view with static exclusions and converting credit/return to negative

CREATE OR REPLACE VIEW alzaabi_live.VW_Filtered_DocumentSummary_Static AS
SELECT
    DSTRAC_FYCODE,
    DSTRAC_DOCTYPE,
    DSTRAC_DOCNO,
    DSTRAC_DOCSRNO,
    DSTRAC_DOCDATE,
    DSTRAC_SUBLEDGER_DESC,
    DSTRAC_SMAN_DESC,
    DSTRAC_AREA_DESC,
    DSTRAC_DIVN_DESC,
    DSTRAC_STOCK_DESC,
    DSTRAC_QTY,
    DSTRAC_UNIT_DOCNO,
    DSTRAC_RATE,

    -- Convert CSR/SR values to negative
    CASE 
        WHEN DSTRAC_DOCTYPE LIKE 'CSR%' OR DSTRAC_DOCTYPE LIKE 'SR%' 
        THEN -ABS(DSTRAC_BC_ITEM_GROSS_AMOUNT)
        ELSE DSTRAC_BC_ITEM_GROSS_AMOUNT
    END AS DSTRAC_BC_ITEM_GROSS_AMOUNT,

    DSTRAC_COST_RATE,
    DSTRAC_COST_VALUE,
    DSTRAC_STTYPE_DESC,
    DSTRAC_GRP2_DESC,
    DSTRAC_GRP3_DESC,
    DSTRAC_PROFIT_VALUE,
    DSTRAC_ACGRP4_DESC,
    DSTRAC_PAY_MODE

FROM alzaabi_live.DOCUMENT_SUMMARY_TRANSACTION_CUBE_SAL

-- Filter: Remove customers
WHERE DSTRAC_SUBLEDGER_DESC NOT IN (
    'SAEED AL ZAABI BUILDING MATERIALS LLC',
    'ROYAL PRINCE HOLDING LLC DUBAI BRANCH',
    'SAEED AL ZAABI GENERAL TRADING LLC BRANCH 1 - MW4',
    'SAEED AL ZAABI TYRE FACORY LLC',
    'AL MASSA AL JANOOBI BUILDING MATERIALS LLC',
    'ROYAL PRINCE HOLDING LLC DUBAI BRANCH - DEIRA',
    'AL MASSA AL JANOOBI BUILDING MATERIALS LLC BRANCH 1',
    'SAEED AL ZAABI GENERAL TRADING LLC - SZB2B',
    'SAEED AL ZAABI GENERAL TRADING LLC - M38',
    'EMIRATES ROYAL HOLDING L.L.C.',
    'SAEED AL ZAABI TYRE FACTORY',
    'EMIRATES ROYAL HOLDING LLC',
    'SUPER ALOMDA BUILDING MATERIALS LLC',
    'ROYAL PRINCE HOLDING LLC - DUBAI BRANCH',
    'AL BURJ AL THAHBI BUILDING MATERIALS',
    'SAEED AL ZAABI AUTO CARE CENTER LLC',
    'SAEED AL ZAABI GEN TRADING MAIN -M 38',
    'AL MASSA AL JANOOBI BUILDING MATERIALS',
    'SAEED AL ZAABI BUILDING MATERIALS',
    'SAEED AL ZAABI TYRES',
    'SANDHI TRANSPORT LLC',
    'EXODUS CEMENT PRODUCT TRADING LLC',
    'SAEED AL ZAABI AUTO CARE CENTER L.L.C.',
    'SAEED AL ZAABI GENERAL TRANSPORT',
    'FIRST ROYAL GROUP LLC',
    'ROYAL PRINCE GENERAL TRADING LLC - DUBAI BRANCH',
    'SUPER ALOMDA BUILDING MATERIALS',
    'EXODUS CEMENT PRODUCT TRADING',
    'ROYAL PRINCE HOLDING LLC',
    'SAEED AL ZAABI GENERAL TRADING LLC',
    'ROYAL PRINCE HOLDING LLC -DUBAI BRANCH',
    'SAEED AL ZAABI BUILDING MATERIALS L.L.C',
    'FEPY.COM E-COMMERCE - SOLE PROPRIETORSHIP L.L.C.',
    'SAEED AL ZAABI BUILDING MATERIALS LLC BRANCH',
    'SATNAM SINGH TRANSPORTS LLC'
)

-- Filter: Exclude internal document types
AND DSTRAC_DOCTYPE NOT IN (
    'ITO101', 'ITO102', 'ITO103', 'ITO104', 'ITO105', 'ITO106', 'ITO107', 
    'ITO501', 'ITO701', 'ITO801', 'ITO901'
)

-- Filter: Exclude specific divisions
AND DSTRAC_DIVN_DESC NOT IN (
    'ERH-TYR', 'FRG-TYR', 'RP-TRS', 'RP-TYR'
);
`} {/* SQL content continues */}
            </Typography>
          </Paper>
        )}

        {value === 2 && (
          <Paper sx={{ p: 3, backgroundColor: '#FAFAFA' }}>
            <Typography variant="h6" gutterBottom>
              📋 Column & Roles
            </Typography>
            <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '1%', fontWeight: 600 }}>S. No.</TableCell>
                  <TableCell sx={{ width: '10%', fontWeight: 600 }}>Column Name</TableCell>
                  <TableCell sx={{ width: '50%', fontWeight: 600 }}>Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {columns.map((col) => (
                  <TableRow key={col.no}>
                    <TableCell sx={{ py: 0.5 }}>{col.no}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>{col.name}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>{col.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default PreprocessingTabs;
