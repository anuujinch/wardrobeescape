const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      if (serviceAccountKey) {
        // Production: Use service account key from environment variable
        const serviceAccount = JSON.parse(serviceAccountKey);
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
          databaseURL: process.env.FIREBASE_DATABASE_URL,
        });
      } else {
        // Development: Use default credentials or local emulator
        console.log('⚠️  No Firebase service account key found, using default credentials');
        
        admin.initializeApp({
          // Will use GOOGLE_APPLICATION_CREDENTIALS environment variable
          // or default service account if running on Google Cloud
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'wardrobeescape-default.appspot.com',
        });
      }
      
      console.log('🔥 Firebase Admin SDK initialized successfully');
    }
    
    return admin;
  } catch (error) {
    console.error('🔴 Firebase initialization error:', error.message);
    return null;
  }
};

// Firebase services
const getFirebaseServices = () => {
  const firebase = initializeFirebase();
  
  if (!firebase) {
    return {
      auth: null,
      firestore: null,
      storage: null,
      messaging: null
    };
  }
  
  return {
    auth: firebase.auth(),
    firestore: firebase.firestore(),
    storage: firebase.storage(),
    messaging: firebase.messaging()
  };
};

// Helper function to verify Firebase ID token
const verifyIdToken = async (idToken) => {
  try {
    const firebase = initializeFirebase();
    if (!firebase) {
      throw new Error('Firebase not initialized');
    }
    
    const decodedToken = await firebase.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('🔴 Token verification error:', error.message);
    throw new Error('Invalid or expired token');
  }
};

// Helper function to create custom token
const createCustomToken = async (uid, additionalClaims = {}) => {
  try {
    const firebase = initializeFirebase();
    if (!firebase) {
      throw new Error('Firebase not initialized');
    }
    
    const customToken = await firebase.auth().createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (error) {
    console.error('🔴 Custom token creation error:', error.message);
    throw new Error('Failed to create custom token');
  }
};

// Helper function to get user by UID
const getUserByUid = async (uid) => {
  try {
    const firebase = initializeFirebase();
    if (!firebase) {
      throw new Error('Firebase not initialized');
    }
    
    const userRecord = await firebase.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('🔴 Get user error:', error.message);
    throw new Error('User not found');
  }
};

// Helper function to upload file to Firebase Storage
const uploadFile = async (buffer, fileName, folder = 'uploads') => {
  try {
    const firebase = initializeFirebase();
    if (!firebase) {
      throw new Error('Firebase not initialized');
    }
    
    const bucket = firebase.storage().bucket();
    const file = bucket.file(`${folder}/${fileName}`);
    
    await file.save(buffer, {
      metadata: {
        contentType: 'image/jpeg',
      },
    });
    
    // Make the file publicly accessible
    await file.makePublic();
    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${folder}/${fileName}`;
    return publicUrl;
  } catch (error) {
    console.error('🔴 File upload error:', error.message);
    throw new Error('Failed to upload file');
  }
};

module.exports = {
  initializeFirebase,
  getFirebaseServices,
  verifyIdToken,
  createCustomToken,
  getUserByUid,
  uploadFile
};