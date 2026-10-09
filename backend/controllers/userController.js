import { db } from '../config/firebase.js';

export async function getProfile(req, res, next) {
  try {
    const uid = req.user?.uid || 'dev_user_arjun_123';
    const docSnap = await db.collection('users').doc(uid).get();

    if (!docSnap.exists) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      profile: docSnap.data()
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const uid = req.user?.uid || 'dev_user_arjun_123';
    const updates = req.body;

    updates.updatedAt = new Date().toISOString();

    await db.collection('users').doc(uid).set(updates, { merge: true });

    const updatedSnap = await db.collection('users').doc(uid).get();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile: updatedSnap.data()
    });
  } catch (error) {
    next(error);
  }
}
