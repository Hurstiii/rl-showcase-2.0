import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import { Box, makeStyles, Theme, Tooltip } from "@material-ui/core";

/**
 * Enum actions for the environment to given them more readability/meaning than just numbers.
 */
enum Actions {
  Up,
  Right,
  Down,
  Left,
}

/**
 * Styled components.
 */
const MapWrapper = styled.div`
  display: grid;
  ${({ SquareSize, mapSize }: { SquareSize: number; mapSize: number }) => {
    return css`
      grid: repeat(${mapSize}, ${SquareSize}px) / repeat(
          ${mapSize},
          ${SquareSize}px
        );
    `;
  }}

  align-items: center;
  justify-items: center;
`;

const MapSquare = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all ease-out 0.15s;
  ${({
    type,
    selected,
  }: {
    type: "Hole" | "Ice" | "Goal";
    selected: boolean;
  }) => {
    var background;
    if (type === "Hole") background = "#457b9d";
    else if (type === "Goal") background = "#e3b23c";
    else background = "#a8dadc";

    return css`
      ${background ? `background: ${background}` : ``};
      ${selected
        ? `box-shadow: -7px 7px 1px -1px rgba(0, 0, 0, 0.1); width: 95%; height: 95%;`
        : `box-shadow: -5px 5px 1px -1px rgba(0, 0, 0, 0.1); width: 90%; height: 90%;`}
    `;
  }};
