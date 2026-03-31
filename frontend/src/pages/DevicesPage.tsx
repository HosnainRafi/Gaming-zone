import clsx from "clsx";
import {
  Clock,
  Gamepad2,
  MonitorPlay,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { deviceApi, type Device } from "../api/devices";
import { offerApi, type OfferValidation } from "../api/offers";
import type { PaymentMethod, Session } from "../api/sessions";
import { sessionApi } from "../api/sessions";
import { PrintReceipt } from "../components/PrintReceipt";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Select";
import { PageSpinner } from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { calcPrice, formatBDT, formatMs } from "../utils/format";

const TIME_SLOTS = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 120, label: "2 hours" },
  { value: -1, label: "Custom" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "MOBILE_WALLET", label: "Mobile Wallet" },
  { value: "OTHER", label: "Other" },
];

const DEVICE_TYPES = [
  "PC",
  "PS5",
  "PS4",
  "Racing Sim",
  "Arcade",
  "VR",
  "Other",
];

interface StartForm {
  customerName: string;
  durationMinutes: number;
  customMinutes: string;
  paymentMethod: PaymentMethod;
  offerCode: string;
  cashPaid: string;
}

export default function DevicesPage() {
  const { user } = useAuth();
  const { timers, on, off } = useSocket();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Start Session modal state
  const [startDevice, setStartDevice] = useState<Device | null>(null);
  const [form, setForm] = useState<StartForm>({
    customerName: "",
    durationMinutes: 60,
    customMinutes: "60",
    paymentMethod: "CASH",
    offerCode: "",
    cashPaid: "",
  });
  const [offerResult, setOfferResult] = useState<OfferValidation | null>(null);
  const [offerChecking, setOfferChecking] = useState(false);
  const [startLoading, setStartLoading] = useState(false);
  const [receiptSession, setReceiptSession] = useState<Session | null>(null);

  // Device form modal
  const [deviceModal, setDeviceModal] = useState<{
    open: boolean;
    device?: Device;
  }>({ open: false });
  const [deviceForm, setDeviceForm] = useState({
    name: "",
    type: "PC",
    hourlyRate: "",
    status: "AVAILABLE" as Device["status"],
  });
  const [deviceSaving, setDeviceSaving] = useState(false);

  const loadDevices = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await deviceApi.list();
      setDevices(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDevices();
    const handler = () => void loadDevices(true);
    on("devicesUpdated", handler);
    on("sessionEnded", handler);
    return () => {
      off("devicesUpdated", handler);
      off("sessionEnded", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDevices]);

  // --- Price calculation ---
  const effectiveMinutes =
    form.durationMinutes === -1
      ? parseInt(form.customMinutes) || 0
      : form.durationMinutes;
  const basePrice = startDevice
    ? calcPrice(startDevice.hourlyRate, effectiveMinutes)
    : 0;
  const finalPrice = offerResult ? offerResult.finalAmount : basePrice;

  // --- Offer validation ---
  async function validateOffer() {
    if (!form.offerCode.trim() || !startDevice) return;
    setOfferChecking(true);
    setOfferResult(null);
    try {
      const result = await offerApi.validate(
        form.offerCode,
        basePrice,
        effectiveMinutes,
        startDevice.hourlyRate,
      );
      setOfferResult(result);
      toast.success(`Offer applied: -${formatBDT(result.discount)}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? "Invalid offer code";
      toast.error(msg);
    } finally {
      setOfferChecking(false);
    }
  }

  // --- Start session ---
  async function handleStartSession() {
    if (!startDevice) return;
    if (effectiveMinutes < 30) {
      toast.error("Minimum 30 minutes required");
      return;
    }
    const cashPaidNum = form.cashPaid ? parseFloat(form.cashPaid) : finalPrice;
    if (form.paymentMethod === "CASH" && cashPaidNum < finalPrice) {
      toast.error("Cash paid cannot be less than total amount");
      return;
    }
    setStartLoading(true);
    try {
      const session = await sessionApi.start({
        deviceId: startDevice.id,
        durationMinutes: effectiveMinutes,
        paymentMethod: form.paymentMethod,
        offerCode: form.offerCode.trim() || undefined,
        customerName: form.customerName.trim() || undefined,
        cashPaid: cashPaidNum,
      });
      toast.success(`Session started on ${startDevice.name}`);
      setStartDevice(null);
      setOfferResult(null);
      setReceiptSession(session);
      void loadDevices(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? "Failed to start session";
      toast.error(msg);
    } finally {
      setStartLoading(false);
    }
  }

  // --- Device CRUD ---
  function openAddDevice() {
    setDeviceForm({
      name: "",
      type: "PC",
      hourlyRate: "",
      status: "AVAILABLE",
    });
    setDeviceModal({ open: true });
  }

  function openEditDevice(d: Device) {
    setDeviceForm({
      name: d.name,
      type: d.type,
      hourlyRate: String(d.hourlyRate),
      status: d.status,
    });
    setDeviceModal({ open: true, device: d });
  }

  async function handleSaveDevice() {
    if (!deviceForm.name || !deviceForm.type || !deviceForm.hourlyRate) {
      toast.error("Fill all fields");
      return;
    }
    setDeviceSaving(true);
    try {
      if (deviceModal.device) {
        await deviceApi.update(deviceModal.device.id, {
          name: deviceForm.name,
          type: deviceForm.type,
          hourlyRate: parseFloat(deviceForm.hourlyRate),
          status: deviceForm.status,
        });
        toast.success("Device updated");
      } else {
        await deviceApi.create({
          name: deviceForm.name,
          type: deviceForm.type,
          hourlyRate: parseFloat(deviceForm.hourlyRate),
        });
        toast.success("Device added");
      }
      setDeviceModal({ open: false });
      void loadDevices(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? "Save failed";
      toast.error(msg);
    } finally {
      setDeviceSaving(false);
    }
  }

  async function handleDeleteDevice(d: Device) {
    if (!confirm(`Delete "${d.name}"? This cannot be undone.`)) return;
    try {
      await deviceApi.delete(d.id);
      toast.success("Device deleted");
      void loadDevices(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? "Delete failed";
      toast.error(msg);
    }
  }

  if (loading) return <PageSpinner />;

  const available = devices.filter((d) => d.status === "AVAILABLE");
  const running = devices.filter((d) => d.status === "RUNNING");
  const other = devices.filter(
    (d) => d.status !== "AVAILABLE" && d.status !== "RUNNING",
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Devices
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {available.length} available · {running.length} running ·{" "}
            {devices.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void loadDevices(true)}
            loading={refreshing}
          >
            <RefreshCw size={14} />
            Refresh
          </Button>
          {user?.role === "ADMIN" && (
            <Button size="sm" onClick={openAddDevice}>
              <Plus size={14} />
              Add Device
            </Button>
          )}
        </div>
      </div>

      {/* RUNNING devices */}
      {running.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-400">
            Running ({running.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {running.map((d) => (
              <DeviceCard
                key={d.id}
                device={d}
                timer={timers[d.id]}
                onEdit={user?.role === "ADMIN" ? openEditDevice : undefined}
                onDelete={
                  user?.role === "ADMIN" ? handleDeleteDevice : undefined
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* AVAILABLE devices */}
      {available.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-green-400">
            Available ({available.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {available.map((d) => (
              <DeviceCard
                key={d.id}
                device={d}
                onStart={() => {
                  setStartDevice(d);
                  setForm({
                    customerName: "",
                    durationMinutes: 60,
                    customMinutes: "60",
                    paymentMethod: "CASH",
                    offerCode: "",
                    cashPaid: "",
                  });
                  setOfferResult(null);
                }}
                onEdit={user?.role === "ADMIN" ? openEditDevice : undefined}
                onDelete={
                  user?.role === "ADMIN" ? handleDeleteDevice : undefined
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* OTHER statuses */}
      {other.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Other ({other.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {other.map((d) => (
              <DeviceCard
                key={d.id}
                device={d}
                onEdit={user?.role === "ADMIN" ? openEditDevice : undefined}
                onDelete={
                  user?.role === "ADMIN" ? handleDeleteDevice : undefined
                }
              />
            ))}
          </div>
        </section>
      )}

      {devices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-600">
          <MonitorPlay size={48} className="mb-3 opacity-30" />
          <p className="text-sm">No devices yet. Add your first device.</p>
        </div>
      )}

      {/* === Start Session Modal === */}
      <Modal
        open={!!startDevice}
        onClose={() => {
          setStartDevice(null);
          setOfferResult(null);
        }}
        title={`Start Session — ${startDevice?.name}`}
        size="md"
      >
        {startDevice && (
          <div className="space-y-5">
            {/* Customer name */}
            <Input
              label="Customer Name"
              placeholder="e.g. Rafi (required for receipt)"
              value={form.customerName}
              onChange={(e) =>
                setForm((f) => ({ ...f, customerName: e.target.value }))
              }
            />

            {/* Device info */}
            <div className="rounded-lg border border-[#1e1e30] bg-[#0f0f1a] px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{startDevice.name}</p>
                <p className="text-xs text-slate-500">{startDevice.type}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Hourly Rate</p>
                <p className="font-display text-lg font-bold text-violet-400">
                  {formatBDT(startDevice.hourlyRate)}
                  <span className="text-xs font-normal text-slate-500">
                    /hr
                  </span>
                </p>
              </div>
            </div>

            {/* Time slot */}
            <Select
              label="Time Slot"
              options={TIME_SLOTS.map((t) => ({
                value: t.value,
                label: t.label,
              }))}
              value={form.durationMinutes}
              onChange={(e) => {
                setForm((f) => ({
                  ...f,
                  durationMinutes: parseInt(e.target.value),
                }));
                setOfferResult(null);
              }}
            />
            {form.durationMinutes === -1 && (
              <Input
                label="Custom Duration (minutes, min 30)"
                type="number"
                min={30}
                value={form.customMinutes}
                onChange={(e) => {
                  setForm((f) => ({ ...f, customMinutes: e.target.value }));
                  setOfferResult(null);
                }}
              />
            )}

            {/* Payment method */}
            <Select
              label="Payment Method"
              options={PAYMENT_METHODS}
              value={form.paymentMethod}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  paymentMethod: e.target.value as PaymentMethod,
                }))
              }
            />

            {/* Offer code */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Offer Code (optional)
              </label>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-[#1e1e30] bg-[#0f0f1a] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 transition"
                  placeholder="e.g. GAMEON20"
                  value={form.offerCode}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, offerCode: e.target.value }));
                    setOfferResult(null);
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={validateOffer}
                  loading={offerChecking}
                  disabled={!form.offerCode.trim()}
                >
                  Apply
                </Button>
              </div>
              {offerResult && (
                <p className="text-xs text-green-400">
                  ✓ -{formatBDT(offerResult.discount)} (
                  {offerResult.type === "PERCENT"
                    ? `${offerResult.value}%`
                    : offerResult.type === "TIME_BASED"
                      ? `First ${offerResult.freeMinutes} min free`
                      : "fixed"}
                  )
                </p>
              )}
            </div>

            {/* Cash Paid (CASH only) */}
            {form.paymentMethod === "CASH" && (
              <Input
                label="Cash Received (Tk)"
                type="number"
                min={finalPrice}
                placeholder={String(Math.ceil(finalPrice))}
                value={form.cashPaid}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cashPaid: e.target.value }))
                }
              />
            )}
            {form.paymentMethod === "CASH" &&
              form.cashPaid &&
              parseFloat(form.cashPaid) >= finalPrice && (
                <p className="-mt-3 text-xs text-green-400">
                  Change: {formatBDT(parseFloat(form.cashPaid) - finalPrice)}
                </p>
              )}

            {/* Price summary */}
            <div
              className={clsx(
                "rounded-lg border px-4 py-4 space-y-2",
                effectiveMinutes < 30
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-violet-500/30 bg-violet-500/5",
              )}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Duration</span>
                <span className="font-medium text-white flex items-center gap-1.5">
                  <Clock size={13} className="text-violet-400" />
                  {effectiveMinutes >= 60
                    ? `${(effectiveMinutes / 60).toFixed(1)}h`
                    : `${effectiveMinutes} min`}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Base Price</span>
                <span className="text-slate-300">{formatBDT(basePrice)}</span>
              </div>
              {offerResult && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-400">Discount</span>
                  <span className="text-green-400">
                    -{formatBDT(offerResult.discount)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-[#1e1e30] pt-2">
                <span className="font-semibold text-white">Total</span>
                <span className="font-display text-xl font-bold text-violet-400">
                  {formatBDT(finalPrice)}
                </span>
              </div>
              {effectiveMinutes < 30 && (
                <p className="text-xs text-red-400 text-center pt-1">
                  ⚠ Minimum 30 minutes required
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setStartDevice(null);
                  setOfferResult(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                loading={startLoading}
                disabled={effectiveMinutes < 30}
                onClick={handleStartSession}
              >
                <Printer size={16} />
                Collect {formatBDT(finalPrice)} & Print
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* === Print Receipt === */}
      {receiptSession && (
        <PrintReceipt
          session={receiptSession}
          onClose={() => setReceiptSession(null)}
        />
      )}

      {/* === Add/Edit Device Modal === */}
      <Modal
        open={deviceModal.open}
        onClose={() => setDeviceModal({ open: false })}
        title={deviceModal.device ? "Edit Device" : "Add Device"}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="e.g. PC Station 01"
            value={deviceForm.name}
            onChange={(e) =>
              setDeviceForm((f) => ({ ...f, name: e.target.value }))
            }
          />
          <Select
            label="Type"
            options={DEVICE_TYPES.map((t) => ({ value: t, label: t }))}
            value={deviceForm.type}
            onChange={(e) =>
              setDeviceForm((f) => ({ ...f, type: e.target.value }))
            }
          />
          <Input
            label="Hourly Rate (৳)"
            type="number"
            min={0}
            placeholder="e.g. 70"
            value={deviceForm.hourlyRate}
            onChange={(e) =>
              setDeviceForm((f) => ({ ...f, hourlyRate: e.target.value }))
            }
          />
          {deviceModal.device && (
            <Select
              label="Status"
              options={[
                { value: "AVAILABLE", label: "Available" },
                { value: "MAINTENANCE", label: "Maintenance" },
                { value: "DISABLED", label: "Disabled" },
              ]}
              value={deviceForm.status}
              onChange={(e) =>
                setDeviceForm((f) => ({
                  ...f,
                  status: e.target.value as Device["status"],
                }))
              }
            />
          )}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setDeviceModal({ open: false })}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              loading={deviceSaving}
              onClick={handleSaveDevice}
            >
              {deviceModal.device ? "Save Changes" : "Add Device"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ---- Device Card Component ----
interface TimerUpdate {
  remainingMs: number;
}

interface DeviceCardProps {
  device: Device;
  timer?: TimerUpdate;
  onStart?: () => void;
  onEdit?: (d: Device) => void;
  onDelete?: (d: Device) => void;
}

function DeviceCard({
  device,
  timer,
  onStart,
  onEdit,
  onDelete,
}: DeviceCardProps) {
  const isRunning = device.status === "RUNNING";
  const isAvailable = device.status === "AVAILABLE";

  return (
    <div
      className={clsx(
        "group relative rounded-xl border bg-[#13131f] p-5 flex flex-col gap-4 transition-all duration-200",
        isRunning
          ? "border-violet-500/40 shadow-lg shadow-violet-900/20"
          : isAvailable
            ? "border-[#1e1e30] hover:border-green-500/30 hover:shadow-lg hover:shadow-green-900/10"
            : "border-[#1e1e30] opacity-70",
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-white leading-tight">
            {device.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{device.type}</p>
        </div>
        <Badge status={device.status} />
      </div>

      {/* Timer or Rate */}
      <div className="flex items-center gap-2">
        {isRunning && timer ? (
          <div className="flex items-center gap-2 rounded-lg bg-violet-500/10 px-3 py-2 w-full">
            <Clock size={14} className="text-violet-400 shrink-0" />
            <span className="font-mono font-bold text-violet-400 text-lg tracking-widest">
              {formatMs(timer.remainingMs)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-500">Hourly Rate</span>
            <span className="font-display font-bold text-slate-300">
              {formatBDT(device.hourlyRate)}
              <span className="text-xs font-normal text-slate-600">/hr</span>
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        {isAvailable && onStart && (
          <Button size="sm" className="flex-1" onClick={onStart}>
            <Gamepad2 size={14} />
            Start
          </Button>
        )}
        {(onEdit ?? onDelete) && (
          <div className="flex gap-1 ml-auto">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(device)}>
                <Pencil size={13} />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(device)}
                className="hover:text-red-400"
              >
                <Trash2 size={13} />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
