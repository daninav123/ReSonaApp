import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateBudgetPDF(budget: {
  title: string;
  amount: number;
  items: {
    description: string;
    quantity: number;
    price: number;
  }[];
}) {
  const doc = new jsPDF();
  
  // Title
  doc.text(`Presupuesto: ${budget.title}`, 10, 10);
  
  // Items table
  const tableData = budget.items.map(item => [
    item.description,
    item.quantity.toString(),
    `$${item.price.toFixed(2)}`,
    `$${(item.quantity * item.price).toFixed(2)}`
  ]);
  
  autoTable(doc, {
    head: [['Descripción', 'Cantidad', 'Precio', 'Total']],
    body: tableData,
    startY: 20
  });
  
  // Total
  doc.text(`Total: $${budget.amount.toFixed(2)}`, 10, doc.lastAutoTable.finalY + 10);
  
  doc.save(`presupuesto-${budget.title}.pdf`);
}
