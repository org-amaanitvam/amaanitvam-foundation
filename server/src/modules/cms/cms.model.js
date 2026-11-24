import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, default: "", maxlength: 120 },
    role: { type: String, default: "", maxlength: 160 },
    email: { type: String, default: "", maxlength: 160 },
    bio: { type: String, default: "", maxlength: 1200 },
    group: { type: Number, default: 1, min: 1, max: 2 },
    avatar: { type: String, default: "a", enum: ["a", "b", "c", "d"] },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { _id: false },
);

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
    team: {
      heading: { type: String, default: "", maxlength: 200 },
      subheading: { type: String, default: "", maxlength: 500 },
      members: { type: [teamMemberSchema], default: [] },
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
