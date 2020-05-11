const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const cors = require('cors');


router.get('/char/:id', cors(), async function (req, res, next) { //search by character name
  console.log(req.params);
  const name = req.params.id.toLowerCase();
  const result = await fetch(`http://census.daybreakgames.com/${process.env.API}/get/ps2:v2/character_name/?name.first_lower=^${name}&c:limit=10&c:show=name.first&c:sort=name.first_lower`);
  if (result.ok) {
    const resJson = await result.json();
    res.send(resJson);
  }
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
