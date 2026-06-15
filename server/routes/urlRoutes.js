const router = require('express').Router();
const { createUrl, getUrls, updateUrl, deleteUrl } = require('../controllers/urlController');
const { createUrlValidator, updateUrlValidator } = require('../validators/urlValidator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect); // all URL routes require authentication

router.route('/')
  .post(createUrlValidator, validate, createUrl)
  .get(getUrls);

router.route('/:id')
  .put(updateUrlValidator, validate, updateUrl)
  .delete(deleteUrl);

module.exports = router;
