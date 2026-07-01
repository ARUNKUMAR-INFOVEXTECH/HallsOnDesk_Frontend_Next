import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image 
} from '@react-pdf/renderer';
import { Invoice } from '@/types';

// Define styles using standard PDF primitives
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1e293b',
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#4f46e5',
    paddingBottom: 15,
    marginBottom: 20,
  },
  titleBlock: {
    flexDirection: 'column',
  },
  hallName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  hallInfo: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  gstin: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 4,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 15,
  },
  card: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
  },
  cardTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 3,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
  },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1, textAlign: 'right' },
  thText: {
    fontWeight: 'bold',
    color: '#475569',
    fontSize: 8,
    textTransform: 'uppercase',
  },
  summaryBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 20,
  },
  paymentCard: {
    flex: 3,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },
  qrCode: {
    width: 75,
    height: 75,
  },
  bankInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  totalsCard: {
    flex: 2,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    color: '#475569',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    paddingTop: 6,
    marginTop: 6,
    fontWeight: 'bold',
    fontSize: 12,
    color: '#4f46e5',
  },
  footer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
  },
});

interface InvoiceDocumentProps {
  invoice: Invoice;
  logoBase64?: string;
  qrBase64?: string;
  bankDetails?: {
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
    upi_id?: string;
  };
}

