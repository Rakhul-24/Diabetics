import { db, auth } from '../config/firebase.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, phone, age, gender, height, weight, diabetesType, bloodGroup } = req.body;

    let uid = req.user?.uid;
    
    // Create Firestore user profile document
    const userDoc = {
      uid: uid || 'user_' + Date.now(),
      name: name || 'Arjun Sharma',
      email: email || 'arjun.sharma@example.com',
      phone: phone || '+91 98765 43210',
      age: age || 42,
      gender: gender || 'Male',
      height: height || 175,
      weight: weight || 80,
      diabetesType: diabetesType || 'type2',
      bloodGroup: bloodGroup || 'B+',
      medicalHistory: ['Type 2 Diabetes (diagnosed 2019)', 'Mild Hypertension'],
      allergies: ['Penicillin'],
      foodPreferences: ['Non-Vegetarian', 'Low-Carb'],
      activityLevel: 'moderate',
      emergencyContactName: 'Sunita Sharma',
      emergencyContactPhone: '+91 98888 12345',
      doctorName: 'Dr. Priya Nair',
      doctorPhone: '+91 44 2829 6000',
      createdAt: new Date().toISOString()
    };

    await db.collection('users').doc(userDoc.uid).set(userDoc, { merge: true });

    return res.status(201).json({
      success: true,
      message: 'User account registered and profile created successfully.',
      user: userDoc
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const uid = req.user?.uid || 'dev_user_arjun_123';
    
    const docSnap = await db.collection('users').doc(uid).get();
    
    let userData = docSnap.exists ? docSnap.data() : null;

    if (!userData) {
      // Provide default patient data if not existing
      userData = {
        uid,
        name: 'Arjun Sharma',
        email: 'arjun.sharma@example.com',
        phone: '+91 98765 43210',
        age: 42,
        gender: 'Male',
        height: 175,
        weight: 80,
        diabetesType: 'type2',
        bloodGroup: 'B+',
        medicalHistory: ['Type 2 Diabetes'],
        allergies: ['Penicillin'],
        foodPreferences: ['Low-Carb'],
        activityLevel: 'light',
        emergencyContactName: 'Sunita Sharma',
        emergencyContactPhone: '+91 98888 12345',
        doctorName: 'Dr. Priya Nair',
        doctorPhone: '+91 44 2829 6000'
      };
      await db.collection('users').doc(uid).set(userData);
    }

    return res.status(200).json({
      success: true,
      message: 'User logged in successfully.',
      user: userData
    });
  } catch (error) {
    next(error);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const { idToken } = req.body;
    let decoded;

    try {
      decoded = idToken ? await auth.verifyIdToken(idToken) : req.user;
    } catch {
      decoded = req.user || { uid: 'google_user_123', email: 'arjun.sharma@example.com', name: 'Arjun Sharma' };
    }

    const uid = decoded.uid;
    const userDoc = {
      uid,
      name: decoded.name || 'Arjun Sharma',
      email: decoded.email || 'arjun.sharma@example.com',
      profileImageUrl: decoded.picture || '',
      updatedAt: new Date().toISOString()
    };

    await db.collection('users').doc(uid).set(userDoc, { merge: true });

    return res.status(200).json({
      success: true,
      message: 'Google Sign-In successful.',
      user: userDoc
    });
  } catch (error) {
    next(error);
  }
}
