const express = require("express");
const router = express.Router();
const {
  setTokenCookie,
  requireAuth,
  restoreUser,
} = require("../../utils/auth");
const {
  User,
  Group,
  Image,
  Member,
  Venue,
  Event,
  Attendance,
} = require("../../db/models");
const { check } = require("express-validator");
const { Op } = require("sequelize");
const moment = require("moment");

// get all attendees by eventId
router.get("/:eventId/attendees", restoreUser, async (req, res) => {
  const eventId = req.params.eventId;
  const event = await Event.findByPk(eventId);
  // check if event exists
  if (!event) {
    return res.status(404).json({
      message: `Event couldn't be found`,
    });
  }
  // if no current user is logged in
  if (!req.user) {
    // get all attendees for event available to public
    const publicAttendees = await User.findAll({
      attributes: ["id", "firstName", "lastName"],
      include: [
        {
          model: Attendance,
          attributes: ["status"],
          as: "Attendance",
          where: {
            [Op.or]: [
              { status: "attending" },
              { status: "waitlist", status: "host" },
            ],
          },
        },
      ],
    });

    if (!publicAttendees || publicAttendees.length === 0)
      return res.json({ message: "No attendees found for this event" });
    const attendees = {
      Attendees: publicAttendees.map((attendee) => ({
        id: attendee.id,
        firstName: attendee.firstName,
        lastName: attendee.lastName,
        Attendance: { status: attendee.Attendance[0].status },
      })),
    };
    return res.status(200).json(attendees);
  } else {
    // get user id
    const userId = req.user.id;

    const isCohost = await Member.findOne({
      where: {
        memberId: userId,
        groupId: event.groupId,
        status: "co-host",
      },
    });

    const group = await Group.findByPk(event.groupId);

    // check if user is organizer or co-host
    if (userId === group.organizerId && !isCohost) {
      // all attendees including those with 'pending' status
      const allAttendees = await User.findAll({
        attributes: ["id", "firstName", "lastName"],
        include: [
          {
            model: Attendance,
            attributes: ["status"],
            as: "Attendance",
            where: { eventId: eventId },
          },
        ],
      });

      if (!allAttendees || allAttendees.length === 0)
        return res.json({ message: "No Attendees found for this event" });
      const attendees = {
        Attendees: allAttendees.map((attendee) => ({
          id: attendee.id,
          firstName: attendee.firstName,
          lastName: attendee.lastName,
          Attendance: { status: attendee.Attendance[0].status },
        })),
      };
      return res.status(200).json(attendees);
    } else {
      // current user is logged in BUT NOT the organize or co-host
      // get all attendees for event available to public
      const publicAttendees = await User.findAll({
        attributes: ["id", "firstName", "lastName"],
        include: [
          {
            model: Attendance,
            attributes: ["status"],
            as: "Attendance",
            where: {
              [Op.or]: [{ status: "attending" }, { status: "waitlist" }],
            },
          },
        ],
      });

      if (!publicAttendees || publicAttendees.length === 0)
        return res.json({ message: "No attendees found for this event" });
      const attendees = {
        Attendees: publicAttendees.map((attendee) => ({
          id: attendee.id,
          firstName: attendee.firstName,
          lastName: attendee.lastName,
          Attendance: { status: attendee.Attendance[0].status },
        })),
      };
      return res.status(200).json(attendees);
    }
  }
});

