import express from "express";
import mongoose from "mongoose";
import {
  authenticate,
} from "../../middleware/authenticate.js";
import {
  requireDashboardAccess,
  requireRole,
} from "../../middleware/dashboardAccess.js";

const router = express.Router();

const getCollectionNames = async (db) => {
  const collections = await db
    .listCollections({}, { nameOnly: true })
    .toArray();

  return new Set(
    collections.map((collection) => collection.name),
  );
};

const firstCollection = (
  available,
  candidates,
) =>
  candidates.find((name) => available.has(name)) || "";

const safeCount = async (
  db,
  available,
  candidates,
  query = {},
) => {
  const name = firstCollection(available, candidates);

  if (!name) return 0;

  return db.collection(name).countDocuments(query);
};

const getDonationTotal = async (
  db,
  available,
) => {
  const name = firstCollection(
    available,
    [
      "donations",
      "payments",
      "orders",
      "razorpayorders",
    ],
  );

  if (!name) return 0;

  const result = await db
    .collection(name)
    .aggregate([
      {
        $match: {
          $or: [
            {
              status: {
                $in: [
                  "paid",
                  "captured",
                  "completed",
                  "success",
                  "successful",
                ],
              },
            },
            { paymentStatus: "paid" },
          ],
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $convert: {
                input: {
                  $ifNull: [
                    "$amount",
                    {
                      $ifNull: [
                        "$amountPaid",
                        "$totalAmount",
                      ],
                    },
                  ],
                },
                to: "double",
                onError: 0,
                onNull: 0,
              },
            },
          },
        },
      },
    ])
    .toArray();

  return Number(result[0]?.total || 0);
};

router.get(
  "/",
  authenticate,
  requireDashboardAccess,
  requireRole("super_admin"),
  async (_req, res, next) => {
    try {
      const db = mongoose.connection.db;

      if (!db) {
        return res.status(503).json({
          success: false,
          message:
            "MongoDB is not ready. Please retry shortly.",
        });
      }

      res.set({
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      });

      const available =
        await getCollectionNames(db);

      const [
        totalCandidates,
        activeMembers,
        totalDonations,
        certificatesIssued,
        contactInquiries,
        eventRegistrations,
      ] = await Promise.all([
        safeCount(
          db,
          available,
          [
            "candidates",
            "internshipapplications",
            "applications",
          ],
        ),
        safeCount(
          db,
          available,
          ["users", "members"],
          {
            status: {
              $ne: "inactive",
            },
          },
        ),
        getDonationTotal(db, available),
        safeCount(
          db,
          available,
          ["certificates"],
          {
            $or: [
              { isValid: true },
              { status: "issued" },
              { status: "active" },
            ],
          },
        ),
        safeCount(
          db,
          available,
          [
            "contacts",
            "contactmessages",
            "contact_messages",
          ],
        ),
        safeCount(
          db,
          available,
          [
            "eventregistrations",
            "learninghubregistrations",
          ],
        ),
      ]);

      const stats = {
        totalCandidates,
        activeMembers,
        totalMembers: activeMembers,
        totalDonations,
        donationAmount: totalDonations,
        certificatesIssued,
        totalCertificates: certificatesIssued,
        contactInquiries,
        eventRegistrations,
      };

      return res.json({
        success: true,
        stats,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
