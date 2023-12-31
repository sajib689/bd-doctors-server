const express = require('express')
const cors = require('cors')
var jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000
const app = express()
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2m0rny5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization
    if(!authorization) {
      return res.status(401).send({error: true, message: 'Unauthorized m access'})
    }
    const token = authorization.split(' ')[1]
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
      if(error) {
       return res.status(401).send({error: true, message:'Unauthorized access'})
      }
      req.decoded = decoded
      next()
    })
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
     client.connect();
    const bddoctorsCollection = client.db('bdDoctor').collection('services')
    const appointmentsCollection = client.db('bdDoctor').collection('appointment')
   
  //  jwt
  app.post('/jwt', (req, res) => {
    const user = req.body
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
      expiresIn: '1h'
     
    })
    res.send({token})
  })
   
   
   
   
    // get services from the database
    app.get('/services', async(req, res) => {
        const result = await bddoctorsCollection.find().toArray();
        res.send(result);
    })
    // get single service from api
    app.get('/services/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        // const options = {
        //     projection: {_id: 1, name: 1, img: 1}
        // }
        const result = await bddoctorsCollection.findOne(query);
        res.send(result);
    })
    // post appointment data to server
    app.post('/appointment', async(req, res) => {
      const query = req.body
      const result = await appointmentsCollection.insertOne(query);
      res.send(result)
    });
    // get appiontment data from database
    app.get('/appointment', async(req, res) => {
      // const decoded = req.decoded
      // console.log(req.headers.authorization)
      // if(decoded.email !== req.query.email) {
      //   return res.status(403).send({error: true, message: 'forbidden access token'})
      // }
      let query = {}
      if(req.query?.email) {
        query = {email: req.query.email}
      }
      const result = await appointmentsCollection.find(query).toArray();
      res.send(result)
    })
    // get all appointment data from database
    app.get('/appointment', async(req, res) => {
      const result = await appointmentsCollection.find().toArray()
      res.send(result)
    })
    // delete appointment from database
    app.delete('/appointment/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await appointmentsCollection.deleteOne(query);
      res.send(result);
    })
    // post in service
    app.post('/services', async(req, res) =>{
      const query = req.body
      const result = await bddoctorsCollection.insertOne(query);
      res.send(result);
    })
    // delete service from database
    app.delete('/services/:id', async(req, res) =>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await bddoctorsCollection.deleteOne(query)
      res.send(result);
    })
    	// update service data from database
      app.put('/services/:id', async(req, res) => {
        const id = req.params.id
        const filter = {_id: new ObjectId(id)}
        const update = req.body 
        const options = {upsert: true}
        const updatedService = {
          $set: {
           name: update.name,
           title: update.title,
           college: update.college,
           visting: update.visting,
           call: update.call,
           img: update.img,
           job: update.job,
          }
        }
        const result = await bddoctorsCollection.updateOne(filter,updatedService,options)
        res.send(result)
      })
      // 
      // app.get('/appointment/:id', async(req, res) => {
      //   const id = req.params.id
      //   const query = {_id: new ObjectId(id)}
      //   const result = await bddoctorsCollection.findOne(query)
      //   res.send(result)
      // })
      // appointment status update
      app.patch('/appointment/:id', async(req, res) => {
        const id = req.params.id
        const filter = {_id: new ObjectId(id)}
        const updated = req.body
        const updateStatus = {
          $set: {
            status: updated.status
          }
        }
        const result = await appointmentsCollection.updateOne(filter, updateStatus)
        result.send(result)
      })
    // Send a ping to confirm a successful connection
     client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Welcome the server is running')
})

app.listen(port, () => {
    console.log(`Listing on port ${port}`)
})
