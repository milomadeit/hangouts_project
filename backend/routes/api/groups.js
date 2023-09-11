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


//add an image to a group


//update group
//create a group - require authentication
router.post('/', restoreUser, requireAuth, async (req, res) => {
    const {name, about, type, private, city, state} = req.body
    const errObj = {};
    // console.log(type)
    if (!name || name.length > 60) errObj.name = 'Name must be 60 characters or less';
    if (!about || about.length < 50 ) errObj.about = 'About must be 50 characters or more';

    if (!type || type !== "Online" && type !== 'In person') errObj.type = "Type must be 'Online' or 'In person'";
    if (!private || typeof private !== 'boolean') errObj.private = 'Private must be a boolean';
    if (!city) errObj.city = 'City is required';
    if (!state) errObj.state = 'State is required';

    if (errObj.name || errObj.about || errObj.type || errObj.private || errObj.city | errObj.state) {
        return res.status(400).json({
            message: 'Bad Request',
            errors: errObj,
        })
    }

    //CREATE NEW GROUP WITH CURRENT USER ID
    const organizerId = req.user.id;
    const group = await Group.create({organizerId, name, about, type, private, city, state});

    return res.json(group)
})

//get all groups
router.get('/', async (req, res) => {
    const allGroups = await Group.findAll()

    return res.json(allGroups);
})


module.exports = router;
