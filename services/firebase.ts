
// @ts-ignore
import { initializeApp } from "firebase/app";
// Fix: Use named exports from firebase/auth for v9+ modular SDK
// @ts-ignore
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Fix: Use @ts-ignore to resolve missing export member errors in environments with broken storage types
// @ts-ignore
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

// ملاحظة: يجب وضع قيم المشروع الخاصة بك هنا في حال استخدام مشروع خاص
// وإلا سيعتمد التطبيق على التهيئة التلقائية للمنصة
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "collection-yemen.firebaseapp.com",
  projectId: "collection-yemen",
  storageBucket: "collection-yemen.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
// Fix: Export storage utilities so they can be consumed via our centralized firebase service
export { ref, uploadString, getDownloadURL };
export const googleProvider = new GoogleAuthProvider();
