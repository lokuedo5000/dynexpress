const fs = require("fs");
const path = require("path");

class Dynreload {
  /**
   * Crea una instancia de Dynreload.
   * @param {Object} [options={}] - Opciones adicionales para el Dynreload.
   * @param {string} [options.basePath=false] - Ruta base para la resolución de módulos.
   * @param {Array<string>} [options.extensions=['.js', '.json']] - Extensiones de archivo a intentar.
   * @param {boolean} [options.silent=false] - Si es true, suprime los mensajes de consola.
   * @param {boolean} [options.cache=true] - Si es false, evita almacenar en caché los módulos cargados.
   */
  constructor(options = {}) {
    this.basePath = options.basePath || false;
    this.extensions = options.extensions || [".js", ".json"];
    this.silent = options.silent || false;
    this.cache = options.cache !== undefined ? options.cache : true; // Por defecto, usar caché
  }

  /**
   * Preload o recarga un módulo según su ruta.
   * @param {string} modulePath - Ruta del módulo a cargar.
   * @returns {*} - El módulo cargado.
   * @throws {Error} - Si no se puede cargar el módulo.
   */
  preload(modulePath) {
    // Obtiene la ruta del archivo que invoca esta función
    const invokingFilePath = this.getCallerFile();
    if (!invokingFilePath) {
      throw new Error('No se pudo determinar el archivo que invoca dynreload');
    }

    if (!this.basePath) {
      this.basePath = path.dirname(invokingFilePath);
    }

    const resolvedPath = this.resolvePath(modulePath);

    if (!resolvedPath) {
      throw new Error(`Módulo no encontrado: ${modulePath}`);
    }

    // Verifica la caché
    if (!this.cache && require.cache[resolvedPath]) {
      delete require.cache[resolvedPath];
      if (!this.silent) {
        console.log(`Módulo ${modulePath} eliminado de la caché`);
      }
    }

    // Carga el módulo
    try {
      const loadedModule = require(resolvedPath);
      if (!this.silent) {
        console.log(`Módulo ${modulePath} cargado exitosamente`);
      }
      return loadedModule;
    } catch (error) {
      if (!this.silent) {
        console.error(`Error al cargar el módulo en ${modulePath}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Resuelve la ruta del módulo, probando varias extensiones si es necesario.
   * @param {string} modulePath - Ruta relativa o absoluta del módulo.
   * @returns {string|null} - La ruta del módulo resuelta o null si no se encuentra.
   */
  resolvePath(modulePath) {
    if (path.isAbsolute(modulePath)) {
      return this.tryExtensions(modulePath);
    }

    const absolutePath = path.join(this.basePath, modulePath);
    return this.tryExtensions(absolutePath);
  }

  /**
   * Intenta resolver la ruta del archivo con diferentes extensiones.
   * @param {string} filePath - Ruta del archivo sin extensión.
   * @returns {string|null} - La ruta del archivo con la extensión correcta o null si no se encuentra.
   */
  tryExtensions(filePath) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }

    for (const ext of this.extensions) {
      const pathWithExt = `${filePath}${ext}`;
      if (fs.existsSync(pathWithExt)) {
        return pathWithExt;
      }
    }

    return null;
  }

  /**
   * Obtiene la ruta del archivo que llama a esta función.
   * @returns {string|null} - La ruta del archivo que llama, o null si no se puede determinar.
   */
  getCallerFile() {
    const originalFunc = Error.prepareStackTrace;
    let callerfile;
    try {
      const err = new Error();
      let currentfile;

      Error.prepareStackTrace = (_, stack) => stack;

      currentfile = err.stack.shift().getFileName();

      while (err.stack.length) {
        callerfile = err.stack.shift().getFileName();

        if (currentfile !== callerfile) break;
      }
    } catch (e) {
      if (!this.silent) {
        console.error("Error al obtener el archivo que llama:", e);
      }
    }

    Error.prepareStackTrace = originalFunc;

    return callerfile;
  }
}

module.exports = Dynreload;
