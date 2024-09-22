const path = require("path");
const express = require("express");
const net = require("node:net");
const Dynreload = require("../dist/dynreload");
const dynreload = new Dynreload();

class Dynexpress {
  constructor() {
    this.appInstances = new Map(); // Usamos Map en lugar de un objeto simple
    this.viewspath = path.join(__dirname, "bin", "views");
    this.publicpath = path.join(__dirname, "bin", "public");
  }

  isRoutersArrayOrFile(routers) {
    // Verifica si routers es un array
    if (Array.isArray(routers)) {
      return "array";
    }

    // Si no es un array, verifica si es una ruta de un archivo .js
    if (typeof routers === "string" && path.extname(routers) === ".js") {
      // Verifica si el archivo .js existe
      if (fs.existsSync(routers)) {
        return "file";
      } else {
        throw new Error(`El archivo ${routers} no existe.`);
      }
    }

    // Si no cumple ninguna de las condiciones, retorna un error
    throw new Error("routers debe ser un array de rutas o una ruta válida de un archivo .js");
  }

  setupAppMiddleware(app, { pathViews, pathPublic }) {
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json({ limit: "100mb" }));
    app.set("view engine", "ejs");
    app.set("views", pathViews || this.viewspath);
    app.use(express.static(pathPublic || this.publicpath));
  }

  setupAppRoutes(app, appRoutes) {
    appRoutes.forEach(({ method, path, handler }) => {
      app[method.toLowerCase()](path, handler);
    });
  }

  async isPortAvailable(port) {
    return new Promise((resolve) => {
      const tester = net.createServer()
        .once("error", () => resolve(false))
        .once("listening", () => {
          tester.close();
          resolve(true);
        })
        .listen(port);
    });
  }

  async findAvailablePort(startPort, maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
      if (await this.isPortAvailable(startPort + i)) {
        return startPort + i;
      }
    }
    throw new Error(`No available port found after ${maxAttempts} attempts`);
  }

  async newServer({ name, routers, port, pathViews = false, pathPublic = false }, urlcomplete = false) {
    if (this.appInstances.has(name)) {
      return true;
    }

    try {

      // Verifica si routers es un array o un archivo de JS
      const routersType = this.isRoutersArrayOrFile(routers);

      let appRoutes;

      if (routersType === "array") {
        // Si es un array, usa Dynreload para precargar las rutas
        appRoutes = routers;
      } else if (routersType === "file") {
        // Si es un archivo .js, requiere ese archivo como un módulo que exporta las rutas
        appRoutes = dynreload.preload(routers, { silent: true });
      }

      const availablePort = await this.findAvailablePort(port);
      const app = express();
      this.setupAppMiddleware(app, { pathViews, pathPublic });

      this.setupAppRoutes(app, appRoutes);

      const server = await this.startServerAsync(app, availablePort);

      this.appInstances.set(name, {
        app,
        server,
        routers,
        pathViews,
        pathPublic,
        port: availablePort,
      });

      return urlcomplete === "url" ? `http://localhost:${availablePort}/` : true;
    } catch (error) {
      console.error(`Error creating server ${name}:`, error);
      return false;
    }
  }

  async startServerAsync(app, port) {
    return new Promise((resolve, reject) => {
      const server = app.listen(port);
      server.once("listening", () => resolve(server));
      server.once("error", reject);
    });
  }

  async stopServer(serverName) {
    const instance = this.appInstances.get(serverName);
    if (!instance) {
      throw new Error(`App ${serverName} not found.`);
    }

    return new Promise((resolve, reject) => {
      instance.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          this.appInstances.delete(serverName);
          resolve(true);
        }
      });
    });
  }

  async resetServer(serverName) {
    const instance = this.appInstances.get(serverName);
    if (!instance) {
      throw new Error(`Server ${serverName} not found.`);
    }

    try {
      await this.stopServer(serverName);
      const result = await this.newServer({
        name: serverName,
        ...instance,
      });
      if (!result) {
        throw new Error(`Failed to create new server for ${serverName}`);
      }
      return result;
    } catch (error) {
      console.error(`Error resetting server ${serverName}:`, error);
      throw error;
    }
  }

  // Método para añadir una nueva ruta a un servidor existente
  addNewRoute(serverName, newRoute) {
    const instance = this.appInstances.get(serverName);
    if (!instance) {
      throw new Error(`Server ${serverName} not found.`);
    }

    const { method, path, handler } = newRoute;
    instance.app[method.toLowerCase()](path, handler);
    console.log(`New route added to ${serverName}: ${method.toUpperCase()} ${path}`);
  }
}

module.exports = Dynexpress;