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

async function run() {
    try {
        await client.connect();
        const database = client.db('drone_craft');
        const serviceCollection = database.collection('service');
        const usersCollection = database.collection('users');
        const servicesDetails = database.collection('details');

        // GET API
        app.get('/service', async (req, res) => {
            const cursor = serviceCollection.find({});
            const service = await cursor.toArray();
            res.send(service);
        });
        // app.get('/details', async (req, res) => {
        //     const cursor = servicesDetails.find({});
        //     const details = await cursor.toArray();
        //     res.send(details);
        // });

        // GET Single Service
        app.get('/service/:_id', async (req, res) => {
            const uid = req.params._id;
            console.log('getting specific service id', _id);
            const query = { _id: ObjectId(uid) };
            const service = await serviceCollection.findOne(query);
            res.json(service);
        })
        // app.get('/details/:id', async (req, res) => {
        //     const id = req.params.id;
        //     console.log('getting specific details', id);
        //     const query = { _id: ObjectId(id) };
        //     const details = await servicesDetails.findOne(query);
        //     res.json(details);
        // })


        // // POST API
        // app.post('/services', async (req, res) => {
        //     const service = req.body;
        //     console.log('hit the post api', service);

        //     const result = await servicesCollection.insertOne(service);
        //     console.log(result);
        //     res.json(result)
        // });
        // app.post('/details', async (req, res) => {
        //     const detail = req.body;
        //     console.log('hit the post api', detail);

        //     const result = await servicesDetails.insertOne(detail);
        //     console.log(result);
        //     res.json(result)
        // });

        // // DELETE API
        // app.delete('/details/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await servicesDetails.deleteOne(query);
        //     res.json(result);
        // })
        // // load cart data according to user id get api
        app.get("/details/:id", async (req, res) => {
            const id = req.params.id;
            const query = { uid: id };
            const result = await servicesDetails.find(query).toArray();
            res.json(result);
        });
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
        app.put('/users/admin', verifyToken, async(req, res) => {
            const user = req.body;
            const requester = req.decodedEmail;
            if(requester){
                const requesterAccount = await usersCollection.findOne({email: requester});
                if(requesterAccount.role === 'admin'){
                    const filter = { email: user.email};
                    const updateDoc = { $set: {role: 'admin'} };
                    const result = await usersCollection.updateOne( filter, updateDoc);
                    res.json(result);
                }
            }
            else{
                res.status(403).json({message: 'You do not have access to make admin'})
            }
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
