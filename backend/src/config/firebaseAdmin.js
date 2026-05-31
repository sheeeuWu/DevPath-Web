const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

let initialized = false;

const resolveServiceAccountPath = (rawPath) => {
  const candidatePaths = [];

  if (path.isAbsolute(rawPath)) {
    candidatePaths.push(rawPath);
  } else {
    candidatePaths.push(path.resolve(process.cwd(), rawPath));
    candidatePaths.push(path.resolve(__dirname, "../../../", rawPath));
    candidatePaths.push(path.resolve(__dirname, "../../../../", rawPath));
  }

  for (const candidatePath of candidatePaths) {
    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  return rawPath;
};

const initFirebaseAdmin = () => {
  if (initialized) {
    return admin;
  }

  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    path.resolve(process.cwd(), "../service-account-key.json");
  const resolvedServiceAccountPath = resolveServiceAccountPath(serviceAccountPath);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(require(resolvedServiceAccountPath)),
    });
  }

  initialized = true;
  return admin;
};

const getFirestore = () => {
  const adminClient = initFirebaseAdmin();
  return adminClient.firestore();
};

// Helper function to initialize and get the Firebase Auth Admin module
const getAuth = () => {
  const adminClient = initFirebaseAdmin();
  return adminClient.auth();
};

// Exporting the modules so they can be securely used across backend routes
module.exports = {
  getFirestore,
  getAuth,
};