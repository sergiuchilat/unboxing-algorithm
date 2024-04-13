import UnboxingGameTest from "./UnboxingGameTest";


import express, { Request, Response } from "express";
import dotenv from "dotenv";

// configures dotenv to work in your application
dotenv.config ();
const app = express ();

const PORT = process.env.PORT;

app.get ("/", (request: Request, response: Response) => {
  testUnboxingGame ()
  response
    .status (200)
    .send (renderResult ());
});

app.listen (PORT, () => {
  console.log ("Server running at PORT: ", PORT);
}).on ("error", (error) => {
  // gracefully handle error
  throw new Error (error.message);
});


const resultParts: any[] = [];

function testUnboxingGame () {

  const boxes = [
    // '50_50',
    //'60_40',
    'nintendo',
    'apple',
    'only_phones',
    'tiffany',
    'crocs',
  ];

  // const testOpeningsCounter = [2, 10, 50, 100, 500, 1_000, 5_000, 10_000, 50_000];
  // const testOpeningsCounter = [10, 100, 1_000];
  const testOpeningsCounter = [10, 100, 1_000, 10_000];
  resultParts.splice (0, resultParts.length)
  for (const box of boxes) {
    for (const openings of testOpeningsCounter) {
      const unboxingGame = new UnboxingGameTest (box, openings);
      for (let i = 0; i < openings; i++) {
        unboxingGame.openBox ()
      }
      resultParts.push ({
        box,
        totalSpentSum: unboxingGame.totalSpentSum,
        totalWinningSum: unboxingGame.totalWinningSum,
        openings,
        openingResults: unboxingGame.getOpeningResults (openings),
      });
    }
  }

  console.log ('Done');
}

function renderResult () {
  const parts = resultParts.map ((part) => {
    const profit: number = parseInt ((part.totalSpentSum - part.totalWinningSum).toFixed (2))
    return `
      <details>
        <summary>
            <div><span>&rAarr;</span><strong></strong></div>
            <div>
                <span>Box</span> <strong>${ part.box }</strong>
            </div> 
            <div>
                <span>Openings:</span> <strong style="color: yellow;">${ part.openings }</strong>
            </div>
            <div>
                <span>Spent: </span><strong style="color: orange;">${ part.totalSpentSum.toFixed(2) }</strong>
            </div>
            <div>
                <span>Winning sum:</span> <strong style="color: aqua">${ part.totalWinningSum.toFixed (2) }</strong>
            </div> 
            <div>
                <span>Profit:</span> <strong style="color: ${ (profit > 0) ? 'green' : 'red' }">${ profit }</strong>
            </div>
            <div>
                <span>Profit rate:</span> <strong style="color: ${ (profit > 0) ? 'green' : 'red' }">${ (profit / part.totalSpentSum * 100).toFixed (2) }%</strong>
            </div>
        </summary>
        <pre>${ JSON.stringify (part.openingResults, null, 2) }</pre>
      </details>
    `;
  })
  //console.log(parts)
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Unboxing Game Test</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              padding: 2em;
          }
          details {
              margin-bottom: 1em;
          }
          summary {
              cursor: pointer;
              padding: 1em;
              border: 1px solid black;
              border-radius: 5px;
              background-color: black; 
              color: white; display: 
              grid; grid-template-columns: 4em repeat(6, 1fr);
          }
          
          summary div {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            border-left-color: white;
            border-left-style: solid;
            border-left-width: 2px;
            padding: 0 1em;
          }
          
          summary div strong{
              text-align: right;
          }
          
          pre {
              background-color: #f9f9f9;
              padding: 1em;
              border: 1px solid #ccc;
              border-radius: 5px;
              overflow-x: auto;
          }
      </style>
  </head>
  <body>
      ${ parts.join ('') }
  </body>
  </html>
  `;

}

//testUnboxingGame()
//console.log(resultParts)





