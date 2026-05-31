// Import the central admin utilities we updated in Step 1
// Adjust this path relative to where this verification script file lives
const { getFirestore } = require("./path-to-your-init-file");
const path = require('path');

// Configure dotenv to read from the project root .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function verifyAdmin() {
    try {
        const email = 'ap8548328@gmail.com';
        console.log(`Fetching admin via Admin SDK: ${email}`);
        
        // Use the safe backend firestore instance
        const db = getFirestore();

        // Admin SDK uses .collection().doc().get() instead of the client getDoc() function
        const docRef = db.collection('admins').doc(email);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            console.log('Admin Data:', JSON.stringify(docSnap.data(), null, 2));
        } else {
            console.log('No such document found in admins collection!');
        }
    } catch (error) {
        console.error('Error fetching admin securely:', error);
    }
}

verifyAdmin();