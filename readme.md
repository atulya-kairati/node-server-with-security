# Node server with security, authentication and authorization

### Generating a self signed ssl cert

```sh
 openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365
```

### Google Oauth2 

#### Set up

1. Go to google console, create a new project and it.
2. Go to the credentials section -> Create Credentials -> OAuth Client ID.
3. Before creating OAuth credentials you have to configure the consent page so you'll be redirected there.
4. Now you will land on *Configure Consent Screen*. Set that up.
   1. User type -> External
5. Setup scopes.
6. Add test users **if you have selected any sensitive scopes** so that app can be tested.
7. Publish app.
8. Now again repeat step 2.
9. Select App type and name it.
10. Set up *Authorized JS Origin* and *Authorized redirect URIs*.
   1. **Authorized JS Origin** -> URI for the frontend app. `(eg. https://localhost:3000)`
   2. **Authorized redirect URIs** -> The endpoint in our server where google will redirect the user after authentication. `(eg. https://localhost:3000/auth/google/callback)`
11. Click on create. Save down ID and secret in `.env`.

#### Passport.js

- Go to [Passportjs.org](passportjs.org).
- View all strategy -> Search *google oauth2*.
- Install `npm install passport-google-oauth20`.


***

### Setting up cookie session

- Install cookie-session package.
- Import it.
```js
const cookieSession = require('cookie-session')
```

- Use it before intializing passport middleware.
```js
app.use(cookieSession({ // use this before passport, since passport will be using the session
    name: "session",
    maxAge: 7 * 24 * 60 * 60 * 1000, // a week till user has to login again
    keys: [process.env.COOKIE_KEY_1, process.env.COOKIE_KEY_2] // multiple keys to help with rotation in case one of the keys is compromised.
}))
```
- Here:
  - `name` -> name of the session.
  - `maxAge` -> after which the session expires.
  - `keys` -> used to sign the cookies so they can't be tampered with.

#### Hooking up to Passport.js

- `cookie-session` not working with passport 0.6. Use 0.5.
- Turn on sessions in `passport.authenticate(...)`.
```js
app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/failure',
        successRedirect: '/',
        session: true, // to use session
    }),
    (req, res) => {
        console.log("Google callback");
    }
)
```

- Define serialization and deserialization strategies using
```js
// save the session to the cookie
passport.serializeUser((user, done) => {
    // user --> cookie session

    // we are directly populating the cookie here: not recommended
    done(null, user) // null means no error
    // done(error, user) if there was any error
})


// read the session from the cookie
passport.deserializeUser((obj, done) => {
    // cookie session --> user

    done(null, obj)
})
```

- Use passport session middleware (after intializing passport).
```js
app.use(passport.session()) // this is to use sessions
```
