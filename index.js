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
		secure: false,
		maxAge: 24 * 60 * 60 * 1_000 // 24 soat
	},
} ) )

// Passport middleware
app.use( passport.initialize() )
app.use( passport.session() )

// Google OAuth Strategy
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: `${ process.env.BASE_URL }/auth/google/callback`
		},
		async ( accessToken, refreshToken, profile, done ) => {

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

// Serialize/Deserialize user
passport.serializeUser( ( user, done ) => done( null, user ) )
passport.deserializeUser( ( user, done ) => done( null, user ) )

// Middleware - foydalanuvchi kirganmi tekshirish
const requireAuth = ( req, res, next ) => {

	if ( req.isAuthenticated() ) {

		return next()
	}

	res.redirect( "/" )
}

// Routes
app.get( "/", ( req, res ) => {

	if ( req.isAuthenticated() ) {

		res.send(`
			<h1>Xush kelibsiz, ${ req.user.name }!</h1>
			<img src="${ req.user.avatar }" alt="Avatar" style="width: 100px border-radius: 50%">
			<p>Email: ${ req.user.email }</p>
			<a href="/dashboard">Dashboard</a> | 
			<a href="/logout">Chiqish</a>
		`)
	}
	else {

		res.send(`
			<h1>Google OAuth bilan kirish</h1>
			<a href="/auth/google" style="
				display: inline-block
				padding: 12px 24px
				background: #4285f4
				color: white
				text-decoration: none
				border-radius: 4px
				font-family: Arial, sans-serif
			">Google orqali kirish</a>
		`)
	}
} )

// Google auth routes
app.get( "/auth/google",
	passport.authenticate( "google", {
		scope: [ "profile", "email" ],
	} )
)

app.get( "/auth/google/callback",
	passport.authenticate( "google", { failureRedirect: "/" } ),
	( req, res ) => {

		// Muvaffaqiyatli kirish
		res.redirect( "/" )
	}
)

// Himoyalangan route
app.get( "/dashboard", requireAuth, ( req, res ) => {

	res.send(`
		<h1>Dashboard</h1>
		<p>Xush kelibsiz, ${ req.user.name }!</p>
		<img src="${ req.user.avatar }" alt="Avatar" style="width: 80px border-radius: 50%">
		<div style="margin-top: 20px">
			<h3>Ma"lumotlaringiz:</h3>
			<p><strong>ID:</strong> ${ req.user.id }</p>
			<p><strong>Email:</strong> ${ req.user.email }</p>
			<p><strong>Vaqt:</strong> ${ new Date().toLocaleString() }</p>
		</div>
		<div style="margin-top: 20px">
			<a href="/">Bosh sahifa</a> | 
			<a href="/profile">Profil</a> | 
			<a href="/settings">Sozlamalar</a> | 
			<a href="/logout">Chiqish</a>
		</div>
	`)
} )

// Yana bir himoyalangan route
app.get( "/profile", requireAuth, ( req, res ) => {

	res.send(`
		<h1>Profil sahifasi</h1>
		<p>Bu sahifa faqat autentifikatsiya qilingan foydalanuvchilar uchun</p>
		<p>Sizning ID: ${ req.user.id }</p>
		<a href="/dashboard">Dashboard ga qaytish</a>
	`)
} )

// Sozlamalar sahifasi
app.get( "/settings", requireAuth, ( req, res ) => {

	res.send( `
		<h1>Sozlamalar</h1>
		<p>Bu sahifa ham himoyalangan</p>
		<p>Foydalanuvchi: ${ req.user.name }</p>
		<a href="/dashboard">Dashboard ga qaytish</a>
	` )
} )

// API endpoint - foydalanuvchi ma"lumotlari
app.get( "/api/user", requireAuth, ( req, res ) => {

	res.json( {
		user: {
			id: req.user.id,
			name: req.user.name,
			email: req.user.email,
			avatar: req.user.avatar,
		}
	} )
} )

// API endpoint - himoyalangan ma"lumotlar
app.get( "/api/protected", requireAuth, ( req, res ) => {

	res.json( {
		message: "Bu himoyalangan API endpoint",
		timestamp: new Date().toISOString(),
		userId: req.user.id,
	} )
} )

// Logout
app.get( "/logout", ( req, res, next ) => {

	req.logout( err => {

		if ( err ) {

			return next( err )
		}

		req.session.destroy()
		res.redirect( "/" )
	} )
} )

app.listen( PORT, () => {

	console.log( `Server http://localhost:${ PORT } da ishlamoqda` )
} )
