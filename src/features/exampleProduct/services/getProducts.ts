import { collection, getDocs } from 'firebase/firestore';

import { db } from '@/shared/lib/firebase';
import { productSchema, type Product } from '../models/product.types';

export async function getProducts(): Promise<Product[]> {
  const productsRef = collection(db, 'products');
  // znowu korzystamy z referencji zeby moc sie odwolac do danego punktu w bazie danych
  const snapshot = await getDocs(productsRef);
  // sprawdzcie sobie czym jest snapshot i w jaki sposob dzialaja kolekcje i dokumenty w firestore
  const raw = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return productSchema.array().parse(raw);
  // mapujemy dane wiadomo o co chodzi
}
