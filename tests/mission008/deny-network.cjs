// Smoke-test tripwire, not an OS-level network sandbox.
const deny = () => { throw new Error("Network access is forbidden in the Mission 008 offline fixture"); };
for (const name of ["node:http", "node:https"]) {
  const module = require(name);
  module.request = deny;
  module.get = deny;
}
for (const name of ["node:net", "node:tls"]) {
  const module = require(name);
  module.connect = deny;
  module.createConnection = deny;
}
const dns = require("node:dns");
dns.lookup = deny;
dns.resolve = deny;
globalThis.fetch = deny;
