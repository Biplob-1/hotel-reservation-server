const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


// console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@biplob.whidwsu.mongodb.net/?retryWrites=true&w=majority&appName=Biplob`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //rooms collection
    const roomsCollection = client.db('hotelBook').collection('rooms');
    //get all room data
    app.get('/allRooms', async(req, res) => {
        const cursor = roomsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })
    // get room details by id
    app.get('/allRooms/:id', async(req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id)}
        const room = await roomsCollection.findOne(query)
        res.send(room)
      } catch (error) {
        console.error('Room details error:',error)
        req.status(500).json({error: 'Failed to Read Room Details.'})
      }
    })

    // get available room
    app.get('/availabileRooms', async(req, res) => {
        const cursor = roomsCollection.find({availability: true})
        const result = await cursor.toArray();
        res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('server is running')
})
app.listen(port, ()=>{
    console.log(`server is running on ${port}`)
})