// request attendance to event
router.post(
  "/:eventId/attendance",
  restoreUser,
  requireAuth,
  async (req, res) => {
    const userId = req.user.id;
    const eventId = req.params.eventId;

    const event = await Event.findByPk(eventId);
    // if event can't be found or doesn't exist
    if (!event)
      return res.status(404).json({ message: `Event couldn't be found` });

    const isMember = await Member.findOne({
      where: {
        memberId: userId,
        groupId: event.groupId,
      },
    });

    // check if the user is a member
    if (
      isMember &&
      (isMember.status === "member" || isMember.status === "co-host")
    ) {
      const isAttendee = await Attendance.findOne({
        where: {
          userId: userId,
          eventId: eventId,
        },
      });

      // check if there is no attendance record
      if (!isAttendee) {
        const status = "pending";
        const attendee = await Attendance.create({ userId, eventId, status });
        const createdAttendance = {
          userId: attendee.userId,
          status: attendee.status,
        };
        return res.status(200).json(createdAttendance);
      }

      // if status is pending
      if (isAttendee.status === "pending") {
        return res.status(400).json({
          message: "Attendance has already been requested",
        });
      }

      // if status is pending
      if (isAttendee.status === "host") {
        return res.status(400).json({
          message: "You are the host of this event",
        });
      }

      // if status is attending
      if (isAttendee.status === "attending") {
        return res.status(400).json({
          message: "User is already an attendee of the event",
        });
      }
    } else {
      return res.status(400).json({
        message: "Only members can attend the event",
      });
    }
  }
);

// change status of attendance by eventId
router.put(
  "/:eventId/attendance",
  restoreUser,
  requireAuth,
  async (req, res) => {
    const { userId, status } = req.body;
    const currentUserId = req.user.id;
    const eventId = req.params.eventId;

    // query and check if event exists
    const event = await Event.findByPk(eventId);
    if (!event)
      return res.status(404).json({ message: `Event couldn't be found` });

    //! MUST BE A COHOST OR ORGANIZER TO CHANGE ATTENDANCE STATUS
    // query for current user status
    // as organizer  or cohost of group
    // 1st query the group
    const group = await Group.findByPk(event.groupId);
    // 2nd query for cohost
    const isCohost = await Member.findOne({
      where: {
        memberId: currentUserId,
        groupId: group.id,
        status: "co-host",
      },
    });
    // NOW....
    if (currentUserId !== group.organizerId && !isCohost) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    //! END AUTHORIZATION CHECK

    // query for attendance record
    const attendance = await Attendance.findOne({
      where: {
        userId: userId,
        eventId: eventId,
      },
    });
    // check if attendance record exists
    if (!attendance)
      return res.status(404).json({
        message: "Attendance between the user and the event does not exist",
      });

    // if attempting to update status to pending
    if (status === "pending")
      return res
        .status(400)
        .json({ message: "Cannot change an attendance status to pending" });

    await attendance.update({
      status: status,
    });

    // Increment attendance
    event.numAttending += 1;

    // save in database
    await event.save();

    const updatedAttendance = {
      userId: attendance.userId,
      status: attendance.status,
    };

    return res.status(200).json(updatedAttendance);
  }
);

router.delete(
  "/:eventId/attendance",
  restoreUser,
  requireAuth,
  async (req, res) => {
    const { userId } = req.body;
    const eventId = req.params.eventId;

    // check if event exists
    const event = await Event.findByPk(eventId);
    if (!event)
      return res.status(404).json({ message: `Event couldn't be found` });

    // Check if the user has provided a valid userId
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const group = await Group.findByPk(event.groupId);

    const attendance = await Attendance.findOne({
      where: {
        userId: userId,
        eventId: eventId,
      },
    });
    //check if attendance exists
    if (!attendance)
      return res
        .status(404)
        .json({ message: "Attendance does not exist for this User" });

    if (req.user.id === group.organizerId || req.user.id === parseInt(userId)) {
      await attendance.destroy();

      const checkAttendance = await Attendance.findOne({
        where: {
          userId: userId,
          eventId: eventId,
        },
      });

      if (!checkAttendance) {
        // Increment attendance
        event.numAttending -= 1;

        // save in database
        await event.save();

        return res
          .status(200)
          .json({ message: "Successfully deleted attendance from event" });
      } else {
        return res.status(400).json({ message: "Could not confirm deletion" });
      }
    }
    return res
      .status(403)
      .json({ message: "Only the User or organizer may delete an Attendance" });
  }
);

