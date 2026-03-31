import { format } from "date-fns";
import { Printer, X } from "lucide-react";
import { createPortal } from "react-dom";
import type { Session } from "../api/sessions";

interface Props {
  session: Session;
  onClose: () => void;
}

const ZONE_NAME = "GAMING ZONE";
const ZONE_ADDRESS = "Your Gaming Zone Address Here";
const ZONE_CONTACT = "";
const ZONE_WEB = "";

export function PrintReceipt({ session, onClose }: Props) {
  const tx = session.transaction;
  const cashPaid = tx?.cashPaid ?? session.totalAmount;
  const change = Math.max(0, cashPaid - session.totalAmount);
  const receiptNo = tx?.receiptNumber ?? 0;
  const startTime = new Date(session.startTime);
  const endTime = new Date(session.endTime);
  const durationLabel =
    session.durationMinutes >= 60
      ? session.durationMinutes % 60 === 0
        ? `${session.durationMinutes / 60} Hr`
        : `${(session.durationMinutes / 60).toFixed(1)} Hr`
      : `${session.durationMinutes} Min`;

  const fTime = (d: Date) => format(d, "hh:mm a");
  const fDate = (d: Date) => format(d, "M/d/yyyy");
  const fTk = (n: number) => `${n.toFixed(0)} Tk`;

  const paymentLabel =
    session.pricingType === "MEMBERSHIP"
      ? "Membership"
      : session.pricingType === "FIRST_TIME_FREE" && !tx
        ? "Free Trial"
        : tx?.paymentMethod === "MOBILE_WALLET"
          ? "Mobile Wallet"
          : tx?.paymentMethod === "CARD"
            ? "Card"
            : tx?.paymentMethod === "OTHER"
              ? "Other"
              : "Cash";

  return (
    <>
      {/* ── Screen overlay ── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 print:hidden">
        <div className="relative flex flex-col items-center gap-4">
          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/50 hover:bg-violet-500 transition"
            >
              <Printer size={16} />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 rounded-lg border border-gz-border bg-gz-card px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition"
            >
              <X size={16} />
              Close
            </button>
          </div>

          {/* Receipt preview */}
          <div id="receipt-preview" className="receipt-paper">
            <ReceiptContent
              zoneName={ZONE_NAME}
              zoneAddress={ZONE_ADDRESS}
              zoneContact={ZONE_CONTACT}
              zoneWeb={ZONE_WEB}
              receiptNo={receiptNo}
              customerName={session.customerName}
              customerPhone={session.customerPhone}
              staffName={session.staff?.name ?? null}
              date={fDate(startTime)}
              time={fTime(startTime)}
              deviceName={session.device.name}
              deviceType={session.device.type}
              playerCount={session.playerCount}
              pricingType={session.pricingType}
              appliedOfferCode={session.appliedOfferCode}
              hourlyRate={session.device.hourlyRate}
              startStr={fTime(startTime)}
              endStr={fTime(endTime)}
              durationLabel={durationLabel}
              totalAmount={session.totalAmount}
              discount={tx?.discount ?? 0}
              cashPaid={cashPaid}
              change={change}
              paymentLabel={paymentLabel}
              isCash={tx?.paymentMethod === "CASH"}
            />
          </div>
        </div>
      </div>

      {/* ── Actual print output: portal renders directly in <body> ── */}
      {createPortal(
        <div className="receipt-paper-print">
          <ReceiptContent
            zoneName={ZONE_NAME}
            zoneAddress={ZONE_ADDRESS}
            zoneContact={ZONE_CONTACT}
            zoneWeb={ZONE_WEB}
            receiptNo={receiptNo}
            customerName={session.customerName}
            customerPhone={session.customerPhone}
            staffName={session.staff?.name ?? null}
            date={fDate(startTime)}
            time={fTime(startTime)}
            deviceName={session.device.name}
            deviceType={session.device.type}
            playerCount={session.playerCount}
            pricingType={session.pricingType}
            appliedOfferCode={session.appliedOfferCode}
            hourlyRate={session.device.hourlyRate}
            startStr={fTime(startTime)}
            endStr={fTime(endTime)}
            durationLabel={durationLabel}
            totalAmount={session.totalAmount}
            discount={tx?.discount ?? 0}
            cashPaid={cashPaid}
            change={change}
            paymentLabel={paymentLabel}
            isCash={tx?.paymentMethod === "CASH"}
          />
        </div>,
        document.body,
      )}
    </>
  );
}

