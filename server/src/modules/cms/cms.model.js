import mongoose from "mongoose";

const cmsContentSchema = new mongoose.Schema(
  {
    homepage: {
      heroTitle: {
        type: String,
        default: "",
        maxlength: 300,
      },
      heroSubtitle: {
        type: String,
        default: "",
        maxlength: 1000,
      },
      aboutSummary: {
        type: String,
        default: "",
        maxlength: 5000,
      },
    },
    aboutUs: {
      mission: {
        type: String,
        default: "",
        maxlength: 5000,
      },
      vision: {
        type: String,
        default: "",
        maxlength: 5000,
      },
      history: {
        type: String,
        default: "",
        maxlength: 10000,
      },
    },
  },
  { _id: false },
);

const cmsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "website",
    },
    content: {
      type: cmsContentSchema,
      required: true,
      default: () => ({}),
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "cms",
  },
);

export default mongoose.models.Cms ||
  mongoose.model("Cms", cmsSchema);
