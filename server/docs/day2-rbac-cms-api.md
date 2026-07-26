# Day 2: User Management, RBAC and Live CMS

## Role defaults

### Super Admin
Full access to all protected dashboard modules.

### Department Head
- tasks.read, tasks.manage
- projects.read, projects.manage
- meetings.read, meetings.manage
- announcements.read, announcements.manage
- reports.read, reports.manage
- departments.read
- attendance.read, attendance.read.all, attendance.write

Task, project, report and attendance data is restricted to the assigned department.

### Team Member
- tasks.read
- projects.read
- meetings.read
- announcements.read
- reports.read
- departments.read
- attendance.read, attendance.write

Task, project, report and attendance data is restricted to the authenticated member where supported.

Explicit `UserAccess.permissions` values are merged with these defaults. Permission wildcards such as `tasks.*` and `*` are supported.

## CMS endpoints

- GET `/api/cms`: public, cache disabled
- PUT `/api/cms`: Super Admin
- PATCH `/api/cms`: Super Admin

## Public CMS mapping

- Homepage hero title: `#hero-title`
- Homepage hero subtitle: `#hero-desc`
- Homepage About summary: `#home-about-summary`
- Homepage mission: `#mission-text`
- Homepage vision: `#vision-text`
- About history: `#about-history-text`
- About mission: `#about-mission-text`
- About vision: `#about-vision-text`

The website refreshes CMS content on initial load, every 30 seconds, when the window receives focus and when the tab becomes visible.

## Protected module endpoints

### Tasks
- GET `/api/tasks`: tasks.read or tasks.manage
- POST `/api/tasks`: tasks.manage
- PUT/PATCH `/api/tasks/:id`: tasks.manage

### Projects
- GET `/api/projects`: projects.read or projects.manage
- POST `/api/projects` and `/api/projects/create`: projects.manage
- PUT/PATCH `/api/projects/:id`: projects.manage

### Meetings
- GET `/api/meetings`: meetings.read or meetings.manage

### Announcements
- GET `/api/announcements`: announcements.read or announcements.manage
- POST `/api/announcements` and `/create`: announcements.manage
- PUT/PATCH `/api/announcements/:id`: announcements.manage

### Reports
- GET `/api/reports`: reports.read or reports.manage
- GET `/api/reports/member/:uid`: self, own department or Super Admin scope

### Attendance
- POST `/api/attendance/punch-in`: attendance.write
- POST `/api/attendance/punch-out`: attendance.write
- GET `/api/attendance/member/:userId`: self, own department or Super Admin scope

## Test matrix

### CMS
1. Publish a unique Hero Title.
2. Open localhost:5175 and hard-refresh.
3. Confirm the title changes.
4. Publish a Mission, Vision and Organisation History.
5. Confirm the homepage and About page update.
6. Leave the website open and publish again; confirm it updates within 30 seconds or after refocusing the tab.

### Super Admin
1. Confirm every dashboard navigation item is visible.
2. Create and update a task for any member.
3. Create and update a project in any department.
4. View any member report.
5. Confirm mutation entries appear in the auth audit collection.

### Department Head
1. Confirm management modules are visible.
2. Confirm only own-department tasks and projects load.
3. Confirm another department's assignee is rejected.
4. Confirm another department's report and attendance are rejected.

### Team Member
1. Confirm Team Reports is hidden.
2. Confirm task/project creation returns 403.
3. Confirm only assigned tasks/projects and own report/attendance load.
4. Paste a forbidden route directly and confirm redirect to `/dashboard`.

### Day 1 regression
1. Unique ID login.
2. Temporary password login.
3. Mandatory first-login password change.
4. Permanent-password re-login.
5. Deactivation and reactivation.
6. Permanent deletion with audit history retained.
