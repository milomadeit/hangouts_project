const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const groupsRouter = require('./groups.js');
const venuesRouter = require('./venues.js');
const eventsRouter = require('./events.js');
const eventImagesRouter = require('./event-images.js')
const groupImagesRouter = require('./group-images.js')
const { restoreUser, requireAuth } = require('../../utils/auth.js');

router.get('/test', requireAuth, function(req, res) {
    res.json({ message: 'success' });
  });

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.use('/groups', groupsRouter);

router.use('/venues', venuesRouter);

router.use('/events', eventsRouter);

router.use('/event-images', eventImagesRouter);

router.use('/group-images', groupImagesRouter);
// // GET /api/set-token-cookie
// const { setTokenCookie } = require('../../utils/auth.js');
// const { User } = require('../../db/models');
// router.get('/set-token-cookie', async (_req, res) => {
//   const user = await User.findOne({
//     where: {
//       username: 'Demo-lition'
//     }
//   });

//   setTokenCookie(res, user);

//   return res.json({ user: user });
// });


// // GET /api/restore-user
// const { restoreUser } = require('../../utils/auth.js');

// router.use(restoreUser);

// router.get('/restore-user',(req, res) => {
//     return res.json(req.user);
//   });

// // GET /api/require-auth
// const { requireAuth } = require('../../utils/auth.js');
// router.get('/require-auth', requireAuth, (req, res) => {
//     return res.json(req.user);
//   });

// router.use(restoreUser);


router.post('/test', (req, res) => {
    res.json({ requestBody: req.body });
  });

module.exports = router;
