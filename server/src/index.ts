require('dotenv').config();

import express, {Application} from 'express';
import cookieParser from 'cookie-parser';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './graphql';
import { connectDB } from './database';

const { env } = process;

// Server launcher
const launch = async (app: Application) => {
  const db = await connectDB();

  // app configurarion
  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser(env.SECRET));

  // Apollo server configuration
  const server = new ApolloServer({ 
    typeDefs, 
    resolvers, 
    context: ({ req, res }) => ({ db, req, res }),
  });
  server.applyMiddleware({app, path: '/api'});

  // start listening
  app.listen(process.env.DB_PORT, () => {
    console.log('[app is ready]:', `localhost:${process.env.DB_PORT}`);
  });
}

launch(express());
