const passport = require("passport");
const GitHubStrategy = require("passport-github2");
const local =require("passport-local");
const userService = require("../models/users.model.js")
const {userModel} = require("../models/users.model.js")
const utils = require("../utils.js");


const localStrategy = local.Strategy

const initializePassport = () => {
    

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser(async (email, done) => {
        try {
          const user = await userModel.findOne({ email });
          done(null, user);
        } catch (error) {
          return done(error);
        }
    });
 
    passport.use("github", new GitHubStrategy({
        clientID: "",
        clientSecret: "" ,
        callbackURL: ""
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile)
            let user = await userModel.findOne({ email: profile._json.email })
            if (!user) {
                let newUser = {
                    nombre: profile._json.name, 
                    /* last_name: "", */
                    email: profile._json.email,
                    isGithubAuth: true
                    /* password: "" */
                }
                
                /* console.log(profile._json.name); */
                let result = await userModel.create(newUser)
                done(null, result)
                
            }
            else {
                done(null, user)
            }
        } catch (error) {
            return done(error)
        }
        
    }))
    
}

module.exports = initializePassport;



