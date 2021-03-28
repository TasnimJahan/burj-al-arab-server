const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();
// console.log(process.env.DB_PASS);
// console.log(process.env.DB_HOST);
// console.log(process.env.DB_USER);
//ei console.log golo terminal e dekhai

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.stbya.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const port = 5000


const app = express();
app.use(cors());
app.use(bodyParser.json());


const admin = require("firebase-admin");
var serviceAccount = require("./configs/burj-al-arab111-firebase-adminsdk-9egjc-ae7c32df59.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  
  
  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
    .then(result => {
      // console.log(result);    //inserted count and id koto  sheta dekhabe.
      res.send(result.insertedCount >0);
    })
    console.log(newBooking);
  })


//showing all result  mane http://localhost:5000/bookings ekhane gele shb result pabo ki ki ache shegolo
  app.get('/bookings',(req, res)=> {
    console.log(req.headers.authorization);
    // console.log(req.query.email);     //front end e je query ta pathaichilam sheta req.query die pabo

    // idToken comes from the client app
    const bearer = req.headers.authorization;
    if(bearer && bearer.startsWith('Bearer ')){
      const idToken = bearer.split(' ')[1];
      console.log({idToken});

       admin
      .auth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        const tokenEmail = decodedToken.email;
        console.log("tokenEmail=" ,tokenEmail);
        console.log("query email= " , req.query.email);
        if (tokenEmail == req.query.email) {
          bookings.find({email: req.query.email})
          .toArray((err,documents)=> {
            res.status(200).send(documents);
          })
        }
        else{
          res.status(401).send("Unauthorized access");
        }
      })
      .catch((error) => {
        res.status(401).send("Unauthorized access");
      });
    }
    else{
      res.status(401).send("Unauthorized access");
    }
    
  })

  console.log('burj al arab database connected successfully');
  // client.close();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})