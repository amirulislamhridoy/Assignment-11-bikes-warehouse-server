const express = require('express')
const app = express()
const port = process.env.PORT || 5000
var cors = require('cors')
// var bodyParser = require('body-parser')
require('dotenv').config()
const jwt = require('jsonwebtoken');

// middleware
app.use(cors())
// app.use(bodyParser.json())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { application } = require('express')
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gpybl.mongodb.net/?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const uri = `mongodb+srv://BikesWarehouse:32202910@cluster0.gpybl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const bikeCollection = client.db("warehouse").collection("bike");
//   // perform actions on the collection object
//   client.close();
// });
async function run(){
  try{
    await client.connect()
    const bikeCollection = client.db("warehouse").collection("bike");
    
    // json web token create
    app.post('/login', (req, res) => {
       const email = req.body
       var token = jwt.sign(email, "191637279d5f8e808019529d9ea0daa0e84dc3efcf357a2ed087733755313b2c540307c40bf9b4762227759cf657284eb87a7359793f44bf90a0449a1d225d52", {expiresIn: '1d'});
       res.send({token})
    })
    // get all bikes
    app.get('/bike', async (req, res) => {
      const query = {}
      const cursor = bikeCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })
    //get 1 bike
    app.get('/bike/:id', async (req, res) => {
      const id = req.params.id
      const query = {_id: ObjectId(id)}
      const result = await bikeCollection.findOne(query)
      res.send(result)
    })
    // put or update 1 bike
    app.put('/bike',async (req, res) => {
      const quantity = req.body.quantity
      const id = req.body.id
      const filter = {_id: ObjectId(id)}
      const options = {upsert: true}
      const updateDoc = {
        $set: {
          quantity
        }
      }
      const result = await bikeCollection.updateOne(filter, updateDoc, options)
      res.send(result)
    })
    // delete 1 bike
    app.delete('/bike/:id', async (req, res) => {
      const id = req.params.id
      const query = {_id: ObjectId(id)}
      const result = await bikeCollection.deleteOne(query)
      res.send(result)
    })
    // add or post 1 bike
    app.post('/bike', async (req, res) => {
      const doc = req.body
      const result = await bikeCollection.insertOne(doc)
      res.send(result)
    })
    // get some matched bike
    app.get('/mybike', verifyToken, async (req, res) => {
      const email = req.query.email
      const decoded = req.decoded
      if(decoded.email === email){
        const query = {email: email}
        const cursor = bikeCollection.find(query)
        const result = await cursor.toArray()
        res.send(result)
      }else{
        return res.status(403).send({message: "Forbidden"})
      }
    })
  }finally{}
}
run().catch(console.dir)

function verifyToken(req, res, next){
  const token = req.headers.authorization
  if(!token){
    return res.status(401).send({message: "Unauthorized"})
  }
  const accessToken = token.split(' ')[1]
  jwt.verify(accessToken, '191637279d5f8e808019529d9ea0daa0e84dc3efcf357a2ed087733755313b2c540307c40bf9b4762227759cf657284eb87a7359793f44bf90a0449a1d225d52', function(err, decoded) {
    if(err){
      return res.status(403).send({message: "Forbidden"})
    }
    if(decoded){
      req.decoded = decoded
      next()
    }
  });
}
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})