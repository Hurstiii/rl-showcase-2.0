import {
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import React from "react";

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
  },
  tableContainer: {
    height: "fit-content",
  },
});

export const AlgorithmValuesViewer: React.FC<Props> = (props) => {
  const { values } = props;
  const classes = useStyles();

  return (
    <TableContainer
      component={Paper}
      style={{
        width: "350px",
      }}
      className={`${classes.tableContainer}`}
    >
      <Table size="small" className={classes.table}>
        <TableHead key={"head"}>
          <TableRow color="primary">
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
            }
            // else if (typeof value === "object" && Array.isArray(value)) {
            //   let arrayString = ``;
            //   value.forEach((singleValue, index) => {
            //     return (arrayString += `${singleValue}, `);
            //   });
            //   return (
            //     <Typography>
            //       {key}={arrayString}
            //     </Typography>
            //   );
            // }
            else {
              return <></>;
            }
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
