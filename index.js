import express from "express"
import session from "express-session"
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"

const app = express()
const PORT = process.env.PORT || 3_000

// Session middleware
app.use( session( {
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false, // true bo'lsa HTTPS kerak
		maxAge: 24 * 60 * 60 * 1_000 // 24 soat
	}
} ) )

app.use( passport.initialize() )
app.use( passport.session() )

// Google OAuth Strategy
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: `${ process.env.BASE_URL }/auth/google/callback`,
		},
		async ( accessToken, refreshToken, profile, done ) => {

			console.log( "User profile:", profile )

			// Bu yerda foydalanuvchini bazaga saqlashingiz mumkin
			const user = {
				id: profile.id,
				name: profile.displayName,
				email: profile.emails[ 0 ].value,
				avatar: profile.photos[ 0 ].value,
				accessToken
			}

			console.log( "User authenticated:", user )

			return done( null, user )
		}
	)
)

//

app.listen( PORT, () => {

	console.log( `Server http://localhost:${ PORT } da ishlamoqda` )
} )
