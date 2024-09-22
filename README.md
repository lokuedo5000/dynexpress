# Dynexpress

Dynexpress is a dynamic Express.js server management module that allows for easy creation, manipulation, and management of multiple Express.js server instances. It provides features such as dynamic routing, server reset, and automatic port assignment.

## Features

- Create multiple Express.js server instances
- Dynamic routing with support for both array-based and file-based route definitions
- Automatic port assignment and conflict resolution
- Server reset functionality
- Add new routes to existing servers dynamically
- Customizable views and public directories
- Built-in middleware setup for common use cases

## Installation

First, clone the repository and install the dependencies:
```bash
git clone https://github.com/lokuedo5000/dynexpress.git
cd dynexpress
npm install
```

## Usage

Here's a basic example of how to use Dynexpress:

```javascript
const Dynexpress = require('dynexpress');
const dynexpress = new Dynexpress();

// Define your routes
const routes = [
  { method: 'GET', path: '/', handler: (req, res) => res.send('Hello, World!') },
  { method: 'POST', path: '/api/data', handler: (req, res) => res.json({ received: req.body }) }
];

// Create a new server
dynexpress.newServer({
  name: 'myServer',
  routers: routes,
  port: 3000,
  pathViews: "./views",
  pathPublic: "./public"
})
.then(result => {
  if (result === true) {
    console.log('Server started successfully');
  } else {
    console.error('Failed to start server');
  }
})
.catch(error => console.error('Error:', error));
```

## API

### Constructor

```javascript
const dynexpress = new Dynexpress();
```

### Methods

#### newServer(options, urlcomplete = false)

Creates a new Express.js server instance.

- `options` (Object):
  - `name` (string, *required): Unique name for the server instance
  - `routers` (Array or string, *required): Array of route objects or path to a JavaScript file containing routes
  - `port` (number): Preferred port number
  - `pathViews` (string, *required): Custom path for views
  - `pathPublic` (string, *required): Custom path for public files
- `urlcomplete` (boolean or string, optional): If 'url', returns the complete URL of the server

Returns: A Promise that resolves to `true` if the server was created successfully, or the server URL if `urlcomplete` is 'url'.

#### stopServer(serverName)

Stops a running server instance.

- `serverName` (string): Name of the server to stop

Returns: A Promise that resolves to `true` if the server was stopped successfully.

#### resetServer(serverName)

Resets (stops and restarts) an existing server instance.

- `serverName` (string): Name of the server to reset

Returns: A Promise that resolves to the result of creating a new server with the same configuration.

#### addNewRoute(serverName, newRoute)

Adds a new route to an existing server instance.

- `serverName` (string): Name of the server to add the route to
- `newRoute` (Object): Route object with `method`, `path`, and `handler` properties

## Examples

### Creating a server with file-based routes

```javascript
dynexpress.newServer({
  name: 'fileBasedServer',
  routers: './routes/myRoutes.js',
  port: 3000,
  pathViews: "./views",
  pathPublic: "./public"
})
.then(result => console.log('Server created:', result))
.catch(error => console.error('Error:', error));
```

### myRoutes.js
```javascript
const path = require('path');
const routers = [
  {
    method: "get",
    path: "/",
    handler: (req, res) => {
      res.render(path.join(__dirname, "views", "home"));
    },
  }
]
module.exports = routers;
```

### Resetting a server

```javascript
dynexpress.resetServer('myServer')
  .then(result => console.log('Server reset:', result))
  .catch(error => console.error('Error resetting server:', error));
```

### Adding a new route dynamically

```javascript
dynexpress.addNewRoute('myServer', {
  method: 'GET',
  path: '/new-route',
  handler: (req, res) => res.send('This is a new route')
});
```

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.