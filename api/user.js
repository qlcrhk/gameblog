const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

const uri = process.env.MONGODB_URL; // MongoDB 연결 문자열
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// 사용자 추가 함수
const addUser = async (id, plainPassword) => {
    try {
        await client.connect();
        const db = client.db('jblog'); // 데이터베이스 이름
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

        await db.collection('users').insertOne({ id, password: hashedPassword });
        console.log('User added');
    } catch (error) {
        console.error('Error adding user:', error);
    } finally {
        await client.close();
    }
};

// 로그인 라우트
router.post('/login', async (req, res) => {
    const { id, password } = req.body;

    try {
        await client.connect();
        const database = client.db('jblog'); // 데이터베이스 이름
        const collection = database.collection('users'); // 컬렉션 이름

        const user = await collection.findOne({ id });

        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                res.status(200).json({ message: '로그인 성공', user: { id: user.id } });
            } else {
                res.status(401).json({ message: '아이디 또는 비밀번호가 잘못되었습니다.' });
            }
        } else {
            res.status(401).json({ message: '아이디 또는 비밀번호가 잘못되었습니다.' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: '서버 오류' });
    } finally {
        await client.close();
    }
});

// 사용자 추가 라우트 (예제용)
router.post('/addUser', async (req, res) => {
    const { id, password } = req.body;

    try {
        await client.connect();
        const database = client.db('jblog'); // 데이터베이스 이름
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await database.collection('users').insertOne({ id, password: hashedPassword });
        res.status(201).json({ message: 'User added successfully' });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Failed to add user' });
    } finally {
        await client.close();
    }
});

module.exports = router;
