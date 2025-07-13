import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as AppleStrategy } from 'passport-apple';
import { OIDCStrategy as MicrosoftStrategy } from 'passport-azure-ad';
import fs from 'fs';
import path from 'path';
import User from '../models/User';
import logger from '../config/logger';
import dotenv from 'dotenv';

dotenv.config();

// Google 
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: '/api/auth/google/callback',
}, async (_accessToken, _refreshToken, profile, done) => {
  const email = profile.emails?.[0]?.value;
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: profile.displayName,
      email,
      googleId: profile.id,
      role: 'user',
    });
  }

  return done(null, user);
}));

// Apple
passport.use(new AppleStrategy({
  clientID: process.env.APPLE_CLIENT_ID!,
  teamID: process.env.APPLE_TEAM_ID!,
  keyID: process.env.APPLE_KEY_ID!,
  callbackURL: '/api/auth/apple/callback',
  privateKey: fs.readFileSync(path.join(__dirname, '../../', process.env.APPLE_PRIVATE_KEY_PATH!), 'utf8'),
  passReqToCallback: true,
}, async (_req, accessToken, _refreshToken, idToken, profile, done) => {
  const email = idToken.email;
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: profile?.name?.firstName || 'Apple User',
      email,
      appleId: idToken.sub,
      role: 'user',
    });
  }

  return done(null, user);
}));

// Microsoft
passport.use(new MicrosoftStrategy({
  identityMetadata: `https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration`,
  clientID: process.env.MICROSOFT_CLIENT_ID!,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
  redirectUrl: 'http://localhost:5001/api/auth/microsoft/callback',
  responseType: 'code',
  responseMode: 'form_post',
  scope: ['profile', 'email'],
}, async (_iss, _sub, profile, accessToken, refreshToken, done) => {
  const email = profile._json.email;
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: profile.displayName || 'Microsoft User',
      email,
      microsoftId: profile.oid,
      role: 'user',
    });
  }

  return done(null, user);
}));

// Session support
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id).select('-password');
  done(null, user);
});
