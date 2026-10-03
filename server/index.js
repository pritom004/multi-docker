require('dotenv').config();
const keys = require("./keys");


const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());


const { Pool } = require("pg");

const pgClient = new Pool({
  user: keys.pgUser,
  password: keys.pgPassword,
  port: keys.pgPORT,
  host: keys.pgHOST,
  database: keys.pgDatabase,
});

pgClient.on("error", () => {
  console.log("Lost PG connection");
});

const query = `
    CREATE TABLE IF NOT EXISTS values(
        number INTEGER NOT NULL
    )
`;
pgClient.query(query).catch((err) => console.log(err));

// Redis client setup
const redis = require("redis");

const redisClient = redis.createClient({
  port: keys.redisPort,
  host: keys.redisHost, // Fixed typo here (was keys.redisPort)
  retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate();

// Express route handlers
app.get("/", (req, res) => {
  res.send("hi");
});

app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * FROM values");
  res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
  redisClient.hgetall("values", (err, values) => res.send(values));
});

app.post("/values", async (req, res) => {
  const { index } = req.body;

  if (parseInt(index) > 40) {
    return res.status(422).send("Index too high");
  }

  redisClient.hset("values", index, "Nothing yet!");
  redisPublisher.publish("insert", index);
  
  // Added await to properly handle the database execution
  await pgClient.query("INSERT INTO values(number) values(\$1)", [index]);

  res.send({ working: true });
});

app.listen(5000, (err) => {
  if (err) {
    console.log(err.message);
  }
  console.log("server is running on port 5000");
});
