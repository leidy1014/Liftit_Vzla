import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Venta } from './venta.interface';

@Injectable({ providedIn: 'root' })
export class PdfVentasService {

    private readonly MAGENTA = '#c2185b';
    private readonly GRIS = '#757575';
    private readonly TEXTO = '#212121';

    private formatCOP(valor: number): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(valor);
    }

    private encabezado(doc: jsPDF, titulo: string) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(this.MAGENTA);
        doc.text('LEIDY CHERRY GLAM', 14, 22);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(this.GRIS);
        doc.text('Productos de belleza y cosméticos', 14, 29);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(this.TEXTO);
        doc.text(titulo, 196, 22, { align: 'right' });

        doc.setDrawColor(this.MAGENTA);
        doc.setLineWidth(0.8);
        doc.line(14, 34, 196, 34);
    }

    private infoGeneral(doc: jsPDF, venta: Venta, labelCliente: string) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(this.GRIS);
        doc.text(labelCliente.toUpperCase(), 14, 44);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(this.TEXTO);
        doc.text(venta.clienteNombre, 14, 51);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(this.GRIS);
        doc.text('NÚMERO', 196, 44, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(this.TEXTO);
        doc.text(venta.numero, 196, 51, { align: 'right' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(this.GRIS);
        doc.text('FECHA', 196, 61, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(this.TEXTO);
        doc.text(new Date(venta.fecha).toLocaleDateString('es-CO'), 196, 68, { align: 'right' });
    }

    private total(doc: jsPDF, venta: Venta, startY: number) {
        doc.setDrawColor('#e0e0e0');
        doc.setLineWidth(0.5);
        doc.line(130, startY, 196, startY);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(this.TEXTO);
        doc.text('TOTAL', 130, startY + 9);

        doc.setFontSize(16);
        doc.setTextColor(this.MAGENTA);
        doc.text(this.formatCOP(venta.total), 196, startY + 9, { align: 'right' });
    }

    private tablaProductosPrecio(doc: jsPDF, venta: Venta) {
        autoTable(doc, {
            startY: 78,
            head: [['Producto', 'Cant.', 'Precio unit.', 'Subtotal']],
            body: (venta.items ?? []).map(item => [
                item.producto?.nombre ?? '—',
                item.cantidad,
                this.formatCOP(item.precioUnitario),
                this.formatCOP(item.subtotal),
            ]),
            headStyles: { fillColor: [252, 228, 236], textColor: [66, 66, 66], fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 10 },
            columnStyles: {
                1: { halign: 'center', cellWidth: 20 },
                2: { halign: 'right', cellWidth: 45 },
                3: { halign: 'right', cellWidth: 45, fontStyle: 'bold' },
            },
            alternateRowStyles: { fillColor: [255, 255, 255] },
        });
    }

    descargarProforma(venta: Venta) {
        const doc = new jsPDF();
        this.encabezado(doc, 'PROFORMA');
        this.infoGeneral(doc, venta, 'Cliente');
        this.tablaProductosPrecio(doc, venta);

        const finalY: number = (doc as any).lastAutoTable.finalY + 12;
        this.total(doc, venta, finalY);

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(this.GRIS);
        doc.text('Este documento es una proforma y no tiene validez fiscal.', 14, finalY + 20);

        doc.save(`Proforma_${venta.numero}.pdf`);
    }

    descargarFactura(venta: Venta) {
        const doc = new jsPDF();
        this.encabezado(doc, 'FACTURA DE VENTA');
        this.infoGeneral(doc, venta, 'Cliente');
        this.tablaProductosPrecio(doc, venta);

        const finalY: number = (doc as any).lastAutoTable.finalY + 12;
        this.total(doc, venta, finalY);

        doc.save(`Factura_${venta.numero}.pdf`);
    }

    descargarOrdenEntrega(venta: Venta) {
        const doc = new jsPDF();
        this.encabezado(doc, 'ORDEN DE ENTREGA');
        this.infoGeneral(doc, venta, 'Destinatario');

        autoTable(doc, {
            startY: 78,
            head: [['Producto', 'Cantidad']],
            body: (venta.items ?? []).map(item => [
                item.producto?.nombre ?? '—',
                item.cantidad,
            ]),
            headStyles: { fillColor: [252, 228, 236], textColor: [66, 66, 66], fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 11 },
            columnStyles: { 1: { halign: 'center', cellWidth: 35, fontStyle: 'bold' } },
        });

        const firmaY: number = (doc as any).lastAutoTable.finalY + 30;
        doc.setDrawColor('#9e9e9e');
        doc.setLineWidth(0.5);
        doc.line(14, firmaY, 90, firmaY);
        doc.line(120, firmaY, 196, firmaY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(this.GRIS);
        doc.text('Firma recibido conforme', 14, firmaY + 6);
        doc.text('Fecha de entrega', 120, firmaY + 6);

        doc.save(`OrdenEntrega_${venta.numero}.pdf`);
    }
}