// add image to an event
router.post("/:eventId/images", restoreUser, requireAuth, async (req, res) => {
  const { url, preview } = req.body;
  const userId = req.user.id;
  const event = await Event.findByPk(req.params.eventId);

  const errObj = {};
  if (!url) errObj.url = "Please provide a URL";
  if (typeof preview !== "boolean")
    errObj.preview = "Please provide true or false for preview";
  if (Object.keys(errObj).length) {
    return res.status(400).json({
      message: "Bad Request",
      errors: errObj,
    });
  }

  if (!event) {
    return res.status(404).json({
      message: "Event couldn't be found",
    });
  }

  const authorizedUser = await Attendance.findOne({
    where: {
      userId: userId,
      eventId: event.id,
      [Op.or]: [
        { status: "attending" },
        { status: "host" },
        { status: "co-host" },
      ],
    },
  });

  if (!authorizedUser) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  // Find all images for the event
  const eventImages = await Image.findAll({
    where: {
      imageableType: "EventImages",
      imageableId: req.params.eventId,
    },
  });

  if (event.previewImage && preview === true) {
    // Iterate through the images and update their preview status
    for (const image of eventImages) {
      image.preview = false;
      await image.save(); // Save the changes to each image
    }
  }

  if (event.previewImage === null && preview === true) {
    await event.update({ previewImage: url });
  }

  // create new image
  const image = await Image.create({
    url,
    preview,
    imageableType: "EventImages",
    imageableId: req.params.eventId,
  });

  const createdImage = {
    id: image.id,
    url: image.url,
    preview: image.preview,
  };

  return res.status(200).json(createdImage);
});

// get event by eventId
router.get("/:eventId", async (req, res) => {
  const event = await Event.findByPk(req.params.eventId, {
    attributes: { exclude: ["previewImage", "createdAt", "updatedAt"] },
    include: [
      {
        model: Group,
        attributes: ["id", "name", "private", "city", "state"],
      },
      {
        model: Venue,
        attributes: ["id", "address", "city", "state", "lat", "lng"],
      },
      {
        model: Image,
        as: "EventImages",
        where: { imageableType: "EventImages" },
        attributes: ["id", "url", "preview"],
        required: false,
      },
    ],
  });

  if (!event) {
    res.status(404).json({
      message: `Event couldn't be found`,
    });
  }

  return res.status(200).json(event);
});

// edit an event by its id
router.put("/:eventId", restoreUser, requireAuth, async (req, res) => {
  const {
    venueId,
    name,
    type,
    capacity,
    price,
    description,
    startDate,
    endDate,
  } = req.body;
  const userId = req.user.id;
  const event = await Event.findByPk(req.params.eventId);
  const venue = await Venue.findByPk(venueId);

  if (!event) {
    return res.status(404).json({
      message: `Event couldn't be found`,
    });
  }

  const group = await Group.findByPk(event.groupId);

  if (!group) {
    return res.status(404).json({
      message: `Event couldn't be found`,
    });
  }

  const isCohost = await Member.findOne({
    where: {
      memberId: userId,
      groupId: group.id,
      status: "co-host",
    },
  });

  if (userId !== group.organizerId && !isCohost) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const eventErr = {};
  if (!venueId || !venue) eventErr.venueId = "Venue does not exist";
  if (!name || name.length < 5)
    eventErr.name = "Name must be at least 5 characters";
  if (type !== "Online" && type !== "In person")
    eventErr.type = "Type must be Online or In person";
  if (!capacity || typeof capacity !== "number")
    eventErr.capacity = "Capacity must be an integer";
  if (!price || typeof price !== "number" || price < 0)
    eventErr.price = "Price is invalid";
  if (!description || description.length < 1)
    eventErr.description = "Description is required";
  const currentDate = new Date();
  const compareDate = new Date(startDate);
  if (!startDate || compareDate < currentDate)
    eventErr.startDate = "Start date must be in the future";
  if (!endDate || endDate < startDate)
    eventErr.endDate = "End date is less than start date";

  if (Object.keys(eventErr).length > 0) {
    return res.status(400).json({
      message: "Bad Request",
      errors: eventErr,
    });
  }

  // the venue and event must belong to the same group
  if (venue.groupId !== event.groupId) {
    return res.status(404).json({
      message: `Venue couldn't be found`,
    });
  }

  const groupId = group.id;
  await event.update({
    venueId,
    name,
    type,
    capacity,
    price,
    description,
    startDate,
    endDate,
  });

  updatedEvent = {
    id: event.id,
    groupId: event.groupId,
    venueId: event.venueId,
    name: event.name,
    type: event.type,
    capacity: event.capacity,
    price: event.price,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
  };

  return res.status(200).json(updatedEvent); //
});

