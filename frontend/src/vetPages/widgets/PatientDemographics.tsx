export default function PatientDemographics() {
  const rows = [
    { label: "Species", values: [{ k: "Canine", v: 62 }, { k: "Feline", v: 34 }, { k: "Other", v: 4 }] },
    { label: "Age", values: [{ k: "Puppy/Kitten", v: 18 }, { k: "Adult", v: 55 }, { k: "Senior", v: 27 }] },
    { label: "Weight", values: [{ k: "<10kg", v: 22 }, { k: "10–25kg", v: 48 }, { k: ">25kg", v: 30 }] },
  ];

  return (
    <div className="rounded-2xl border p-5">
      <h3 className="text-lg font-semibold mb-3">Patient Demographics</h3>
      <div className="space-y-4 text-sm">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1 font-medium">{r.label}</div>
            <ul className="space-y-1">
              {r.values.map((v) => (
                <li key={v.k} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{v.k}</span>
                  <span className="font-medium">{v.v}%</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
