import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface INSSItem {
  employeeName: string;
  inssNumber: string;
  grossWages: number;
  employeeContribution: number;
  employerContribution: number;
}

interface INSSFormData {
  organizationName: string;
  organizationTIN: string;
  period: string;
  filingDeadline: string;
  items: INSSItem[];
  totalWages: number;
  totalEmployeeContribution: number;
  totalEmployerContribution: number;
}

export function generateINSSForm(data: INSSFormData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('REPUBLIKA DEMOKRATIKA DE TIMOR-LESTE', pageWidth / 2, 15, { align: 'center' });
  doc.text('INSTITUTO NACIONAL DE SEGURANCA SOCIAL', pageWidth / 2, 20, { align: 'center' });
  doc.text('INSS - Timor-Leste', pageWidth / 2, 25, { align: 'center' });

  // Form Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MONTHLY SOCIAL SECURITY CONTRIBUTION RETURN', pageWidth / 2, 35, { align: 'center' });
  doc.text('DECLARACAO MENSAL DE CONTRIBUICOES SEGURANCA SOCIAL', pageWidth / 2, 42, { align: 'center' });

  // INSS Logo/Badge area (placeholder)
  doc.setDrawColor(0, 100, 180);
  doc.setLineWidth(1);
  doc.rect(pageWidth - 40, 10, 30, 30);
  doc.setFontSize(8);
  doc.setTextColor(0, 100, 180);
  doc.text('INSS', pageWidth - 25, 28, { align: 'center' });
  doc.setTextColor(0);

  // Form Border
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(10, 50, pageWidth - 20, 35);

  // Organization Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Employer Name:', 15, 58);
  doc.setFont('helvetica', 'bold');
  doc.text(data.organizationName, 55, 58);

  doc.setFont('helvetica', 'normal');
  doc.text('TIN:', 15, 65);
  doc.setFont('helvetica', 'bold');
  doc.text(data.organizationTIN || 'N/A', 55, 65);

  doc.setFont('helvetica', 'normal');
  doc.text('Contribution Period:', 15, 72);
  doc.setFont('helvetica', 'bold');
  doc.text(data.period, 55, 72);

  doc.setFont('helvetica', 'normal');
  doc.text('Number of Employees:', 120, 58);
  doc.setFont('helvetica', 'bold');
  doc.text(data.items.length.toString(), 170, 58);

  doc.setFont('helvetica', 'normal');
  doc.text('Filing Deadline:', 120, 65);
  doc.setFont('helvetica', 'bold');
  doc.text(format(new Date(data.filingDeadline), 'MMM d, yyyy'), 170, 65);

  // Contribution Rates Info
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Employee Rate: 4% | Employer Rate: 6% | Total: 10%', 120, 80);

  // Employee Details Table
  autoTable(doc, {
    startY: 90,
    head: [['No.', 'Employee Name', 'INSS No.', 'Gross Wages', 'Employee (4%)', 'Employer (6%)', 'Total']],
    body: data.items.map((item, index) => [
      index + 1,
      item.employeeName,
      item.inssNumber || '-',
      `$${item.grossWages.toFixed(2)}`,
      `$${item.employeeContribution.toFixed(2)}`,
      `$${item.employerContribution.toFixed(2)}`,
      `$${(item.employeeContribution + item.employerContribution).toFixed(2)}`,
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [0, 100, 180],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 45 },
      2: { cellWidth: 25 },
      3: { halign: 'right', cellWidth: 28 },
      4: { halign: 'right', cellWidth: 25 },
      5: { halign: 'right', cellWidth: 25 },
      6: { halign: 'right', cellWidth: 25 },
    },
    margin: { left: 10, right: 10 },
  });

  // Summary Section
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setDrawColor(0, 100, 180);
  doc.setLineWidth(0.5);
  doc.rect(pageWidth - 110, finalY, 100, 45);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 180);
  doc.text('CONTRIBUTION SUMMARY', pageWidth - 105, finalY + 8);
  doc.setTextColor(0);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Contributory Wages:', pageWidth - 105, finalY + 18);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${data.totalWages.toFixed(2)}`, pageWidth - 15, finalY + 18, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.text('Employee Contributions (4%):', pageWidth - 105, finalY + 26);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${data.totalEmployeeContribution.toFixed(2)}`, pageWidth - 15, finalY + 26, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.text('Employer Contributions (6%):', pageWidth - 105, finalY + 34);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${data.totalEmployerContribution.toFixed(2)}`, pageWidth - 15, finalY + 34, { align: 'right' });

  doc.setDrawColor(0);
  doc.line(pageWidth - 105, finalY + 37, pageWidth - 15, finalY + 37);

  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL DUE:', pageWidth - 105, finalY + 43);
  doc.setFontSize(11);
  doc.text(`$${(data.totalEmployeeContribution + data.totalEmployerContribution).toFixed(2)}`, pageWidth - 15, finalY + 43, { align: 'right' });

  // Payment Info
  const payY = finalY + 55;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT INFORMATION', 10, payY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Bank: Banco Nacional Ultramarino (BNU)', 10, payY + 6);
  doc.text('Account: INSS Collection Account', 10, payY + 11);
  doc.text('Reference: Use your organization TIN as payment reference', 10, payY + 16);

  // Declaration Section
  const declY = payY + 28;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('I certify that the above information is complete and accurate. All contributions are calculated', 10, declY);
  doc.text('according to INSS Law No. 12/2016 of Timor-Leste.', 10, declY + 5);

  // Signature Lines
  const sigY = declY + 20;
  doc.line(10, sigY, 80, sigY);
  doc.text('Authorized Signature', 10, sigY + 5);
  doc.text('(Assinatura Autorizada)', 10, sigY + 9);

  doc.line(100, sigY, 150, sigY);
  doc.text('Date', 100, sigY + 5);

  doc.line(160, sigY, 200, sigY);
  doc.text('Company Stamp', 160, sigY + 5);
  doc.text('(Carimbo)', 160, sigY + 9);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text('Generated by Timor Payroll System', pageWidth / 2, 285, { align: 'center' });
  doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy HH:mm')}`, pageWidth / 2, 290, { align: 'center' });

  // Save the PDF
  doc.save(`INSS-Return-${data.period.replace(' ', '-')}.pdf`);
}
