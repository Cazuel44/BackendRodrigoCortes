const passport = require("passport");
const GitHubStrategy = require("passport-github2");
const local =require("passport-local");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const userService = require("../dao/models/users.model.js")
const {userModel} = require("../dao/models/users.model.js")
const {PRIVATE_KEY} = require("../utils.js");



const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
      token = req.cookies["token"];
    }
    return token;
};

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

    
    // aqui se verifica la validez del token y se obtiene el usuario del payload si el token es válido
    passport.use("jwt", new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: PRIVATE_KEY, 
    }, (payload, done) => { 
        
        // se busca el usuario en la base de datos por email (lleva el nombre email id )   
        userModel.findOne({ email: payload.sub }, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));
    

    passport.use("current", new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([
          cookieExtractor,
        ]),
        secretOrKey: PRIVATE_KEY,
      }, (payload, done) => {
        userModel.findOne({ email: payload.sub }, (err, user) => {
          if (err) {
            return done(err, false);
          }
          if (user) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
    }));
}

module.exports = initializePassport;



