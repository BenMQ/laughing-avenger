var config = {};

config.env = 'development';
config.db = {};
config.db.host = 'localhost';
config.db.user = 'root';
config.db.password = 'root';
config.db.database = 'laughing_avenger';
config.AUTH_COOKIE_NAME = 'express.sid';
config.SECRET_KEY = 'secret';
config.FACEBOOK_APP_ID = "492242497533605";
config.FACEBOOK_APP_SECRET = "c7fdfdb90ef722119f78eb0476e64de2";
config.FBAUTH_CALLBACK_URL = "http://dev.fragen.cmq.me:4321/auth/facebook/callback";
config.FBGRAPH_REDIRECT_URL = 'http://dev.fragen.cmq.me:4321/invite'
config.FB_EXTENDED_PERMISSION = ['publish_actions']

// Port that express listens to
config.port = 4321;

module.exports = config;