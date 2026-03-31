import { format } from "date-fns";
import {
  CreditCard,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  membershipApi,
  type MemberListItem,
  type MembershipPlan,
} from "../api/memberships";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Select";
import { PageSpinner } from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";
import { formatBDT } from "../utils/format";

export default function MembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [planSaving, setPlanSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    planId: "",
  });
  const [planForm, setPlanForm] = useState({
    name: "",
    price: "500",
    maxHours: "8",
    durationDays: "7",
    isActive: "true",
    sortOrder: "0",
  });

  async function load(search?: string) {
    setLoading(true);
    try {
      const [memberData, planData] = await Promise.all([
        membershipApi.list(search),
        membershipApi.listPlans(),
      ]);
      setMembers(memberData);
      setPlans(planData);
    } catch {
      toast.error("Failed to load memberships");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const activePlans = plans.filter((plan) => plan.isActive);
  const purchasePlanOptions = activePlans.map((plan) => ({
    value: plan.id,
    label: `${plan.name} · ${formatBDT(plan.price)} · ${plan.maxHours} hours`,
  }));
  const selectedPlan =
    plans.find((plan) => plan.id === form.planId) ?? activePlans[0] ?? null;

  function openSellModal() {
    if (activePlans.length === 0) {
      toast.error(
        user?.role === "ADMIN"
          ? "Create an active membership plan first"
          : "No active membership plan available",
      );
      return;
    }

    setForm({
      name: "",
      phone: "",
      planId: activePlans[0]?.id ?? "",
    });
    setModalOpen(true);
  }

  function openCreatePlan() {
    setEditingPlanId(null);
    setPlanForm({
      name: "",
      price: "500",
      maxHours: "8",
      durationDays: "7",
      isActive: "true",
      sortOrder: String(plans.length + 1),
    });
    setPlanModalOpen(true);
  }

  function openEditPlan(plan: MembershipPlan) {
    setEditingPlanId(plan.id);
    setPlanForm({
      name: plan.name,
      price: String(plan.price),
      maxHours: String(plan.maxHours),
      durationDays: String(plan.durationDays),
      isActive: String(plan.isActive),
      sortOrder: String(plan.sortOrder),
    });
    setPlanModalOpen(true);
  }

  async function handlePurchase() {
    if (!form.name.trim() || !form.phone.trim() || !form.planId) {
      toast.error("Name, phone, and plan are required");
      return;
    }

    setSaving(true);
    try {
      await membershipApi.purchase({
        name: form.name.trim(),
        phone: form.phone.trim(),
        planId: form.planId,
      });
      toast.success("Membership created");
      setModalOpen(false);
      setForm({ name: "", phone: "", planId: activePlans[0]?.id ?? "" });
      void load(query);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? "Failed to create membership";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePlan() {
    if (
      !planForm.name.trim() ||
      !planForm.price ||
      !planForm.maxHours ||
      !planForm.durationDays
    ) {
      toast.error("Fill all plan fields");
      return;
    }

    setPlanSaving(true);
    try {
      const payload = {
        name: planForm.name.trim(),
        price: Number(planForm.price),
        maxHours: Number(planForm.maxHours),
        durationDays: Number(planForm.durationDays),
        isActive: planForm.isActive === "true",
        sortOrder: Number(planForm.sortOrder || 0),
      };

      if (editingPlanId) {
        await membershipApi.updatePlan(editingPlanId, payload);
        toast.success("Plan updated");
      } else {
        await membershipApi.createPlan(payload);
        toast.success("Plan created");
      }

      setPlanModalOpen(false);
      setEditingPlanId(null);
      void load(query);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? "Failed to save plan";
      toast.error(message);
    } finally {
      setPlanSaving(false);
    }
  }

  async function handleDeletePlan(plan: MembershipPlan) {
    if (!confirm(`Delete membership plan \"${plan.name}\"?`)) return;

    try {
      await membershipApi.deletePlan(plan.id);
      toast.success("Plan deleted");
      void load(query);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? "Failed to delete plan";
      toast.error(message);
    }
  }

  if (loading && members.length === 0) return <PageSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Members
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Sell cards, track remaining hours, and manage plan pricing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {user?.role === "ADMIN" && (
            <Button size="sm" variant="outline" onClick={openCreatePlan}>
              <Plus size={14} />
              Add Plan
            </Button>
          )}
          <Button size="sm" onClick={openSellModal}>
            <CreditCard size={14} />
            Sell Membership
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-white">{plan.name}</h2>
                <p className="text-sm text-slate-400">
                  {formatBDT(plan.price)} · {plan.maxHours} hours ·{" "}
                  {plan.durationDays} days
                </p>
              </div>
              <span className="rounded-full border border-gz-border bg-gz-surface px-2.5 py-1 text-[10px] uppercase tracking-wide text-slate-400">
                {plan.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Sort order: {plan.sortOrder}</span>
              {user?.role === "ADMIN" && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditPlan(plan)}
                  >
                    <Pencil size={13} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-red-400"
                    onClick={() => void handleDeletePlan(plan)}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Search member"
              placeholder="Search by name or phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => void load(query)}>
            <Search size={14} />
            Search
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <Card key={member.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-white">{member.name}</h2>
                <p className="text-sm text-slate-400">{member.phone}</p>
              </div>
              <span className="rounded-full border border-gz-border bg-gz-surface px-2.5 py-1 text-[10px] uppercase tracking-wide text-slate-400">
                {member.hasClaimedFirstFree ? "Free used" : "Free eligible"}
              </span>
            </div>

            <div className="mt-4 rounded-xl border border-gz-border bg-gz-surface p-4">
              {member.latestMembership ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Plan</span>
                    <span className="font-medium text-white">
                      {member.latestMembership.planName ??
                        member.latestMembership.planType ??
                        "Membership"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Remaining</span>
                    <span className="text-cyan-400">
                      {member.latestMembership.remainingHours} hours
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Expiry</span>
                    <span className="text-slate-300">
                      {format(
                        new Date(member.latestMembership.expiresAt),
                        "dd MMM yyyy",
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Price</span>
                    <span className="text-green-400">
                      {formatBDT(member.latestMembership.price)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Sparkles size={14} className="text-violet-400" />
                  No membership sold yet.
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {members.length === 0 && !loading && (
        <Card>
          <p className="py-10 text-center text-sm text-slate-500">
            No members found.
          </p>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Sell Membership"
      >
        <div className="space-y-4">
          <Input
            label="Customer Name"
            placeholder="e.g. Rafi"
            value={form.name}
            onChange={(e) =>
              setForm((current) => ({ ...current, name: e.target.value }))
            }
          />
          <Input
            label="Phone Number"
            placeholder="01XXXXXXXXX"
            value={form.phone}
            onChange={(e) =>
              setForm((current) => ({ ...current, phone: e.target.value }))
            }
          />
          <Select
            label="Plan"
            value={form.planId}
            options={purchasePlanOptions}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                planId: e.target.value,
              }))
            }
          />
          {selectedPlan && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-sm text-slate-300">
              {selectedPlan.name}: {formatBDT(selectedPlan.price)} for up to{" "}
              {selectedPlan.maxHours} hours within {selectedPlan.durationDays}{" "}
              days.
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              loading={saving}
              onClick={handlePurchase}
            >
              Sell Card
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title={editingPlanId ? "Edit Membership Plan" : "Add Membership Plan"}
      >
        <div className="space-y-4">
          <Input
            label="Plan Name"
            placeholder="e.g. Weekend Pass"
            value={planForm.name}
            onChange={(e) =>
              setPlanForm((current) => ({ ...current, name: e.target.value }))
            }
          />
          <Input
            label="Price (Tk)"
            type="number"
            min={1}
            value={planForm.price}
            onChange={(e) =>
              setPlanForm((current) => ({ ...current, price: e.target.value }))
            }
          />
          <Input
            label="Hours Included"
            type="number"
            min={1}
            value={planForm.maxHours}
            onChange={(e) =>
              setPlanForm((current) => ({
                ...current,
                maxHours: e.target.value,
              }))
            }
          />
          <Input
            label="Valid For (days)"
            type="number"
            min={1}
            value={planForm.durationDays}
            onChange={(e) =>
              setPlanForm((current) => ({
                ...current,
                durationDays: e.target.value,
              }))
            }
          />
          <Input
            label="Sort Order"
            type="number"
            min={0}
            value={planForm.sortOrder}
            onChange={(e) =>
              setPlanForm((current) => ({
                ...current,
                sortOrder: e.target.value,
              }))
            }
          />
          <Select
            label="Status"
            value={planForm.isActive}
            options={[
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ]}
            onChange={(e) =>
              setPlanForm((current) => ({
                ...current,
                isActive: e.target.value,
              }))
            }
          />
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setPlanModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              loading={planSaving}
              onClick={handleSavePlan}
            >
              Save Plan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
