import { Application } from 'express';
import { adminJsConfig, initAdminJS } from './admin.config';

/**
 * Configure AdminJS for the Express application
 * @param app - The Express application
 * @returns Promise<void>
 */
export const setupAdminJS = async (app: Application): Promise<void> => {
  try {
    // Initialize AdminJS
    const AdminJS = await initAdminJS();
    // @ts-expect-error - Type incompatibility with mock in test environment
    const adminJs = new AdminJS({
      ...adminJsConfig,
      branding: {
        ...adminJsConfig.branding,
        logo: adminJsConfig.branding.logo
          ? String(adminJsConfig.branding.logo)
          : false,
      },
    });

    // Import AdminJSExpress dynamically (ESM)
    const AdminJSExpress = await import('@adminjs/express');

    // Configure the session middleware for AdminJS
    const sessionOptions = {
      secret: process.env.JWT_SECRET || 'secret-key',
      resave: false,
      saveUninitialized: true,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      },
    };

    // Create the AdminJS router with authentication
    const adminRouter = AdminJSExpress.default.buildAuthenticatedRouter(
      adminJs,
      {
        authenticate: async (email: string, password: string) => {
          // For now, use credentials from environment
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
          const adminPassword =
            process.env.ADMIN_PASSWORD || 'admin_password_securise';

          if (email === adminEmail && password === adminPassword) {
            return { email: adminEmail, role: 'admin' };
          }
          return null;
        },
        cookieName: 'adminjs',
        cookiePassword: process.env.JWT_SECRET || 'secret-key',
      },
      null,
      sessionOptions
    );

    // Mount the AdminJS router on the Express application
    // @ts-expect-error - Type incompatibility between AdminJS router and Express
    app.use(adminJs.options.rootPath || '/admin', adminRouter);

    console.log(
      `AdminJS available at: ${adminJs.options.rootPath || '/admin'}`
    );
  } catch (error) {
    console.error('Error configuring AdminJS:', error);
    throw error;
  }
};
