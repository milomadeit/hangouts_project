const express = require('express');
const router = express.Router();
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { User, Group, Image, Member, Venue, Event, Attendance } = require('../../db/models');
const { check } = require('express-validator');

// validate group body data
const groupValidation = (name, about, type, private, city, state) => {
    const errObj = {};
    // console.log(type)
    if (!name || name.length > 60) errObj.name = 'Name must be 60 characters or less';
    if (!about || about.length < 50 ) errObj.about = 'About must be 50 characters or more';

    if (!type || type !== "Online" && type !== 'In person') errObj.type = "Type must be 'Online' or 'In person'";
    if (!private || typeof private !== 'boolean') errObj.private = 'Private must be a boolean';
    if (!city || city === null || city.length < 1) errObj.city = 'City is required';
    if (!state || state === null || state.length < 1) errObj.state = 'State is required';

    if (errObj.name || errObj.about || errObj.type || errObj.private || errObj.city || errObj.state) {
        const allErrors ={
            message: 'Bad Request',
            errors: errObj,
        }
        return allErrors
    }
    return true
}


// create an event by group id
router.post('/:groupId/events', restoreUser, requireAuth, async (req, res) => {
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
    const userId = req.user.id;
    const group = await Group.findByPk(req.params.groupId);
    const venue = await Venue.findByPk(venueId);

    if (!group) {
        return res.status(404).json({
            message: "Group couldn't be found"
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
    // console.log(currentDate.toLocaleString(), 'YOOOOOOOOOOOOOOOOOOOOOOOO')
    if (!startDate || compareDate < currentDate) eventErr.startDate = 'Start date must be in the future'
    if (!endDate || endDate < startDate) eventErr.endDate = 'End date is less than start date'

    if (Object.keys(eventErr).length > 0) {
        return res.status(400).json({
            message: 'Bad Request',
            errors: eventErr,
        })
    }
    const groupId = group.id
    const event = await Event.create({groupId, venueId, name, type, capacity, price, description, startDate, endDate});
    const eventId = event.id
    const status = 'host'
    const setHost = await Attendance.create({userId, eventId, status});
    const createdEvent = {
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

    return res.status(200).json({event:createdEvent, host: setHost})

})


// get all events by group id
router.get('/:groupId/events', async (req, res) => {
    const group = await Group.findByPk(req.params.groupId);

    if (!group) {
        return res.status(404).json({
            message: "Group couldn't be found"
        });
    }
    const groupEvents = await Event.findAll({
        where: {
            groupId: group.id
        },
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
        Events: groupEvents
    })

})

// create a venue by group id
router.post('/:groupId/venues', restoreUser, requireAuth, async (req, res) => {
    const { address, city, state, lat, lng } = req.body;
    const userId = req.user.id;
    const group = await Group.findByPk(req.params.groupId);

    if (!group) {
        return res.status(404).json({
            message: "Group couldn't be found"
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


    const venueErr = {};
    if (!address|| address === null || address.length < 1) venueErr.address = 'Address is required';
    if (!city || city === null || city.length < 1) venueErr.city = 'City is required';
    if (!state || state === null || state.length < 1) venueErr.state = 'State is required';
    if (!lat || lat === null || typeof lat !== 'number' || lat > 90 || lat < -90 ) venueErr.lat = 'Latitude is not valid';
    if (!lng || lng === null || typeof lng !== 'number' || lng > 180 || lng < -180 ) venueErr.lng = 'Longitude is not valid';

    if (venueErr.address || venueErr.city || venueErr.state || venueErr.lat || venueErr.lng) {
        return res.status(400).json({
            message: 'Bad Request',
            errors: venueErr,
        })
    }
    const groupId = group.id
    const newVenue = await Venue.create({ groupId, address, city, state, lat, lng})

    const createdVenue = {
        id: newVenue.id,
        groupId: newVenue.groupId,
        address: newVenue.address,
        city: newVenue.city,
        state: newVenue.state,
        lat: newVenue.lat,
        lng: newVenue.lng
    }

    res.status(200).json(createdVenue);
})


// get all venues by groupId
router.get('/:groupId/venues', restoreUser, requireAuth, async (req,res) => {
    const userId = req.user.id;
    const group = await Group.findByPk(req.params.groupId);

    if (!group) {
        return res.status(404).json({
            message: "Group couldn't be found"
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

    const groupVenues = await Venue.findAll({
        where: {
            groupId:group.id,
        },
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    })

    if (groupVenues.length < 1) {
        return res.json({
            message: 'Group has no venues'
        })
    }

    return res.status(200).json({
        Venues: groupVenues})
})

// create an image for the group.
router.post('/:groupId/images', restoreUser, requireAuth, async (req, res) => {
    const { url, preview } = req.body;
    const userId = req.user.id;
    const group = await Group.findByPk(req.params.groupId);

    if (!group) {
        return res.status(404).json({
            message: "Group couldn't be found"
        });
    }

    if (userId !== group.organizerId) {
        return res.status(403).json(
            {
             "message": "Forbidden"
            })
        }


    const image = await Image.create({ url, preview, imageableType: 'GroupImages', imageableId: req.params.groupId})

    if (preview === true) {
        await group.update({ previewImage: url })
    }

    const createdImage = {
        id:image.id,
        url:image.url,
        preview:image.preview
    }

    return res.status(200).json(createdImage);
})

// get all groups ORGANIZED OR JOINED by current user,
router.get('/current', restoreUser, requireAuth, async (req, res) => {
    console.log(req.user.id)

    const organizedGroups = await Group.findAll({
        where: {
            organizerId:req.user.id
        },
      })
    const joinedGroups = await Member.findAll({
        where: {
            memberId: req.user.id
        }
    })

    const allGroups = [...organizedGroups, ...joinedGroups]

    return res.status(200).json({
        Groups: allGroups
    })

})


// get details of a group by id
router.get('/:groupId', async (req, res) => {
    // should include array of GroupImages
    // should include Organizer info (name + id)
    // should include array of Venues
    console.log(req.params.groupId)
    const group = await Group.findByPk(req.params.groupId
        , {
        include: [
        {
            model: Image,
            where: {imageableType: 'GroupImages'},
            attributes: ['id', 'url', 'preview'],
            required: false,
        },
        {
            model: User,
            as: 'Organizer',
            attributes: ['id', 'firstName', 'lastName']
        },
        {
            model: Venue,
            attributes: {
                exclude: ['createdAt', 'updatedAt']}
        }
    ]}
    );

    if (!group) {
        return res.status(404).json({
          message: "Group couldn't be found!!!!!",
        });
      }


    return res.status(200).json(group)
})

// update a group by id
router.put('/:groupId', restoreUser,requireAuth, async (req, res) => {
    const {name, about, type, private, city, state} = req.body
    const userId = req.user.id;
    const group = await Group.findByPk(req.params.groupId)
    if (!group) {
        return res.status(404).json({
          message: "Group couldn't be found",
        });
      }

    if (userId !== group.organizerId) {
        return res.status(403).json(
            {
             "message": "Forbidden"
            })
        }

    if (groupValidation(name, about, type, private, city, state) === true) {
        //CREATE NEW GROUP WITH CURRENT USER ID
        // const organizerId = req.user.id;
        await group.update({name, about, type, private, city, state});
        return res.json(group)
        } else {
            res.status(400).json(groupValidation(name, about, type, private, city, state));
        }
})


// create a group - require authentication
router.post('/', restoreUser, requireAuth, async (req, res) => {
    const {name, about, type, private, city, state} = req.body

    if (groupValidation(name, about, type, private, city, state) === true) {
    //CREATE NEW GROUP WITH CURRENT USER ID
    const organizerId = req.user.id;
    const group = await Group.create({organizerId, name, about, type, private, city, state});
    // add organizerId and memberId to members table.
    await Member.create({
        groupId: group.id,
        userId: organizerId,
        status: 'member',
        // You might want to specify additional member attributes here
      });

    return res.status(200).json(group)
    } else {
        res.status(400).json(groupValidation(name, about, type, private, city, state));
    }
})

// delete group by id
router.delete('/:groupId', restoreUser,requireAuth, async (req, res) => {
    const group = await Group.findByPk(req.params.groupId)
    const userId = req.user.id;

    if (!group) {
        return res.status(404).json({
          message: "Group couldn't be found",
        });
      }

    if (userId !== group.organizerId) {
        return res.status(403).json(
            {
             "message": "Forbidden"
            })
        }

    const images = await Image.findAll({
        where: {
            imageableId:group.id
        }
        });
    images.forEach(img => {
        Image.destroy({where: {imageableId: group.id}})

    });

    Group.destroy({where : {id: group.id}})

    const deletedGroup = await Group.findByPk(req.params.groupId)
    if(!deletedGroup) {
        return res.status(200).json({
            "message": "Successfully deleted"
        })
    }
})



// get all groups
router.get('/', async (req, res) => {
    const allGroups = await Group.findAll()

    return res.status(200).json(allGroups);
})


module.exports = router;
