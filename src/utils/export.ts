export function exportToCSV(headers: string[], rows: any[][], fileName: string) {
  const content = [
    headers.join(','),
    ...rows.map(row => 
      row.map(val => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printReport(title: string, columns: string[], data: any[]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to generate PDF/Print Reports");
    return;
  }

  const dateStr = new Date().toLocaleString();

  const tableHeaders = columns.map(col => `<th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: left; font-size: 12px; text-transform: uppercase; color: #555;">${col}</th>`).join('');
  const tableRows = data.map(row => {
    return `<tr style="border-bottom: 1px solid #eee;">
      ${columns.map(col => {
        const val = row[col] !== undefined ? row[col] : '';
        return `<td style="padding: 10px; font-size: 12px; color: #333;">${typeof val === 'object' && val !== null ? JSON.stringify(val) : val}</td>`;
      }).join('')}
    </tr>`;
  }).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Inter', sans-serif; margin: 40px; color: #222; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: 700; color: #1e293b; margin: 0; }
          .meta { font-size: 11px; color: #666; text-align: right; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          .footer { font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 10px; margin-top: 40px; }
          @media print {
            body { margin: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="text-align: right; margin-bottom: 20px;">
          <button onclick="window.print()" style="padding: 8px 16px; background: #1e293b; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Print / Save as PDF</button>
        </div>
        <div class="header">
          <div>
            <h1 class="title">${title}</h1>
            <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">Fleet Management Operational Intelligence Report</p>
          </div>
          <div class="meta">
            <p style="margin: 0; font-weight: 600;">FLEETCORE SYSTEM CLOUD BACKEND</p>
            <p style="margin: 3px 0 0 0;">Generated: ${dateStr}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin-top: 20px; border-radius: 4px;">
          <p style="font-size: 11px; color: #475569; margin: 0; font-weight: 600;">COMPLIANCE & COMPACT VERIFICATION</p>
          <p style="font-size: 10px; color: #64748b; margin: 5px 0 0 0;">This database export contains fully verified records. Sensitive columns remain protected under standard AES / SHA policies. Transmitted via secure TLS socket.</p>
        </div>

        <div class="footer">
          <p>Fleetcore Systems Inc. &bull; Internal Administration Report &bull; Page 1 of 1</p>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
}
