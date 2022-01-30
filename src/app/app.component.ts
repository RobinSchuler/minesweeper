import { Component } from '@angular/core';

interface Field {
  isMine: boolean;
  isFlagged: boolean;
  isRevealed: boolean;
  adjacentMines: number;
  adjacentFlagged: number;
  adjacentRevealed: number;
  adjacentFields: number;
}

interface Point {
  x: number;
  y: number;
}

type Accessor = 'adjacentMines' | 'adjacentFlagged' | 'adjacentRevealed';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  width = 30;
  height = 16;
  minesSet = 0;
  minesToSet = 99;
  flaggedFields = 0;
  fields: Field[][] = [];

  reload = () => {
    location.reload();
  };

  solve = () => {
    const hasSimpleChanged = this.solveSimple();
    const hasComplexChanged = this.solveComplex();
    if (hasComplexChanged || hasSimpleChanged) this.solve();
  };

  solveSimple = (): boolean => {
    let hasChanged = false;
    for (let rowNum = 0; rowNum < this.height; rowNum++) {
      for (let cellNum = 0; cellNum < this.width; cellNum++) {
        let field = this.fields[rowNum][cellNum];

        if (
          this.minesToSet - this.flaggedFields === 0 &&
          !field.isRevealed &&
          !field.isFlagged
        ) {
          //all mines found, turn all not revealed not flagge
          this.turnField(rowNum, cellNum);
        }
        // if has unknown fields
        else if (
          field.isRevealed &&
          field.adjacentFields -
            field.adjacentRevealed -
            field.adjacentFlagged >
            0
        ) {
          if (field.adjacentMines === field.adjacentFlagged) {
            //all mines discovered, turn the rest
            hasChanged = true;
            this.turnField(
              Math.min(Math.max(rowNum - 1, 0), this.height - 1),
              Math.min(Math.max(cellNum - 1, 0), this.width - 1)
            );
            this.turnField(
              Math.min(Math.max(rowNum - 1, 0), this.height - 1),
              Math.min(Math.max(cellNum, 0), this.width - 1)
            );
            this.turnField(
              Math.min(Math.max(rowNum - 1, 0), this.height - 1),
              Math.min(Math.max(cellNum + 1, 0), this.width - 1)
            );
            this.turnField(
              Math.min(Math.max(rowNum, 0), this.height - 1),
              Math.min(Math.max(cellNum - 1, 0), this.width - 1)
            );
            this.turnField(
              Math.min(Math.max(rowNum, 0), this.height - 1),
              Math.min(Math.max(cellNum + 1, 0), this.width - 1)
            );
            this.turnField(
              Math.min(Math.max(rowNum + 1, 0), this.height - 1),
              Math.min(Math.max(cellNum - 1, 0), this.width - 1)
            );
            this.turnField(
              Math.min(Math.max(rowNum + 1, 0), this.height - 1),
              Math.min(Math.max(cellNum, 0), this.width - 1)
            );
            this.turnField(
              Math.min(Math.max(rowNum + 1, 0), this.height - 1),
              Math.min(Math.max(cellNum + 1, 0), this.width - 1)
            );
          } else if (
            field.adjacentFields - field.adjacentRevealed ===
            field.adjacentMines
          ) {
            //remaining fields are mines, flag all
            hasChanged = true;
            this.flagField(
              Math.min(Math.max(rowNum - 1, 0), this.height - 1),
              Math.min(Math.max(cellNum - 1, 0), this.width - 1),
              true
            );
            this.flagField(
              Math.min(Math.max(rowNum - 1, 0), this.height - 1),
              Math.min(Math.max(cellNum, 0), this.width - 1),
              true
            );
            this.flagField(
              Math.min(Math.max(rowNum - 1, 0), this.height - 1),
              Math.min(Math.max(cellNum + 1, 0), this.width - 1),
              true
            );
            this.flagField(
              Math.min(Math.max(rowNum, 0), this.height - 1),
              Math.min(Math.max(cellNum - 1, 0), this.width - 1),
              true
            );
            this.flagField(
              Math.min(Math.max(rowNum, 0), this.height - 1),
              Math.min(Math.max(cellNum + 1, 0), this.width - 1),
              true
            );
            this.flagField(
              Math.min(Math.max(rowNum + 1, 0), this.height - 1),
              Math.min(Math.max(cellNum - 1, 0), this.width - 1),
              true
            );
            this.flagField(
              Math.min(Math.max(rowNum + 1, 0), this.height - 1),
              Math.min(Math.max(cellNum, 0), this.width - 1),
              true
            );
            this.flagField(
              Math.min(Math.max(rowNum + 1, 0), this.height - 1),
              Math.min(Math.max(cellNum + 1, 0), this.width - 1),
              true
            );
          }
        }
      }
    }
    return hasChanged;
  };

  isNeighbour = (field: Point, compareFields: Point[]): boolean => {
    let returnValue = true;
    compareFields.forEach((compareField) => {
      if (
        Math.abs(field.x - compareField.x) > 1 ||
        Math.abs(field.y - compareField.y) > 1
      )
        returnValue = false;
    });
    return returnValue;
  };

  solveComplex = (): boolean => {
    const hasPairChanged = this.solvePair();
    const hasSharedChanged = this.solveShared();
    return hasSharedChanged || hasPairChanged;
  };

  getSharedUnknownFields = (a: Point, b: Point): Point[] => {
    let points: Point[] = [];

    let fromX = Math.min(a.x, b.x);
    let toX = Math.max(a.x, b.x);
    let fromY = Math.min(a.y, b.y);
    let toY = Math.max(a.y, b.y);

    for (
      let rowNum = Math.max(fromY - 1, 0);
      rowNum <= Math.min(toY + 1, this.height - 1);
      rowNum++
    ) {
      for (
        let cellNum = Math.max(fromX - 1, 0);
        cellNum <= Math.min(toX + 1, this.width - 1);
        cellNum++
      ) {
        let field = this.fields[rowNum][cellNum];
        let point = { x: cellNum, y: rowNum };
        if (
          !field.isRevealed &&
          !field.isFlagged &&
          this.isNeighbour(point, [a, b])
        )
          points.push(point);
      }
    }
    return points;
  };

  solveShared = (): boolean => {
    //shared fields
    /*
    !! geht auch ohne Nachbarn, mit 1 Reihe dazwischen !. Pair kann abgebildet werden, in dem man den Fall betrachtet wo b remaining unknown = b + a shared ist

    let a and b = neighbours
    a remaining mines = 1 
    b remaining mines = 3 
    b unknown fields = 4 
    shared unknown fields = 2 
    min shared mines = shared unknown - ( b unknown - b remaining) => 1
    if min shared === a remaining 
    => turn a surrounding that are not shared
    */
    let hasChanged = false;
    //whole field
    for (let rowNum = 0; rowNum < this.height; rowNum++) {
      for (let cellNum = 0; cellNum < this.width; cellNum++) {
        let field = this.fields[rowNum][cellNum];
        let unknownFields =
          field.adjacentFields - field.adjacentRevealed - field.adjacentFlagged;
        let remainingMines = field.adjacentMines - field.adjacentFlagged;
        if (field.isRevealed) {
          //surrounding to current field
          for (
            let rowNum2 = Math.max(rowNum - 1, 0);
            rowNum2 <= Math.min(rowNum + 1, this.height - 1);
            rowNum2++
          ) {
            for (
              let cellNum2 = Math.max(cellNum - 1, 0);
              cellNum2 <= Math.min(cellNum + 1, this.width - 1);
              cellNum2++
            ) {
              let field2 = this.fields[rowNum2][cellNum2];
              if (field2.isRevealed) {
                let unknownFields2 =
                  field2.adjacentFields -
                  field2.adjacentRevealed -
                  field2.adjacentFlagged;
                let remainingMines2 =
                  field2.adjacentMines - field2.adjacentFlagged;
                let sharedUnknownFields = this.getSharedUnknownFields(
                  { x: cellNum, y: rowNum },
                  { x: cellNum2, y: rowNum2 }
                );
                let sharedUnknownsLength = sharedUnknownFields.length;
                let minSharedMines =
                  sharedUnknownsLength - (unknownFields2 - remainingMines2);
                if (
                  minSharedMines === remainingMines &&
                  unknownFields > sharedUnknownsLength
                ) {
                  //turn all that are not shared, flagged
                  for (
                    let rowNum3 = Math.max(rowNum - 1, 0);
                    rowNum3 <= Math.min(rowNum + 1, this.height - 1);
                    rowNum3++
                  ) {
                    for (
                      let cellNum3 = Math.max(cellNum - 1, 0);
                      cellNum3 <= Math.min(cellNum + 1, this.width - 1);
                      cellNum3++
                    ) {
                      let field3 = this.fields[rowNum3][cellNum3];
                      let isInShared = JSON.stringify(
                        sharedUnknownFields
                      ).includes(JSON.stringify({ x: cellNum3, y: rowNum3 }));
                      if (
                        !field3.isFlagged &&
                        !field3.isRevealed &&
                        !isInShared
                      ) {
                        hasChanged = true;
                        this.turnField(rowNum3, cellNum3);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return hasChanged;
  };

  solvePair = (): boolean => {
    let hasChanged = false;
    let pairs: Point[][] = [];
    //through all fields
    for (let rowNum = 0; rowNum < this.height; rowNum++) {
      for (let cellNum = 0; cellNum < this.width; cellNum++) {
        let field = this.fields[rowNum][cellNum];
        let unknownFields =
          field.adjacentFields - field.adjacentRevealed - field.adjacentFlagged;
        let remainingMines = field.adjacentMines - field.adjacentFlagged;
        // 2 unkown, 1 mine => pair
        if (
          field.isRevealed &&
          unknownFields === remainingMines + 1 &&
          remainingMines === 1
        ) {
          let pair: Point[] = [];
          //find pair
          for (
            let rowNum2 = Math.max(rowNum - 1, 0);
            rowNum2 <= Math.min(rowNum + 1, this.height - 1);
            rowNum2++
          ) {
            for (
              let cellNum2 = Math.max(cellNum - 1, 0);
              cellNum2 <= Math.min(cellNum + 1, this.width - 1);
              cellNum2++
            ) {
              if (!(rowNum2 === rowNum && cellNum2 === cellNum)) {
                let field2 = this.fields[rowNum2][cellNum2];
                if (!field2.isFlagged && !field2.isRevealed) {
                  //find unturned fields
                  pair.push({ y: rowNum2, x: cellNum2 });
                }
              }
            }
          }
          console.log('push to pairs', pair);
          pairs.push(pair);
        }
      }
    }

    // ToDo a field with 5 unknown 2 pairs and
    // 3 mines may flag 5th field
    // 2 mines may turn 5th field
    pairs.forEach((pair: Point[]) => {
      let y1 = pair[0].y;
      let x1 = pair[0].x;
      let y2 = pair[1].y;
      let x2 = pair[1].x;
      let fromX = Math.min(x1, x2);
      let toX = Math.max(x1, x2);
      let fromY = Math.min(y1, y2);
      let toY = Math.max(y1, y2);

      for (
        let rowNum = Math.max(fromY - 1, 0);
        rowNum <= Math.min(toY + 1, this.height - 1);
        rowNum++
      ) {
        for (
          let cellNum = Math.max(fromX - 1, 0);
          cellNum <= Math.min(toX + 1, this.width - 1);
          cellNum++
        ) {
          let field = this.fields[rowNum][cellNum];
          let bordersPair = this.isNeighbour({ x: cellNum, y: rowNum }, pair);
          if (field.isRevealed && bordersPair) {
            console.log('borders pair', field, rowNum, cellNum, pair);
            let unknownFields =
              field.adjacentFields -
              field.adjacentRevealed -
              field.adjacentFlagged;
            let remainingMines = field.adjacentMines - field.adjacentFlagged;
            //can turn, as all mines known in pair
            let condition1 =
              unknownFields > remainingMines + 1 && remainingMines === 1;
            //can flag, as all not pairs are mines
            let condition2 = unknownFields === remainingMines + 1;

            //found another pair
            let condition3 = unknownFields === 4 && remainingMines === 2;
            if (condition1 || condition2 || condition3) {
              console.log(
                'turn or flag surr',
                unknownFields,
                remainingMines,
                field
              );
              let pair: Point[] = [];
              for (
                let rowNum2 = Math.max(rowNum - 1, 0);
                rowNum2 <= Math.min(rowNum + 1, this.height - 1);
                rowNum2++
              ) {
                for (
                  let cellNum2 = Math.max(cellNum - 1, 0);
                  cellNum2 <= Math.min(cellNum + 1, this.width - 1);
                  cellNum2++
                ) {
                  let field2 = this.fields[rowNum2][cellNum2];
                  //must not be one of pair
                  if (
                    !field2.isFlagged &&
                    !field2.isRevealed &&
                    !(rowNum2 === y1 && cellNum2 === x1) &&
                    !(rowNum2 === y2 && cellNum2 === x2) &&
                    !this.fields[y1][x1].isRevealed &&
                    !this.fields[y2][x2].isRevealed &&
                    !this.fields[y1][x1].isFlagged &&
                    !this.fields[y2][x2].isFlagged
                  ) {
                    if (condition1) {
                      //turn surrounding not pair
                      hasChanged = true;
                      console.log(
                        'not flag, not turned, not pair, turn',
                        field2,
                        pair
                      );
                      this.turnField(rowNum2, cellNum2);
                    } else if (condition2) {
                      //flag surrounding not pair
                      hasChanged = true;
                      console.log(
                        'not flag, not turned, not pair, flag',
                        field2,
                        pair
                      );
                      this.flagField(rowNum2, cellNum2, true);
                    } else if (condition3) {
                      //add pair
                      console.log('add pair');
                      pair.push({ x: rowNum2, y: cellNum2 });
                    }
                  }
                }
              }
              condition3 && pairs.push(pair);
            }
          }
        }
      }
    });
    return hasChanged;
  };

  changeSurroundingFields = (
    y: number,
    x: number,
    accessor: Accessor,
    valueIncrease: number
  ) => {
    for (
      let rowNum = Math.max(y - 1, 0);
      rowNum <= Math.min(y + 1, this.height - 1);
      rowNum++
    ) {
      for (
        let cellNum = Math.max(x - 1, 0);
        cellNum <= Math.min(x + 1, this.width - 1);
        cellNum++
      ) {
        if (!(rowNum === y && cellNum === x)) {
          console.log('change surrounding, not x y');
          this.fields[rowNum][cellNum][accessor] =
            this.fields[rowNum][cellNum][accessor] + valueIncrease;
        }
      }
    }
  };

  flagField = (rowNum: number, cellNum: number, setTrue: boolean = false) => {
    let field = this.fields[rowNum][cellNum];
    let newValue = setTrue ? true : !field.isFlagged;
    if (!field.isRevealed && !(setTrue && field.isFlagged)) {
      field.isFlagged = newValue;
      this.flaggedFields = this.flaggedFields + (newValue ? 1 : -1);
      this.changeSurroundingFields(
        rowNum,
        cellNum,
        'adjacentFlagged',
        newValue ? 1 : -1
      );
    }
  };

  turnField = (rowNum: number, cellNum: number) => {
    let field = this.fields[rowNum][cellNum];
    if (!field.isRevealed && !field.isFlagged) {
      field.isRevealed = true;
      this.changeSurroundingFields(rowNum, cellNum, 'adjacentRevealed', 1);
      if (field.isMine) {
        console.log('you died');
      } else if (field.adjacentMines === 0) {
        //turn all adjacent Fields
        for (
          let rowNumToTurn = Math.max(rowNum - 1, 0);
          rowNumToTurn <= Math.min(rowNum + 1, this.height - 1);
          rowNumToTurn++
        ) {
          for (
            let cellNumToTurn = Math.max(cellNum - 1, 0);
            cellNumToTurn <= Math.min(cellNum + 1, this.width - 1);
            cellNumToTurn++
          ) {
            this.turnField(rowNumToTurn, cellNumToTurn);
          }
        }
      }
    }
  };

  ngOnInit() {
    this.fields = Array.from({ length: this.height }, (e, i) =>
      Array.from({ length: this.width }, (e, j) => ({
        isFlagged: false,
        isMine: false,
        isRevealed: false,
        adjacentMines: 0,
        adjacentFlagged: 0,
        adjacentRevealed: 0,
        adjacentFields:
          (i === 0 || i === this.height - 1) &&
          (j === 0 || j === this.width - 1)
            ? 3
            : i === 0 ||
              i === this.height - 1 ||
              j === 0 ||
              j === this.width - 1
            ? 5
            : 8,
      }))
    );

    while (this.minesSet < this.minesToSet) {
      let x = Math.floor(Math.random() * this.width);
      let y = Math.floor(Math.random() * this.height);
      if (!this.fields[y][x].isMine) {
        this.fields[y][x].isMine = true;
        this.minesSet++;
        this.changeSurroundingFields(y, x, 'adjacentMines', 1);
      }
    }
  }
}
