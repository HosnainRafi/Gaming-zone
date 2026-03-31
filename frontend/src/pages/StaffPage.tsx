import { format } from "date-fns";
import { Plus, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authApi, type AuthUser } from "../api/auth";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Select";
import { PageSpinner } from "../components/ui/Spinner";

export default function StaffPage() {
  const [staff, setStaff] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF" as "ADMIN" | "STAFF",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setStaff(await authApi.staff());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  async function handleAdd() {
    if (!form.name || !form.email || !form.password) {
      toast.error("Fill all fields");
      return;
    }
    setSaving(true);
    try {
      await authApi.register(form);
      toast.success(`${form.name} added`);
      setModal(false);
      void load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? "Failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Staff</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {staff.length} team members
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setForm({ name: "", email: "", password: "", role: "STAFF" });
            setModal(true);
          }}
        >
          <Plus size={14} />
          Add Staff
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((s) => (
          <Card key={s.id}>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-400">
                {s.role === "ADMIN" ? <Shield size={22} /> : <User size={22} />}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">
                  {s.name ?? "—"}
                </p>
                <p className="text-xs text-slate-500 truncate">{s.email}</p>
                <span
                  className={`mt-1 inline-block text-[10px] font-semibold uppercase tracking-wide ${s.role === "ADMIN" ? "text-violet-400" : "text-cyan-400"}`}
                >
                  {s.role}
                </span>
              </div>
            </div>
            <div className="mt-3 border-t border-[#1e1e30] pt-3">
              <p className="text-[11px] text-slate-600">
                Joined{" "}
                {format(
                  new Date((s as unknown as { createdAt: string }).createdAt),
                  "dd MMM yyyy",
                )}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Add Staff Member"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Rakib Hossain"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            placeholder="staff@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min 6 characters"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
          />
          <Select
            label="Role"
            options={[
              { value: "STAFF", label: "Staff" },
              { value: "ADMIN", label: "Admin" },
            ]}
            value={form.role}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                role: e.target.value as "ADMIN" | "STAFF",
              }))
            }
          />
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setModal(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" loading={saving} onClick={handleAdd}>
              Add Staff
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
