export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-card-sm bg-white px-5 py-[18px]">
      <div className="text-[30px] leading-none font-extrabold text-accent-900 stretch-118">
        {value}
      </div>
      <div className="mt-1.5 text-sm text-text/70">{label}</div>
    </div>
  );
}
