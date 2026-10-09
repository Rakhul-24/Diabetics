import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let db;
let auth;
let messaging;

let serviceAccount = null;

// 1. Try reading from environment variable (JSON string or base64)
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON.trim();
    const jsonStr = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
    serviceAccount = JSON.parse(jsonStr);
  } catch (e) {
    console.warn('⚠️ Could not parse FIREBASE_SERVICE_ACCOUNT_JSON:', e.message);
  }
}

// 2. Try reading from file path (local or Render Secret File)
if (!serviceAccount) {
  const possiblePaths = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    '/etc/secrets/serviceAccountKey.json',
    './config/serviceAccountKey.json'
  ].filter(Boolean);

  for (const p of possiblePaths) {
    const resolvedPath = path.resolve(p);
    if (fs.existsSync(resolvedPath)) {
      try {
        serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
        break;
      } catch (err) {
        console.warn(`⚠️ Failed reading service account from ${p}:`, err.message);
      }
    }
  }
}

if (serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore();
    auth = admin.auth();
    messaging = admin.messaging();
    console.log('✅ Firebase Admin SDK initialized successfully with credentials.');
  } catch (error) {
    console.warn('⚠️ Failed to initialize Firebase Admin with service account:', error.message);
  }
}

if (!admin.apps.length) {
  console.log('ℹ️ Running in Mock/Development Database Mode (No Firebase Service Account key found).');
  
  // In-memory mock store fallback
  const mockStore = {
    users: new Map(),
    glucose_readings: new Map(),
    heart_rate: new Map(),
    steps: new Map(),
    sleep: new Map(),
    water: new Map(),
    medications: new Map(),
    recommendations: new Map(),
    reports: new Map(),
    notifications: new Map()
  };

  db = {
    collection: (colName) => {
      if (!mockStore[colName]) mockStore[colName] = new Map();
      const colMap = mockStore[colName];
      return {
        doc: (id) => ({
          get: async () => ({
            exists: colMap.has(id),
            data: () => colMap.get(id),
            id
          }),
          set: async (data, options) => {
            const existing = colMap.get(id) || {};
            const updated = options && options.merge ? { ...existing, ...data } : data;
            colMap.set(id, updated);
            return { id };
          },
          update: async (data) => {
            const existing = colMap.get(id) || {};
            colMap.set(id, { ...existing, ...data });
            return { id };
          },
          delete: async () => colMap.delete(id)
        }),
        add: async (data) => {
          const id = 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
          colMap.set(id, { ...data, id });
          return { id };
        },
        where: function() {
          return {
            orderBy: function() {
              return {
                get: async () => ({
                  docs: Array.from(colMap.values()).map(data => ({
                    id: data.id,
                    data: () => data
                  }))
                })
              };
            },
            get: async () => ({
              docs: Array.from(colMap.values()).map(data => ({
                id: data.id,
                data: () => data
              }))
            })
          };
        },
        orderBy: function() {
          return {
            get: async () => ({
              docs: Array.from(colMap.values()).map(data => ({
                id: data.id,
                data: () => data
              }))
            })
          };
        },
        get: async () => ({
          docs: Array.from(colMap.values()).map(data => ({
            id: data.id,
            data: () => data
          }))
        })
      };
    }
  };

  auth = {
    verifyIdToken: async (token) => {
      // Stub verification for dev mode
      return { uid: 'dev_user_arjun_123', email: 'arjun.sharma@example.com' };
    }
  };

  messaging = {
    send: async (msg) => {
      console.log('📱 Mock FCM Notification Sent:', msg);
      return 'mock_msg_id_123';
    }
  };
}

export { db, auth, messaging, admin };
