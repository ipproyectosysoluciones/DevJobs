/**
 * Declaraciones de módulos sin tipos
 * @en Module declarations without types
 */

// dotenv - tiene sus propios tipos desde v16
declare module "dotenv";

// express-handlebars
declare module "express-handlebars" {
  import { Engine, Options } from "hbs";
  const exphbs: Engine;
  export = exphbs;
}

// connect-mongo
declare module "connect-mongo" {
  import { SessionOptions } from "express-session";
  function MongoStore(options?: {
    clientPromise?: Promise<unknown>;
    mongooseConnection?: unknown;
  }): unknown;
  export = MongoStore;
}

// nodemailer-express-handlebars
declare module "nodemailer-express-handlebars" {
  interface NodemailerExpressHandlebarsOptions {
    viewEngine: {
      extName: string;
      defaultLayout: boolean;
      partialsDir?: string;
      layoutsDir?: string;
    };
    viewPath: string;
    extName: string;
  }
  function nodemailerExpressHandlebars(options: NodemailerExpressHandlebarsOptions): unknown;
  export = nodemailerExpressHandlebars;
}

// Handlebars helpers types
declare namespace Handlebars {
  interface HelperOptions {
    fn(context?: unknown): { html: string };
  }
}