export function InvoiceDocument({ 
  invoice, 
  logoBase64, 
  qrBase64, 
  bankDetails 
}: InvoiceDocumentProps) {
  const symbol = invoice.currency_symbol || '₹';
  const formatVal = (v: number) => `${symbol}${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  // Determine tax splits (CGST/SGST vs IGST)
  const renderTaxBreakdown = () => {
    if (!invoice.tax_enabled || !invoice.tax_amount) return null;
    
    // Check if it is local (CGST + SGST) or interstate (IGST)
    const isLocal = !invoice.customer_address || 
                    invoice.customer_address.toLowerCase().includes(invoice.hall_address.slice(0, 10).toLowerCase());

    if (isLocal) {
      const halfRate = (invoice.tax_percentage / 2).toFixed(1);
      const halfAmount = invoice.tax_amount / 2;
      return (
        <>
          <View style={styles.totalRow}>
            <Text>CGST ({halfRate}%)</Text>
            <Text>{formatVal(halfAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>SGST ({halfRate}%)</Text>
            <Text>{formatVal(halfAmount)}</Text>
          </View>
        </>
      );
    } else {
      return (
        <View style={styles.totalRow}>
          <Text>IGST ({invoice.tax_percentage}%)</Text>
          <Text>{formatVal(invoice.tax_amount)}</Text>
        </View>
      );
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.hallName}>{invoice.hall_name}</Text>
            <Text style={styles.hallInfo}>{invoice.hall_address}</Text>
            <Text style={styles.hallInfo}>Phone: {invoice.hall_phone} | Email: {invoice.hall_email}</Text>
            {invoice.hall_gstin && (
              <Text style={styles.gstin}>GSTIN: {invoice.hall_gstin}</Text>
            )}
          </View>
          {logoBase64 && (
            <Image style={styles.logo} src={logoBase64} />
          )}
        </View>

        {/* Invoice Metadata & Customer Grid */}
        <View style={styles.metaGrid}>
          {/* Invoice Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Invoice Details</Text>
            <Text><Text style={styles.boldText}>Invoice No:</Text> #{invoice.invoice_number}</Text>
            <Text><Text style={styles.boldText}>Date:</Text> {invoice.invoice_date}</Text>
            <Text><Text style={styles.boldText}>Due Date:</Text> {invoice.due_date || 'On Receipt'}</Text>
            <Text><Text style={styles.boldText}>Status:</Text> {invoice.status.toUpperCase()}</Text>
          </View>

          {/* Billed To */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Billed To</Text>
            <Text style={styles.boldText}>{invoice.customer_name}</Text>
            <Text>Phone: {invoice.customer_phone}</Text>
            {invoice.customer_email && <Text>Email: {invoice.customer_email}</Text>}
            {invoice.customer_address && <Text>Address: {invoice.customer_address}</Text>}
          </View>

          {/* Event Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Event Info</Text>
            <Text><Text style={styles.boldText}>Event Name:</Text> {invoice.event_name}</Text>
            <Text><Text style={styles.boldText}>Event Type:</Text> {invoice.event_type}</Text>
            <Text><Text style={styles.boldText}>Start Date:</Text> {invoice.event_date}</Text>
            <Text><Text style={styles.boldText}>End Date:</Text> {invoice.event_end_date}</Text>
          </View>
        </View>

        {/* Itemized Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.colDesc}><Text style={styles.thText}>Description</Text></View>
            <View style={styles.colQty}><Text style={[styles.thText, { textAlign: 'center' }]}>Qty</Text></View>
            <View style={styles.colPrice}><Text style={[styles.thText, { textAlign: 'right' }]}>Unit Price</Text></View>
            <View style={styles.colTotal}><Text style={[styles.thText, { textAlign: 'right' }]}>Total</Text></View>
          </View>
          {invoice.line_items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={styles.colDesc}><Text>{item.description}</Text></View>
              <View style={styles.colQty}><Text style={{ textAlign: 'center' }}>{item.quantity}</Text></View>
              <View style={styles.colPrice}><Text style={{ textAlign: 'right' }}>{formatVal(item.unit_price)}</Text></View>
              <View style={styles.colTotal}><Text style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatVal(item.amount)}</Text></View>
            </View>
          ))}
        </View>

        {/* Footer Dues and QR Section */}
        <View style={styles.summaryBlock}>
          {/* Payment & Bank info */}
          <View style={styles.paymentCard}>
            {qrBase64 && (
              <Image style={styles.qrCode} src={qrBase64} />
            )}
            <View style={styles.bankInfo}>
              <Text style={[styles.cardTitle, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 4 }]}>
                Payment & Bank Info
              </Text>
              {bankDetails?.bank_name ? (
                <>
                  <Text><Text style={styles.boldText}>Bank:</Text> {bankDetails.bank_name}</Text>
                  <Text><Text style={styles.boldText}>A/C No:</Text> {bankDetails.account_number}</Text>
                  <Text><Text style={styles.boldText}>IFSC:</Text> {bankDetails.ifsc_code}</Text>
                </>
              ) : (
                <Text style={{ color: '#64748b', fontSize: 8 }}>Bank account transfer info not configured.</Text>
              )}
              {bankDetails?.upi_id && (
                <Text style={{ marginTop: 4 }}><Text style={styles.boldText}>UPI ID:</Text> {bankDetails.upi_id}</Text>
              )}
            </View>
          </View>

          {/* Totals Box */}
          <View style={styles.totalsCard}>
            <View style={styles.totalRow}>
              <Text>Subtotal</Text>
              <Text>{formatVal(invoice.subtotal)}</Text>
            </View>
            {invoice.discount_amount > 0 && (
              <View style={styles.totalRow}>
                <Text>Discount</Text>
                <Text>-{formatVal(invoice.discount_amount)}</Text>
              </View>
            )}
            {renderTaxBreakdown()}
            <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 4, marginTop: 4 }]}>
              <Text>Total Amount</Text>
              <Text style={styles.boldText}>{formatVal(invoice.total_amount)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Amount Paid</Text>
              <Text>{formatVal(invoice.amount_paid)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text>Balance Due</Text>
              <Text>{formatVal(invoice.balance_due)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f8fafc', borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 8, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Notes</Text>
            <Text style={{ fontSize: 8, color: '#475569' }}>{invoice.notes}</Text>
          </View>
        )}

        {/* Brand Footer */}
        <Text style={styles.footer}>
          Thank you for your business! | Powered by Infovex Halls SaaS
        </Text>
      </Page>
    </Document>
  );
}

export interface ReceiptDocumentProps {
  receiptNumber: string;
  customerName: string;
  customerPhone: string;
  bookingNumber: string;
  eventType: string;
  eventDate: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  hallName: string;
  hallAddress: string;
  hallPhone: string;
  hallEmail: string;
  logoBase64?: string;
}

export function ReceiptDocument({
  receiptNumber,
  customerName,
  customerPhone,
  bookingNumber,
  eventType,
  eventDate,
  amount,
  paymentDate,
  paymentMethod,
  hallName,
  hallAddress,
  hallPhone,
  hallEmail,
  logoBase64
}: ReceiptDocumentProps) {
  const formatVal = (v: number) => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.hallName}>{hallName}</Text>
            <Text style={styles.hallInfo}>{hallAddress}</Text>
            <Text style={styles.hallInfo}>Phone: {hallPhone} | Email: {hallEmail}</Text>
          </View>
          {logoBase64 && (
            <Image style={styles.logo} src={logoBase64} />
          )}
        </View>

        {/* Receipt Title */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Payment Receipt
          </Text>
          <Text style={{ fontSize: 9, color: '#64748b', marginTop: 4 }}>
            Receipt No: {receiptNumber}
          </Text>
        </View>

        {/* Info Grid */}
        <View style={styles.metaGrid}>
          {/* Billed To */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Received From</Text>
            <Text style={styles.boldText}>{customerName}</Text>
            <Text>Phone: {customerPhone}</Text>
          </View>

          {/* Payment Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payment Details</Text>
            <Text><Text style={styles.boldText}>Payment Date:</Text> {paymentDate}</Text>
            <Text><Text style={styles.boldText}>Payment Method:</Text> {paymentMethod.toUpperCase().replace('_', ' ')}</Text>
            <Text><Text style={styles.boldText}>Amount Paid:</Text> {formatVal(amount)}</Text>
          </View>

          {/* Booking Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Booking Context</Text>
            <Text><Text style={styles.boldText}>Booking No:</Text> {bookingNumber}</Text>
            <Text><Text style={styles.boldText}>Event Category:</Text> {eventType}</Text>
            <Text><Text style={styles.boldText}>Event Date:</Text> {eventDate}</Text>
          </View>
        </View>

        {/* Receipt Statement Card */}
        <View style={{ backgroundColor: '#f8fafc', borderStyle: 'dashed', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 20, marginBottom: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 11, textAlign: 'center', color: '#334155', lineHeight: 1.8 }}>
            Received with thanks from <Text style={styles.boldText}>{customerName}</Text> the sum of{' '}
            <Text style={[styles.boldText, { color: '#4f46e5' }]}>{formatVal(amount)}</Text> towards the booking reservation{' '}
            <Text style={styles.boldText}>#{bookingNumber}</Text> for the event scheduled on{' '}
            <Text style={styles.boldText}>{eventDate}</Text>.
          </Text>
        </View>

        {/* Brand Footer */}
        <Text style={styles.footer}>
          Thank you for your payment! | Powered by Infovex Halls SaaS
        </Text>
      </Page>
    </Document>
  );
}
