import { format } from "date-fns";
import { Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { offerApi, type Offer, type OfferType } from "../api/offers";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Select";
import { PageSpinner } from "../components/ui/Spinner";
import { formatBDT } from "../utils/format";

interface OfferForm {
  code: string;
  type: OfferType;
  value: string;
  freeMinutes: string;
  expiry: string;
}

const defaultForm = (): OfferForm => ({
  code: "",
  type: "PERCENT",
  value: "",
  freeMinutes: "",
  expiry: "",
});

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; offer?: Offer }>({
    open: false,
  });
  const [form, setForm] = useState<OfferForm>(defaultForm());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setOffers(await offerApi.list());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  function openAdd() {
    setForm(defaultForm());
    setModal({ open: true });
  }

  function openEdit(o: Offer) {
    setForm({
      code: o.code,
      type: o.type,
      value: String(o.value),
      freeMinutes: o.freeMinutes ? String(o.freeMinutes) : "",
      expiry: o.expiry.slice(0, 16),
    });
    setModal({ open: true, offer: o });
  }

  async function handleSave() {
    if (!form.code || !form.expiry) {
      toast.error("Fill all fields");
      return;
    }
    if (form.type === "TIME_BASED" && !form.freeMinutes) {
      toast.error("Free minutes is required for time-based offers");
      return;
    }
    if (form.type !== "TIME_BASED" && !form.value) {
      toast.error("Value is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: form.code,
        type: form.type,
        value: parseFloat(form.value) || 0,
        expiry: new Date(form.expiry).toISOString(),
        ...(form.type === "TIME_BASED" && form.freeMinutes
          ? { freeMinutes: parseInt(form.freeMinutes) }
          : {}),
      };
      if (modal.offer) {
        await offerApi.update(modal.offer.id, payload);
        toast.success("Offer updated");
      } else {
        await offerApi.create(payload);
        toast.success("Offer created");
      }
      setModal({ open: false });
      void load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? "Save failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(o: Offer) {
    try {
      await offerApi.update(o.id, { isActive: !o.isActive });
      void load();
    } catch {
      toast.error("Failed to update");
    }
  }

  async function handleDelete(o: Offer) {
    if (!confirm(`Delete offer "${o.code}"?`)) return;
    try {
      await offerApi.delete(o.id);
      toast.success("Offer deleted");
      void load();
    } catch {
      toast.error("Delete failed");
    }
  }

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Offers</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Discount codes &amp; promotions
          </p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus size={14} />
          Add Offer
        </Button>
      </div>

      {offers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-600">
          <Tag size={48} className="opacity-30 mb-3" />
          <p className="text-sm">No offers yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((o) => {
            const expired = new Date(o.expiry) < new Date();
            return (
              <Card key={o.id} glow={o.isActive && !expired}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-display text-lg font-bold text-white tracking-wider">
                      {o.code}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Expires {format(new Date(o.expiry), "dd MMM yyyy")}
                    </p>
                  </div>
                  <Badge
                    status={!o.isActive || expired ? "DISABLED" : "AVAILABLE"}
                    label={
                      expired ? "expired" : o.isActive ? "active" : "inactive"
                    }
                  />
                </div>

                <div className="rounded-lg bg-gz-surface border border-gz-border px-4 py-3 mb-4">
                  <p className="text-xs text-slate-500 mb-1">Discount</p>
                  <p className="font-display text-2xl font-bold text-violet-400">
                    {o.type === "PERCENT"
                      ? `${o.value}%`
                      : o.type === "TIME_BASED"
                        ? `${o.freeMinutes} min free`
                        : formatBDT(o.value)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {o.type === "PERCENT"
                      ? "Percentage discount"
                      : o.type === "TIME_BASED"
                        ? "Time-based (first N min free)"
                        : "Fixed amount off"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={o.isActive ? "ghost" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleToggle(o)}
                  >
                    {o.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(o)}>
                    <Pencil size={13} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(o)}
                    className="hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.offer ? "Edit Offer" : "Create Offer"}
      >
        <div className="space-y-4">
          <Input
            label="Code"
            placeholder="GAMEON20"
            value={form.code}
            onChange={(e) =>
              setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
            }
          />
          <Select
            label="Type"
            options={[
              { value: "PERCENT", label: "Percentage (%)" },
              { value: "FIXED", label: "Fixed Amount (৳)" },
              { value: "TIME_BASED", label: "Time-Based (Free Minutes)" },
            ]}
            value={form.type}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                type: e.target.value as OfferType,
              }))
            }
          />
          {form.type === "TIME_BASED" ? (
            <Input
              label="Free Minutes"
              type="number"
              min={1}
              placeholder="e.g. 30"
              value={form.freeMinutes}
              onChange={(e) =>
                setForm((f) => ({ ...f, freeMinutes: e.target.value }))
              }
            />
          ) : (
            <Input
              label={form.type === "PERCENT" ? "Value (%)" : "Value (৳)"}
              type="number"
              min={0}
              placeholder={form.type === "PERCENT" ? "e.g. 20" : "e.g. 50"}
              value={form.value}
              onChange={(e) =>
                setForm((f) => ({ ...f, value: e.target.value }))
              }
            />
          )}
          <Input
            label="Expiry Date"
            type="datetime-local"
            value={form.expiry}
            onChange={(e) => setForm((f) => ({ ...f, expiry: e.target.value }))}
          />
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setModal({ open: false })}
            >
              Cancel
            </Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>
              {modal.offer ? "Save Changes" : "Create Offer"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
