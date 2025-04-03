
import express from 'express';
import mongoose from 'mongoose';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import teacherRoutes from './routes/teacherRoutes';
import studentRoutes from './routes/studentRoutes';
import bookRoutes from './routes/bookRoutes';
import { initRedis, closeRedis } from './services/redisClient';

// Load environment variables
dotenv.config();

// MongoDB connection URL
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/school_management';

// Initialize Express app
const app = express();
const httpServer = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/books', bookRoutes);

// Serve static frontend
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Initialize Apollo Server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  context: ({ req }) => ({ req })
});

// Start the server
async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');
    
    // Initialize Redis
    await initRedis();
    
    // Start Apollo Server
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, path: '/graphql' });
    
    // Start Express server
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}`);
      console.log(`🚀 GraphQL endpoint: http://localhost:${PORT}${apolloServer.graphqlPath}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Handle server shutdown gracefully
process.on('SIGINT', async () => {
  await apolloServer.stop();
  await closeRedis();
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await apolloServer.stop();
  await closeRedis();
  await mongoose.connection.close();
  process.exit(0);
});

startServer();

export default app;
