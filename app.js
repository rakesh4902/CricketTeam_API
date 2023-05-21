const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
const sqlite3 = require("sqlite3");

let db = null;

const initializeDbANdServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running");
    });
  } catch (e) {
    console.log(`Db error ${e.message}`);
    process.exit(1);
  }
};
initializeDbANdServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//API-1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT *
    FROM cricket_team;`;
  const player = await db.all(getPlayersQuery);
  response.send(
    player.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//API-2
app.post("/players/", async (request, response) => {
  const playerBody = request.body;
  const { playerName, jerseyNumber, role } = playerBody;
  const postPlayerQuery = `
  INSERT into 
  cricket_team(player_name,jersey_number,role)
  VALUES(
      '${playerName}',
      ${jerseyNumber},
      '${role}');`;
  const postArr = await db.run(postPlayerQuery);
  response.send("Player Added to Team");
});

//API-3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * 
    FROM cricket_team
    WHERE player_id=${playerId};`;
  const single_player = await db.get(getPlayerQuery);
  console.log(single_player);
  response.send(convertDbObjectToResponseObject(single_player));
});

//API-4
app.put("/players/:playerId", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const putPlayerQuery = `
    UPDATE cricket_team
    SET player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}'
    WHERE player_id=${playerId};`;
  const player_up = await db.run(putPlayerQuery);
  console.log(player_up);
  response.send("Player Details Updated");
});

//API-5
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const delPlayerQuery = `
    DELETE from
    cricket_team
    WHERE player_id=${playerId};`;
  await db.run(delPlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
