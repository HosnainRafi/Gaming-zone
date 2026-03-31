import { format } from "date-fns";
import { Pencil, Plus, Shield, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authApi, type AuthUser } from "../api/auth";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Select";
import { PageSpinner } from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";

export default function StaffPage() {
  const { user, refreshUser } = useAuth();
  const [staff, setStaff] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<
    "create" | "edit" | "account" | null
  >(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
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

  async function handleSave() {
    const passwordRequired = modalMode === "create";

    if (!form.name || !form.email || (passwordRequired && !form.password)) {
      toast.error("Fill all required fields");
      return;
    }

    setSaving(true);
    try {
      if (modalMode === "create") {
        await authApi.register(form);
        toast.success(`${form.name} added`);
      } else if (modalMode === "edit" && editingUserId) {
        await authApi.updateStaff(editingUserId, {
          email: form.email,
          name: form.name,
          password: form.password || undefined,
          role: form.role,
        });
        toast.success("Staff updated");
      } else if (modalMode === "account") {
        await authApi.updateMe({
          email: form.email,
          name: form.name,
          password: form.password || undefined,
        });
        await refreshUser();
        toast.success("Account updated");
      }

      setModalMode(null);
      setEditingUserId(null);
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

  function openCreate() {
    setForm({ name: "", email: "", password: "", role: "STAFF" });
    setEditingUserId(null);
    setModalMode("create");
  }

  function openEdit(target: AuthUser) {
    setForm({
      name: target.name ?? "",
      email: target.email,
      password: "",
      role: target.role,
    });
    setEditingUserId(target.id);
    setModalMode(target.id === user?.id ? "account" : "edit");
  }

  async function handleDelete(target: AuthUser) {
    if (!confirm(`Delete ${target.name ?? target.email}?`)) return;
    try {
      await authApi.deleteStaff(target.id);
      toast.success("User removed");
      void load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? "Delete failed";
      toast.error(msg);
    }
  }

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Staff</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {staff.length} team members
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => user && openEdit(user)}
          >
            <Pencil size={14} />
            My Account
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus size={14} />
            Add Staff
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((s) => (
          <Card key={s.id}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-400">
                  {s.role === "ADMIN" ? (
                    <Shield size={22} />
                  ) : (
                    <User size={22} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {s.name ?? "—"}
                  </p>
                  <p className="truncate text-xs text-slate-500">{s.email}</p>
                  <span
                    className={`mt-1 inline-block text-[10px] font-semibold uppercase tracking-wide ${s.role === "ADMIN" ? "text-violet-400" : "text-cyan-400"}`}
                  >
                    {s.role}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
                  <Pencil size={13} />
                </Button>
                {s.id !== user?.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-red-400"
                    onClick={() => void handleDelete(s)}
                  >
                    <Trash2 size={13} />
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-3 border-t border-gz-border pt-3">
              <p className="text-[11px] text-slate-600">
                Joined{" "}
                {s.createdAt
                  ? format(new Date(s.createdAt), "dd MMM yyyy")
                  : "—"}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={modalMode !== null}
        onClose={() => setModalMode(null)}
        title={
          modalMode === "create"
            ? "Add Staff Member"
            : modalMode === "account"
              ? "Update My Account"
              : "Edit Staff Member"
        }
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
            label={
              modalMode === "create" ? "Password" : "New Password (optional)"
            }
            type="password"
            placeholder={
              modalMode === "create"
                ? "Min 6 characters"
                : "Leave blank to keep current password"
            }
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
          />
          {modalMode !== "account" && (
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
          )}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setModalMode(null)}
            >
              Cancel
            </Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
