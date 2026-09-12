export function Table({ columns, rows, keyField = '_id', empty = 'No records yet.' }) {
  return <div className="table-wrap"><table><thead><tr>{columns.map((column) => <th key={column.label}>{column.label}</th>)}</tr></thead><tbody>
    {rows.length ? rows.map((row) => <tr key={row[keyField]}>{columns.map((column) => <td key={column.label}>{column.render ? column.render(row) : row[column.key] || '—'}</td>)}</tr>) : <tr><td colSpan={columns.length} className="empty-cell">{empty}</td></tr>}
  </tbody></table></div>;
}

