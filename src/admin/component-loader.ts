/**
 * Component loader for AdminJS
 * Allows loading custom React components for the admin interface
 *
 * Note: We use an asynchronous initialization approach to handle ESM imports
 */

// Variable that will hold the ComponentLoader instance
let loaderInstance: any = null;

// Asynchronous initialization function
export const initComponentLoader = async (): Promise<any> => {
  if (!loaderInstance) {
    const AdminJS = await import('adminjs');
    loaderInstance = new AdminJS.ComponentLoader();
  }
  return loaderInstance;
};

// Function to add a component (wrapper for the API)
export const addComponent = async (
  name: string,
  path: string
): Promise<string> => {
  const loader = await initComponentLoader();
  return loader.add(name, path);
};

// Export an object compatible with the ComponentLoader API
export const componentLoader = {
  add: (name: string, path: string): string => {
    // Return a placeholder, the real component will be loaded asynchronously
    void addComponent(name, path);
    return `${name}Component`;
  },
};
