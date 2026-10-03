import { PriceGrid } from "@/components/admin/PriceGrid";
import { DEFAULT_PRICING } from "@/lib/defaults";
import { requireAdmin } from "@/lib/firebase/session";
import { readPricing } from "@/lib/repos/pricing";
import { toPricingInput } from "@/lib/schemas/pricing";
import { savePricing } from "./actions";

export default async function TarifsPage() {
  await requireAdmin();
  const p = await readPricing();
  return (
    <PriceGrid
      initial={toPricingInput(p)}
      defaults={toPricingInput(DEFAULT_PRICING)}
      updatedAt={p.updatedAt}
      save={savePricing}
    />
  );
}
