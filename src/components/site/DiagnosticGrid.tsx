import type { ComponentProps } from "react";
import { DiagnosticCard } from "./DiagnosticCard";

type Card = ComponentProps<typeof DiagnosticCard> & { id: string };

export function DiagnosticGrid({ cards }: { cards: readonly Card[] }) {
  return (
    <ul className="m-0 mt-9 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-3.5 p-0">
      {cards.map(({ id, ...card }) => (
        <li key={id} className="flex">
          <DiagnosticCard {...card} />
        </li>
      ))}
    </ul>
  );
}
