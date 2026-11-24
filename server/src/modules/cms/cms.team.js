// Shared team-bio helpers used by both the API (cms.controller.js) and the
// admin gateway (adminApiGateway.js) so both expose an identical shape.

export const AVATAR_VARIANTS = ["a", "b", "c", "d"];

// Seeded from the current public website so the CMS editor is never empty on
// first load and the About page keeps rendering the same people.
export const DEFAULT_TEAM_MEMBERS = [
  { name: "Kartik Sharma", role: "Founder & Director", email: "kartik@amaanitvam.org", bio: "", group: 1, avatar: "a" },
  { name: "Noman Ali", role: "President", email: "noman@amaanitvam.org", bio: "", group: 1, avatar: "b" },
  { name: "Niranjan Kumar", role: "Vice President", email: "niranjan@amaanitvam.org", bio: "", group: 1, avatar: "a" },
  { name: "Falak Khan", role: "Secretary", email: "falak@amaanitvam.org", bio: "", group: 1, avatar: "d" },
  { name: "Roshan Kapar", role: "HR Head", email: "roshan.hr@amaanitvam.org", bio: "", group: 1, avatar: "d" },
  { name: "Ishika Sharma", role: "Head – Graphic Design Department", email: "", bio: "", group: 2, avatar: "b" },
  { name: "Sneha", role: "Head – Content Writing Department", email: "", bio: "", group: 2, avatar: "c" },
  { name: "Ragani", role: "Head – Social Media Department", email: "", bio: "", group: 2, avatar: "d" },
  { name: "Muskan Sharma", role: "Head – Web Developer Department", email: "", bio: "", group: 2, avatar: "b" },
].map((member, index) => ({
  ...member,
  order: index,
  visible: true,
}));

export const DEFAULT_TEAM = Object.freeze({
  heading: "Leadership Team",
  subheading: "The dedicated individuals driving our mission forward.",
  members: DEFAULT_TEAM_MEMBERS,
});

const text = (value, max) =>
  String(value ?? "").trim().slice(0, max);

export function sanitizeTeamMember(input = {}, index = 0) {
  const group = Number(input?.group);
  const avatar = String(input?.avatar || "").toLowerCase();
  const order = Number(input?.order);

  return {
    name: text(input?.name, 120),
    role: text(input?.role, 160),
    email: text(input?.email, 160).toLowerCase(),
    bio: text(input?.bio, 1200),
    group: group === 2 ? 2 : 1,
    avatar: AVATAR_VARIANTS.includes(avatar) ? avatar : "a",
    order: Number.isFinite(order) ? order : index,
    visible: input?.visible === undefined ? true : Boolean(input.visible),
  };
}

export function sanitizeTeam(input) {
  if (!input || typeof input !== "object") {
    return { heading: "", subheading: "", members: [] };
  }

  const members = Array.isArray(input.members) ? input.members : [];

  return {
    heading: text(input.heading, 200),
    subheading: text(input.subheading, 500),
    members: members
      .map((member, index) => sanitizeTeamMember(member, index))
      .filter((member) => member.name || member.role)
      .slice(0, 100)
      .map((member, index) => ({ ...member, order: index })),
  };
}

// Public reads should never return an empty team section while the CMS has not
// been published yet — fall back to the seeded website roster.
export function teamForResponse(team) {
  const sanitized = sanitizeTeam(team);
  if (sanitized.members.length) {
    return {
      heading: sanitized.heading || DEFAULT_TEAM.heading,
      subheading: sanitized.subheading || DEFAULT_TEAM.subheading,
      members: sanitized.members,
    };
  }
  return sanitizeTeam(DEFAULT_TEAM);
}
