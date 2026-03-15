import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateOTReport = async (otDetails, bikeDetails, userName) => {
    // A4 size is 210 x 297 mm
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // --- Header ---
    doc.setFillColor(10, 19, 21); // Dark background #0a1315
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Logo text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Dynotech Power", 15, 20);
    doc.setTextColor(13, 204, 242); // Primary color
    doc.text("Garage", 65, 20);

    // Header Info
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("REPORTE DE ORDEN DE TRABAJO", pageWidth - 15, 18, { align: 'right' });
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(`Doc Ref: ${otDetails.reference}`, pageWidth - 15, 25, { align: 'right' });

    yPos = 50;

    // --- Client & Vehicle Details ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Información del Cliente y Vehículo", 15, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(`Cliente: ${userName}`, 15, yPos);
    doc.text(`Vehículo: ${bikeDetails.brand} ${bikeDetails.model}`, 100, yPos);
    yPos += 6;
    doc.text(`Fecha Emisión: ${new Date().toLocaleDateString('es-ES')}`, 15, yPos);
    doc.text(`Patente: ${bikeDetails.licensePlate}`, 100, yPos);
    yPos += 6;
    doc.text(`VIN: ${bikeDetails.vin || 'N/A'}`, 100, yPos);

    yPos += 15;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 10;

    // --- Service Description ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Detalle del Servicio", 15, yPos);
    yPos += 8;

    // Background for service box
    doc.setFillColor(245, 245, 248);
    doc.rect(15, yPos, pageWidth - 30, 40, 'F');
    yPos += 6;

    doc.setFontSize(12);
    doc.text(otDetails.title, 20, yPos);
    yPos += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha del Servicio: ${otDetails.date}`, 20, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    yPos += 8;

    // Split text into multiple lines if too long
    const splitDescription = doc.splitTextToSize(otDetails.description, pageWidth - 40);
    doc.text(splitDescription, 20, yPos);

    yPos += splitDescription.length * 5 + 15;

    // --- Certification / Stamp ---
    if (otDetails.type === "Certificado") {
        doc.setTextColor(13, 204, 242);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("CERTIFICADO OFICIAL DYNOTECH", pageWidth / 2, yPos, { align: 'center' });

        yPos += 6;
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "normal");
        doc.text("Este documento certifica la validez técnica de los procedimientos listados.", pageWidth / 2, yPos, { align: 'center' });
    }

    // --- Footer ---
    const footerY = 280;
    doc.setDrawColor(13, 204, 242);
    doc.setLineWidth(0.5);
    doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Dynotech Power Garage • Avenida Libertad 4825, CABA", pageWidth / 2, footerY, { align: 'center' });
    doc.text("Contacto: soporte@dynotech.ar | +54 11 4455-6677", pageWidth / 2, footerY + 5, { align: 'center' });

    // Save PDF
    doc.save(`Reporte_OT_${otDetails.reference}.pdf`);
};
