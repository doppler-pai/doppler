// kazdy (GET POST UPDATE DELETE) w oddzielnym pliku

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { NewProductData } from '../models/product.types';
import { db } from '@/shared/lib/firebase';

export async function addProduct(data: NewProductData) {
  try {
    const productsRef = collection(db, 'products');
    //tak sie bierze referencje do danego punktu w bazie danych, ten string to poprostu sciezka np users/skin/mati

    //add doc wiadomo o co chodzi
    const docRef = await addDoc(productsRef, {
      ...data,
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      id: docRef.id,
    };
  } catch (error: unknown) {
    console.error('Error adding product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
