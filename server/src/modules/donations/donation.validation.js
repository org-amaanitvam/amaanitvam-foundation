import Joi from "joi";

export const createSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().email().max(180).required(),
  phone: Joi.string().trim().max(30).allow("", null).optional(),
  amount: Joi.number().positive().min(1).required(),
  campaignId: Joi.alternatives()
    .try(Joi.string().trim(), Joi.valid(null))
    .optional(),
  campaign: Joi.alternatives()
    .try(Joi.string().trim(), Joi.valid(null))
    .optional(),
  donationTarget: Joi.alternatives()
    .try(Joi.string().trim(), Joi.valid(null))
    .optional(),
}).unknown(true);
