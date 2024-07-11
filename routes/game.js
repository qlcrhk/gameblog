const router = require('express').Router()

router.get('/gamelist',(req, res)=>{
   res.send('게임리스트페이지'); 
})

module.exports = router