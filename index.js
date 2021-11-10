const express = require('express')
const app = express()
const cors = require('cors');
// const admin = require("firebase-admin");
require('dotenv').config();
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kz6u6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        await client.connect();
        const database = client.db('doctor_portal');
        const serviceCollection = database.collection('appointments');
        const usersCollection = database.collection('users');
        const reviewCollection = database.collection('users');


    }
    finally {
        // await client.close();
    }
}



app.get('/', (req, res) => {
    res.send('Hello Drone Craft!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})