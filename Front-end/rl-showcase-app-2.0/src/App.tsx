import {
  Paper,
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Box,
  Slider,
  Tooltip,
  Switch,
  IconButton,
} from "@material-ui/core";
import Button from "@material-ui/core/Button/Button";
import {
  ExpandMoreRounded,
  RefreshRounded,
  PlayArrowRounded,
  PauseRounded,
  FastForwardRounded,
} from "@material-ui/icons";
import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import FrozenLake, {
  Props as EnvProps,
} from "./components/FrozenLake/FrozenLake";
import { ColorValues as ThemeColors } from "./Theme";
import styled from "styled-components";
import {
  AlgorithmValuesViewer,
  AlgorithmValue,
} from "./components/AlgorithmValues";

const websocket = new WebSocket("ws://localhost:8888/");

const SimulationBase = styled.div`
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
`;

const TimelineBox = styled.div`
  transition: all 0.2s ease-out;
  width: 8px;
  height: 36px;
  &:hover {
    width: 20px;
    height: 48px;
  }
`;

interface AgentState {
  A: number[];
  Q: {
    [key: string]: number;
  };
  R: number[];
  S: number[];
  T: "inf" | number;
  alpha: number;
  epsilon: number;
  gamma: number;
  n: number;
  pi: {
    [key: string]: number;
  };
  t: number;
  tau: number;
}

const package_message = (request: string, data: Object = {}) => {
  return JSON.stringify({ request: request, data: data });
};

// export const useStyles = makeStyles({

