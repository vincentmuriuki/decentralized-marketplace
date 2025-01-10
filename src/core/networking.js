import Hyperswarm from 'hyperswarm';
import { initializeDB } from './database';
import DHT from 'hyperdht';
import b4a from 'b4a';

let dhtNode;

/**
 * Set up the DHT swarm using b4a and Hyperswarm.
 */
export const setupSwarm = async () => {
  if (dhtNode) {
    console.log('🌐 DHT Node already running');
    return dhtNode;
  }

  // Initialize the DHT node
  dhtNode = new DHT();
  console.log('🌐 DHT Node initialized');

  // Define the topic (already in hex format, 64 characters)
  const topicHex = '800a9d39740cb0614c71159e1d01c6e7d2bfe5927ae928a4361c4166c0222fb7';

  // Convert the hex string to a Uint8Array using b4a
  const topicBuffer = b4a.from(topicHex, 'hex');

  // Ensure that topicBuffer is a TypedArray (Uint8Array)
  if (!(topicBuffer instanceof Uint8Array)) {
    console.error('❌ Error: Topic buffer is not a Uint8Array');
    return;
  }

  console.log('Topic Buffer:', topicBuffer);

  // Create the DHT server
  const server = dhtNode.createServer();

  // Handle peer connections
  server.on('connection', (socket) => {
    console.log('🔗 New peer connected');
    socket.write('Welcome to the decentralized marketplace\n');
    socket.on('data', (data) => {
      console.log('Received:', data.toString());
    });
  });

  // Start the server listening on the topic
  try {
    await server.listen(topicBuffer);
    console.log('🌐 Listening for peers under topic:', topicBuffer.toString('hex'));
  } catch (error) {
    console.error('❌ Error starting networking:', error.message);
    return;
  }

  // Initialize database and replicate feeds
  const { productDB, userDB, userCore, productCore } = await initializeDB();

  // Set up Hyperswarm for additional replication
  const swarm = new Hyperswarm();

  swarm.on('connection', (connection) => {
    console.log('🔗 Connected to a peer');
    // Replicate feeds to the connected peer
    productDB.feed.replicate(connection);
    userDB.feed.replicate(connection);
  });

  // Join the product and user feeds to the swarm
  swarm.join(productDB.feed.discoveryKey);
  swarm.join(userDB.feed.discoveryKey);

  return { productDB, userDB };
};

/**
 * Shutdown the DHT node.
 */
export async function shutdownSwarm() {
  if (dhtNode) {
    console.log('🌐 Shutting down DHT node...');
    await dhtNode.destroy();
    console.log('🌐 DHT node stopped.');
  }
}

/**
 * Send a message to a peer using the DHT node.
 */
export async function sendMessage(peerAddress, message) {
  if (!dhtNode) {
    throw new Error('DHT node is not initialized.');
  }

  const socket = dhtNode.connect(peerAddress);
  socket.write(message);

  socket.on('data', (data) => {
    console.log('Response from peer:', data.toString());
  });

  socket.on('error', (error) => {
    console.error('❌ Error communicating with peer:', error.message);
  });
}
