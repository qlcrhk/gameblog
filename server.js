const express = require('express');
const path = require('path');
const cors = require('cors');
const uploadRoutes = require('./routes/upload');
const { MongoClient, ObjectId } = require('mongodb'); // ObjectId 추가


const saveContentRoutes = require('./api/saveContent');
const saveContent2Routes = require('./api/saveContent2.js');
const DailyEdit = require('./api/dailyEdit.js');
const GameEdit = require('./api/gameEdit.js');
const dailyRouter = require("./api/dailyDelete.js");
const gameRouter = require("./api/gameDelete.js");
const userRouter = require('./api/user'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(path.join(__dirname, 'gameblog/build')));
app.use('/images', express.static(path.join(__dirname, '/images')));
app.use("/daily", dailyRouter);
app.use("/game", gameRouter);
app.use('/api/upload', uploadRoutes);

let db;
const url = process.env.MONGODB_URL;
new MongoClient(url).connect().then((client) => {
  db = client.db('jblog');
}).catch((err) => {
  console.log(err);
});

app.use('/api/upload', uploadRoutes);
app.use('/api/saveContent', saveContentRoutes);
app.use('/api/saveContent2', saveContent2Routes);
app.use('/api/dailyEdit', DailyEdit);
app.use('/api/gameEdit', GameEdit);
app.use('/api', userRouter);


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'gameblog/build/index.html'));
});

// 게임정보 데이터
app.get('/games', async (req, res) => {
  try {
    const games = await db.collection('jblog').find().toArray();
    res.json(games);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// 특정 게임 정보 데이터
app.get('/game/:id/information',async (res,req) =>{
  id = new ObjectId(req.params.id);
  try{
    const result = await db.collection('jblog').find({_id: new ObjectId(req.params.id)});
    res.json(result);
  }catch (error) {
    console.error('Error');
  }
})

// 게임 추가
app.post('/gameadd', async (req, res) => {
  if ( req.body.name == '' || req.body.title ==  '' ) {
    res.send('제목 또는 영문이름 안적음');
  } else {
    await db.collection('jblog').insertOne({
      title: req.body.title,
      mainImg: req.body.mainImg,
      name: req.body.gameEngTitle,
      startDate: req.body.startDate,
      platform: req.body.platform,
      kind: req.body.kind,
      develop: req.body.develop,
      intro: req.body.intro
    });
    res.redirect('/game');
  }
});

// 게임 수정
app.post('/game/update', async (req, res) => {
  if (req.body.title == '') {
    res.send('제목 안적었는데');
  } else {
    try {
      const result = await db.collection('jblog').updateOne(
        { _id: new ObjectId(req.body._id) },
        {
          $set: {
            title: req.body.title,
            mainImg: req.body.mainImg,
            startDate: req.body.startDate,
            platform: req.body.platform,
            kind: req.body.kind,
            develop: req.body.develop,
            intro: req.body.intro
          }
        }
      );
      if (result.matchedCount > 0) {
        res.send('Update successful');
      } else {
        res.send('No document found with that id');
      }
    } catch (error) {
      res.status(500).send('Error updating document: ' + error.message);
    }
  }
});
// 삭제기능
app.delete('/game/:name/delete', async (req, res) => {

  try {

    const deleteResult1 = await db.collection('jblog').deleteOne({ name: req.params.name });
    const deleteResult2 = await db.collection('game').deleteOne({ parentTitle: req.params.name });

    res.status(200).send('Deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting from database');
  } finally {
  
  }
});


app.get('/game/:name/info', async (req, res) => {
  try {
    const result1 = await db.collection('jblog').findOne({ name: req.params.name });
    res.json(result1);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ message: 'Error fetching game' });
  }
});

app.get('/game/:name/list', async (req, res) => {
  try {
    // 요청에서 name 파라미터를 받아옵니다.   
    const parentTitle = req.params.name;

    // 데이터베이스에서 parentTitle 필드가 요청된 name과 일치하는 문서를 찾습니다.
    const result = await db.collection('game').find({ parentTitle: parentTitle }).toArray();

    // 결과를 JSON 형태로 반환합니다.
    res.json(result);
  } catch (error) {
    console.error('Error fetching game list:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 게임 목록 데이터
app.get('/game/:name/:id/detail', async (req, res) => {
  try {
    const id = req.params.id;
    const objectId = new ObjectId(id);

    // 데이터베이스에서 해당 _id를 가진 문서를 찾습니다.
    const result = await db.collection('game').findOne({ _id: objectId });

    if (!result) {
      return res.status(404).json({ error: '게임을 찾을 수 없습니다.' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching game detail:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 검색기능

app.get('/search', async (요청, 응답) => {
  let 검색조건 = [
    {$search : {
      index : 'jblog_index',
      text : { query : 요청.query.val , path : 'title' }
    }}
  ]
  let result = await db.collection('jblog').aggregate(검색조건).toArray()
  응답.json(result);
}) 

app.get('/game/search', async (요청, 응답) => {
  let 검색조건 = [
    {$search : {
      index : 'game_index',
      text : { query : 요청.query.val , path : 'title' }
    }}
  ]
  let result = await db.collection('game').aggregate(검색조건).toArray()
  응답.json(result);
}) 


app.get('/daily/search', async (요청, 응답) => {
  let 검색조건 = [
    {$search : {
      index : 'daily_index',
      text : { query : 요청.query.val , path : 'title' }
    }}
  ]
  let result = await db.collection('daily').aggregate(검색조건).toArray()
  응답.json(result);
}) 


// 일상 페이지
app.get('/daily/list', async (req, res) => {
  try {
    const result = await db.collection('daily').find().toArray();
    res.json(result);
  } catch (error) {
    console.error('Error fetching daily list:', error);
    res.status(500).json({ message: 'Error fetching daily list' });
  }
});

app.get('/daily/:id/info', async (req, res) => {
  try {
    const result = await db.collection('daily').findOne({ _id: new ObjectId(req.params.id) });
    res.json(result);
  } catch (error) {
    console.error('Error fetching daily item:', error);
    res.status(500).json({ message: 'Error fetching daily item' });
  }
});



app.delete('/daily/:id/delete', async (req, res) => {
  try {
    const result = await db.collection('daily').deleteOne({ _id: new ObjectId(req.params.id) });
  } catch (error) {
    console.error('Error fetching daily item:', error);
    res.status(500).json({ message: 'Error fetching daily item' });
  }
});

// update기능

// jblog 콜렉션 game 메인 페이지 항목 수정기능

app.get('/game/:id/info', async (req, res)=>{
  const result = await db.collection('jblog').find().toArray();
  res.json(result)
})



app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'gameblog/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
