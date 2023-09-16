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

    const authorizedUser = await Attendance.findAll({
        where: {
            userId:userId,
            eventId:event.id,
            [Op.or]: [{status: 'attendee'}, {status: 'host'}, {status: 'co-host'}]
        }
    })

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

// get event by eventId
router.get('/:eventId', async (req, res) => {
    const event = await Event.findByPk(req.params.eventId, {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [
            {
                model: Group,
                attributes: [ 'id', 'name', 'private', 'city', 'state' ]
            },
            {
                model: Venue,
                attributes: [ 'id', 'address', 'city', 'state', 'lat', 'lng' ]
            },
            {
                model: Image,
                as: 'EventImages',
                where: {imageableType: 'EventImages'},
                attributes: [ 'id', 'url', 'preview'],
                required: false
            }
        ]
    });

    if (!event) {
        res.status(404).json({
            message: `Event couldn't be found`
        })
    }

    return res.status(200).json(event);

})

// edit an event by its id
router.put('/:eventId', restoreUser, requireAuth, async (req, res) => {
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
    const userId = req.user.id;
    const event = await Event.findByPk(req.params.eventId);
    const venue = await Venue.findByPk(venueId);
    const group = await Group.findByPk(event.groupId)

    if (!event) {
        return res.status(404).json({
          message: `Event couldn't be found`,
        });
    }

    const isCohost = await Member.findAll({
        where: {
            memberId: userId,
            groupId: group.id,
            status: 'co-host'
        }
    })

    if (userId !== group.organizerId || !isCohost) {
        return res.status(403).json(
            {
             "message": "Forbidden"
            })
        }

        const eventErr = {}
        if (!venue) eventErr.venueId = 'Venue does not exist'
        if (!name || name.length < 5) eventErr.name = 'Name must be at least 5 characters'
        if (type !== 'Online' && type !== 'In person') eventErr.type = 'Type must be Online or In person'
        if (!capacity || typeof capacity !== 'number') eventErr.capacity = 'Capacity must be an integer'
        if (!price || typeof price !== 'number' || price < 0) eventErr.price = 'Price is invalid'
        if (!description || description.length < 1) eventErr.description = 'Description is required'
        const currentDate = new Date();
        const compareDate = new Date(startDate)
        if (!startDate || compareDate < currentDate) eventErr.startDate = 'Start date must be in the future'
        if (!endDate || endDate < startDate) eventErr.endDate = 'End date is less than start date'

        if (Object.keys(eventErr).length > 0) {
            return res.status(400).json({
                message: 'Bad Request',
                errors: eventErr,
            })
        }

        if (venue.groupId !== event.groupId) {
            return res.status(404).json({
                message: `Venue couldn't be found`
            })
        }

        const groupId = group.id
        await event.update({venueId, name, type, capacity, price, description, startDate, endDate});

        updatedEvent = {
            id:event.id,
            groupId:event.groupId,
            venueId:event.venueId,
            name:event.name,
            type:event.type,
            capacity:event.capacity,
            price:event.price,
            description:event.description,
            startDate:event.startDate,
            endDate:event.endDate
        }

        return res.status(200).json(updatedEvent) //
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
