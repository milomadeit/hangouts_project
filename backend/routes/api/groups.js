const express = require('express');
const router = express.Router();

const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { User, Group } = require('../../db/models');


const { check } = require('express-validator');

//get all groups ORGANIZED OR JOINED by current user,
router.get('/current', async (req, res) => {
    // const user = req.user;
    return res.json('yooooo');
})
//get details of a group by id
router.get('/:groupId', async (req, res) => {
    // should include array of GroupImages
    // should include Organizer info (name + id)
    // should include array of Venues
    const group = await Group.findByPk(req.params.groupId)
    res.json(group)
})

// get all groups
router.get('/', async (req, res) => {
    const allGroups = await Group.findAll()

    return res.json(allGroups);
})


module.exports = router;