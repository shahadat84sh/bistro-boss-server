const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xu7lgvl.mongodb.net/?retryWrites=true&w=majority`;

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
    const menuCollection = client.db("bistroDB").collection("menu");
    const reviewCollection = client.db("bistroDB").collection("review");
    const cartCollection = client.db("bistroDB").collection("carts");
    const usersCollection = client.db("bistroDB").collection("users");

    // users related apis
    app.get('/users', async(req, res) =>{
      const result = await usersCollection.find().toArray()
      res.send(result)
    })

    app.post('/users', async (req, res) =>{
      const user = req.body;
      const query = {email: user.email}
      const existingUser = await usersCollection.findOne(query);
      console.log('existingUser',existingUser);
      if(existingUser){
        return res.send({message: 'User already logged in'})
      }
      const result = await usersCollection.insertOne(user)
      res.send(result) 
    })

    app.patch('users/admin/:id', async (req, res) =>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)};
      const updateDoc = {
        $set: {
          role: `admin`
        },
      };
    })


    // fetch menu data
    app.get('/menu', async (req, res) =>{
        const result = await menuCollection.find().toArray();
        res.send(result)
    })
// post cart item data
    app.post('/carts', async (req, res) =>{
      const item = req.body;
      const result = await cartCollection.insertOne(item)
      res.send(result)
    })

    app.get('/carts', async (req, res) =>{
      const email = req.query.email;
      if(!email){
        res.send([])
      }
      const query = {email:email}
      const result = await cartCollection.find(query).toArray();
      res.send(result)
    })

    app.delete('/carts/:id', async (req, res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await cartCollection.deleteOne(query)
      res.send(result)
    })

    // fetch review data
    app.get('/review', async (req, res) =>{
        const result = await reviewCollection.find().toArray();
        res.send(result)
    })
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('Bistro Boss Sitting')
})

app.listen(port, ()=>{
    console.log(`Bistro boss running on port ${port}`);
})

