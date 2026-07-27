import { useState } from "react";
import Modal from "../common/Modal";
import PurchaseFlow, { type PurchaseItem } from "./PurchaseFlow";
import type { Product } from "../../types/ProductTypes";

export function usePurchaseModal() {
  const [pending, setPending] = useState<PurchaseItem | null>(null);

  const openPurchase = (product: Product, qty: number) => {
    setPending({ product, qty });
  };

  const closePurchase = () => setPending(null);

  const purchaseModal = (
    <Modal
      isOpen={pending !== null}
      onClose={closePurchase}
      title={pending ? `Purchase ${pending.product.name}` : "Purchase"}
    >
      {pending && <PurchaseFlow item={pending} onClose={closePurchase} />}
    </Modal>
  );

  return { openPurchase, purchaseModal };
}