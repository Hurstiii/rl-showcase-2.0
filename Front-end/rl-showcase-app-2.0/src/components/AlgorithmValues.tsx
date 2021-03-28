import {
  Box,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import MuiAccordion from "@material-ui/core/Accordion";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import MuiAccordionDetails from "@material-ui/core/AccordionDetails";
export interface AlgorithmValue {
  key: string;
  value: unknown;
}

export interface Props {
  values: AlgorithmValue[];
}

const useStyles = makeStyles({
  table: {
    tableLayout: "fixed",
    background: "#fff",
  },
  tableContainer: {
    height: "fit-content",
    overflowX: "hidden",
  },
  tableHeadRow: {
    background: "rgba(0, 0, 0, .01)",
  },
});

const Accordion = withStyles({
  root: {
    border: "1px solid rgba(0, 0, 0, .125)",
    boxShadow: "none",
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
    "&$expanded": {
      margin: "auto",
    },
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles({
  root: {
    backgroundColor: "rgba(0, 0, 0, .01)",
    borderBottom: "1px solid rgba(0, 0, 0, .125)",
    marginBottom: -1,
    minHeight: 56,
    "&$expanded": {
      minHeight: 56,
    },
  },
  content: {
    "&$expanded": {
      margin: "12px 0",
    },
  },
  expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiAccordionDetails);

export const AlgorithmValuesViewer: React.FC<Props> = (props) => {
  const { values } = props;
  const classes = useStyles();

  return (
    <TableContainer
      component={Paper}
      style={{
        marginTop: "1em",
        width: "350px",
      }}
      className={`${classes.tableContainer}`}
    >
      <Table size="small" className={classes.table}>
        <TableHead key={"head"}>
          <TableRow color="primary" classes={{ head: classes.tableHeadRow }}>
            <TableCell key={"symbol"} align="right">
              Symbol
            </TableCell>
            <TableCell key={"value"} align="left">
              Value
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody key={"body"}>
          {values.map((KeyValue, index) => {
            const key = KeyValue.key;
            const value = KeyValue.value;
            if (typeof value === "number" || typeof value === "string") {
              return (
                <TableRow key={index}>
                  <TableCell
                    key={"symbol"}
                    component="th"
                    scope="row"
                    align="right"
                  >
                    {key}
                  </TableCell>
                  <TableCell key={"value"} align="left">
                    {value}
                  </TableCell>
                </TableRow>
              );
            } else {
              return <></>;
            }
          })}
        </TableBody>
      </Table>
      {values.map((KeyValue, index) => {
        const key = KeyValue.key;
        const value = KeyValue.value;
        if (typeof value === "object" && Array.isArray(value)) {
          return (
            <Accordion elevation={0}>
              <AccordionSummary>
                <Typography variant="button">{key}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" flexWrap="wrap">
                  {value.map((x, i) => {
                    return (
                      <Box
                        padding=".5rem"
                        margin="0.1rem"
                        border="1px solid rgba(0, 0, 0, .125)"
                        lineHeight="0.1rem"
                      >
                        <Typography>{x}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        } else {
          return <></>;
        }
      })}
    </TableContainer>
  );
};
