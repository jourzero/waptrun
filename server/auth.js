var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth20").Strategy;
var GitHubStrategy = require("passport-github").Strategy;
const logger = require("./lib/appLogger.js");

module.exports = function () {
    // OAuth 2.0-based strategies require a `verify` function which receives the
    // credential (`accessToken`) for accessing the authenticator API on the user's
    // behalf, along with the user's profile.  The function must invoke `cb`
    // with a user object, which will be set at `req.user` in route handlers after
    // authentication.
    logger.debug(`Adding Passport's Google strategy for client ID ${process.env["GOOGLE_CLIENT_ID"]}`);
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env["GOOGLE_CLIENT_ID"],
                clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
                callbackURL: process.env["GOOGLE_REDIRECT_URI"],
                scope: ["profile"],
                state: true,
            },
            function (accessToken, refreshToken, profile, cb) {
                // In this example, the user's profile is supplied as the user
                // record.  In a production-quality application, the profile should
                // be associated with a user record in the application's database, which
                // allows for account linking and authentication with other identity
                // providers.
                return cb(null, profile);
            }
        )
    );
    logger.debug(`Adding Passport's Github strategy for client ID ${process.env["GITHUB_CLIENT_ID"]}`);
    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env["GITHUB_CLIENT_ID"],
                clientSecret: process.env["GITHUB_CLIENT_SECRET"],
                callbackURL: process.env["GITHUB_REDIRECT_URI"],
            },
            function (accessToken, refreshToken, profile, cb) {
                return cb(null, profile);
            }
        )
    );

    // Configure Passport authenticated session persistence.
    //
    // In order to restore authentication state across HTTP requests, Passport needs
    // to serialize users into and deserialize users out of the session.  In a
    // production-quality application, this would typically be as simple as
    // supplying the user ID when serializing, and querying the user record by ID
    // from the database when deserializing.  However, due to the fact that this
    // example does not have a database, the complete user profile is serialized
    // and deserialized.
    passport.serializeUser(function (user, cb) {
        cb(null, user);
    });

    passport.deserializeUser(function (obj, cb) {
        cb(null, obj);
    });
};
