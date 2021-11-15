const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kz6u6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// https://arcane-savannah-78505.herokuapp.com/

async function run() {
    try {
        await client.connect();
        const database = client.db('drone_craft');
        const serviceCollection = database.collection('service');
        const usersCollection = database.collection('users');
        const detailsCollection = database.collection('details');
        const reviewCollection = database.collection('review');


        // GET API
        app.get('/service', async (req, res) => {
            const cursor = serviceCollection.find({});
            const service = await cursor.toArray();
            res.send(service);
        });
        app.get('/details', async (req, res) => {
            const cursor = detailsCollection.find({});
            const details = await cursor.toArray();
            res.send(details);
        });
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        });

        // GET Single Service
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const services = await serviceCollection.findOne(query);
            res.json(services);
        })
        

        // // POST API
        app.post('/review', async (req, res) => {
            const review = req.body;
            // console.log('hit the post api', review);
            const result = await reviewCollection.insertOne(review);
            // console.log(result);
            res.json(result)
        });
        app.post('/service', async (req, res) => {
            const service = req.body
            const result = await serviceCollection.insertOne(service);
            console.log(result);
            res.json(result)
        });

        // // DELETE API
        app.delete('/details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.json(result);
        })
        
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user};
            const result = await usersCollection.updateOne( filter, updateDoc, options);
            res.json(result);
        })
        app.put('/users/admin', async(req, res) => {
            const user = req.body;
                const filter = { email: user.email};
                const updateDoc = { $set: {role: 'admin'} };
                const result = await usersCollection.updateOne( filter, updateDoc);
                res.json(result);
        })

    }
    finally {
        // await client.close(); 
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running DRONE CRAFT Server');
});

app.listen(port, () => {
    console.log('Running DRONE CRAFT Server on port', port);
})
