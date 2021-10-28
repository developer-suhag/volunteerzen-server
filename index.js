const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qow90.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("volunteerzen");
    const serviceCollection = database.collection("services");
    const eventCollection = database.collection("events");

    // GET API
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // GET single Event API
    app.get("/events/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      console.log("hit it ", id);
      res.json(result);
    });

    // Event POST API
    app.post("/event", async (req, res) => {
      const event = req.body;
      const result = await eventCollection.insertOne(event);
      res.json(result);
    });

    // use POST to get data by emails
    app.post("/events/byEmail", async (req, res) => {
      const values = req.body;
      const query = { Email: { $in: values } };
      const events = await eventCollection.find(query).toArray();
      res.json(events);
    });
  } finally {
    // await client.close()
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Volunteerzen server running");
});

app.listen(port, () => {
  console.log(`Volunteerzen app listening at http://localhost:${port}`);
});
