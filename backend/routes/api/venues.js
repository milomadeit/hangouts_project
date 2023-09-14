const express = require('express');
const router = express.Router();
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { User, Group, Image, Member, Venue } = require('../../db/models');
const { check } = require('express-validator');


// edit a venue by id
router.put('/:venueId', restoreUser, requireAuth, async (req, res) => {
    const userId = req.user.id;
    const { address, city, state, lat, lng } = req.body;
    const venue = await Venue.findByPk(req.params.venueId);

    if (!venue) {
        return res.status(404).json({
            message: `Venue couldn't be found`
        })
    }
    const group =  await Group.findByPk(venue.groupId);
    if (!group) {
        return res.status(404).json({
            message: "Venue is not associated with a group"
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

        const updatedVenue = await venue.update({ address, city, state, lat, lng });

        return res.status(200).json(updatedVenue)
})



module.exports = router;
