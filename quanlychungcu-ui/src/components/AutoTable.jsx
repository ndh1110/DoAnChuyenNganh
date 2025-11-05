export default function AutoTable({ data, columns = [], rowKey }) {
  if (!Array.isArray(data) || data.length === 0) return <p>Không có dữ liệu.</p>;

  // Nếu không truyền columns, tự suy ra từ phần tử đầu
  const detected = Object.keys(data[0] || {}).slice(0, 8).map((k) => ({ key: k, label: k }));
  const cols = columns.length ? columns : detected;

  const getKey = (row, idx) => {
    if (rowKey && row[rowKey] != null) return row[rowKey];
    const maKey = Object.keys(row).find((k) => /^Ma/i.test(k));
    return row[maKey] ?? row.id ?? idx;
  };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
          {cols.map((c) => (
            <th key={c.key} style={{ textAlign: "left", padding: 8 }}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={getKey(row, idx)} style={{ borderBottom: "1px solid #eee" }}>
            {cols.map((c) => (
              <td key={c.key} style={{ padding: 8 }}>
                {row[c.key] != null && row[c.key] !== "" ? String(row[c.key]) : "—"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
