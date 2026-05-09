/**
 * Configuración de email / Email configuration
 */
interface EmailAuth {
  user: string | undefined;
  pass: string | undefined;
}

interface EmailConfig {
  host: string | undefined;
  port: string | number | undefined;
  auth: EmailAuth;
}

/**
 * Configuración para el envío de emails
 * @en Configuration for sending emails
 */
const emailConfig: EmailConfig = {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

export default emailConfig;