import { AddProductForm } from '@/features/exampleProduct/components/AddProductForm';
import { ProductList } from '@/features/exampleProduct/components/ProductList';

export default async function ProductsPage() {
  return (
    <main className="p-6 space-y-4">
      <AddProductForm />
      <ProductList />
    </main>
  );
}
