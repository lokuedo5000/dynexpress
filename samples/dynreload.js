const path = require("path");
const express = require("express");
const net = require("node:net");
const Dynreload = require("../dynreload/src/dynreload.js");
const dynreload = new Dynreload();

class Dynexpress {
  constructor() {
    this.appInstances = new Map(); // Usamos Map en lugar de un objeto simple
    this.viewspath = path.join(__dirname, "bin", "views");
    this.publicpath = path.join(__dirname, "bin", "public");
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
      const availablePort = await this.findAvailablePort(port);
      const app = express();
      this.setupAppMiddleware(app, { pathViews, pathPublic });

      const appRoutes = dynreload.preload(routers, { silent: true });
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