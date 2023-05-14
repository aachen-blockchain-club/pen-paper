import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { sha256 } from "js-sha256";
import { Base64 } from "js-base64";
import { Accordion, AccordionSummary, AccordionDetails, Button } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Transation object uses integer keys for deterministic JSON stringification
// That's important for getting the same hash for the same Transaction object
// See: https://stackoverflow.com/a/43049877 
// 0: from
// 1: to
// 2: amount
type Transaction = [string, string, number];

function ComponentOne() {
  const [msg, setMsg] = React.useState("");

  const handleMsgChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(event.target.value);
  };

  return (
    <>
      <TextField
        sx={{ width: "100%", mb: 3 }}
        id="outlined-name"
        label="Text"
        value={msg}
        onChange={handleMsgChange}
        />
      <h3>Base 16</h3>
      <Box sx={{ width: "100%", wordWrap: "break-word" }}>{sha256(msg)}</Box>

      <h3>Base 64</h3>
      <Box sx={{ width: "100%", wordWrap: "break-word" }}>
        {sha256Base64(msg)}
        </Box>
      </>
  );
}

function ComponentTwo() {
  const [state, setState] = React.useState<{
    prevBlockHash: string;
    numTxs: number;
    txs: Transaction[];
    nonce: number;
  }>({
    prevBlockHash: "",
    numTxs: 1,
    txs: [],
    nonce: 0,
  });

  const handlePrevBlockHashChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setState({
      ...state,
      prevBlockHash: event.target.value,
    });
  };

  const handleNumTxsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newNumTxs = parseInt(event.target.value);

    setState({
      ...state,
      numTxs: newNumTxs,
      txs: Array(newNumTxs || 0).fill(getDefaultTxValue()),
    });
  };

  const handleTxsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      txs: getTxData(),
    });
  };

  const handleNonceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      nonce: parseInt(event.target.value),
    });
  };

  // create list of TX input fields
  const txInputs = [];
  for (let i = 0; i < state.numTxs; i++) {
    txInputs.push(
            <Accordion>
                <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                >TX {i + 1}</AccordionSummary>
                <AccordionDetails
                    key={i}
                    id={`tx-container-${i}`}
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'space-around',
                        justifyContent:'space-around',
                        gap: 3,
                    }}
                >
                    <TextField
                      sx={{ width: "100%" }}
                        id={`tx-from-${i}`}
                        label="From"
                        onChange={handleTxsChange}
                    />
                    <TextField 
                        sx={{ width: "100%" }}
                        id={`tx-to-${i}`} 
                        label="To" 
                        onChange={handleTxsChange} 
                    />
                    <TextField
                        sx={{ width: "100%" }}
                        id={`tx-amount-${i}`}
                        label="Amount"
                        type="number"
                        defaultValue={0}
                        onChange={handleTxsChange}
                    />
                </AccordionDetails>
            </Accordion>
    );
  }

  return (
    <>
            <TextField
                sx={{ width: "100%", mb: 3 }}
                id="outlined-name"
                label="Previous block hash"
                value={state.prevBlockHash}
                onChange={handlePrevBlockHashChange}
            />
            <TextField
              sx={{ width: "100%", mb: 3 }}
                id="outlined-name"
                label="number of TXs"
                type="number"
                value={state.numTxs}
                onChange={handleNumTxsChange}
            />

            <Box
                sx={{ "&:first-child::before": { display: "none" } }}
            >{txInputs}</Box>

            <Box sx={{ 
                width: "100%", 
                mt: 3, 
                display: "flex", 
                flexDirection: "row", 
                alignItems: "center",
                justifyContent:"center",
                gap: 3,
            }}>
                <TextField
                    sx={{ flex: 1 }}
                    label="Nonce"
                    type="number"
                    defaultValue={0}
                    value={state.nonce}
                    onChange={handleNonceChange}
                />
                <Button 
                    variant="contained" 
                    sx={{ 
                        width: "56px", 
                        height: "56px", 
                        p: 0, 
                        minWidth: "unset"
                    }}
                    onClick={() => setState({...state, nonce: state.nonce + 1 })}
                >
                    +1
                </Button>
            </Box>

            <h3>Block Hash</h3>
            <Box sx={{ width: "100%", wordWrap: "break-word" }}>
                {sha256Base64(
                    `{"prevBlock":"${state.prevBlockHash}","txs":${JSON.stringify(
                        state.txs
                    )},"nonce":${state.nonce}}`
                )}
            </Box>
    </>
  );
}

function ComponentThree() {
  const [msg, setMsg] = React.useState("");
  const [difficulty, setDifficulty] = React.useState(0);
  const [miningMsg, setMiningMsg] = React.useState("");
  
  const handleMsgChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(event.target.value);
  };

  const handleDifficultyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDifficulty(parseInt(event.target.value));
  };

  function handleStartMining() {
    // difficulty can be NaN when its input is empty
    const difficultyNum = difficulty || 0;
    // make target prefix that we want the hash to start with
    const targetPrefix = Array(difficultyNum).fill('0').join("");
    // keep track of time
    const start = new Date().getTime();

    // start mining ⛏️
    let i = 0;
    while (sha256Base64(`${msg}${i}`).slice(0, difficultyNum) !== targetPrefix) {
        i++;
    }

    const elapsed = (new Date().getTime()) - start;

    setMiningMsg(`Finished! nonce = ${i} (${elapsed} ms)`);
  }

  return (
    <>
        <TextField
            sx={{ width: "100%", mb: 3 }}
            id="outlined-name"
            label="Text"
            value={msg}
            onChange={handleMsgChange}
        />
        <Box sx={{ 
            width: "100%", 
            mt: 3, 
            display: "flex", 
            flexDirection: "row", 
            alignItems: "center",
            justifyContent:"center",
            gap: 3,
        }}>
            <TextField
                sx={{ flex: 1 }}
                label="Difficulty"
                type="number"
                value={difficulty}
                onChange={handleDifficultyChange}
            />
            <Button 
                variant="contained" 
                sx={{ 
                    width: "56px", 
                    height: "56px", 
                    p: 0, 
                    minWidth: "unset"
                }}
                onClick={handleStartMining}
            >
                Go!
            </Button>
        </Box>
        <h3>{miningMsg}</h3>
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
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "800px", mx: "auto" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          centered
        >
          <Tab label="One" {...a11yProps(0)} />
          <Tab label="Two" {...a11yProps(1)} />
          <Tab label="Three" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <ComponentOne />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <ComponentTwo />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <ComponentThree />
      </TabPanel>
    </Box>
  );
}

// Helper methods

function getTxData(): Transaction[] {
  const newTxs: Transaction[] = [];
  const txContainers = document.querySelectorAll('[id^="tx-container-"]');
  txContainers.forEach((txContainer, i) => {
    let from =
      (txContainer.querySelector(`#tx-from-${i}`) as HTMLInputElement).value ??
      "";
    let to =
      (txContainer.querySelector(`#tx-to-${i}`) as HTMLInputElement).value ??
      "";
    let amount =
      parseFloat(
        (txContainer.querySelector(`#tx-amount-${i}`) as HTMLInputElement)
          .value ?? ""
      ) || 0;
    newTxs.push([from, to, amount]);
  });

  return newTxs;
}

function getDefaultTxValue(): Transaction {
  // empty "from", "to" and "amount" is 0
  return ["", "", 0];
}

function sha256Base64(msg: string): string {
    return Base64.fromUint8Array(new Uint8Array(sha256.arrayBuffer(msg)))
}
