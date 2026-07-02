import test from 'node:test';
import assert from 'node:assert/strict';

import Attendance from '../models/attendance.js';

test('attendance model requires department, user, date and status', () => {
  const attendance = new Attendance();
  const error = attendance.validateSync();

  assert.ok(error);
  assert.match(error.errors.department.message, /required/i);
  assert.match(error.errors.user.message, /required/i);
  assert.match(error.errors.date.message, /required/i);
});
