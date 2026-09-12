const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDirs = ['./uploads', './uploads/news', './uploads/gallery', './uploads/profile', './uploads/assignments', './uploads/lessons'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const makeStorage = (folder, prefix) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, `uploads/${folder}/`),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${prefix}-${unique}${path.extname(file.originalname)}`);
  }
});

const imageFileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const uploadNews    = multer({ storage: makeStorage('news',    'news'),    fileFilter: imageFileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadGallery = multer({ storage: makeStorage('gallery', 'gallery'), fileFilter: imageFileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadProfile = multer({ storage: makeStorage('profile', 'profile'), fileFilter: imageFileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
const uploadAssignment = multer({
  storage: makeStorage('assignments', 'assignment'),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: imageFileFilter
});
const uploadLesson = multer({
  storage: makeStorage('lessons', 'lesson'),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: imageFileFilter
});

module.exports = { uploadNews, uploadGallery, uploadProfile, uploadAssignment, uploadLesson };