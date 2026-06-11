import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? "Login failed";
      toast.error(msg);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gz-bg p-4 overflow-hidden">
      {/* Animated background effects */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 -left-20 h-[400px] w-[400px] rounded-full bg-purple-500/8 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-20 top-1/3 h-[350px] w-[350px] rounded-full bg-cyan-500/5 blur-[100px]"
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 flex flex-col items-center text-center"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-2xl shadow-violet-900/50 ring-1 ring-violet-400/20"
          >
            <Gamepad2 size={32} className="text-white" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-white">
            Gaming Zone
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Management System — Staff Login
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative rounded-2xl border border-gz-border bg-gz-card/80 p-8 shadow-2xl backdrop-blur-xl"
        >
          {/* Card glow */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-violet-500/10 via-transparent to-transparent pointer-events-none" />

          <form onSubmit={handleSubmit} className="relative space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="staff@gamingzone.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
              size="lg"
            >
              Sign In
            </Button>
          </form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-xs text-slate-600"
        >
          © {new Date().getFullYear()} Gaming Zone. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}
