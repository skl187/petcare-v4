export default function MessagesPreview() {
  const msgs = [
    { from: "Dr. Kim", subject: "Rocky X-Ray review", time: "2h ago" },
    { from: "Clinic", subject: "Bella vaccine reminder", time: "1d ago" },
  ];

  return (
    <div className="rounded-2xl border p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Messages</h3>
        <button className="text-sm underline underline-offset-4">Open inbox</button>
      </div>
      <ul className="divide-y">
        {msgs.map((m, i) => (
          <li key={i} className="py-3">
            <div className="text-sm font-medium">{m.from}</div>
            <div className="text-xs text-muted-foreground">{m.subject}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{m.time}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
