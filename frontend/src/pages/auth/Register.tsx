import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Zap, User, Mail, Lock, Building2 } from "lucide-react";
import api from "../../api/client";

const FIELDS = [
  { key: "full_name",       label: "Full Name",       type: "text",     icon: User,      placeholder: "John Doe" },
  { key: "email",           label: "Email",           type: "email",    icon: Mail,      placeholder: "you@company.com" },
  { key: "password",        label: "Password",        type: "password", icon: Lock,      placeholder: "••••••••" },
  { key: "workspace_name",  label: "Workspace Name",  type: "text",     icon: Building2, placeholder: "My Business" },
] as const;

export default function Register() {
  const [form, setForm] = useState({ full_name: "", email: "", password: "", workspace_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const provider = localStorage.getItem("pending_gateway_provider");
    if (provider) {
      setPendingProvider(provider);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);

      // Auto-link pending credentials if any
      const provider = localStorage.getItem("pending_gateway_provider");
      const activeWorkspace = useAuthStore.getState().workspace;
      if (provider && activeWorkspace) {
        try {
          if (provider === "meta") {
            const creds = JSON.parse(localStorage.getItem("pending_whatsapp_creds") || "{}");
            if (creds.phone_number_id) {
              await api.put(`/workspaces/${activeWorkspace.id}/whatsapp`, creds);
              const updated = { ...activeWorkspace, whatsapp_provider: "meta", whatsapp_phone_number_id: creds.phone_number_id };
              useAuthStore.getState().setWorkspace(updated);
              localStorage.setItem("workspace", JSON.stringify(updated));
            }
          } else if (provider === "twilio") {
            const creds = JSON.parse(localStorage.getItem("pending_twilio_creds") || "{}");
            if (creds.account_sid) {
              const updated = await api.put(`/workspaces/${activeWorkspace.id}/twilio`, creds).then(r => r.data);
              useAuthStore.getState().setWorkspace({ ...activeWorkspace, ...updated });
              localStorage.setItem("workspace", JSON.stringify({ ...activeWorkspace, ...updated }));
            }
          }
        } catch (linkErr) {
          console.error("Failed to auto-link gateway:", linkErr);
        }
        localStorage.removeItem("pending_gateway_provider");
        localStorage.removeItem("pending_whatsapp_creds");
        localStorage.removeItem("pending_twilio_creds");
      }

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-900/40">
            <Zap size={22} className="text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-gray-400 text-sm mt-1">Start automating WhatsApp today</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-2xl">
          {pendingProvider && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-4 text-left animate-fade-in">
              <p className="text-xs font-bold text-emerald-400">⚡ Setup Sync Available</p>
              <p className="text-[10px] text-gray-405 mt-0.5 leading-relaxed">
                We detected the {pendingProvider === "meta" ? "Meta WhatsApp" : "Twilio Sandbox"} credentials you configured on the homepage. They will automatically link to your new workspace.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {FIELDS.map(({ key, label, type, icon: Icon, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
            ))}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-green-900/30 mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
