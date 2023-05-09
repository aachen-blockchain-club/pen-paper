import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { sha256 } from 'js-sha256';
import { Base64 } from 'js-base64';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Transation object uses integer keys for deterministic JSON stringification
// That's important for getting the same hash for the same Transaction object
// See: https://stackoverflow.com/a/43049877 
type Transaction = {
  0: string,  // from
  1: string,  // to
  2: number,  // amount
};

function ComponentOne() {
  const [msg, setMsg] = React.useState('');

  const handleMsgChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(event.target.value);
  };

  return (
    <>
      <Box
        component="form"
        sx={{
          '& > :not(style)': { m: 1, width: '25ch' },
        }}
        noValidate
        autoComplete="off"
      >
        <TextField
          id="outlined-name"
          label="Text"
          value={msg}
          onChange={handleMsgChange}
        />
      </Box>
      <Box component="span" sx={{ display: 'block' }}>
        Base 16: { sha256(msg) }{"\n"}
      </Box>
      <Box component="span" sx={{ display: 'block' }}>
        Base 64: { Base64.fromUint8Array(new Uint8Array(sha256.arrayBuffer(msg))) }
      </Box>
    </>
  );
}

function ComponentTwo() {
  const [state, setState] = React.useState<{
    prevBlockHash: string;
    numTxs: number;
    txs: Transaction[];
  }>({
    prevBlockHash: "",
    numTxs: 1,
    txs: [],
  });
  

  const handlePrevBlockHashChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      prevBlockHash: event.target.value,
    });
  };

  const handleNumTxsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      numTxs: parseInt(event.target.value),
    });
  };

  const handleTxsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTxs: Transaction[] = [];
    const txContainers = document.querySelectorAll('[id^="tx-container-"]');
    txContainers.forEach((txContainer, i) => {
      let from = (txContainer.querySelector(`#tx-from-${i}`) as HTMLInputElement).value ?? "";
      let to = (txContainer.querySelector(`#tx-to-${i}`) as HTMLInputElement).value ?? "";
      let amount = parseInt((txContainer.querySelector(`#tx-amount-${i}`) as HTMLInputElement).value ?? "") || 0;
      newTxs.push({ 0: from, 1: to, 2: amount });
    });
    console.log("before:")
    console.log(state);
    setState({
      ...state,
      txs: newTxs,
    });
    console.log("after:")
    console.log(state);
  };

  // create list of TX input fields
  const txInputs = [];
  for (let i = 0; i < state.numTxs; i++) {
    txInputs.push(
      <Box
        key={i}
        id={`tx-container-${i}`}
        component="form"
        sx={{
          '& > :not(style)': { m: 1, width: '25ch' },
        }}
        noValidate
        autoComplete="off"
      >
        <div>TX {i + 1}: </div>
        <TextField
          id={`tx-from-${i}`}
          label="From"
          onChange={handleTxsChange}
        />
        <TextField
          id={`tx-to-${i}`}
          label="To"
          onChange={handleTxsChange}
        />
        <TextField
          id={`tx-amount-${i}`}
          label="Amount"
          type="number"
          defaultValue={0}
          onChange={handleTxsChange}
        />
      </Box>
    );
  }

  return (
    <>
      <Box
        component="form"
        sx={{
          '& > :not(style)': { m: 1, width: '25ch' },
        }}
        noValidate
        autoComplete="off"
      >
        <TextField
          id="outlined-name"
          label="Previous block hash"
          value={state.prevBlockHash}
          onChange={handlePrevBlockHashChange}
        />
        <TextField
          id="outlined-name"
          label="number of TXs"
          type="number"
          value={state.numTxs}
          onChange={handleNumTxsChange}
        />
      </Box>
      { txInputs }
      <Box key={Math.random()} component="span" sx={{ display: 'block' }}>
        Block Hash: { sha256(`{"prevBlock":"${state.prevBlockHash}","txs":${JSON.stringify(state.txs)}}`) }{"\n"}
      </Box>
    </>
  );
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="One" {...a11yProps(0)} />
          <Tab label="Two" {...a11yProps(1)} />
          <Tab label="Three" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <ComponentOne/>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <ComponentTwo/>
      </TabPanel>
      <TabPanel value={value} index={2}>
        Item Three
      </TabPanel>
    </Box>
  );
}
