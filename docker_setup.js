//Create config.json.example from ENV VARS
const fs = require('fs/promises');

async function setup() {
  try {
    return await fs.access('./config.json', 4);
  } catch {
    const config = {
      connectors: {},
      replicator: {},
    }

    config.replicator.state = JSON.parse(process.env.STATE_CONFIG || '{"id":"replicator"}');
    config.replicator.polling_interval = Number.parseInt(process.env.POLL_INTERVAL || '5000');
    config.replicator.ldes = process.env.URLS.split(',').map(url => { return { url } });
    config.replicator.requestsPerMinute = Number.parseInt(process.env.REQ_PER_MINUTE || '60');
    config.replicator.fromTime = process.env.FROM_TIME;
    config.replicator.fromTimeStrict = process.env.FROM_TIME_STRICT || false;

    const connectors = JSON.parse(process.env.CONNECTORS || '[]');

    for (let con of connectors) {
      config.connectors[con] = {
        type: process.env[`CONNECTOR_${con}_TYPE`] || '@treecg/ldes-dummy-connector',
        settings: JSON.parse(process.env[`CONNECTOR_${con}_CONFIG`] || '{}'),
      }
    }
    console.log('Config file created:', config);
    await fs.writeFile('./config.json', JSON.stringify(config, null, 2), 'utf8');
  }
}

setup().catch(error => console.error(error));
