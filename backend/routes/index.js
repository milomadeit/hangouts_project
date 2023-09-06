const express = require('express');
const router = express.Router();

// router.get('/hello/world', function(req, res) {
//   res.cookie('XSRF-TOKEN', req.csrfToken());
//   res.send('Hello World!');
// });


// Add a XSRF-TOKEN cookie
router.get("/api/csrf/restore", (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie("XSRF-TOKEN", csrfToken);
  res.status(200).json({
    'XSRF-Token': csrfToken
  });
});

const apiRouter = require('./api');

//?? All the URLs of the routes in the
//?? api router will be prefixed with /api.
router.use('/api', apiRouter);

module.exports = router;
