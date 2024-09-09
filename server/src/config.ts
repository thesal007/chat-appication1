// import dotenv from 'dotenv';
// import path from 'path';
// import Joi from 'joi';

// type Config = {
//   env: string;
//   port: number;
//   mongodbUrl: string;
// };

// // Function to load and validate environment variables
// function loadConfig(): Config {
//   // Determine the environment and set the appropriate .env file
//   const env = process.env.NODE_ENV || 'development';
//   const envPath = path.resolve(__dirname, `./configs/.env.${env}`);
//   dotenv.config({ path: envPath });

//   // Define a schema for the environment variables
//   const envVarsSchema = Joi.object({
//     NODE_ENV: Joi.string().required(),
//     PORT: Joi.number().default(3000),
//     MONGODB_URL: Joi.string().required(),
//   }).unknown().required();

//   // Validate the environment variables
//   const { value: envVars, error } = envVarsSchema.validate(process.env);
//   if (error) {
//     throw new Error(`Config validation error: ${error.message}`);
//   }

//   return {
//     env: envVars.NODE_ENV,
//     port: envVars.PORT,
//     mongodbUrl: envVars.MONGODB_URL,
//   };
// }

// // Export the loaded configuration
// const configs = loadConfig();
// export default configs;



import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';

// Define the Config type to include AWS-related environment variables
type Config = {
  env: string;
  port: number;
  mongodbUrl: string;
  awsRegion: string;
  bucketName: string;
};

// Function to load and validate environment variables
function loadConfig(): Config {
  // Determine the environment and set the appropriate .env file
  const env = process.env.NODE_ENV || 'development';
  const envPath = path.resolve(__dirname, `./configs/.env.${env}`);
  dotenv.config({ path: envPath });

  // Define a schema for the environment variables
  const envVarsSchema = Joi.object({
    NODE_ENV: Joi.string().required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required(),
    AWS_REGION: Joi.string().required(), // Add validation for AWS region
    BUCKET_NAME: Joi.string().required(), // Add validation for S3 bucket name
  })
    .unknown()
    .required();

  // Validate the environment variables
  const { value: envVars, error } = envVarsSchema.validate(process.env);
  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    mongodbUrl: envVars.MONGODB_URL,
    awsRegion: envVars.AWS_REGION, // Return the AWS region
    bucketName: envVars.BUCKET_NAME, // Return the S3 bucket name
  };
}

// Export the loaded configuration
const configs = loadConfig();
export default configs;
