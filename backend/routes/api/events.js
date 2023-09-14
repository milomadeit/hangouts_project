const express = require('express');
const router = express.Router();
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { User, Group, Image, Member, Venue, Event, Attendance } = require('../../db/models');
const { check } = require('express-validator');
const { Op } = require("sequelize");


// add image to an event
router.post('/:eventId/images', restoreUser, requireAuth, async (req, res) => {
    const { url, preview } = req.body;
    const userId = req.user.id;
    const event = await Event.findByPk(req.params.eventId);

    if (!event) {
        return res.status(404).json({
            message: "Event couldn't be found"
        });
    }

    const authorizedUser = await Attendance.findByPk(userId, {
        where: {
            [Op.or]: [{status: 'attendee'}, {status: 'host'}, {status: 'co-host'}]
        }
    })
    console.log(authorizedUser, 'yoooooooooooooooooooooo')
    if (!authorizedUser) {
        return res.status(403).json(
            {
             "message": "Forbidden"
            })
        }

    const image = await Image.create({url, preview, imageableType: 'EventImages', imageableId: req.params.eventId})
    if (preview === true) {
        await event.update({ previewImage: url})
    }

    const createdImage = {
        id:image.id,
        url:image.url,
        preview:image.preview
    }

    return res.status(200).json(createdImage);
})

// get all events
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