`;

export interface StylesProps {
  InfoSize: number;
  SquareSize: number;
}

const useStyles = makeStyles<Theme, StylesProps>((theme: Theme) => ({
  InfoBubble: (props) => ({
    width: `${props.InfoSize}px`,
    height: `${props.InfoSize}px`,
    background: "#ffffff66",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "0.8rem",
    fontWeight: 300,
  }),
  InfoBox: {
    position: "absolute",
    justifyContent: "center",
    display: "flex",
    overflow: "hidden",
    transition: "opacity 0.5s ease,left 0.1s ease-in-out, top 0.1s ease-in-out",
  },
  InfoBoxHorizontal: (props) => ({
    maxWidth: `${props.SquareSize}px`,
    width: `${props.SquareSize}px`,
    height: `${props.InfoSize}px`,
    flexDirection: "row",
  }),
  InfoBoxVertical: (props) => ({
    maxHeight: `${props.SquareSize}px`,
    height: `${props.SquareSize}px`,
    width: `${props.InfoSize}px`,
    flexDirection: "column",
  }),
}));

/**
 * Props for the FrozenLake environment.
 */
export interface Props {
  map: string[][];
  isSlippery?: boolean;
  speed: number;
  extraSquareInfo:
    | {
        up: {
          label: string;
          value: string | undefined;
        }[];
        right: {
          label: string;
          value: string | undefined;
        }[];
        down: {
          label: string;
          value: string | undefined;
        }[];
        left: {
          label: string;
          value: string | undefined;
        }[];
      }
    | {};
  currentSquare?: number;
}

/**
 * The FrozenLake environment.
 * @param props Object of props
 */
const FrozenLake: React.FC<Props> = ({
  map,
  speed,
  isSlippery = false,
  extraSquareInfo,
  currentSquare = 0,
}) => {
  const mapSize = map.length; // TODO: Calculate the mapSize based on the map prop.

  const SquareSize: number = 600 / mapSize;
  const AgentSize: number = SquareSize / 2;
  const InfoSize: number = 38;

  const styleProps: StylesProps = {
    InfoSize: InfoSize,
    SquareSize: SquareSize,
  };
  const classes = useStyles(styleProps);

  const [hideExtraInfo, setHideExtraInfo] = useState(false);

  const [agentAnimDuration, setAgentAnimDuration] = useState(0.1);

  useEffect(() => {
    setAgentAnimDuration(speed / 1000);
  }, [speed]);

  return (
    <div>
      {/** The render/visual for this environment */}
      <div
        style={{
          position: "relative",
          height: "max-content",
        }}
      >
        <MapWrapper SquareSize={SquareSize} mapSize={mapSize}>
          {map.map((line, i) => {
            return line.map((v, ii) => {
              const gridIndex = i * mapSize + ii;
              if (v === "H")
                return (
                  <MapSquare
                    key={gridIndex}
                    type="Hole"
                    // onClick={() => {
                    //   if (localSelectedSquare === i) {
                    //     setHideExtraInfo((hideExtraInfo) => !hideExtraInfo);
                    //   } else {
                    //     setHideExtraInfo(false);
                    //     setSelectedSquare(i);
                    //     setLocalSelectedSquare(i);
                    //   }
                    // }}
                    selected={currentSquare === gridIndex}
                  />
                );
              else if (v === "G")
                return (
                  <MapSquare
                    key={gridIndex}
                    type="Goal"
                    // onClick={() => {
                    //   if (localSelectedSquare === i) {
                    //     setHideExtraInfo((hideExtraInfo) => !hideExtraInfo);
                    //   } else {
                    //     setHideExtraInfo(false);
                    //     setSelectedSquare(i);
                    //     setLocalSelectedSquare(i);
                    //   }
                    // }}
                    selected={currentSquare === gridIndex}
                  />
                );
              else
                return (
                  <MapSquare
                    key={gridIndex}
                    type="Ice"
                    // onClick={() => {
                    //   if (localSelectedSquare === i) {
                    //     setHideExtraInfo((hideExtraInfo) => !hideExtraInfo);
                    //   } else {
                    //     setHideExtraInfo(false);
                    //     setSelectedSquare(i);
                    //     setLocalSelectedSquare(i);
                    //   }
                    // }}
                    selected={currentSquare === gridIndex}
                  />
                );
            });
          })}
        </MapWrapper>
        <div
          id="Agent"
          style={{
            width: `${AgentSize}px`,
            height: `${AgentSize}px`,
            background: "red",
            borderRadius: "50%",
            transitionProperty: "all",
            transitionDuration: `${agentAnimDuration}s`,
            transitionTimingFunction: "ease",
            position: "absolute",
            boxShadow: "-5px 5px 1px -1px rgba(0, 0, 0, 0.2)",
            left: `${
              (currentSquare - Math.floor(currentSquare / mapSize) * mapSize) *
                SquareSize +
              AgentSize / 2
            }px`,
            top: `${
              Math.floor(currentSquare / mapSize) * SquareSize + AgentSize / 2
            }px`,
          }}
        ></div>
        <Box
          id="ValuesUp"
          className={`${classes.InfoBoxHorizontal} ${classes.InfoBox}`}
          style={{
            opacity: hideExtraInfo ? 0 : 1,
            left: `${
              (currentSquare - Math.floor(currentSquare / mapSize) * mapSize) *
              SquareSize
            }px`,
            top: `${-28 + Math.floor(currentSquare / mapSize) * SquareSize}px`,
          }}
        >
          {"up" in extraSquareInfo &&
            extraSquareInfo.up.map((obj, i) => {
              return (
                <Tooltip key={i} title={obj.label}>
                  <div id="StateValueUp" className={`${classes.InfoBubble}`}>
                    {obj.value}
                  </div>
                </Tooltip>
              );
            })}
        </Box>
        <Box
          id="ValuesDown"
          className={`${classes.InfoBoxHorizontal} ${classes.InfoBox}`}
          style={{
            opacity: hideExtraInfo ? 0 : 1,
            left: `${
              (currentSquare - Math.floor(currentSquare / mapSize) * mapSize) *
              SquareSize
            }px`,
            top: `${
              SquareSize +
              -15 +
              Math.floor(currentSquare / mapSize) * SquareSize
            }px`,
          }}
        >
          {"down" in extraSquareInfo &&
            extraSquareInfo.down.map((obj, i) => {
              return (
                <Tooltip key={i} title={obj.label}>
                  <div id="StateValueUp" className={`${classes.InfoBubble}`}>
                    {obj.value}
                  </div>
                </Tooltip>
              );
            })}
        </Box>
        <Box
          id="ValuesRight"
          className={`${classes.InfoBoxVertical} ${classes.InfoBox}`}
          style={{
            opacity: hideExtraInfo ? 0 : 1,
            left: `${
              SquareSize +
              -15 +
              (currentSquare - Math.floor(currentSquare / mapSize) * mapSize) *
                SquareSize
            }px`,
            top: `${Math.floor(currentSquare / mapSize) * SquareSize}px`,
          }}
        >
          {"right" in extraSquareInfo &&
            extraSquareInfo.right.map((obj, i) => {
              return (
                <Tooltip key={i} title={obj.label}>
                  <div id="StateValueUp" className={`${classes.InfoBubble}`}>
                    {obj.value}
                  </div>
                </Tooltip>
              );
            })}
        </Box>
        <Box
          id="ValuesLeft"
          className={`${classes.InfoBoxVertical} ${classes.InfoBox}`}
          style={{
            opacity: hideExtraInfo ? 0 : 1,
            left: `${
              -28 +
              (currentSquare - Math.floor(currentSquare / mapSize) * mapSize) *
                SquareSize
            }px`,
            top: `${Math.floor(currentSquare / mapSize) * SquareSize}px`,
          }}
        >
          {"left" in extraSquareInfo &&
            extraSquareInfo.left.map((obj, i) => {
              return (
                <Tooltip key={i} title={obj.label}>
                  <div id="StateValueUp" className={`${classes.InfoBubble}`}>
                    {obj.value}
                  </div>
                </Tooltip>
              );
            })}
        </Box>
      </div>
    </div>
  );
};

export default FrozenLake;
