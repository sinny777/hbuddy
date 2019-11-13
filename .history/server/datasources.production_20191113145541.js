module.exports = {
  "db": {
    "name": "db",
    "connector": "memory"
  },
  "transient": {
    "name": "transient",
    "connector": "transient"
  },
  "accounts": {
    "url": JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0].credentials.url,
    "database": "accounts",
    "name": "accounts",
    "connector": "cloudant"
  },
  "identities": {
    "url": JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0].credentials.url,
    "database": "identities",
    "name": "identities",
    "connector": "cloudant"
  },
  "roles": {
    "url": JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0].credentials.url,
    "database": "roles",
    "name": "roles",
    "connector": "cloudant"
  },
  "rolemappings": {
    "url": JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0].credentials.url,
    "database": "rolemappings",
    "name": "rolemappings",
    "connector": "cloudant"
  },
  "groups": {
    "url": JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0].credentials.url,
    "database": "groups",
    "name": "groups",
    "connector": "cloudant"
  },
  "usersettings": {
    "url": JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0].credentials.url,
    "database": "usersettings",
    "name": "usersettings",
    "connector": "cloudant"
  },
  "notifications": {
    "url": JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0].credentials.url,
    "database": "notifications",
    "name": "notifications",
    "connector": "cloudant"
  },
  "configurations": {
    "url": JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0].credentials.url,
    "database": "configurations",
    "name": "configurations",
    "connector": "cloudant"
  },
  "places": {
    "url": JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0].credentials.url,
    "database": "places",
    "name": "places",
    "connector": "cloudant"
  },
  "placeareas": {
    "url": JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0].credentials.url,
    "database": "placeareas",
    "name": "placeareas",
    "connector": "cloudant"
  },
  "boards": {
    "url": JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0].credentials.url,
    "database": "boards",
    "name": "boards",
    "connector": "cloudant"
  },
  "devices": {
    "url": JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0].credentials.url,
    "database": "devices",
    "name": "devices",
    "connector": "cloudant"
  },
  "scenes": {
    "url": JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0].credentials.url,
    "database": "scenes",
    "name": "scenes",
    "connector": "cloudant"
  },
  "conversations": {
    "url": JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0].credentials.url,
    "database": "conversations",
    "name": "conversations",
    "connector": "cloudant"
  },
  "mappings": {
    "url": JSON.parse(process.env.VCAP_SERVICES).cloudantNoSQLDB[0].credentials.url,
    "database": "mappings",
    "name": "mappings",
    "connector": "cloudant"
  }
};
