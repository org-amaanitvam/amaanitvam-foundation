import dns from "node:dns/promises";

try {
  const records = await dns.resolveSrv(
    "_mongodb._tcp.amaanitvam.z9utf07.mongodb.net"
  );
  console.log(records);
} catch (err) {
  console.error(err);
}