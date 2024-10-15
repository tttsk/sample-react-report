import type { VercelRequest, VercelResponse } from '@vercel/node'
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, setDoc } from "firebase/firestore";

// 環境変数を使用してFirebaseの設定を行う
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req; // リクエストのメソッドを取得
  const { docId, newData, content } = req.body; // リクエストボディからdocIdや新しいデータを取得

  try {
    if (method === "GET") {
      // データを取得 (すべてのドキュメント)
      const postsCollection = collection(db, 'posts');
      const querySnapshot = await getDocs(postsCollection);
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        post_date: doc.data().post_date,
        content: doc.data().content,
      }));

      return res.status(200).json({ message: 'データ取得に成功しました', results: postsData });

    } else if (method === "POST" && newData) {
      // 新しいドキュメントを追加
      const docRef = await addDoc(collection(db, "posts"), newData);
      return res.status(200).json({ message: 'ドキュメントが追加されました', docId: docRef.id });



    } else if (method === "PUT" && docId) {
      // 特定のドキュメントを取得
      try {
        const docRef = doc(db, "posts", docId);
        await setDoc(docRef, {
          content: content,
          updated_at: new Date().getTime()
        }, { merge: true });  // 既存のフィールドは保持し、更新するフィールドのみ上書き

        return res.status(200).json({ message: 'ドキュメントの更新に成功しました' });

      } catch (error) {
        return res.status(500).json({ error: 'ドキュメントの更新に失敗しました', details: error.message });
      }

    } else {
      return res.status(400).json({ error: '無効なリクエスト' });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Firestore操作に失敗しました', details: error.message });
  }
}