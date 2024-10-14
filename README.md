# Advanced Dynexpress Module Usage Examples

Dynexpress is a dynamic Express.js server management module that allows for easy creation, manipulation, and management of multiple Express.js server instances. It provides features such as dynamic routing, server reset, and automatic port assignment.

## Table of Contents
- [Advanced Dynexpress Module Usage Examples](#advanced-dynexpress-module-usage-examples)
  - [Table of Contents](#table-of-contents)
  - [Basic Server Setup](#basic-server-setup)
  - [Multiple Servers with Different Configurations](#multiple-servers-with-different-configurations)
  - [Dynamic Route Addition](#dynamic-route-addition)
  - [Server Reset and Port Management](#server-reset-and-port-management)
  - [Using External Router Files](#using-external-router-files)
  - [Custom Middleware and Error Handling](#custom-middleware-and-error-handling)
  - [WebSocket Integration](#websocket-integration)
  - [API Versioning](#api-versioning)
  - [Database Integration](#database-integration)
  - [Authentication and Authorization](#authentication-and-authorization)

## Basic Server Setup
```javascript
const Dynexpress = require('./Dynexpress');
const dynexpress = new Dynexpress();

const routes = [
  { method: 'GET', path: '/', handler: (req, res) => res.send('Hello World!') },
  { method: 'POST', path: '/api/data', handler: (req, res) => res.json(req.body) }
];

(async () => {
  const serverUrl = await dynexpress.newServer({
    name: 'mainServer',
    routers: routes,
    port: 3000
  }, 'url');

  console.log(`Server started at ${serverUrl}`);
})();
```

## Multiple Servers with Different Configurations
```javascript
const Dynexpress = require('./Dynexpress');
const dynexpress = new Dynexpress();
const path = require('path');

const apiRoutes = [
  { method: 'GET', path: '/api/users', handler: (req, res) => res.json([{id: 1, name: 'John'}]) },
];

const webRoutes = [
  { method: 'GET', path: '/', handler: (req, res) => res.render('index') },
];

(async () => {
  const apiServer = await dynexpress.newServer({
    name: 'apiServer',
    routers: apiRoutes,
    port: 3000
  });

  const webServer = await dynexpress.newServer({
    name: 'webServer',
    routers: webRoutes,
    port: 3001,
    pathViews: path.join(__dirname, 'views'),
    pathPublic: path.join(__dirname, 'public')
  });

  console.log('API Server started on port 3000');
  console.log('Web Server started on port 3001');
})();
```

## Dynamic Route Addition
```javascript
const Dynexpress = require('./Dynexpress');
const dynexpress = new Dynexpress();

const initialRoutes = [
  { method: 'GET', path: '/', handler: (req, res) => res.send('Initial Route') },
];

(async () => {
  await dynexpress.newServer({
    name: 'dynamicServer',
    routers: initialRoutes,
    port: 3000
  });

  // Add a new route after server initialization
  setTimeout(() => {
    dynexpress.addNewRoute('dynamicServer', {
      method: 'GET',
      path: '/new-route',
      handler: (req, res) => res.send('New Dynamic Route')
    });
    console.log('New route added');
  }, 5000);
})();
```

## Server Reset and Port Management
```javascript
const Dynexpress = require('./Dynexpress');
const dynexpress = new Dynexpress();

const routes = [
  { method: 'GET', path: '/', handler: (req, res) => res.send('Hello World!') },
];

(async () => {
  await dynexpress.newServer({
    name: 'resetServer',
    routers: routes,
    port: 3000
  });

  console.log('Server started on port 3000');

  // Reset the server after 10 seconds
  setTimeout(async () => {
    await dynexpress.resetServer('resetServer');
    console.log('Server reset complete');
  }, 10000);
})();
```

## Using External Router Files
```javascript
// routerFile.js
module.exports = [
  { method: 'GET', path: '/external', handler: (req, res) => res.send('External Route') },
];

// main.js
const Dynexpress = require('./Dynexpress');
const dynexpress = new Dynexpress();
const path = require('path');

(async () => {
  await dynexpress.newServer({
    name: 'externalRouterServer',
    routers: path.join(__dirname, 'routerFile.js'),
    port: 3000
  });

  console.log('Server with external router file started on port 3000');
})();
```

## Custom Middleware and Error Handling
```javascript
const Dynexpress = require('./Dynexpress');
const dynexpress = new Dynexpress();

const customMiddleware = (req, res, next) => {
  console.log(`Request received at ${new Date()}`);
  next();
};

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
};

const routes = [
  { 
    method: 'GET', 
    path: '/', 
    handler: [
      customMiddleware,
      (req, res) => res.send('Hello World!')
    ]
  },
  { 
    method: 'GET', 
    path: '/error', 
    handler: (req, res, next) => next(new Error('Test Error')) 
  }
];

(async () => {
  const server = await dynexpress.newServer({
    name: 'middlewareServer',
    routers: routes,
    port: 3000
  });

  // Add error handling middleware
  server.app.use(errorHandler);

  console.log('Server with custom middleware and error handling started on port 3000');
})();
```

## WebSocket Integration
```javascript
const Dynexpress = require('./Dynexpress');
const dynexpress = new Dynexpress();
const WebSocket = require('ws');

const routes = [
  { method: 'GET', path: '/', handler: (req, res) => res.send('WebSocket Server') },
];

(async () => {
  const serverInstance = await dynexpress.newServer({
    name: 'wsServer',
    routers: routes,
    port: 3000
  });

  const wss = new WebSocket.Server({ server: serverInstance.server });

  wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('message', (message) => {
      console.log('Received:', message);
      ws.send(`Echo: ${message}`);
    });
  });

  console.log('WebSocket server started on port 3000');
})();
```

## API Versioning
```javascript
const Dynexpress = require('./Dynexpress');
const dynexpress = new Dynexpress();

const v1Routes = [
  { method: 'GET', path: '/api/v1/users', handler: (req, res) => res.json({ version: 'v1', users: [] }) },
];

const v2Routes = [
  { method: 'GET', path: '/api/v2/users', handler: (req, res) => res.json({ version: 'v2', users: [] }) },
];

(async () => {
  await dynexpress.newServer({
    name: 'versionedAPI',
    routers: [...v1Routes, ...v2Routes],
    port: 3000
  });

  console.log('Versioned API server started on port 3000');
})();
```

## Database Integration
```javascript
const Dynexpress = require('./Dynexpress');
const dynexpress = new Dynexpress();
const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

// Define a simple schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String
});

const User = mongoose.model('User', UserSchema);

const routes = [
  { 
    method: 'POST', 
    path: '/users', 
    handler: async (req, res) => {
      try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
  },
  { 
    method: 'GET', 
    path: '/users', 
    handler: async (req, res) => {
      try {
        const users = await User.find();
        res.json(users);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  }
];

(async () => {
  await dynexpress.newServer({
    name: 'dbServer',
    routers: routes,
    port: 3000
  });

  console.log('Database integrated server started on port 3000');
})();
```

## Authentication and Authorization
```javascript
const Dynexpress = require('./Dynexpress');
const dynexpress = new Dynexpress();
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'your-secret-key';

const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const routes = [
  { 
    method: 'POST', 
    path: '/login', 
    handler: (req, res) => {
      // Mock user authentication
      const user = { id: 1, username: 'testuser' };
      const token = generateToken(user);
      res.json({ token });
    }
  },
  { 
    method: 'GET', 
    path: '/protected', 
    handler: [
      authenticateToken,
      (req, res) => res.json({ message: 'This is a protected route', user: req.user })
    ]
  }
];

(async () => {
  await dynexpress.newServer({
    name: 'authServer',
    routers: routes,
    port: 3000
  });

  console.log('Authentication server started on port 3000');
})();
```

These examples demonstrate various advanced use cases of the Dynexpress module, including multiple server setups, dynamic route addition, WebSocket integration, API versioning, database integration, and authentication. Each example can be further customized and expanded based on specific project requirements.
