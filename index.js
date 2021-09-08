const express = require("express");
const { MongoClient } = require("mongodb");
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
  await client.db("myFirstDatabase").collection("users").findOne({ email: email}).then((user) =>{
    if(!user){
      res.json({
        message: "email doesn't exist"
      })
    }
    else{
      bcrypt.compare(req.body.password ,user.password, (err, isMatch)=>{
        if(isMatch){
          const maxAge = 24 * 60 * 60
          const token = jwt.sign(
            {
              id: user._id,
              username: user.userName,
            },
            process.env.JWT_SECRET
          );
          // res.cookie("jwt",token,{
          //   expiresIn: maxAge
          // } )        
          console.log("login");
          return res.json({
            token: token,
            message: "user loged in"
          })
        } else {
          return res.json({ status: "error", message: "password is incorrect" });
        }
        })
      
      }
    })
});

app.post("/register",async (req, res) => {
  console.log(req.body)
  const plainPassword = req.body.password
  const email = req.body.email
  const password = await bcrypt.hash(plainPassword, 10)
  const result = await client.db("myFirstDatabase").collection("users").findOne({ email: email}).then((user) =>{
    if(user){
      res.json({
        message: "user already exists"
      })
    }
    else{
       client.db("myFirstDatabase").collection("users").insertOne({
        name: req.body.name,
        email: email,
        password: password,
        address: req.body.address,
        street: req.body.street, 
        city: req.body.city,
        state: req.body.state, 
        country: req.body.country,
        DateOfBirth: req.body.dateOfBirth,
        Gender: req.body.gender 
      })
      res.json({
        message: "user registered"
      } )}
     })
     });

app.listen(PORT, () => console.log(`listening on ${PORT}`));
