const express = require("express");
const bcrypt = require("bcryptjs");

const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { User } = require("../../db/models");

const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const router = express.Router();

// middleware to check keys of a new user signup
const validateSignup = [
  check("email")
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage("Invalid email"),
  check("username")
    .exists({ checkFalsy: true })
    // .isLength({ min: 4 })
    .withMessage("Username is required."),
  check("username").not().isEmail().withMessage("Username cannot be an email"),
  check("password")
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage("Password must be 6 characters or more"),
  check("firstName")
    .exists({ checkFalsy: true })
    .isLength({ min: 1 })
    .withMessage("First name is required"),
  check("lastName")
    .exists({ checkFalsy: true })
    .isLength({ min: 1 })
    .withMessage("Last name is required"),
  check("username")
    .custom(async (value) => {
      const usernameExists = await User.findOne({
        where: {
          username: value,
        },
      });
      if (usernameExists) {
        throw new Error("Username must be unique");
      }
    })
    .withMessage("Username must be unique"),
  handleValidationErrors,
];

// Sign up
router.post("/", validateSignup, async (req, res) => {
  const { email, firstName, lastName, password, username } = req.body;
  const hashedPassword = bcrypt.hashSync(password);

  const userEmailExists = await User.findOne({
    where: {
      email: email,
    },
  });

  const userUsernameExists = await User.findOne({
    where: {
      username: username,
    },
  });

  if (userEmailExists) {
    return res.status(500).json({
      message: "User already exists",
      errors: {
        email: "User with that email already exists",
      },
    });
  }

  if (userUsernameExists) {
    return res.status(500).json({
      message: "User already exists",
      errors: {
        username: "User with that username already exists",
      },
    });
  }

  const user = await User.create({
    email,
    firstName,
    lastName,
    username,
    hashedPassword,
  });

  const safeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
  };

  await setTokenCookie(res, safeUser);

  return res.json({
    user: safeUser,
  });
});

//? =================================================================================================

// // Sign up
// router.post('/', validateSignup, async (req, res) => {
//       const { email, firstName, lastName, password, username } = req.body;
//       const hashedPassword = bcrypt.hashSync(password);
//       const user = await User.create({ email, firstName, lastName, username, hashedPassword });

//       const safeUser = {
//         id: user.id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         username: user.username,
//       };

//       await setTokenCookie(res, safeUser);

//       return res.json({
//         user: safeUser
//       });
//     }
//   );

module.exports = router;
