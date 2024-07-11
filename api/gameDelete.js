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
    const gameCollection = db.collection("game");
    try {
        const games = await gameCollection.find().toArray();
        res.json(games);
    } catch (error) {
        console.error("Error fetching daily content:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    const gameCollection = db.collection("game");
    try {
        const result = await gameCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "message content not found" });
        }
        res.json({ message: "Game content deleted successfully" });
    } catch (error) {
        console.error("Error deleting daily content:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
