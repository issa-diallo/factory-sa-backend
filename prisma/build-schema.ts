import * as fs from 'fs';
import * as path from 'path';

async function buildSchema() {
  const baseDir = __dirname;
  const configDir = path.join(baseDir, 'config');
  const modelsDir = path.join(baseDir, 'models');
  const outputPath = path.join(baseDir, 'schema.prisma');

  // Check if config/ and models/ directories exist
  if (!fs.existsSync(configDir) || !fs.existsSync(modelsDir)) {
    throw new Error('The config/ or models/ directories do not exist.');
  }

  // Read configuration files
  const configFiles = fs
    .readdirSync(configDir)
    .filter(file => file.endsWith('.config'))
    .sort((a, b) => {
      // Place datasource.config first, then generator.config
      if (a.includes('datasource')) return -1;
      if (b.includes('datasource')) return 1;
      return 0;
    });

  // Read model files
  const modelFiles = fs
    .readdirSync(modelsDir)
    .filter(file => file.endsWith('.model'));

  // Concatenate file contents
  let schemaContent = '';

  // First, configuration files
  for (const file of configFiles) {
    const filePath = path.join(configDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    schemaContent += content + '\n\n';
  }

  // Then, model files
  for (const file of modelFiles) {
    const filePath = path.join(modelsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    schemaContent += content + '\n\n';
  }

  // Write the final schema
  fs.writeFileSync(outputPath, schemaContent);

  console.log('Schema generated successfully!');
}

buildSchema().catch(error => {
  console.error('Error generating schema:', error);
  process.exit(1);
});
