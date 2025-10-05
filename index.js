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

//

app.listen( PORT, () => {

	console.log( `Server http://localhost:${ PORT } da ishlamoqda` )
} )
