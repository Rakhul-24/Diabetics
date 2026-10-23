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
    const { idToken, profile } = req.body;
    let decoded = null;

    if (idToken) {
      try {
        decoded = await auth.verifyIdToken(idToken);
      } catch (e) {
        console.warn('Firebase verifyIdToken skipped/failed:', e.message);
      }
    }

    const email = decoded?.email || profile?.email || req.user?.email || 'user@gmail.com';
    const name = decoded?.name || profile?.name || req.user?.name || email.split('@')[0];
    const uid = decoded?.uid || profile?.id || 'google_' + email.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const picture = decoded?.picture || profile?.profileImageUrl || profile?.picture || '';

    // Check if user exists in Firestore (both by doc UID and by email)
    let existingData = null;
    try {
      const snap = await db.collection('users').doc(uid).get();
      if (snap.exists) {
        existingData = snap.data();
      } else {
        const emailSnap = await db.collection('users').where('email', '==', email.toLowerCase()).get();
        if (!emailSnap.empty) {
          existingData = emailSnap.docs[0].data();
        }
      }
    } catch (err) {
      console.warn('Firestore existing user lookup notice:', err.message);
    }

    // A user is considered existing if they already have clinical onboarding data saved
    const isAlreadyOnboarded = !!(
      existingData &&
      (existingData.diabetesType || existingData.age || existingData.mealTimes)
    );

    const targetUid = existingData?.uid || uid;

    const userDoc = {
      ...(existingData || {}),
      uid: targetUid,
      name: name || existingData?.name || 'User',
      email: email.toLowerCase(),
      profileImageUrl: picture || existingData?.profileImageUrl || '',
      authProvider: 'google',
      ...(profile?.diabetesType ? { diabetesType: profile.diabetesType } : {}),
      ...(profile?.age ? { age: Number(profile.age) } : {}),
      ...(profile?.gender ? { gender: profile.gender } : {}),
      ...(profile?.height ? { height: Number(profile.height) } : {}),
      ...(profile?.weight ? { weight: Number(profile.weight) } : {}),
      ...(profile?.bmi ? { bmi: Number(profile.bmi) } : {}),
      ...(profile?.activityLevel ? { activityLevel: profile.activityLevel } : {}),
      ...(profile?.targetGlucoseMin ? { targetGlucoseMin: Number(profile.targetGlucoseMin) } : {}),
      ...(profile?.targetGlucoseMax ? { targetGlucoseMax: Number(profile.targetGlucoseMax) } : {}),
      ...(profile?.mealTimes ? { mealTimes: profile.mealTimes } : {}),
      updatedAt: new Date().toISOString()
    };

    await db.collection('users').doc(targetUid).set(userDoc, { merge: true });

    return res.status(200).json({
      success: true,
      message: 'Google Sign-In successful.',
      isNewUser: !isAlreadyOnboarded && !profile?.diabetesType,
      user: userDoc
    });
  } catch (error) {
    next(error);
  }
}
