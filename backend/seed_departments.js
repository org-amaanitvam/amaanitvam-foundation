import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/user.js';
import Department from './models/department.js';

dotenv.config();

const departments = [
  {
    departmentName: 'Social media',
    head: {
      name: 'Social Media Head',
      email: 'social-head@amaanitvam.org',
      phone: '9000000001',
      role: 'member',
    },
    members: [
      { name: 'Dhruv Mankame', email: 'dhruvmankame3@gmail.com', phone: '9594412538', role: 'intern' },
    ],
  },
  {
    departmentName: 'Technology',
    head: {
      name: 'Technology Head',
      email: 'technology-head@amaanitvam.org',
      phone: '9000000002',
      role: 'member',
    },
    members: [
      { name: 'Tech Intern', email: 'techintern@amaanitvam.org', phone: '9000000003', role: 'intern' },
    ],
  },
  {
    departmentName: 'Operations',
    head: {
      name: 'Operations Head',
      email: 'operations-head@amaanitvam.org',
      phone: '9000000004',
      role: 'member',
    },
    members: [
      { name: 'Operations Intern', email: 'opsintern@amaanitvam.org', phone: '9000000005', role: 'intern' },
    ],
  },
];

const ensureUser = async ({ name, email, phone, role, department }) => {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      phone,
      role,
      status: 'active',
      department: department || '',
    });
    console.log(`Created user: ${email}`);
  } else {
    console.log(`User exists: ${email}`);
      let updated = false;
      if (department && user.department !== department) {
        user.department = department;
        updated = true;
        console.log(`Updated department for user: ${email} -> ${department}`);
      }
      // departmentDomain removed
    if (updated) {
      await user.save();
    }
  }
  return user;
};

const run = async () => {
  await connectDB();

  for (const dept of departments) {
      const head = await ensureUser({ ...dept.head, department: dept.departmentName });
    const existingDepartment = await Department.findOne({ departmentName: dept.departmentName });

    const formattedMembers = [];
    for (const memberData of dept.members) {
      const member = await ensureUser({ ...memberData, department: dept.departmentName });
      formattedMembers.push({ user: member._id, role: member.role || 'member', joinedAt: new Date() });
    }

    if (!existingDepartment) {
      await Department.create({
        departmentName: dept.departmentName,
        description: `${dept.departmentName} department`,
        departmentHead: head._id,
        members: formattedMembers,
        totalMembers: formattedMembers.length,
      });
      console.log(`Created department: ${dept.departmentName}`);
    } else {
      let shouldSave = false;
      if (!existingDepartment.departmentHead || existingDepartment.departmentHead.toString() !== head._id.toString()) {
        existingDepartment.departmentHead = head._id;
        shouldSave = true;
      }
      const existingUserIds = existingDepartment.members.map((m) => m.user.toString());
      for (const member of formattedMembers) {
        if (!existingUserIds.includes(member.user.toString())) {
          existingDepartment.members.push(member);
          shouldSave = true;
        }
      }
      if (shouldSave) {
        existingDepartment.totalMembers = existingDepartment.members.length;
        await existingDepartment.save();
        console.log(`Updated department: ${dept.departmentName}`);
      } else {
        console.log(`Department exists and was unchanged: ${dept.departmentName}`);
      }
    }
  }

  console.log('Department seeding complete.');
  process.exit(0);
};

run().catch((error) => {
  console.error('Department seed error:', error);
  process.exit(1);
});
