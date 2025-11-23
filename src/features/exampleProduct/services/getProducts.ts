import { db } from "@/shared/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function getProducts() {
  const productsRef = collection(db, "products");
  // znowu korzystamy z referencji zeby moc sie odwolac do danego punktu w bazie danych
  const snapshot = await getDocs(productsRef);
  //sprawdzcie sobie czym jest snapshot i w jaki sposob dzialaja kolekcje i dokumenty w firestore
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  //mapujemy dane wiadomo o co chodzi
}
