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

    /* passport.deserializeUser(async (id, done) => {
        let user = await userService.findById(id)
        done(null, user)
    }) */
    
    
    passport.use("github", new GitHubStrategy({
        clientID: "Iv1.29ebf10f4f96abcb",
        clientSecret: "0c7c4d3bf2893f3eeb3371c5d5ff08455817303a" ,
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
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




/*  
clientID: "Iv1.29ebf10f4f96abcb",
clientSecret: "d602a4b9b6e5d81dc0805596ac0c87a435909da6" ,
callbackURL: "http://localhost:8080/api/sessions/githubcallback" 
*/