import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/shared/lib/firebase";

export async function handleBuyService({
  userId,
  coins,
  price,
}: {
  userId: string;
  coins: number;
  price: number;
}) {
  const newCoins = coins - price;

  const ref = doc(db, "users", userId);

  await updateDoc(ref, {
    currency: newCoins,
  });

  return newCoins;
}
