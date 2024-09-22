# Dynreload

Dynreload is a flexible Node.js module that allows for dynamic loading and reloading of JavaScript modules. It provides a way to load modules at runtime, with options for caching, custom file extensions, and more.

## Features

- Dynamic module loading and reloading
- Customizable base path for module resolution
- Support for multiple file extensions
- Optional caching of loaded modules
- Silent mode to suppress console output

## Installation

First, clone the repository and install the dependencies:
```bash
git clone https://github.com/lokuedo5000/dynreload.git
cd dynreload
npm install
```

## Usage

Here's a basic example of how to use Dynreload:

```javascript
const Dynreload = require('dynreload');

// Create a new instance of Dynreload
const dynreload = new Dynreload();

// Load a module
const myModule = dynreload.preload('./myModule');

// Use the loaded module
myModule.someFunction();
```

## API

### Constructor

```javascript
const dynreload = new Dynreload(options);
```

#### Options

- `basePath` (string, optional): Base path for module resolution. Defaults to the directory of the file calling Dynreload.
- `extensions` (array of strings, optional): File extensions to try when resolving modules. Defaults to `['.js', '.json']`.
- `silent` (boolean, optional): If true, suppresses console output. Defaults to `false`.
- `cache` (boolean, optional): If false, prevents caching of loaded modules. Defaults to `true`.

### Methods

#### preload(modulePath)

Loads or reloads a module from the specified path.

- `modulePath` (string): Path to the module to load.
- Returns: The loaded module.
- Throws: An error if the module cannot be loaded.

## Examples

### Basic Usage

```javascript
const Dynreload = require('dynreload');
const dynreload = new Dynreload();

const myModule = dynreload.preload('./myModule');
myModule.doSomething();
```

### Custom Configuration

```javascript
const Dynreload = require('dynreload');
const dynreload = new Dynreload({
  basePath: '/path/to/modules',
  extensions: ['.js', '.mjs', '.cjs'],
  silent: true,
  cache: false
});

const myModule = dynreload.preload('myCustomModule');
```

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.