interface ContentProps {
  zoneName: string;
  zoneAddress: string;
  zoneContact: string;
  zoneWeb: string;
  receiptNo: number;
  customerName: string | null;
  customerPhone: string | null;
  staffName: string | null;
  date: string;
  time: string;
  deviceName: string;
  deviceType: string;
  playerCount: number;
  pricingType: string;
  appliedOfferCode: string | null;
  hourlyRate: number;
  startStr: string;
  endStr: string;
  durationLabel: string;
  totalAmount: number;
  discount: number;
  cashPaid: number;
  change: number;
  paymentLabel: string;
  isCash: boolean;
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className={`receipt-row ${bold ? "font-bold" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Dashes() {
  return (
    <div className="receipt-dash">
      - - - - - - - - - - - - - - - - - - - - - - - -
    </div>
  );
}

function ReceiptContent(p: ContentProps) {
  const fTk = (n: number) => `${Math.round(n)} Tk`;

  return (
    <div className="receipt">
      {/* Header */}
      <div className="receipt-header">
        <div className="receipt-title">{p.zoneName}</div>
        {p.zoneAddress && <div className="receipt-sub">{p.zoneAddress}</div>}
      </div>

      <Dashes />

      {/* Meta */}
      <div className="receipt-meta">
        <div>
          <span className="receipt-label">Rcpt: </span>
          <span>{String(p.receiptNo).padStart(6, "0")}</span>
        </div>
        {p.customerName && (
          <div>
            <span className="receipt-label">Name: </span>
            <span className="font-semibold">
              {p.customerName.toUpperCase()}
            </span>
          </div>
        )}
        {p.customerPhone && (
          <div>
            <span className="receipt-label">Phone: </span>
            <span>{p.customerPhone}</span>
          </div>
        )}
        {p.staffName && (
          <div>
            <span className="receipt-label">Staff: </span>
            <span>{p.staffName}</span>
          </div>
        )}
        <div>
          <span className="receipt-label">Date: </span>
          <span>
            {p.date} • {p.time}
          </span>
        </div>
      </div>

      <Dashes />

      {/* Sessions */}
      <div className="receipt-section-title">GAMING SESSIONS</div>
      <Row label={p.deviceName} value={fTk(p.hourlyRate)} />

      <div className="receipt-slot-box">
        <span>
          {p.startStr} - {p.endStr}
        </span>
        <span>{p.durationLabel}</span>
      </div>

      <Dashes />

      {/* Summary */}
      <div className="receipt-section-title">SUMMARY</div>
      <Row label={`Total ${p.deviceType} Time:`} value={p.durationLabel} />
      <Row label="Players:" value={String(p.playerCount)} />
      <Row
        label="Mode:"
        value={
          p.pricingType === "FIRST_TIME_FREE"
            ? "First Free"
            : p.pricingType === "MEMBERSHIP"
              ? "Membership"
              : (p.appliedOfferCode ?? "Standard")
        }
      />

      {p.discount > 0 && (
        <Row label="Discount:" value={`-${fTk(p.discount)}`} />
      )}

      {/* Total box */}
      <div className="receipt-total-box">
        <span>TOTAL</span>
        <span>{fTk(p.totalAmount)}</span>
      </div>

      {/* Payment */}
      <div className="receipt-payment-box">
        <Row label="Payment:" value={p.paymentLabel} />
        {p.isCash && (
          <>
            <Row label="CASH Paid:" value={fTk(p.cashPaid)} />
            <Row label="Returned Amount:" value={fTk(p.change)} />
          </>
        )}
      </div>

      {/* Footer */}
      <Dashes />
      <div className="receipt-footer">
        <div className="font-bold">*** PAID ***</div>
        <div>Game on! Thanks for choosing {p.zoneName}</div>
        <Dashes />
        {p.zoneContact && <div>Contact: {p.zoneContact}</div>}
        {p.zoneWeb && <div>Web: {p.zoneWeb}</div>}
      </div>
    </div>
  );
}
