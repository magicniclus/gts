export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0 rounded-card-sm bg-white px-3 py-3.5 sm:px-5 sm:py-[18px]">
      <div className="text-[clamp(19px,5.6vw,30px)] leading-none font-extrabold whitespace-nowrap text-accent-900 stretch-118">
        {value}
      </div>
      <div className="mt-1.5 text-xs leading-snug text-text/70 sm:text-sm">{label}</div>
    </div>
  );
}
