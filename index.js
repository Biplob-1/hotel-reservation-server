const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(
  cors({
    origin: ["http://localhost:5173",],
    credentials: true,
  })
)
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
    // await client.connect();

    //rooms collection
    const roomsCollection = client.db('hotelBook').collection('rooms');

    //create bookingroom table/ collection
    const bookingCollection = client.db('hotelBook').collection('bookings');

    // create reviews table / collection
    const reviewsCollection = client.db('hotelBook').collection('reviews');

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

    // bookings data insert
    app.post('/roomBookings', async(req, res) =>{
      try {
        const booking = req.body;
        // console.log(booking);
        const result = await bookingCollection.insertOne(booking);
        res.send(result);
      } catch (error) {
        console.error('data insert error:', error);
      }
    })

    // review data insert
    app.post('/allReviews', async(req, res) => {
      try {
        const reviews = req.body;
        const result = await reviewsCollection.insertOne(reviews);
        res.send(result);
      } catch (error) {
        console.error('Review insert error:', error);
      }
    })

    // get all review
    app.get('/allReviews', async(req, res) => {
      try {
        const cursor = reviewsCollection.find();
        const result = await cursor.toArray();
        res.send(result)
      } catch (error) {
        console.error('Reviews data fetch error:',error)
      }
    })
    

    // Update room availability by id
    app.put('/updateRoomAvailability/:id', async (req, res) => {
      try {
          const id = req.params.id;
          const update = req.body;

          const filter = { _id: new ObjectId(id) };
          const updateRoom = {
              $set: {
                  availability: update.availability
              }
          };

          const result = await roomsCollection.updateOne(filter, updateRoom);
          if (result.modifiedCount === 1) {
              res.json({ message: 'Room availability updated successfully' });
          } else {
              res.status(404).json({ error: 'Room not found' });
          }
      } catch (error) {
          console.error('Error updating room availability:', error);
          res.status(500).json({ error: 'Failed to update room availability' });
      }
    });


    //get all booked rooms
    app.get('/bookedRooms', async (req, res) => {
      try {
        const cursor = bookingCollection.find()
        const result = await cursor.toArray()
        res.send(result);
      } catch (error) {
        console.error('booking rooms data fetch error:',error)
      }
    })
    //get single booked room by id
    app.get('/bookedRooms/:id', async (req, res) => {
      try {
        const cursor = bookingCollection.find()
        const result = await cursor.toArray()
        res.send(result);
      } catch (error) {
        console.error('booking rooms data fetch error:',error)
      }
    })

    //update booked rooms date
    app.put('/updateBookedRoom/:id', async (req, res) =>{
      try {
        const id = req.params.id;
        const room = req.body;
        const filter = {_id: new ObjectId(id)};
        const option = {upsert : true};
        const updateRoom = {
          $set: {
            date : room.date,
          }
        }
        const result = await bookingCollection.updateOne(filter, updateRoom, option);
        res.send(result)
      } catch (error) {
        console.error('"Error updating Room:", error');
      }
    })

    //remove my booked room
    app.delete('/deleteBookedRoom/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await bookingCollection.deleteOne(query)
        if (result.deletedCount === 1) {
          res.json({ message: 'Booking deleted successfully' });
      } else {
          res.status(404).json({ error: 'Booking not found' });
      }
      } catch (error) {
        console.error('Error deleting Booking:', error);
      }
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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