import IdCard, { APPROVED_ID_POSITIONS } from './idCard.model.js';
import IdCardCounter from './idCardCounter.model.js';

const COUNTER_KEY = 'member_id_card';

export const formatSequentialId = (seq) => String(seq).padStart(3, '0');

export const getNextIdPreview = async (_req, res, next) => {
  try {
    const counter = await IdCardCounter.findById(COUNTER_KEY).lean();
    const currentSeq = counter?.seq || 0;
    const nextSeq = currentSeq + 1;

    res.json({
      success: true,
      nextIdNumber: formatSequentialId(nextSeq),
      approvedPositions: APPROVED_ID_POSITIONS,
    });
  } catch (error) {
    next(error);
  }
};

export const listIdCards = async (req, res, next) => {
  try {
    const search = String(req.query.search || '').trim();
    const filter = {};

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { name: regex },
        { position: regex },
        { idNumber: regex },
      ];
    }

    const [cards, counter] = await Promise.all([
      IdCard.find(filter).sort({ sequenceNumber: -1 }).lean(),
      IdCardCounter.findById(COUNTER_KEY).lean(),
    ]);

    const nextSeq = (counter?.seq || 0) + 1;

    res.json({
      success: true,
      cards,
      nextIdNumber: formatSequentialId(nextSeq),
      approvedPositions: APPROVED_ID_POSITIONS,
    });
  } catch (error) {
    next(error);
  }
};

export const createIdCard = async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim().replace(/\s+/g, ' ');
    const position = String(req.body?.position || '').trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Member name is required.',
      });
    }

    if (!APPROVED_ID_POSITIONS.includes(position)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid position from the approved list.',
      });
    }

    // Atomic increment ensures duplicate IDs are impossible
    const counter = await IdCardCounter.findOneAndUpdate(
      { _id: COUNTER_KEY },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    const sequenceNumber = counter.seq;
    const idNumber = formatSequentialId(sequenceNumber);

    const card = await IdCard.create({
      sequenceNumber,
      idNumber,
      name,
      position,
      issueDate: new Date(),
      issuedBy: {
        uid: req.user?.uid || '',
        name: req.user?.name || '',
        email: req.user?.email || '',
      },
    });

    res.status(201).json({
      success: true,
      message: `ID Card ${idNumber} generated successfully.`,
      card,
      nextIdNumber: formatSequentialId(sequenceNumber + 1),
    });
  } catch (error) {
    next(error);
  }
};