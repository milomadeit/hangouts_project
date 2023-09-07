const express = require('express');
const router = express.Router();

const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { User, Group } = require('../../db/models');


const { check } = require('express-validator');


router.get('/', async (req, res) => {
    const allGroups = await Group.findAll()

    return res.json(allGroups);
})


module.exports = router;
