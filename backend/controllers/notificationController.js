import { db, messaging } from '../config/firebase.js';

export async function sendNotification(req, res, next) {
  try {
    const uid = req.user?.uid || 'dev_user_arjun_123';
    const { title, body, type, actionRoute } = req.body;

    const notifData = {
      userId: uid,
      title: title || 'GlucoGuard Reminder',
      body: body || 'Time to check your blood glucose level.',
      type: type || 'general',
      actionRoute: actionRoute || '/dashboard',
      isRead: false,
      timestamp: new Date().toISOString()
    };

    const docRef = await db.collection('notifications').add(notifData);
    notifData.id = docRef.id;

    // Send FCM Push notification if token exists
    try {
      await messaging.send({
        notification: { title: notifData.title, body: notifData.body },
        topic: 'user_' + uid
      });
    } catch (fcmErr) {
      console.log('ℹ️ FCM Push note (dev mode):', fcmErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Notification sent successfully.',
      notification: notifData
    });
  } catch (error) {
    next(error);
  }
}

export async function getNotifications(req, res, next) {
  try {
    const uid = req.user?.uid || 'dev_user_arjun_123';
    const snapshot = await db.collection('notifications').where('userId', '==', uid).get();
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.status(200).json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    next(error);
  }
}
