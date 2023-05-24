
const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
let app = express(); 
app.use(express.json());
app.use(cors());
 app.use(
    bodyParser.urlencoded({
      extended: false
    })
  );
  const JWT = require('jsonwebtoken')
  const jwtkey = "yourkey"

const connectionString = "your-database-atlas-link-here" || "";
const client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('ezTruck');
  } catch (err) {
    console.error(err);
  }
}

async function startServer() {
  const database = await connectToDatabase();
  const collection = database.collection('drivers');
  const collectionuser = database.collection('users');
  const driverlocations = database.collection('driver-location');
  const adminotp = database.collection('otp');

  app.get('/data', async (req, res) => {
    try {
      const results = await collection.find().toArray();
      res.send(results).status(200);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });
  app.get('/users', async (req, res) => {
    try {
      const results = await collectionuser.find().toArray();
      res.send(results).status(200);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });
  app.get('/driverlocations', async (req, res) => {
    try {
      const results = await driverlocations.find().toArray();
      res.send(results).status(200);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });
  
  app.post('/signwithotp', async (req, res) => {
    try {
      const{otp} = req.body;
      const {mobile} = req.body ;
      const results = await adminotp.findOne({mobile:mobile}, { sort: { _id: -1 } });
      if(results){
       if( results.mobile === mobile && results.otp === otp){
       
        JWT.sign({results},jwtkey,{expiresIn:"24h"},(err,token)=>{
                  if(err){
                    res.send("Try after sometimes")
                  }         
                  else{
                    res.send({'token':token}).status(200);
                  }
        })

       }
      else{
        res.send("Credentials not found!");
      }
      }
       else{
        res.send("Credentials not found!");
       }
      
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });


  app.listen(3002, () => {
    console.log('Server started on port 3001');
  });
}

startServer();
