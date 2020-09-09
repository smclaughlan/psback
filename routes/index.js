require('dotenv').config();
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const cors = require('cors');

const { sequelize } = require("../models");
const db = require("../models");

// const whiteList = ['http://localhost:3000', 'https://psstats.herokuapp.com/'];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whiteList.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('not allowed by CORS'));
//     }
//   }
// }

router.options('*', cors());
router.use(cors());
router.get("/comments", cors(), async function (req, res) {
  const url = req.query.url;
  const comments = await db.Comment.findAll({
    where: { url },
    order: [["createdAt", "ASC"]]
  })

  res.json({ comments });
})

router.post("/comments", cors(), async function (req, res) {
  const { name, email, url, body } = req.body;
  // console.log(name, email, url, body);
  const comment = await db.Comment.create({
    name,
    email,
    url,
    body
  })

  res.end();
})

router.delete("/comments", cors(), async function (req, res) {
  const { id } = req.body;
  const comment = await db.Comment.destroy({
    where: {
      id
    }
  })

  res.end();
})

router.get('/factions', cors(), async function (req, res, next) {
  const result = await fetch(`http://census.daybreakgames.com/${process.env.API}/get/ps2:v2/faction?c:limit=10&c:lang=en`);
  if (result.ok) {
    const resJson = await result.json();
    res.send(resJson);
  }
})

router.get('/classes', cors(), async function (req, res, next) {
  const result = await fetch(`http://census.daybreakgames.com/${process.env.API}/get/ps2:v2/profile?c:limit=500&c:lang=en&faction_id=1`);
  if (result.ok) {
    const resJson = await result.json();
    res.send(resJson);
  }
})

router.get('/vehicles', cors(), async function (req, res, next) {
  const result = await fetch(`http://census.daybreakgames.com/${process.env.API}/get/ps2:v2/vehicle?c:limit=14&&c:lang=en`);
  if (result.ok) {
    const resJson = await result.json();
    res.send(resJson);
  }
})

router.get('/leaderboard/:id', cors(), async function (req, res, next) { //get leaderboard info
  let type = req.params.id;
  const result = await fetch(`http://census.daybreakgames.com/${process.env.API}/get/ps2:v2/leaderboard/?name=${type}&period=Forever&c:limit=10&c:resolve=character(name,times.minutes_played,faction)`);
  if (result.ok) {
    const resJson = await result.json();
    res.send(resJson);
  }
});

router.get('/charid/:id', cors(), async function (req, res, next) { //get specific character info
  const charid = req.params.id;
  const result = await fetch(`http://census.daybreakgames.com/${process.env.API}/get/ps2:v2/character/?character_id=${charid}&c:resolve=world,outfit,stat,stat_history,profile,online_status`);
  if (result.ok) {
    const resJson = await result.json();
    res.send(resJson);
  }
});

router.get('/char/:id', cors(), async function (req, res, next) { //get specific character info
  const name = req.params.id;
  const result = await fetch(`http://census.daybreakgames.com/${process.env.API}/get/ps2/character?name.first=${name}&c:resolve=online_status&c:join=type:profile^on:profile_id^to:profile_id^list:0^show:name.en'image_path^inject_at:main_class&c:join=type:faction^on:faction_id^to:faction_id^list:0^show:name.en'image_path^inject_at:faction&c:join=type:world^on:world_id^to:world_id^list:0^inject_at:world&c:join=type:characters_stat_history^on:character_id^to:character_id^list:0^show:stat_name'all_time^list:1^inject_at:stats_history^terms:stat_name=deaths'stat_name=kills&c:join=type:characters_stat^on:character_id^to:character_id^list:0^show:stat_name'value_forever'profile_id^list:1^inject_at:stats^terms:stat_name=score'stat_name=hit_count'stat_name=fire_count(profile^on:profile_id^to:profile_type_id^show:name.en^inject_at:class)&c:join=type:outfit_member^on:character_id^to:character_id^list:0^inject_at:outfit_member(outfit^on:outfit_id^to:outfit_id^list:0^inject_at:outfit)&c:join=type:title^on:title_id^to:title_id^list:0^show:name.en^inject_at:title`);
  if (result.ok) {
    const resJson = await result.json();
    res.send(resJson);
  }
});

router.get('/outfit/:id', cors(), async function (req, res, next) { //get specific outfit info
  const outfitId = req.params.id;
  const result = await fetch(`http://census.daybreakgames.com/${process.env.API}/get/ps2:v2/outfit?c:resolve=member_online_status,member_character(times.minutes_played,character_id,member_since_date,battle_rank,prestige_level,name.first,certs.earned_points,certs.gifted_points,profile_id)&c:join=type:profile%5Eon:members.profile_id%5Eto:profile_id%5Elist:1%5Eshow:name.en%27image_path%5Einject_at:main_class&c:join=type:characters_stat_history%5Eon:members.character_id%5Eto:character_id%5Elist:1%5Eshow:stat_name%27all_time%5Einject_at:stats_history%5Eterms:stat_name=deaths%27stat_name=kills&c:join=characters_stat%5Eon:members.character_id%5Eto:character_id%5Elist:1%5Eshow:stat_name%27value_forever%27profile_id%5Elist:1%5Einject_at:stats%5Eterms:stat_name=score%27stat_name=hit_count%27stat_name=fire_count(profile%5Eon:profile_id%5Eto:profile_type_id%5Eshow:name.en%5Einject_at:class)&outfit_id=${outfitId}&c:resolve=member_online_status(online_status),member_character(battle_rank)&c:hide=character_id,member_since`);
  if (result.ok) {
    const resJson = await result.json();
    res.send(resJson);
  }
});

router.get('/chars/:id', cors(), async function (req, res, next) { //search by character name
  try {
    const name = req.params.id.toLowerCase();
    const result = await fetch(`http://census.daybreakgames.com/${process.env.API}/get/ps2:v2/character_name/?name.first_lower=^${name}&c:limit=10&c:show=name.first&c:sort=name.first_lower`);
    if (result.ok) {
      const resJson = await result.json();
      res.send(resJson);
    }
  } catch (e) {
    console.log(e);
  }
});

router.get('/outfits/:id', cors(), async function (req, res, next) { //search by outfit name
  const outfitname = req.params.id;
  const result = await fetch(`http://census.daybreakgames.com/${process.env.API}/get/ps2:v2/outfit/?name=^${outfitname}&c:limit=10&c:sort=member_count:-1`);
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
