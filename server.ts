
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import admin from 'firebase-admin';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
// Note: In this environment, we use the project ID. 
// For a real production outside AI Studio, you would use a service account key.
admin.initializeApp({
  projectId: firebaseConfig.projectId,
});

const auth = admin.auth();
const db = admin.firestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  
  // Create User (Admin Only)
  app.post('/api/admin/users', async (req, res) => {
    const { name, username, password, role, planId, expiresAt, maxDevices, isVip } = req.body;
    
    try {
      // 1. Create in Firebase Auth
      const userRecord = await auth.createUser({
        email: `${username.toLowerCase()}@nexus.com`,
        password: password,
        displayName: name,
      });

      // 2. Create in Firestore
      const userData = {
        id: userRecord.uid,
        name,
        username,
        role: role || 'user',
        planId: planId || '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        maxDevices: maxDevices || 1,
        isVip: isVip || false,
        isActive: true,
        loginHistory: []
      };

      await db.collection('users').doc(userRecord.uid).set(userData);

      res.status(201).json({ success: true, user: userData });
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Delete User (Admin Only)
  app.delete('/api/admin/users/:uid', async (req, res) => {
    const { uid } = req.params;
    try {
      await auth.deleteUser(uid);
      await db.collection('users').doc(uid).delete();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
