import mongoose, { model } from 'mongoose';

//CATEGORY SCHEMA
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    is_active: {
      type: Boolean,
      default: true,
    }
  }, { timestamps: true }
);

categorySchema.index({ name: 1 });

const Category = mongoose.model("Category", categorySchema);


//SUBJECT SCHEMA
const subjectSchema = new mongoose.Schema(
  {
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    is_active: {
      type: Boolean,
      default: true,
    }
  }, { timestamps: true }
);

subjectSchema.index(
  {
    category_id: 1,
    name: 1,
  },
  { unique: true }
);

const Subject = mongoose.model("Subject", subjectSchema);


//DOMAIN SCHEMA
const domainSchema = new mongoose.Schema(
  {
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    is_active: {
      type: Boolean,
      default: true,
    }
  }, { timestamps: true }
);

domainSchema.index(
  {
    subject_id: 1,
    name: 1,
  },
  { unique: true }
);

const Domain = mongoose.model("Domain", domainSchema);


// RESOURCE SCHEMA
const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    domain_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain",
      required: true,
      index: true,
    },

    grade_level: {
      type: Number,
      enum: [9, 10, 11, 12],
      index: true,
    },

    resource_type: {
      type: String,
      enum: ["pdf", "ppt", "doc", "docx", "video", "image", "zip", "other"],
      required: true,
      index: true,
    },

    content_url: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      default: "English",
      index: true,
    },

    content_public_id: {
      type: String,
      required: true,
    },

    thumbnail_public_id: {
      type: String,
      default: null,
    },

    mime_type: {
      type: String,
      required: true,
    },

    file_size: {
      type: Number,
      required: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    keywords: [
      {
        type: String,
        trim: true,
      },
    ],

    is_free: {
      type: Boolean,
      default: true,
      index: true,
    },

    is_published: {
      type: Boolean,
      default: false,
      index: true,
    },


    is_deleted: {
      type: Boolean,
      default: false
    },

    download_count: {
      type: Number,
      default: 0,
    },

    view_count: {
      type: Number,
      default: 0,
    },

    uploaded_by_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    ai_indexed: {
      type: Boolean,
      default: false,
      index: true,
    },

    ai_indexed_at: {
      type: Date,
      default: null,
    },
  }, { timestamps: true }
);

// Search & Filtering
resourceSchema.index({
  category_id: 1,
  subject_id: 1,
  domain_id: 1,
});

// Grade + Subject
resourceSchema.index({
  grade_level: 1,
  subject_id: 1,
});

// Library Listing
resourceSchema.index({
  is_published: 1,
  is_free: 1,
  createdAt: -1,
});

// AI Retrieval
resourceSchema.index({
  ai_indexed: 1,
});

// Text Search
resourceSchema.index({
  title: "text",
  description: "text",
  tags: "text",
  keywords: "text",
});

const Resource = mongoose.model("Resource", resourceSchema);


//RESOURCE ACCESS HISTORY SCHEMA
const resourceAccessHistorySchema = new mongoose.Schema(
  {
    resource_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
      index: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: ["view", "download"],
      required: true,
      index: true,
    },

    ip_address: {
      type: String,
      default: "",
    }
  }, { timestamps: true }
);

resourceAccessHistorySchema.index({
  user_id: 1,
  createdAt: -1,
});

resourceAccessHistorySchema.index({
  resource_id: 1,
  createdAt: -1,
});

const ResourceAccessHistory = mongoose.model("ResourceAccessHistory", resourceAccessHistorySchema);

export {
  Resource, Category, Subject, Domain, ResourceAccessHistory
}