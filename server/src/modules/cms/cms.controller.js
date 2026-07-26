import Cms from "./cms.model.js";

const DEFAULT_CONTENT = {
  homepage: {
    heroTitle: "",
    heroSubtitle: "",
    aboutSummary: "",
  },
  aboutUs: {
    mission: "",
    vision: "",
    history: "",
  },
};

const clean = (input, max) =>
  String(input ?? "").trim().slice(0, max);

const sanitizeContent = (body = {}) => ({
  homepage: {
    heroTitle: clean(
      body?.homepage?.heroTitle,
      300,
    ),
    heroSubtitle: clean(
      body?.homepage?.heroSubtitle,
      1000,
    ),
    aboutSummary: clean(
      body?.homepage?.aboutSummary,
      5000,
    ),
  },
  aboutUs: {
    mission: clean(
      body?.aboutUs?.mission,
      5000,
    ),
    vision: clean(
      body?.aboutUs?.vision,
      5000,
    ),
    history: clean(
      body?.aboutUs?.history,
      10000,
    ),
  },
});

export const getAll = async (_req, res, next) => {
  try {
    res.set({
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Surrogate-Control": "no-store",
    });

    const document = await Cms.findOne({
      key: "website",
    }).lean();

    const content =
      document?.content ||
      DEFAULT_CONTENT;

    return res.json({
      success: true,
      content,
      data: content,
      updatedAt: document?.updatedAt || null,
    });
  } catch (error) {
    next(error);
  }
};

export const updateContent = async (req, res, next) => {
  try {
    const content = sanitizeContent(req.body);

    const document = await Cms.findOneAndUpdate(
      { key: "website" },
      {
        $set: {
          content,
          updatedBy: req.dbUser?._id || null,
        },
        $setOnInsert: {
          key: "website",
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return res.json({
      success: true,
      message:
        "Website content published successfully.",
      content: document.content,
      data: document.content,
      updatedAt: document.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};
