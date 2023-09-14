const express = require('express');
const router = express.Router();
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { User, Group, Image, Member, Venue, Event } = require('../../db/models');
const { check } = require('express-validator');



router.get('/', async (req, res) => {
    const allEvents = await Event.findAll({
        attributes: {
            exclude: [ 'description', 'capacity', 'price', 'createdAt', 'updatedAt']

        },
        include: [
        {
            model: Group,
            attributes: ['id', 'name', 'city', 'state']
        },
        {
            model: Venue,
            attributes: ['id', 'city', 'state']
        }
    ]
    })

    return res.status(200).json({
        Events: allEvents});

})

module.exports = router;
