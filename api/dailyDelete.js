const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URL;
let db;

MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        db = client.db('jblog');
    })
    .catch(error => console.error('Failed to connect to MongoDB', error));

router.get("/list", async (req, res) => {
    try {
        const dailies = await db.collection('daily').find().toArray();
        res.json(dailies);
    } catch (error) {
        console.error("Error fetching daily content:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.collection('daily').deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Daily content not found" });
        }
        res.json({ message: "Daily content deleted successfully" });
    } catch (error) {
        console.error("Error deleting daily content:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
