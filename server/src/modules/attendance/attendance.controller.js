import Attendance from "./attendance.model.js";
import User from "../users/user.model.js";

const canonicalId = (req) =>
  String(
    req.user?.uid ||
    req.dbUser?.firebaseUid ||
    req.dbUser?._id,
  );

const findTarget = async (identifier) => {
  const input = String(identifier || "").trim();
  const conditions = [
    { firebaseUid: input },
    { memberId: input },
    { email: input.toLowerCase() },
  ];

  if (/^[a-f\d]{24}$/i.test(input)) {
    conditions.push({ _id: input });
  }

  return User.findOne({
    $or: conditions,
  });
};

const canRead = async (req, identifier) => {
  if (req.userAccess?.role === "super_admin") {
    return true;
  }

  const own = new Set(
    [
      req.user?.uid,
      req.dbUser?._id,
      req.dbUser?.firebaseUid,
      req.dbUser?.memberId,
      req.dbUser?.email,
    ]
      .map((item) =>
        String(item || "").trim(),
      )
      .filter(Boolean),
  );

  if (own.has(String(identifier))) {
    return true;
  }

  if (
    req.userAccess?.role ===
    "department_head"
  ) {
    const target =
      await findTarget(identifier);

    return Boolean(
      target &&
      String(target.department || "")
        .trim()
        .toLowerCase() ===
        String(req.dbUser?.department || "")
          .trim()
          .toLowerCase(),
    );
  }

  return false;
};

export const punchIn = async (req, res) => {
  try {
    const userId = canonicalId(req);
    const date = new Date()
      .toISOString()
      .split("T")[0];

    if (
      await Attendance.exists({
        userId,
        date,
      })
    ) {
      return res.status(409).json({
        success: false,
        message:
          "You have already punched in today.",
      });
    }

    const record =
      await Attendance.create({
        userId,
        date,
        punchIn: new Date(),
      });

    return res.status(201).json({
      success: true,
      record,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const punchOut = async (req, res) => {
  try {
    const userId = canonicalId(req);
    const date = new Date()
      .toISOString()
      .split("T")[0];

    const record =
      await Attendance.findOne({
        userId,
        date,
      });

    if (!record) {
      return res.status(404).json({
        success: false,
        message:
          "No punch-in record was found for today.",
      });
    }

    if (record.punchOut) {
      return res.status(409).json({
        success: false,
        message:
          "You have already punched out today.",
      });
    }

    const punchOut = new Date();

    record.punchOut = punchOut;
    record.totalHours = (
      (punchOut -
        new Date(record.punchIn)) /
      (1000 * 60 * 60)
    ).toFixed(2);

    await record.save();

    return res.json({
      success: true,
      record,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyAttendance = async (
  req,
  res,
) => {
  try {
    if (
      !(await canRead(
        req,
        req.params.userId,
      ))
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot view attendance for this user.",
      });
    }

    const target = await findTarget(
      req.params.userId,
    );

    const identifiers = [
      req.params.userId,
      target?.firebaseUid,
      target?._id,
      target?.memberId,
    ]
      .map((item) =>
        String(item || "").trim(),
      )
      .filter(Boolean);

    const history =
      await Attendance.find({
        userId: {
          $in: [...new Set(identifiers)],
        },
      }).sort({ date: -1 });

    return res.json({
      success: true,
      history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