function App() {
  const [Environment, setEnvironment] = useState<JSX.Element | undefined>(
    undefined
  );

  const [simulating, setSimulating] = useState(false);
  const [agentState, setAgentState] = useState<AgentState | {}>({});
  const [values, setValues] = useState<AlgorithmValue[]>([]);
  const [alpha, setAlpha] = useState<number>(0.1);
  const [epsilon, setEpsilon] = useState<number>(0.1);
  const [discount, setDiscount] = useState<number>(0.9);
  const [n, setN] = useState<number>(4);
  const [envSpeed, setEnvSpeed] = useState<number>(200);
  const [isSlippery, setIsSlippery] = useState<boolean>(false);

  websocket.onopen = (evt) => {
    // handle any setup that is required upon new connection?
  };

  websocket.onmessage = (evt) => {
    // retrieve the message from the server which has the data for the environment. e.g. type and data to render it
    // console.log(evt);
    const data = JSON.parse(evt.data);
    if (data.type && data.type === "FrozenLake") {
      let currentSquare: number | undefined = undefined; //TODO: Something better than just using undefined if the current square cannot be got form obs
      if ("stepResults" in data && "obs" in data.stepResults) {
        currentSquare = data.stepResults.obs;
      }

      const extraSquareInfo = () => {
        if (
          currentSquare !== undefined &&
          "Q" in agentState &&
          "pi" in agentState
        ) {
          return {
            up: [
              {
                label: `Q`,
                value: agentState.Q[`(${currentSquare}, 0)`]!.toFixed(2),
              },
              {
                label: `pi`,
                value: agentState.pi[`(${currentSquare}, 0)`]!.toFixed(2) + "%",
              },
            ],
            right: [
              {
                label: `Q`,
                value: agentState.Q[`(${currentSquare}, 1)`]!.toFixed(2),
              },
              {
                label: `pi`,
                value: agentState.pi[`(${currentSquare}, 1)`]!.toFixed(2),
              },
            ],
            down: [
              {
                label: `Q`,
                value: agentState.Q[`(${currentSquare}, 2)`]!.toFixed(2),
              },
              {
                label: `pi`,
                value: agentState.pi[`(${currentSquare}, 2)`]!.toFixed(2) + "%",
              },
            ],
            left: [
              {
                label: `Q`,
                value: agentState.Q[`(${currentSquare}, 3)`]!.toFixed(2),
              },
              {
                label: `pi`,
                value: agentState.pi[`(${currentSquare}, 3)`]!.toFixed(2) + "%",
              },
            ],
          };
        } else {
          return {};
        }
      };

      console.log(data);
      console.log(currentSquare);

      setEnvironment(
        <FrozenLake
          map={data.map}
          speed={100}
          currentSquare={currentSquare}
          extraSquareInfo={extraSquareInfo()}
        />
      ); // sets the environment to be rendered to FrozenLake

      setAgentState({ ...data.agentState });
    }
  };

  const handleStep = (e: React.MouseEvent) => {
    websocket.send(package_message("step"));
  };

  const handleSimulate = (e: React.MouseEvent) => {
    setSimulating((simulating) => !simulating);
    websocket.send(package_message("simulate"));
  };

  const handleReset = (e: React.MouseEvent) => {
    websocket.send(package_message("reset"));
  };

  const handleParamsChange = () => {
    websocket.send(
      package_message("params", {
        agent: { n: n, epsilon: epsilon, alpha: alpha, gamma: discount },
        env: { is_slippery: isSlippery },
      })
    );
  };

  useEffect(() => {
    if (agentState !== undefined) {
      setValues(
        Object.entries(agentState).map(([key, value], i) => {
          return { key: key, value: value };
        })
      );
    }
  }, [agentState]);

  return (
    <SimulationBase>
      <Paper elevation={1} square={true}>
        <Accordion elevation={1} defaultExpanded={true} square={true}>
          <AccordionSummary expandIcon={<ExpandMoreRounded />}>
            <Typography variant="body1">Algorithm Variables</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box id="algorithm-variables-box" minWidth="300px">
              <Typography
                variant="body2"
                id="learning-rate-slider"
                gutterBottom
              >
                Learning Rate
              </Typography>
              <Slider
                disabled={simulating}
                aria-labelledby="learning-rate-slider"
                min={0}
                max={1}
                step={0.05}
                value={alpha}
                onChange={(e: React.ChangeEvent<{}>, v: number | number[]) => {
                  if (typeof v === "number") {
                    setAlpha(v);
                  }
                }}
                onChangeCommitted={() => {
                  handleParamsChange();
                }}
                valueLabelDisplay="auto"
              />
              <Typography id="epsilon-slider" gutterBottom>
                Epsilon
              </Typography>
              <Slider
                disabled={simulating}
                aria-labelledby="epsilon-slider"
                min={0}
                max={1}
                step={0.05}
                value={epsilon}
                onChange={(e: React.ChangeEvent<{}>, v: number | number[]) => {
                  if (typeof v === "number") {
                    setEpsilon(v);
                  }
                }}
                onChangeCommitted={() => {
                  handleParamsChange();
                }}
                valueLabelDisplay="auto"
              />
              <Typography id="n-slider" gutterBottom>
                n-steps
              </Typography>
              <Slider
                disabled={simulating}
                aria-labelledby="n-slider"
                min={1}
                max={10}
                step={1}
                value={n}
                onChange={(e: React.ChangeEvent<{}>, v: number | number[]) => {
                  if (typeof v === "number") {
                    setN(v);
                  }
                }}
                onChangeCommitted={() => {
                  handleParamsChange();
                }}
                valueLabelDisplay="auto"
              />
              <Typography id="discount-slider" gutterBottom>
                Discount
              </Typography>
              <Slider
                disabled={simulating}
                aria-labelledby="discount-slider"
                min={0}
                max={1}
                step={0.05}
                value={discount}
                onChange={(e: React.ChangeEvent<{}>, v: number | number[]) => {
                  if (typeof v === "number") {
                    setDiscount(v);
                  }
                }}
                onChangeCommitted={() => {
                  handleParamsChange();
                }}
                valueLabelDisplay="auto"
              />
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion elevation={1} defaultExpanded={true} square={true}>
          <AccordionSummary expandIcon={<ExpandMoreRounded />}>
            <Typography variant="body1">Environment Variables</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box id="environment-variables-box" minWidth="300px">
              {/* 
                // TODO: Move speed controls and use seperate message to update because env and agent don't need to be reset. 
              */}
              {/* <Typography variant="body2" id="speed-slider" gutterBottom>
                Simulation Speed
              </Typography>
              <Slider
                aria-labelledby="speed-slider"
                defaultValue={envSpeed}
                min={60}
                max={500}
                step={20}
                value={envSpeed}
                onChange={(e: React.ChangeEvent<{}>, v: number | number[]) => {
                  if (typeof v === "number") {
                    setEnvSpeed(v);
                  }
                }}
                onChangeCommitted={() => {
                  handleParamsChange();
                }}
                valueLabelDisplay="auto"
              /> */}
              <Tooltip
                title="Actions become non-deterministic. There is a probability that the agent will 
              slip on the ice and move in a different direction than the action it took."
              >
                <Box display="flex" flexDirection="row" alignItems="center">
                  <Typography variant="body2" id="isSlippery-switch">
                    IsSlippery
                  </Typography>
                  <Switch
                    checked={isSlippery}
                    onChange={() => {
                      setIsSlippery((isSlippery) => !isSlippery);
                      handleParamsChange();
                    }}
                    disabled={simulating}
                  />
                </Box>
              </Tooltip>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>
      <Box display="flex" flexDirection="row" padding="1em" flexGrow={1}>
        <Box
          display="flex"
          flexGrow={1}
          alignItems="center"
          paddingTop="2em"
          flexDirection="column"
        >
          {Environment !== undefined && Environment}
          {/* IN DEVELOPMENT */}
          {/* <Box width="100%">
            <Paper>
              <Box display="flex" flexDirection="column" padding="0.6em">
                <Box
                  display="flex"
                  flexDirection="row"
                  id="episodes-box"
                  marginBottom="0.4em"
                  overflow="auto visible"
                  padding="0.1em"
                  height="50px"
                  alignItems="center"
                >
                  {Array.from(history.keys()).map((key, i) => {
                    return (
                      <Paper
                        elevation={0}
                        key={i}
                        style={{
                          marginRight: "0.2em",
                          height: "max-content",
                          background: "red",
                        }}
                        square={true}
                        onClick={(
                          event: React.MouseEvent<HTMLDivElement, MouseEvent>
                        ) => {
                          console.log(event.target);
                          // set some state to remeber which has been clicked, and show the timesteps of the episode that has been clicked.
                          setCurrentEpisode(key);
                        }}
                      >
                        <TimelineBox />
                      </Paper>
                    );
                  })}
                </Box>
                <Box
                  display="flex"
                  flexDirection="row"
                  id="timesteps-box"
                  overflow="auto visible"
                  padding="0.1em"
                  height="50px"
                  alignItems="center"
                >
                  {history.get(currentEpisode)?.map((timestepState, i) => {
                    return (
                      <Paper
                        key={i}
                        style={{
                          marginRight: "0.2em",
                          height: "max-content",
                        }}
                        square={true}
                        onClick={(
                          event: React.MouseEvent<HTMLDivElement, MouseEvent>
                        ) => {
                          console.log(event.target);
                          // set some state to remember which has been clicked, and show the timesteps of the episode that has been clicked.
                          setCurrentTimestep(i);
                          loadTimestepState(timestepState);
                        }}
                      >
                        <TimelineBox />
                      </Paper>
                    );
                  })}
                </Box>
              </Box>
            </Paper>
          </Box> */}
        </Box>
        <Box>
          <Box>
            <Paper style={{ background: ThemeColors.primary?.main }}>
              <Box display="flex" flexDirection="row" justifyContent="center">
                <IconButton onClick={handleReset} disabled={simulating}>
                  <RefreshRounded fontSize="large" />
                </IconButton>
                <IconButton onClick={handleStep} disabled={simulating}>
                  <PlayArrowRounded fontSize="large" />
                </IconButton>
                <IconButton onClick={handleSimulate}>
                  {simulating ? (
                    <PauseRounded fontSize="large" />
                  ) : (
                    <FastForwardRounded fontSize="large" />
                  )}
                </IconButton>
              </Box>
            </Paper>
          </Box>
          <AlgorithmValuesViewer values={values} />
        </Box>
      </Box>
    </SimulationBase>
  );
}

export default App;
