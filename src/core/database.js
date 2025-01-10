import Hypercore from 'hypercore';
import Hyperbee from 'hyperbee';
import Hyperswarm from 'hyperswarm';
import b4a from 'b4a'
import crypto from 'hypercore-crypto';
// import { log } from '../utils/logger';

let productDBInstance = null;
let userDBInstance = null;

export const initializeDB = async (replicationTopic) => {
  if (productDBInstance && userDBInstance) {
    return { productDB: productDBInstance, userDB: userDBInstance }; // Reuse existing instances
  }

  const productCore = new Hypercore(`./data/products`, { valueEncoding: 'json' });
  const userCore = new Hypercore(`./data/users`, { valueEncoding: 'json' });

  const swarm = new Hyperswarm();

  Pear.teardown(() => swarm.destroy())

  const productDB = new Hyperbee(productCore, { keyEncoding: 'utf-8', valueEncoding: 'json' });
  const userDB = new Hyperbee(userCore, { keyEncoding: 'utf-8', valueEncoding: 'json' });

  await productCore.ready();
  await userCore.ready();
  await productDB.ready();
  await userDB.ready();

  // const topic = crypto.randomBytes(32);
  console.log('Replication topic:', replicationTopic);
  swarm.join(b4a.from(replicationTopic, 'hex'), {
    server: true,
    client: true
  })

  // const foundPeers = productCore.findingPeers()
  swarm.join(productCore.discoveryKey)
  swarm.join(userCore.discoveryKey)

  swarm.on('connection', connection => {
    console.log('peer connected for replication')
    productCore.replicate(connection);
    userCore.replicate(connection);
  })

  // swarm.flush().then(() => foundPeers())

  // await productCore.update()
  // await userCore.update()

  console.log('✅ Databases initialized successfully');

  productDBInstance = productDB;
  userDBInstance = userDB;

  return { productDB, userDB, userCore, productCore };
};
