import clsx from "clsx";
import {
  Clock,
  CreditCard,
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
import { membershipApi, type MemberLookup } from "../api/memberships";
import { offerApi, type OfferValidation } from "../api/offers";
import type {
  PaymentMethod,
  Session,
  SessionPricingType,
} from "../api/sessions";
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
import {
  calcPrice,
  formatBDT,
  formatMs,
  remainingMsFromEndTime,
} from "../utils/format";

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
  customerPhone: string;
  durationMinutes: number;
  customMinutes: string;
  pricingType: SessionPricingType;
  playerCount: number;
  paymentMethod: PaymentMethod;
  offerCode: string;
  cashPaid: string;
}

function isConsoleDevice(type: string) {
  const normalizedType = type.toUpperCase();
  return normalizedType.includes("PS4") || normalizedType.includes("PS5");
}

function getExtraPlayerHourlyRate(type: string) {
  const normalizedType = type.toUpperCase();
  if (normalizedType.includes("PS4")) return 50;
  if (normalizedType.includes("PS5")) return 60;
  return 0;
}

export default function DevicesPage() {
  const { user } = useAuth();
  const { connectionMode, timers, on, off } = useSocket();
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Start Session modal state
  const [startDevice, setStartDevice] = useState<Device | null>(null);
  const [form, setForm] = useState<StartForm>({
    customerName: "",
    customerPhone: "",
    durationMinutes: 60,
    customMinutes: "60",
    pricingType: "STANDARD",
    playerCount: 1,
    paymentMethod: "CASH",
    offerCode: "",
    cashPaid: "",
  });
  const [offerResult, setOfferResult] = useState<OfferValidation | null>(null);
  const [offerChecking, setOfferChecking] = useState(false);
  const [memberLookup, setMemberLookup] = useState<MemberLookup | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
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
      const [deviceData, activeSessionData] = await Promise.all([
        deviceApi.list(),
        sessionApi.active(),
      ]);
      setDevices(deviceData);
      setActiveSessions(activeSessionData);
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

  useEffect(() => {
    if (activeSessions.length === 0) return;

    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeSessions.length]);

  useEffect(() => {
    if (connectionMode === "realtime") return;

    const intervalId = window.setInterval(() => {
      void loadDevices(true);
    }, 15_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [connectionMode, loadDevices]);

  // --- Price calculation ---
  const effectiveMinutes =
    form.durationMinutes === -1
      ? parseInt(form.customMinutes) || 0
      : form.durationMinutes;
  const extraPlayerHourlyRate =
    startDevice && isConsoleDevice(startDevice.type) && form.playerCount > 2
      ? getExtraPlayerHourlyRate(startDevice.type) * (form.playerCount - 2)
      : 0;
  const effectiveHourlyRate = startDevice
    ? startDevice.hourlyRate + extraPlayerHourlyRate
    : 0;
  const basePrice = startDevice
    ? calcPrice(effectiveHourlyRate, effectiveMinutes)
    : 0;
  const firstFreeDiscount =
    form.pricingType === "FIRST_TIME_FREE"
      ? calcPrice(effectiveHourlyRate, Math.min(30, effectiveMinutes))
      : 0;
  const subtotalBeforeOffer =
    form.pricingType === "MEMBERSHIP"
      ? 0
      : Math.max(0, basePrice - firstFreeDiscount);
  const finalPrice =
    form.pricingType === "MEMBERSHIP"
      ? 0
      : offerResult
        ? offerResult.finalAmount
        : subtotalBeforeOffer;

  async function handleLookupMember() {
    if (!form.customerPhone.trim()) {
      setMemberLookup(null);
      return;
    }

    setLookupLoading(true);
    try {
      const result = await membershipApi.lookup(form.customerPhone.trim());
      setMemberLookup(result);
      setForm((current) => ({
        ...current,
        customerName: current.customerName || result.name,
      }));
    } catch {
      setMemberLookup(null);
    } finally {
      setLookupLoading(false);
    }
  }

  // --- Offer validation ---
  async function validateOffer() {
    if (
      !form.offerCode.trim() ||
      !startDevice ||
      form.pricingType === "MEMBERSHIP"
    )
      return;
    setOfferChecking(true);
    setOfferResult(null);
    try {
      const result = await offerApi.validate(
        form.offerCode,
        subtotalBeforeOffer,
        effectiveMinutes,
        effectiveHourlyRate,
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

    if (!form.customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    if (
      (form.pricingType === "MEMBERSHIP" ||
        form.pricingType === "FIRST_TIME_FREE") &&
      !form.customerPhone.trim()
    ) {
      toast.error("Phone number is required for membership and free play");
      return;
    }

    if (!isConsoleDevice(startDevice.type) && form.playerCount !== 1) {
      toast.error("Only PS4 and PS5 support multiple players");
      return;
    }

    if (
      form.pricingType === "MEMBERSHIP" &&
      (!memberLookup?.activeMembership ||
        memberLookup.activeMembership.remainingMinutes < effectiveMinutes)
    ) {
      toast.error("No active membership with enough remaining time");
      return;
    }

    if (
      form.pricingType === "FIRST_TIME_FREE" &&
      memberLookup?.hasClaimedFirstFree
    ) {
      toast.error("This customer has already used first-time free play");
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
        pricingType: form.pricingType,
        paymentMethod: form.paymentMethod,
        offerCode:
          form.pricingType === "STANDARD"
            ? form.offerCode.trim() || undefined
            : undefined,
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim() || undefined,
        playerCount: form.playerCount,
        cashPaid: form.pricingType === "MEMBERSHIP" ? 0 : cashPaidNum,
      });
      toast.success(`Session started on ${startDevice.name}`);
      setStartDevice(null);
      setOfferResult(null);
      setMemberLookup(null);
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
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Devices
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {available.length} available · {running.length} running ·{" "}
            {devices.length} total
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
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
            {running.map((d) => {
              const activeSession = activeSessions.find(
                (session) => session.deviceId === d.id,
              );
              const timer = activeSession
                ? (timers[d.id] ?? {
                    remainingMs: remainingMsFromEndTime(
                      activeSession.endTime,
                      nowMs,
                    ),
                  })
                : undefined;

              return (
                <DeviceCard
                  key={d.id}
                  device={d}
                  timer={timer}
                  activeSession={activeSession}
                  onPrint={(session) => setReceiptSession(session)}
                  onEdit={user?.role === "ADMIN" ? openEditDevice : undefined}
                  onDelete={
                    user?.role === "ADMIN" ? handleDeleteDevice : undefined
                  }
                />
              );
            })}
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
                    customerPhone: "",
                    durationMinutes: 60,
                    customMinutes: "60",
                    pricingType: "STANDARD",
                    playerCount: 1,
                    paymentMethod: "CASH",
                    offerCode: "",
                    cashPaid: "",
                  });
                  setMemberLookup(null);
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
            <Input
              label="Customer Name"
              placeholder="e.g. Rafi"
              value={form.customerName}
              onChange={(e) =>
                setForm((f) => ({ ...f, customerName: e.target.value }))
              }
            />

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Phone Number (optional)
              </label>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-gz-border bg-gz-surface px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30"
                  placeholder="Needed for membership or free play"
                  value={form.customerPhone}
                  onChange={(e) => {
                    setForm((f) => ({
                      ...f,
                      customerPhone: e.target.value,
                      pricingType:
                        f.pricingType === "MEMBERSHIP"
                          ? "STANDARD"
                          : f.pricingType,
                    }));
                    setOfferResult(null);
                    setMemberLookup(null);
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLookupMember}
                  loading={lookupLoading}
                  disabled={!form.customerPhone.trim()}
                >
                  Lookup
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gz-border bg-gz-surface px-4 py-3">
              <div>
                <p className="font-semibold text-white">{startDevice.name}</p>
                <p className="text-xs text-slate-500">{startDevice.type}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Hourly Rate</p>
                <p className="font-display text-lg font-bold text-violet-400">
                  {formatBDT(effectiveHourlyRate)}
                  <span className="text-xs font-normal text-slate-500">
                    /hr
                  </span>
                </p>
              </div>
            </div>

            {memberLookup && (
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">
                      {memberLookup.name}
                    </p>
                    <p className="text-slate-400">{memberLookup.phone}</p>
                  </div>
                  <span className="rounded-full border border-gz-border bg-gz-surface px-2 py-1 text-[10px] uppercase tracking-wide text-slate-400">
                    {memberLookup.hasClaimedFirstFree
                      ? "Free used"
                      : "Free available"}
                  </span>
                </div>
                {memberLookup.activeMembership ? (
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-gz-border bg-gz-surface px-3 py-2">
                    <div>
                      <p className="text-slate-200">
                        {memberLookup.activeMembership.planName ??
                          memberLookup.activeMembership.planType ??
                          "Membership"}{" "}
                        membership
                      </p>
                      <p className="text-xs text-slate-500">
                        Expires{" "}
                        {new Date(
                          memberLookup.activeMembership.expiresAt,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-cyan-400">
                      {memberLookup.activeMembership.remainingHours} hours left
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2 text-slate-400">
                    <CreditCard size={14} className="text-violet-400" />
                    No active membership.
                  </div>
                )}
              </div>
            )}

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

            <Select
              label="Pricing Mode"
              value={form.pricingType}
              options={[
                { value: "STANDARD", label: "Standard billing" },
                ...(!memberLookup || !memberLookup.hasClaimedFirstFree
                  ? [
                      {
                        value: "FIRST_TIME_FREE",
                        label: "First-time free 30 min (phone required)",
                      },
                    ]
                  : []),
                ...(memberLookup?.activeMembership
                  ? [{ value: "MEMBERSHIP", label: "Use active membership" }]
                  : []),
              ]}
              onChange={(e) => {
                setForm((f) => ({
                  ...f,
                  pricingType: e.target.value as SessionPricingType,
                  offerCode: e.target.value === "STANDARD" ? f.offerCode : "",
                }));
                setOfferResult(null);
              }}
            />

            <Select
              label="Players"
              value={form.playerCount}
              options={
                isConsoleDevice(startDevice.type)
                  ? [
                      { value: 1, label: "1 player" },
                      { value: 2, label: "2 players included" },
                      {
                        value: 3,
                        label: startDevice.type.toUpperCase().includes("PS4")
                          ? "3 players · extra controller + Tk 50/hr"
                          : "3 players · extra controller + Tk 60/hr",
                      },
                      {
                        value: 4,
                        label: startDevice.type.toUpperCase().includes("PS4")
                          ? "4 players · 2 extra controllers + Tk 100/hr"
                          : "4 players · 2 extra controllers + Tk 120/hr",
                      },
                    ]
                  : [{ value: 1, label: "1 player" }]
              }
              onChange={(e) => {
                setForm((f) => ({
                  ...f,
                  playerCount: parseInt(e.target.value),
                }));
                setOfferResult(null);
              }}
            />

            <Select
              label="Payment Method"
              options={PAYMENT_METHODS}
              value={form.paymentMethod}
              disabled={form.pricingType === "MEMBERSHIP"}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  paymentMethod: e.target.value as PaymentMethod,
                }))
              }
            />

            {form.pricingType === "STANDARD" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Offer Code (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-gz-border bg-gz-surface px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30"
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
            )}

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
                disabled={form.pricingType === "MEMBERSHIP"}
              />
            )}
            {form.paymentMethod === "CASH" &&
              form.pricingType !== "MEMBERSHIP" &&
              form.cashPaid &&
              parseFloat(form.cashPaid) >= finalPrice && (
                <p className="-mt-3 text-xs text-green-400">
                  Change: {formatBDT(parseFloat(form.cashPaid) - finalPrice)}
                </p>
              )}

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
              {extraPlayerHourlyRate > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    Extra controller charge
                  </span>
                  <span className="text-slate-300">
                    +
                    {formatBDT(
                      calcPrice(extraPlayerHourlyRate, effectiveMinutes),
                    )}
                  </span>
                </div>
              )}
              {firstFreeDiscount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-400">First 30 min free</span>
                  <span className="text-green-400">
                    -{formatBDT(firstFreeDiscount)}
                  </span>
                </div>
              )}
              {offerResult && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-400">Discount</span>
                  <span className="text-green-400">
                    -{formatBDT(offerResult.discount)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-gz-border pt-2">
                <span className="font-semibold text-white">Total</span>
                <span className="font-display text-xl font-bold text-violet-400">
                  {formatBDT(finalPrice)}
                </span>
              </div>
              {effectiveMinutes < 30 && (
                <p className="text-xs text-red-400 text-center pt-1">
                  Minimum 30 minutes required
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setStartDevice(null);
                  setMemberLookup(null);
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
  activeSession?: Session;
  onStart?: () => void;
  onPrint?: (session: Session) => void;
  onEdit?: (d: Device) => void;
  onDelete?: (d: Device) => void;
}

function DeviceCard({
  device,
  timer,
  activeSession,
  onStart,
  onPrint,
  onEdit,
  onDelete,
}: DeviceCardProps) {
  const isRunning = device.status === "RUNNING";
  const isAvailable = device.status === "AVAILABLE";

  return (
    <div
      className={clsx(
        "group relative flex flex-col gap-4 rounded-xl border bg-gz-card p-5 transition-all duration-200",
        isRunning
          ? "border-violet-500/40 shadow-lg shadow-violet-900/20"
          : isAvailable
            ? "border-gz-border hover:border-green-500/30 hover:shadow-lg hover:shadow-green-900/10"
            : "border-gz-border opacity-70",
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
        {isRunning && activeSession && onPrint && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onPrint(activeSession)}
          >
            <Printer size={14} />
            Print Again
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
