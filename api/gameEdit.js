const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URL;
let db;

MongoClient.connect(uri)
    .then(client => {
        db = client.db('jblog');
    })
    .catch(error => {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1);
    });

router.put('/', async (req, res) => {
    const { id, title, mainImage, content } = req.body;

    if (!id || !title || !mainImage || !content) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }

    try {
        const result = await db.collection('game').updateOne(
            { _id: new ObjectId(id) },
            { $set: { title, mainImage, content } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Content not found' });
        }
        
        res.status(200).json({ message: 'Content updated successfully' });
    } catch (error) {
        console.error('Error saving content:', error);
        res.status(500).json({ message: 'Failed to save content' });
    }
});

module.exports = router;
