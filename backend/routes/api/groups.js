const express = require('express');
const router = express.Router();

const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { User, Group, Image, Member, Venue } = require('../../db/models');
const { check } = require('express-validator');

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

// create an image for the group.
router.post('/:groupId/images', restoreUser, requireAuth, async (req, res) => {
    const { url, preview } = req.body;
    const group = await Group.findByPk(req.params.groupId);

    if (!group) {
        return res.status(404).json({
            message: "Group couldn't be found"
        });
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

    res.status(200).json(createdImage);
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

    return res.json({
        Groups: allGroups
    })

})


// get details of a group by id
router.get('/:groupId', async (req, res) => {
    // should include array of GroupImages
    // should include Organizer info (name + id)
    // should include array of Venues
    const group = await Group.findByPk(req.params.groupId, {
        include: [
        {
            model: Image,
            where: {imageableType: 'GroupImages'},
            attributes: ['id', 'url', 'preview']
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
    ]});

    if (!group) {
        return res.status(404).json({
          message: "Group couldn't be found",
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
    return res.json(group)
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

    return res.json(allGroups);
})


module.exports = router;
