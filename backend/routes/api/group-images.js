const express = require('express');
const router = express.Router();
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { User, Group, Image, Member } = require('../../db/models');

router.delete('/:imageId', restoreUser, requireAuth, async (req, res) => {
    const imageId = req.params.imageId;
    const imageableType = 'GroupImages';
    const userId = req.user.id;
    const group = await Group.findOne({
        where: {
            organizerId: userId
        }
    })

    if (!group) res.status(404).json({message: 'Group does not exist'});

    const isCohost = await Member.findAll({
        where: {
            memberId: userId,
            groupId: group.id,
            status: 'co-host'
        }
    });

    if (group.organizerId !== userId || !isCohost ) return res.status(403).json({message: 'Forbidden'})

    const image = await Image.findOne({
        where: {
            imageableType:imageableType,
            id:imageId
        }
    })

    if (!image) return res.status(404).json({message: `Event Image couldn't be found`})

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
