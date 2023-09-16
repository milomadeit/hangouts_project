const express = require('express');
const router = express.Router();
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { User, Group, Image, Member, Venue, Event, Attendance } = require('../../db/models');
const { check } = require('express-validator');
const { Op } = require("sequelize");

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

// get all members by groupId
router.get('/:groupId/members', restoreUser, async (req, res) => {
    const groupId = req.params.groupId;
    const group = await Group.findByPk(groupId)
    // check if group exists
    if (!group) {
        return res.status(404).json({
            message: `Group couldn't be found`
        })
    }

    // if no current user is logged in
    if (!req.user) {
        // get all members for group available to public
        const publicMembers = await User.findAll({
            attributes: ['id', 'firstName', 'lastName'],
            include: [
                {
                    model: Member,
                    attributes: ['status'],
                    as: 'Membership',
                    where: {
                        [Op.or]: [ { status: 'co-host' }, { status: 'member' }
                      ]}
                }
            ]
        })

        if (!publicMembers || publicMembers.length === 0) return res.json({message: 'No members found for this group'})

        const members = { Members: publicMembers.map(member => ({
            id: member.id,
            firstName: member.firstName,
            lastName: member.lastName,
            Membership: { status: member.Membership[0].status }
          })
        )};
        return res.status(200).json(members)
    } else {
        // get user id
        const userId = req.user.id;

        const isCohost = await Member.findAll({
            where: {
                memberId: userId,
                groupId: groupId,
                status: 'co-host'
            }
        });

        // check if user is organizer or co-host
        if (userId === group.organizerId || isCohost.status === 'co-host' ) {
            // all members in group including those with 'pending' status
            const allMembers = await User.findAll({
                attributes: ['id', 'firstName', 'lastName'],
                include: [
                    {
                        model: Member,
                        attributes: ['status'],
                        as: 'Membership',
                        where: { groupId: groupId }
                    }
                ]
            })

            if (!allMembers || allMembers.length === 0) return res.json({message: 'No members found for this group'});
                // Modify the structure of the "Membership" field to be an obj NOT an array smh
                const members = { Members: allMembers.map(member => ({
                id: member.id,
                firstName: member.firstName,
                lastName: member.lastName,
                Membership: { status: member.Membership[0].status }
            }))};
                return res.status(200).json(members);
        } else {
            // current user is logged in BUT NOT the organizer or co-host
            // get all members for group available to public
            const publicMembers = await User.findAll({
                attributes: ['id', 'firstName', 'lastName'],
                include: [
                    {
                        model: Member,
                        attributes: ['status'],
                        as: 'Membership',
                        where: {
                            [Op.or]: [ { status: 'co-host' }, { status: 'member' }
                        ]}
                    }
                ]
            })

            if (!publicMembers || publicMembers.length === 0) return res.json({message: 'No members found for this group'})

            const members = { Members: publicMembers.map(member => ({
                id: member.id,
                firstName: member.firstName,
                lastName: member.lastName,
                Membership: { status: member.Membership[0].status }
            }))};
            return res.status(200).json(members)
        }
    }
})


//request membership for a group by groups id
router.post('/:groupId/membership', restoreUser, requireAuth, async (req, res) => {
    const groupId = req.params.groupId;
    const memberId = req.user.id
    const status = 'pending'
    const group = await Group.findByPk(groupId);
    const isMember = await Member.findAll({
        where: {
            memberId:memberId,
            groupId:groupId,
        }
    })

    // Group couldn't be found
    if (!group) {
        return res.status(404).json({
            message: (`Group couldn't be found`)
        })
    }


    // Membership has already been requested
    if (isMember.length > 0 && isMember[0].status === 'pending') {
        return res.status(400).json({
            message: 'Membership has already been requested'
        })
    }

    // User is already a member of the group
    if (isMember.length > 0 && (isMember[0].status === 'member' || isMember.status === 'co-host' || memberId === group.organizerId)) {
        return res.status(400).json({
            message: 'User is already a member of the group'
        })
    }

    // create new member record
    const member = await Member.create({memberId, groupId, status});

    const newMember = {
        memberId:member.memberId,
        status:member.status
    }

    return res.status(200).json(newMember)
})

// change status of a membership by groupId
router.put('/:groupId/membership', restoreUser, requireAuth, async (req, res) => {
    const { memberId, status } = req.body;
    const userId = req.user.id;
    const group = await Group.findByPk(req.params.groupId);
    const member = await Member.findAll({
        where:{
        memberId:memberId,
        groupId:group.id,
    }})
    // query for cohost
    const isCohost = await Member.findAll({
        where: {
            memberId: userId,
            groupId: group.id,
            status: 'co-host'
        }
    })

    // query to see if user exists by memberId
    const isUser = await User.findByPk(memberId);

    //! MUST BE A COHOST OR ORGANIZER TO SET MEMBER STATUS
    if (userId !== group.organizerId || !isCohost) {
        return res.status(403).json({
             "message": "Forbidden"
        })
    }

    //! MUST BE ORGANIZER TO SET CO HOST STATUS
    if(status === 'co-host' && userId !== group.organizerId ) {
        return res.status(403).json({
            "message": "Forbidden"
        })
    }

    // status cannot be pending
    if(status === 'pending') {
        return res.status(400).json({
            message: 'Validations Error',
            errors: {
                status : 'Cannot change a membership status to pending'
            }
        })
    }

    // if user does not exist
    if(!isUser) {
        return res.status(400).json({
            message: 'Validations Error',
            errors: {
                memberId : `User couldn't be found`
            }
        })
    }

    // if group does not exist
    if (!group) {
        return res.status(404).json({
            message: `Group couldn't be found`
        })
    }
    // if the member is not part of group
    if (!member || member.length === 0) {
        return res.status(404).json({
            message: 'Membership between the user and the group does not exist'
        })
    }

    if(status !== 'member' && status !== 'co-host') {
        return res.status(400).json({
            message: `Please choose a valid status of 'member' or 'co-host'`
        })
    }

    await member[0].update({
        status:status
    })

    const updatedMember = {
        memberId:member[0].memberId,
        status:member[0].status
    }

    return res.status(200).json(updatedMember)


});

