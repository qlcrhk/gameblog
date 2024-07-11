const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB 클라이언트 설정
const uri = process.env.MONGODB_URL; // MongoDB 연결 문자열
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// 내용 저장을 위한 API 엔드포인트
router.post('/', async (req, res) => {
    const { content,title,parentTitle,mainImage } = req.body;

    try {
        await client.connect();
        const database = client.db('jblog'); // 데이터베이스 이름
        const collection = database.collection('game'); // 컬렉션 이름

        const newContent = {
            title: title,
            parentTitle: parentTitle,
            mainImage : mainImage,
            content: content,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await collection.insertOne(newContent);
        res.status(201).json({ message: 'Content saved successfully' });
    } catch (error) {
        console.error('Error saving content:', error);
        res.status(500).json({ message: 'Failed to save content' });
    } finally {
        await client.close();
    }
});

module.exports = router;
