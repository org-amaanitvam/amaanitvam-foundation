import ContactMessage from "./contact.model.js";
import EventRegistration from "./eventRegistration.model.js";

const clean = (value, max = 5000) =>
  String(value ?? "").trim().slice(0, max);

const validEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validPhone = (value) =>
  /^[6-9]\d{9}$/.test(value);

const metadataFor = (req) => ({
  userAgent: clean(req.get("user-agent"), 500),
  forwardedFor: clean(req.get("x-forwarded-for"), 300),
});

export const submitContact = async (req, res, next) => {
  try {
    const name = clean(req.body?.name, 120);
    const email = clean(req.body?.email, 180).toLowerCase();
    const subject = clean(req.body?.subject, 200);
    const message = clean(req.body?.message, 5000);

    if (name.length < 2 || !validEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid name and email address.",
      });
    }

    if (subject.length < 3 || message.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please provide a subject and a meaningful message.",
      });
    }

    const contact = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      metadata: metadataFor(req),
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully.",
      contactId: contact._id,
    });
  } catch (error) {
    next(error);
  }
};

export const registerForEvent = async (req, res, next) => {
  try {
    const name = clean(req.body?.name, 120);
    const email = clean(req.body?.email, 180).toLowerCase();
    const phone = clean(req.body?.phone, 20);
    const event = clean(req.body?.event, 200);
    const organization = clean(req.body?.organization, 200);
    const message = clean(req.body?.message, 3000);

    if (name.length < 2 || !validEmail(email) || !validPhone(phone)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid name, email and 10-digit Indian mobile number.",
      });
    }

    if (event.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Please select or enter an event.",
      });
    }

    const registration = await EventRegistration.create({
      name,
      email,
      phone,
      event,
      organization,
      message,
      metadata: metadataFor(req),
    });

    return res.status(201).json({
      success: true,
      message: "Your event registration has been completed.",
      registrationId: registration._id,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This email address is already registered for the selected event.",
      });
    }

    next(error);
  }
};

export const listContacts = async (_req, res, next) => {
  try {
    const contacts = await ContactMessage.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, contacts, data: contacts });
  } catch (error) {
    next(error);
  }
};

export const listEventRegistrations = async (_req, res, next) => {
  try {
    const registrations = await EventRegistration.find({}).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      registrations,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};