// delete member
router.delete('/:groupId/membership', restoreUser, requireAuth, async (req, res) => {
    const userId = req.user.id;
    const { memberId } = req.body;
    const group = await Group.findByPk(req.params.groupId);
    // check if group exists
    if (!group) {
        return res.status(404).json({
            message: `Group couldn't be found`
        })
    }
    const member = await Member.findAll({
        where:{
        memberId:memberId,
        groupId:group.id,
        [Op.or]: [{status: 'pending'}, {status: 'member'}, {status: 'co-host'}]
    }})

    // is the member a user
    const isUser = await User.findByPk(memberId);
    if(!isUser) {
        return res.status(400).json({
            message: 'Validations Error',
            errors: {
                memberId : `User couldn't be found`
            }
        })
    }

    // check if member exists
    if (!member || member.length === 0) {
        return res.status(404).json({
            message: 'Membership does not exist for this User'
        })
    }

    // delete membership
    const deletedMembership = await member[0].destroy()

    // query to see if member does not exist
    const checkMember = await Member.findAll({
        where:{
        memberId:memberId,
        groupId:group.id,
        [Op.or]: [{status: 'pending'}, {status: 'member'}, {status: 'co-host'}]
    }})

    if (!checkMember[0]) {
        return res.status(200).json({
            message: 'Successfully deleted membership from group'
        })
    }
    return res.status(400).json({
        message: 'Could not confirm deletion'
    })
})


// create an event by group id
router.post('/:groupId/events', restoreUser, requireAuth, async (req, res) => {
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
    const userId = req.user.id;
    const group = await Group.findByPk(req.params.groupId);
    const venue = await Venue.findByPk(venueId);

    // check if group exists
    if (!group) {
        return res.status(404).json({
            message: "Group couldn't be found"
        });
    }

    // query to see if user is cohost
    const isCohost = await Member.findAll({
        where: {
            memberId: userId,
            groupId: group.id,
            status: 'co-host'
        }
    })

    // check if user is organizer or cohost of group
    if (userId !== group.organizerId || !isCohost) {
        return res.status(403).json(
            {
             "message": "Forbidden"
            })
    }

    // body validation for a new event
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
    const groupId = group.id
    const numAttending = 1
    const event = await Event.create({groupId, venueId, name, type, capacity, price, description, numAttending, startDate, endDate});
    const eventId = event.id
    const status = 'host'
    const setHost = await Attendance.create({userId, eventId, status});

    // const attendees = await event.getAttendances(eventId)

    // console.log(attendees, '========================')

    // console.log(attendees, 'yoooooooooooooooo')
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

    return res.status(200).json(createdEvent) //
})


// get all events by group id
router.get('/:groupId/events', async (req, res) => {
    const group = await Group.findByPk(req.params.groupId);

    // check if group exists
    if (!group) {
        return res.status(404).json({
            message: "Group couldn't be found"
        });
    }

    // query to find all events for a group
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

    // check if group exists
    if (!group) {
        return res.status(404).json({
            message: "Group couldn't be found"
        });
    }
    // query to see if user is a co-host
    const isCohost = await Member.findAll({
        where: {
            memberId: userId,
            groupId: group.id,
            status: 'co-host'
        }
    })

    // check if user if organizer or cohost of group
    if (userId !== group.organizerId || !isCohost) {
        return res.status(403).json(
            {
             "message": "Forbidden"
            })
        }

    // body validation for a venue
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

    // create new venue
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


    // check if group exists
    if (!group) {
        return res.status(404).json({
            message: "Group couldn't be found"
        });
    }

    // query to see is user is a co-host
    const isCohost = await Member.findAll({
        where: {
            memberId: userId,
            groupId: group.id,
            status: 'co-host'
        }
    })

    //! check if user is the organizer or co-host of group
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

    // user must be the group organizer
    if (userId !== group.organizerId) {
        return res.status(403).json(
            {
             "message": "Forbidden"
            })
        }

    // create image
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
    const group = await Group.findByPk(req.params.groupId, {
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
    const {name, about, type, private, city, state} = req.body;
    const userId = req.user.id;
    const group = await Group.findByPk(req.params.groupId);
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
            return res.status(400).json(groupValidation(name, about, type, private, city, state));
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
    const newMember = await Member.create({
        groupId: group.id,
        memberId: organizerId,
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
