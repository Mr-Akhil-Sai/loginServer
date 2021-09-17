const express = require("express");
const { MongoClient, MongoCursorInUseError } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const cors = require("cors")
require("dotenv").config()

const app = express()
const PORT = 8000;

let client 
async function connect() {
  const uri =
    "mongodb+srv://akhil:ihateyouiloveyou@d-users.orn2z.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

  client = new MongoClient(uri);

  try {
    await client.connect();
  } catch (e) {
    console.error(e);
  } 
}

connect().catch(console.error);

app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(cors())

app.post("/login", async (req, res) => {
  console.log(req.body)
  const email = req.body.email
  await client.db("myFirstDatabase").collection("users").findOne({ Email: email}).then((user) =>{
    if(!user){
      res.status(403).json({
        message: "email doesn't exist"
      })
    }
    else{
      bcrypt.compare(req.body.password ,user.Password, (err, isMatch)=>{
        if(isMatch){
          return res.status(202).json({
            message: "user loged in",

            token: user.token
          })
        } else {
          return res.status(404).json({ message: "password is incorrect" });
        }
        })
      
      }
    })
});

app.post("/register",async (req, res) => {
  const plainPassword = req.body.password
  const email = req.body.email
  const password = await bcrypt.hash(plainPassword, 10)
  const result = await client.db("myFirstDatabase").collection("users").findOne({ Email: email}).then((user) =>{
    if(user){
      res.status(403).json({
        message: "user already exists"
      })
    }
    else{
      const token = jwt.sign(
        {
          username: req.body.email,
        },
        process.env.JWT_SECRET
      );
       client.db("myFirstDatabase").collection("users").insertOne({
        Name: req.body.name,
        Email: email,
        Password: password,
        Address: req.body.address,
        Street: req.body.street, 
        City: req.body.city,
        State: req.body.state, 
        Country: req.body.country,
        DateOfBirth: req.body.dateOfBirth,
        Gender: req.body.gender,
        Device_id:"",
        token: token
      })
      res.json({
        message: "user registered",
        token: token
      } )}
     })
     });

let updatedEmail 
app.post("/update", async (req, res)=>{
  updatedEmail = req.body.newEmail
  const email = req.body.oldEmail
  const plainPassword = req.body.password
  const password = await bcrypt.hash(plainPassword, 10)
  await client.db("myFirstDatabase").collection("users").updateOne({Email : email},{$set: {
    Name: req.body.name,
    Email: req.body.newEmail,
    Password: password,
    Address: req.body.address,
    Street: req.body.street, 
    City: req.body.city,
    State: req.body.state, 
    Country: req.body.country,
    DateOfBirth: req.body.dateOfBirth,
    Serial_No:"",
    Gender: req.body.gender 
  }})
  res.json({
    message: "user updated successfully"
  })
  console.log(updatedEmail);
})

app.get("/user", async (req, res) => {
  const token = req.headers.token
  console.log(token);
  await client.db("myFirstDatabase").collection("users").findOne({ token: token}).then((user)=>{
    if(user){
      res.json({
        message: "got user",
        user: user
      })
      console.log(user)
      updatedEmail = ""
      console.log(updatedEmail)
    }
    else{
      res.status(401).json({
        message: 'something went worng'
      })
    }
  })
})

app.post("/linkDevice", async(req, res)=>{
  console.log(req.body)
  const token = req.headers.token
  await client.db("myFirstDataba").collection("users").updateOne({token: token},{$set: {
    device: req.body.serialNo
  }})
  res.status(203).json({
    message: "Device linked succesfully"
  })

})
app.listen(PORT, () => console.log(`listening on ${PORT}`));