// delete an event by id
router.delete("/:eventId", restoreUser, requireAuth, async (req, res) => {
  const event = await Event.findByPk(req.params.eventId);
  const userId = req.user.id;

  if (!event)
    return res.status(404).json({ message: `Event couldn't be found` });

  const group = await Group.findByPk(event.groupId);
  const isCohost = await Member.findOne({
    where: {
      memberId: userId,
      groupId: event.groupId,
      status: "co-host",
    },
  });

  //! check if user is the organizer or co-host of group
  if (userId !== group.organizerId && !isCohost) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  await event.destroy();

  const checkEvent = await Event.findByPk(req.params.eventId);

  if (!checkEvent)
    return res.status(200).json({ message: "Successfully deleted" });

  return res.status(400).json({ message: "Could not confirm event deletion" });
});

// get all events
router.get("/", async (req, res) => {
  let { page, size, name, type, startDate } = req.query;

  // Set default values for page and size if not provided
  page = page ? Number(page) : 1;
  size = size ? Number(size) : 20;

  const errObj = {};

  page = Number(page);
  size = Number(size);

  if (page && page < 1) errObj.page = "Page must be greater than or equal to 1";
  if (size && size < 1) errObj.size = "Size must be greater than or equal to 1";
  if (name && (typeof name !== "string" || !isNaN(Number(name))))
    errObj.name = "Name must be a string";
  if (type) {
    type = type.replace(/"/g, ""); // Remove quotes from the type string
    if (type !== "Online" && type !== "In person") {
      errObj.type = `Type must be 'Online' or 'In person'`;
    }
  }
  if (startDate) {
    startDate = startDate.replace(/"/g, ""); // Remove quotes from the type string
    const isValidDate = moment(startDate, "YYYY-MM-DD HH:mm:ss").isValid();
    if (!isValidDate) errObj.startDate = "Start date must be a valid datetime";
  }

  if (Object.keys(errObj).length) {
    return res.status(400).json({
      message: "Bad Request",
      errors: errObj,
    });
  }

  if (page > 10) page = 10;
  if (size > 20) size = 20;

  const pagination = {};
  pagination.limit = size;
  pagination.offset = size * (page - 1);

  const whereStatement = {};

  if (name) {
    name = name.replace(/"/g, "");
    whereStatement.name = { [Op.like]: `%${name}%` }; // Case-insensitive search
  }

  if (type) {
    whereStatement.type = type;
  }

  if (startDate) {
    whereStatement.startDate = { [Op.gte]: new Date(startDate) };
  }

  try {
    const allEvents = await Event.findAll({
      attributes: {
        exclude: ["capacity", "price", "createdAt", "updatedAt"],
      },
      include: [
        {
          model: Group,
          attributes: ["id", "name", "city", "state"],
        },
        {
          model: Venue,
          attributes: ["id", "city", "state"],
        },
      ],
      where: whereStatement,
      ...pagination,
    });

    return res.status(200).json({
      Events: allEvents,
    });
  } catch {
    return res.status(200).json({
      message: "No events",
    });
  }
});

module.exports = router;
