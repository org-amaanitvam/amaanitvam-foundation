import Joi from "joi";

const envSchema = Joi.object({
  PORT: Joi.number().default(5000),
  MONGO_URI: Joi.string().required(),
  AI_SERVICE_URL: Joi.string().uri({ scheme: ['http', 'https'] }).required(),
  INTERNAL_SHARED_SECRET: Joi.string().trim().min(1).required(),
  CLOUDINARY_CLOUD_NAME: Joi.string().optional(),
  CLOUDINARY_API_KEY: Joi.string().optional(),
  CLOUDINARY_API_SECRET: Joi.string().optional(),
  RAZORPAY_KEY_ID: Joi.string().optional(),
  RAZORPAY_KEY_SECRET: Joi.string().optional(),
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().optional(),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),
}).unknown();

export const validateEnv = () => {
  const { error, value } = envSchema.validate(process.env);
  if (error) {
    console.error(`Config validation error: ${error.message}`);
    // We shouldn't exit just yet because of incomplete .envs in development
    // process.exit(1);
  }
  return value;
};
