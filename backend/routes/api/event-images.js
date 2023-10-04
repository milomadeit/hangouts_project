const express = require('express');
const router = express.Router();
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { User, Event, Image, Member, Group } = require('../../db/models');


router.delete('/:imageId', restoreUser, requireAuth, async (req, res) => {
    const imageId = req.params.imageId;
    const imageableType = 'EventImages';
    const userId = req.user.id;
    // image has imageableId which IS the eventId
    const image = await Image.findOne({
        where: {
            id:imageId,
            imageableType:imageableType,
        }
    })

    if (!image) return res.status(404).json({message: `Event Image couldn't be found`})

    const event = await Event.findByPk(image.imageableId)

    if (!event) res.status(404).json({message: `Event couldn't be found`})

    const group = await Group.findByPk(event.groupId);

    // Check if the group exists for the organizer
    // if (!group) {
    //     return res.status(403).json({ message: 'Forbidden' });
    // }

    const isCohost = await Member.findOne({
        where: {
            memberId: userId,
            groupId: group.id,
            status: 'co-host'
        }
    });

    // Check if the user is either the organizer or a co-host
    if (group.organizerId !== userId && !isCohost) {
        return res.status(403).json({ message: 'Forbidden' });
    }


    await image.destroy();


    const checkImage = await Image.findOne({
        where: {
            imageableType:imageableType,
            id:imageId
        }
    })

    if (!checkImage) return res.status(200).json({message: 'Successfully deleted'});

    return res.status(400).json({message: 'Could not confirm deletion'});

})

module.exports = router;
