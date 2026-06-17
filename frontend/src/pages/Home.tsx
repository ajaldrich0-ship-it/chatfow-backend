import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  MessageSquare,
  Network,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Clock,
  Sparkles,
  ChevronRight,
  Send,
  Menu,
  X,
  Phone,
  Video,
  MoreVertical,
  Check,
  Activity,
  Layers,
  ArrowUpRight,
  Database,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import api from "../api/client";

interface Message {
  id: number;
  sender: "bot" | "user";
  text: string;
  buttons?: string[];
  time: string;
}

export default function Home() {
  const { token, workspace, setWorkspace } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Bot Simulator State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: "👋 Hello! Welcome to FlowWA Automation Demo. How can we help you scale your business today?",
      buttons: ["✨ View Services", "📞 Talk to Agent", "💡 What is FlowWA?"],
      time: "1:02 PM",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

  // Gateway Connection Simulator State
  const [gatewayProvider, setGatewayProvider] = useState<"meta" | "twilio">("meta");
  const [metaForm, setMetaForm] = useState({ phoneNumId: "", wabaId: "", token: "" });
  const [twilioForm, setTwilioForm] = useState({ accountSid: "", authToken: "", phone: "+14155238886" });
  const [valLoading, setValLoading] = useState(false);
  const [valSuccess, setValSuccess] = useState(false);
  const [valLogs, setValLogs] = useState<string[]>([]);

  // Newsletter state
  const [subscribedEmail, setSubscribedEmail] = useState("");
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribedEmail.trim()) return;
    setSubscribing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubscribing(false);
    setSubscribeSuccess(true);
    setTimeout(() => {
      setSubscribeSuccess(false);
      setSubscribedEmail("");
    }, 4000);
  };

  // Typewriter effect state
  const words = ["Visual Flows", "Smart Chatbots", "Bulk Campaigns", "Custom Webhooks"];
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Mouse Move Parallax position state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX - window.innerWidth / 2) / 35,
        y: (e.clientY - window.innerHeight / 2) / 35,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const activeWord = words[wordIndex];
    
    const tick = () => {
      if (!isDeleting) {
        setCurrentText(activeWord.substring(0, currentText.length + 1));
        if (currentText === activeWord) {
          timer = setTimeout(() => setIsDeleting(true), 2500);
          return;
        }
      } else {
        setCurrentText(activeWord.substring(0, currentText.length - 1));
        if (currentText === "") {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
      
      const speed = isDeleting ? 30 : 80;
      timer = setTimeout(tick, speed);
    };
    
    timer = setTimeout(tick, 100);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, wordIndex]);

  // Scroll Fade-In Observer Hook
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const elements = document.querySelectorAll(".scroll-anim");
    elements.forEach((el) => observer.observe(el));
    
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Load existing configuration on mount if authenticated or cached in localStorage
  useEffect(() => {
    if (token && workspace) {
      if (workspace.whatsapp_provider === "twilio") {
        setGatewayProvider("twilio");
        setTwilioForm((prev) => ({
          ...prev,
          phone: workspace.twilio_whatsapp_number || "+14155238886",
        }));
      } else {
        setGatewayProvider("meta");
        setMetaForm((prev) => ({
          ...prev,
          phoneNumId: workspace.whatsapp_phone_number_id || "",
        }));
      }
    } else {
      const cachedProvider = localStorage.getItem("pending_gateway_provider") as "meta" | "twilio";
      if (cachedProvider) {
        setGatewayProvider(cachedProvider);
        if (cachedProvider === "meta") {
          const cached = JSON.parse(localStorage.getItem("pending_whatsapp_creds") || "{}");
          setMetaForm({
            phoneNumId: cached.phone_number_id || "",
            wabaId: cached.business_account_id || "",
            token: cached.access_token || "",
          });
        } else if (cachedProvider === "twilio") {
          const cached = JSON.parse(localStorage.getItem("pending_twilio_creds") || "{}");
          setTwilioForm({
            accountSid: cached.account_sid || "",
            authToken: cached.auth_token || "",
            phone: cached.whatsapp_number || "+14155238886",
          });
        }
      }
    }
  }, [token, workspace]);

  const handleValidateGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    setValLoading(true);
    setValSuccess(false);
    setValLogs([]);

    if (gatewayProvider === "meta") {
      if (!metaForm.phoneNumId || !metaForm.wabaId || !metaForm.token) {
        alert("Please fill in all Meta WhatsApp fields.");
        setValLoading(false);
        return;
      }
    } else {
      if (!twilioForm.accountSid || !twilioForm.authToken || !twilioForm.phone) {
        alert("Please fill in all Twilio fields.");
        setValLoading(false);
        return;
      }
    }

    if (token && workspace) {
      try {
        setValLogs((prev) => [...prev, "📡 Connecting to FlowWA secure database..."]);
        await new Promise((resolve) => setTimeout(resolve, 400));

        if (gatewayProvider === "meta") {
          setValLogs((prev) => [...prev, "🔐 Uploading Meta Cloud credentials to active workspace..."]);
          const updatedWs = await api.put(`/workspaces/${workspace.id}/whatsapp`, {
            phone_number_id: metaForm.phoneNumId,
            access_token: metaForm.token,
            business_account_id: metaForm.wabaId,
          }).then((r) => r.data);
          setWorkspace({ ...workspace, ...updatedWs });
          localStorage.setItem("workspace", JSON.stringify({ ...workspace, ...updatedWs }));
        } else {
          setValLogs((prev) => [...prev, "🔐 Uploading Twilio Account credentials to active workspace..."]);
          const updatedWs = await api.put(`/workspaces/${workspace.id}/twilio`, {
            account_sid: twilioForm.accountSid,
            auth_token: twilioForm.authToken,
            whatsapp_number: twilioForm.phone,
          }).then((r) => r.data);
          setWorkspace({ ...workspace, ...updatedWs });
          localStorage.setItem("workspace", JSON.stringify({ ...workspace, ...updatedWs }));
        }

        setValLogs((prev) => [...prev, "🔄 Accessing webhook subscription verification status..."]);
        await new Promise((resolve) => setTimeout(resolve, 400));

        setValLogs((prev) => [...prev, "⚡ Initiating real-time endpoint handshake check..."]);
        const testRes = await api.get(`/workspaces/${workspace.id}/whatsapp/test`).then((r) => r.data);

        setValLogs((prev) => [
          ...prev,
          `✅ Connection Success! Connected as: ${testRes.verified_name || testRes.display_phone_number || "Active Gateway"}`,
        ]);
        setValSuccess(true);
      } catch (err: any) {
        const errorMsg = err.response?.data?.detail || err.message || "Failed to verify configuration.";
        setValLogs((prev) => [
          ...prev,
          `❌ Connection Failed: ${errorMsg}`,
          "💡 Double-check your credentials and verify permissions on Meta Developer / Twilio Console.",
        ]);
        setValSuccess(false);
      } finally {
        setValLoading(false);
      }
    } else {
      try {
        if (gatewayProvider === "meta") {
          localStorage.setItem("pending_gateway_provider", "meta");
          localStorage.setItem(
            "pending_whatsapp_creds",
            JSON.stringify({
              phone_number_id: metaForm.phoneNumId,
              access_token: metaForm.token,
              business_account_id: metaForm.wabaId,
            })
          );
        } else {
          localStorage.setItem("pending_gateway_provider", "twilio");
          localStorage.setItem(
            "pending_twilio_creds",
            JSON.stringify({
              account_sid: twilioForm.accountSid,
              auth_token: twilioForm.authToken,
              whatsapp_number: twilioForm.phone,
            })
          );
        }

        const steps = gatewayProvider === "meta"
          ? [
              "📡 Initializing connection to graph.facebook.com...",
              "🔐 Caching credentials for onboarding sync...",
              "🔍 Simulating validation query for WABA ID: " + metaForm.wabaId + "...",
              "✅ Local sandbox setup saved! Register/Sign In below to apply."
            ]
          : [
              "📡 Routing credentials to api.twilio.com endpoint...",
              "🔐 Caching credentials for onboarding sync...",
              "📞 Simulating Twilio connection to number: " + twilioForm.phone + "...",
              "✅ Local sandbox setup saved! Register/Sign In below to apply."
            ];

        for (let i = 0; i < steps.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          setValLogs((prev) => [...prev, steps[i]]);
        }
        setValSuccess(true);
      } catch (err) {
        console.error("Local caching error:", err);
      } finally {
        setValLoading(false);
      }
    }
  };


  // Scroll handler for floating header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSimulateUserOption = (option: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: option,
      time: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "";
      let replyButtons: string[] = [];

      if (option === "✨ View Services") {
        replyText = "🤖 Here are our key WhatsApp automation services:\n\n1. 📈 Broadcasts: Bulk messages safely\n2. 🔄 Interactive Chat Flows: Automate replies\n3. 🔗 Webhook & Pabbly integrations\n\nWould you like a demo or to start?";
        replyButtons = ["🚀 Sign Up Now", "📅 Book Demo", "⬅️ Back to Main Menu"];
      } else if (option === "📞 Talk to Agent") {
        replyText = "👨‍💻 Perfect! I have flagged this session. Our support representative will join this WhatsApp thread in under 2 minutes. Feel free to describe your query in the meantime!";
        replyButtons = ["⬅️ Back to Main Menu"];
      } else if (option === "💡 What is FlowWA?") {
        replyText = "⚡ FlowWA is a premium Visual WhatsApp Automation Platform. We help businesses design custom interactive chatbot flows, run bulk campaigns, and sync data instantly with tools like Pabbly & webhooks—all via the official WhatsApp Business API!";
        replyButtons = ["✨ View Services", "🚀 Sign Up Now"];
      } else if (option === "🚀 Sign Up Now") {
        replyText = "🎉 Awesome decision! Click the 'Get Started Free' button on this page to register your operator account and unlock instant setup.";
        replyButtons = ["⬅️ Back to Main Menu"];
      } else if (option === "📅 Book Demo") {
        replyText = "📅 Excellent! Our calendar is open. We will schedule a personalized walk-through to integrate the WhatsApp Cloud API with your dashboard.";
        replyButtons = ["⬅️ Back to Main Menu"];
      } else {
        replyText = "👋 Welcome back! Let me know what information you need next:";
        replyButtons = ["✨ View Services", "📞 Talk to Agent", "💡 What is FlowWA?"];
      }

      const botMsg: Message = {
        id: Date.now() + 1,
        sender: "bot",
        text: replyText,
        buttons: replyButtons,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      setTimeout(() => {
        const chatArea = document.getElementById("phone-chat-area");
        if (chatArea) {
          chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
        }
      }, 50);
    }, 1200);
  };

  const handleSendText = (text: string) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: text,
      time: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const chatArea = document.getElementById("phone-chat-area");
      if (chatArea) {
        chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
      }
    }, 50);

    setTimeout(() => {
      let replyText = "";
      let replyButtons: string[] = [];
      const cleanText = text.toLowerCase().trim();

      if (cleanText.includes("service") || cleanText.includes("feature")) {
        replyText = "🤖 Here are our key WhatsApp automation services:\n\n1. 📈 Broadcasts: Bulk messages safely\n2. 🔄 Interactive Chat Flows: Automate replies\n3. 🔗 Webhook & Pabbly integrations\n\nWould you like a demo or to start?";
        replyButtons = ["🚀 Sign Up Now", "📅 Book Demo", "⬅️ Back to Main Menu"];
      } else if (cleanText.includes("agent") || cleanText.includes("support") || cleanText.includes("talk") || cleanText.includes("human")) {
        replyText = "👨‍💻 Perfect! I have flagged this session. Our support representative will join this WhatsApp thread in under 2 minutes. Feel free to describe your query in the meantime!";
        replyButtons = ["⬅️ Back to Main Menu"];
      } else if (cleanText.includes("pricing") || cleanText.includes("cost") || cleanText.includes("plan") || cleanText.includes("price")) {
        replyText = "💰 FlowWA pricing is simple and transparent. We offer Free, Starter, Pro, and Enterprise tiers to fit your growing business needs!\n\nWould you like to view our services?";
        replyButtons = ["✨ View Services", "🚀 Sign Up Now"];
      } else if (cleanText.includes("flowwa") || cleanText.includes("what is")) {
        replyText = "⚡ FlowWA is a premium Visual WhatsApp Automation Platform. We help businesses design custom interactive chatbot flows, run bulk campaigns, and sync data instantly with tools like Pabbly & webhooks—all via the official WhatsApp Business API!";
        replyButtons = ["✨ View Services", "🚀 Sign Up Now"];
      } else if (cleanText.includes("demo") || cleanText.includes("book")) {
        replyText = "📅 Excellent! Our calendar is open. We will schedule a personalized walk-through to integrate the WhatsApp Cloud API with your dashboard.";
        replyButtons = ["⬅️ Back to Main Menu"];
      } else if (cleanText.includes("hello") || cleanText.includes("hi") || cleanText.includes("hey")) {
        replyText = "👋 Hello! Welcome to FlowWA Automation Demo. How can we help you scale your business today?";
        replyButtons = ["✨ View Services", "📞 Talk to Agent", "💡 What is FlowWA?"];
      } else {
        replyText = `🤖 I received: "${text}"\n\nFlowWA parses input text for keywords. Try saying 'services', 'pricing', 'agent', or 'demo'—or tap one of the menus below!`;
        replyButtons = ["✨ View Services", "📞 Talk to Agent", "💡 What is FlowWA?"];
      }

      const botMsg: Message = {
        id: Date.now() + 1,
        sender: "bot",
        text: replyText,
        buttons: replyButtons,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      setTimeout(() => {
        const chatArea = document.getElementById("phone-chat-area");
        if (chatArea) {
          chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
        }
      }, 50);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans selection:bg-brand-200 selection:text-brand-900 transition-colors duration-300 relative overflow-hidden">
      
      {/* Dynamic CSS animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        .scroll-anim {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .scroll-anim.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .hover-tilt {
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s;
        }
        .hover-tilt:hover {
          transform: translateY(-6px) scale(1.02) !important;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05) !important;
        }
        
        @keyframes pulse-travel {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        .pulse-path {
          stroke-dasharray: 6 12;
          animation: pulse-travel 2s linear infinite;
        }
      `}} />

      {/* ── BACKGROUND GLOW EFFECT ORBS (Soft Light Mode Pastels with Parallax) ── */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-brand-200/30 rounded-full blur-[140px] pointer-events-none transition-transform duration-300 ease-out"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      />
      <div
        className="absolute top-[25%] right-[-10%] w-[45vw] h-[45vw] bg-blue-200/30 rounded-full blur-[130px] pointer-events-none transition-transform duration-300 ease-out"
        style={{ transform: `translate(${-mousePos.x * 1.3}px, ${-mousePos.y * 1.3}px)` }}
      />
      <div
        className="absolute bottom-[5%] left-[10%] w-[40vw] h-[40vw] bg-emerald-100/40 rounded-full blur-[160px] pointer-events-none transition-transform duration-300 ease-out"
        style={{ transform: `translate(${mousePos.x * 0.7}px, ${-mousePos.y * 0.7}px)` }}
      />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-60" />

      {/* ── HEADER / NAVIGATION ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-md bg-white/80 border-b border-gray-250/70 shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-brand-500/25 relative group overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Zap size={18} className="text-white fill-white relative z-10" />
            </div>
            <div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">FlowWA</span>
              <span className="ml-1.5 text-[9px] bg-brand-500/10 text-brand-650 border border-brand-500/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                PRO
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 bg-white/85 border border-gray-200/80 px-6 py-2 rounded-full shadow-sm">
            <a href="#services" className="text-xs font-semibold text-gray-650 hover:text-brand-600 transition-colors">
              Services
            </a>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
            <a href="#simulator" className="text-xs font-semibold text-gray-650 hover:text-brand-600 transition-colors">
              Live Demo
            </a>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
            <a href="#features" className="text-xs font-semibold text-gray-650 hover:text-brand-600 transition-colors">
              Features
            </a>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
            <a href="#pricing" className="text-xs font-semibold text-gray-650 hover:text-brand-600 transition-colors">
              Pricing
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {token ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg shadow-brand-500/10 hover:from-brand-700 hover:to-emerald-700 transition-all duration-300 hover:-translate-y-0.5"
              >
                Go to Dashboard <ArrowRight size={13} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-bold text-gray-650 hover:text-brand-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg shadow-brand-500/20 hover:from-brand-700 hover:to-emerald-700 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-gray-200 bg-white px-6 py-6 space-y-4 animate-fade-in">
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-gray-700"
            >
              Services
            </a>
            <a
              href="#simulator"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-gray-700"
            >
              Live Demo
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-gray-700"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-gray-700"
            >
              Pricing
            </a>
            <hr className="border-gray-200" />
            {token ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 text-white py-2.5 text-sm font-semibold"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-white bg-brand-600 rounded-xl"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Hero Content */}
          <div className="lg:col-span-7 space-y-8 text-left z-10 scroll-anim visible">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100/80 border border-brand-200/50 text-brand-700 text-[10px] font-bold tracking-wider uppercase shadow-sm">
              <Sparkles size={11} className="animate-spin text-brand-600" style={{ animationDuration: '3s' }} /> Next-Generation Workflow Engine
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.08]">
              Automate WhatsApp Outreach with{" "}
              <span className="relative inline-block min-w-[280px]">
                <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-500 bg-clip-text text-transparent drop-shadow-sm transition-all duration-300">
                  {currentText}
                </span>
                <span className="inline-block w-[3px] h-[0.9em] bg-brand-500 ml-1.5 align-middle animate-pulse" />
              </span>
            </h1>

            <p className="text-sm md:text-base text-gray-600 max-w-xl leading-relaxed">
              Design conversational logic with our drag-and-drop workflow builder. Broadcast messages safely, sync responses with Pabbly, and direct team chat in a unified Inbox.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to={token ? "/dashboard" : "/register"}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white px-7 py-4 text-sm font-bold shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Get Started Free <ArrowRight size={15} />
              </Link>
              <a
                href="#simulator"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 px-7 py-4 text-sm font-bold shadow-sm transition-all duration-300 hover:-translate-y-0.5"
              >
                Try Interactive Demo
              </a>
            </div>

            {/* Verification badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-gray-500 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-brand-500" /> Official Cloud API
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-brand-500" /> No Setup Fee
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-brand-500" /> Zero Coding Needed
              </span>
            </div>
          </div>

          {/* Hero Visual Mockup: Light theme workflow node preview */}
          <div className="lg:col-span-5 flex justify-center z-10">
            <div className="relative w-full max-w-md aspect-[4/3.5] bg-white rounded-3xl border border-gray-200/80 shadow-2xl p-4 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent pointer-events-none" />
              
              {/* Header panel */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-mono">
                  <Activity size={10} className="text-brand-500 animate-pulse" /> Live Editor Workspace
                </div>
              </div>
              
              {/* Simulated Flow Node Chart */}
              <div className="h-[82%] relative overflow-hidden bg-slate-50 rounded-2xl p-4 border border-gray-200 flex flex-col justify-between">
                
                {/* SVG connection lines with animated dashoffset */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  {/* Left node to center node */}
                  <path
                    d="M 160 55 C 220 55, 120 135, 180 135"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2.5"
                    className="pulse-path opacity-40"
                  />
                  {/* Center node to bottom-right node */}
                  <path
                    d="M 220 135 C 280 135, 200 215, 270 215"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    className="pulse-path opacity-40"
                  />
                </svg>

                {/* Trigger Node */}
                <div className="border border-brand-500/20 bg-white rounded-2xl p-3 shadow-md w-[70%] self-start relative z-10 border-l-[5px] border-l-brand-500">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                    <span className="text-[9px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Trigger</span>
                  </div>
                  <p className="text-[11px] font-bold text-gray-900">Message contains "pricing"</p>
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-brand-500 border-4 border-white flex items-center justify-center shadow-md" />
                </div>

                {/* Decision Node */}
                <div className="border border-blue-500/20 bg-white rounded-2xl p-3 shadow-md w-[70%] self-center relative z-10 border-l-[5px] border-l-blue-500">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Condition</span>
                  </div>
                  <p className="text-[11px] font-bold text-gray-900">Check customer segment</p>
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center shadow-md" />
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center shadow-md" />
                </div>

                {/* Action Node */}
                <div className="border border-emerald-500/20 bg-white rounded-2xl p-3 shadow-md w-[70%] self-end relative z-10 border-l-[5px] border-l-emerald-500">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Action</span>
                  </div>
                  <p className="text-[11px] font-bold text-gray-900">Send "Enterprise Offer"</p>
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shadow-md" />
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="bg-white border-y border-gray-200 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-brand-600">10M+</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Messages Routed</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-brand-600">99.99%</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Gateway Uptime</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-brand-600">&lt; 150ms</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Response Latency</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-brand-600">5k+</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Channels</p>
          </div>
        </div>
      </section>

      {/* ── SERVICES SECTION ── */}
      <section id="services" className="py-16 md:py-20 max-w-7xl mx-auto px-6 text-center space-y-12 scroll-anim">
        <div className="space-y-4 max-w-2xl mx-auto">
          <span className="text-xs bg-brand-100 text-brand-700 border border-brand-200 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            FlowWA Core Engine
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">
            Automate Outreach At Scale
          </h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
            Eliminate operational bottlenecking. Let FlowWA automate customer journeys, query resolution, and data workflows directly on WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="relative group scroll-anim hover-tilt">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-emerald-500 rounded-3xl opacity-0 group-hover:opacity-15 blur-xl transition-all duration-500" />
            <div className="absolute -inset-[1px] bg-gradient-to-r from-brand-400 to-emerald-500 rounded-3xl opacity-0 group-hover:opacity-100 group-hover:-inset-[2px] transition-all duration-500" />
            <div className="relative bg-white border border-gray-200 group-hover:border-transparent rounded-3xl p-8 text-left space-y-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Cpu size={22} />
                </div>
                <h3 className="font-bold text-xl text-gray-900">Visual Flowcharts</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Design automated chatbot loops using an intuitive diagram node builder. Build branching logic, map user decisions, check validation status, and send rich media buttons.
                </p>
              </div>
              <div className="text-xs font-bold text-brand-600 flex items-center gap-1.5 group-hover:gap-2.5 transition-all pt-4 border-t border-gray-100">
                Explore flow engine <ArrowUpRight size={13} />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative group scroll-anim hover-tilt">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl opacity-0 group-hover:opacity-15 blur-xl transition-all duration-500" />
            <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-400 to-cyan-500 rounded-3xl opacity-0 group-hover:opacity-100 group-hover:-inset-[2px] transition-all duration-500" />
            <div className="relative bg-white border border-gray-200 group-hover:border-transparent rounded-3xl p-8 text-left space-y-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Send size={22} />
                </div>
                <h3 className="font-bold text-xl text-gray-900">Bulk Campaigning</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Broadcast utility templates, payment notifications, and custom alerts to thousands of leads. Safe templates matching WhatsApp specifications prevent anti-spam blockages.
                </p>
              </div>
              <div className="text-xs font-bold text-blue-600 flex items-center gap-1.5 group-hover:gap-2.5 transition-all pt-4 border-t border-gray-100">
                Configure broadcasts <ArrowUpRight size={13} />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative group scroll-anim hover-tilt">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-15 blur-xl transition-all duration-500" />
            <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-400 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 group-hover:-inset-[2px] transition-all duration-500" />
            <div className="relative bg-white border border-gray-200 group-hover:border-transparent rounded-3xl p-8 text-left space-y-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Database size={22} />
                </div>
                <h3 className="font-bold text-xl text-gray-900">Integrate Anywhere</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Deploy custom payload webhooks to update databases in real-time, or wire Pabbly Connect workflows. Seamless triggers fire on user message events and action nodes.
                </p>
              </div>
              <div className="text-xs font-bold text-purple-600 flex items-center gap-1.5 group-hover:gap-2.5 transition-all pt-4 border-t border-gray-100">
                Setup webhook sync <ArrowUpRight size={13} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOT SIMULATOR SECTION ── */}
      <section id="simulator" className="py-8 md:py-10 bg-white border-y border-gray-200 transition-colors">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Simulator Info */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <span className="text-xs bg-brand-100 text-brand-700 border border-brand-200 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Interactive Console
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.1]">
              Try the Chatbot Simulator
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-md">
              Tap buttons on the mobile interface to test our routing flow. Watch how the simulator processes selections instantly and replies using dynamic buttons.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 border border-brand-100 shadow-sm">
                  <Zap size={14} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Ultra-Low Latency</h4>
                  <p className="text-xs text-gray-550 mt-0.5 leading-relaxed">Incoming messages process instantly via asynchronous FastAPI background workers.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100 shadow-sm">
                  <Layers size={14} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Complex Path Routing</h4>
                  <p className="text-xs text-gray-550 mt-0.5 leading-relaxed">Map menus, conditional splits, text parsing, and action hooks in a single thread.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Simulator Phone */}
          <div className="lg:col-span-6 flex justify-center">
            {/* Phone casing */}
            <div className="relative w-[330px] h-[590px] bg-slate-900 rounded-[50px] shadow-2xl border-[10px] border-slate-800 p-2 flex flex-col overflow-hidden ring-4 ring-slate-200/50">
              
              {/* iPhone style dynamic notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-full z-20 flex items-center justify-between px-3">
                <div className="w-3 h-3 rounded-full bg-slate-950" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
              </div>

              {/* Screen Content */}
              <div className="flex-1 bg-[#efeae2] rounded-[38px] overflow-hidden flex flex-col relative pt-7 pb-2 border border-slate-950">
                
                {/* Custom WhatsApp Header */}
                <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shadow-md relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-300 to-emerald-500 flex items-center justify-center text-white font-extrabold text-[10px] shadow">
                      FW
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className="font-bold text-xs">FlowWA Bot</h4>
                        <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center text-[7px] font-black text-white scale-90 shadow-sm">✓</div>
                      </div>
                      <span className="text-[8px] text-[#25d366] block font-semibold uppercase tracking-wider animate-pulse">online</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5 text-white/80">
                    <Video size={14} className="hover:text-white cursor-pointer" />
                    <Phone size={13} className="hover:text-white cursor-pointer" />
                    <MoreVertical size={14} className="hover:text-white cursor-pointer" />
                  </div>
                </div>

                {/* Chat Message Workspace */}
                <div id="phone-chat-area" className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3 scrollbar-hide bg-[#efeae2]">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col max-w-[85%] rounded-2xl p-3 text-[11px] shadow-sm relative animate-fade-up ${
                        m.sender === "bot"
                          ? "bg-white text-gray-800 self-start rounded-tl-none border border-gray-100"
                          : "bg-[#d9fdd3] text-gray-800 self-end rounded-tr-none"
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed font-medium">{m.text}</p>
                      <span className="text-[7.5px] text-gray-400 self-end mt-1.5 font-bold uppercase">{m.time}</span>
                      
                      {/* Interaction options */}
                      {m.sender === "bot" && m.buttons && m.buttons.length > 0 && (
                        <div className="flex flex-col gap-1.5 mt-3 border-t border-gray-100 pt-2.5">
                          {m.buttons.map((btn, i) => (
                            <button
                              key={i}
                              onClick={() => handleSimulateUserOption(btn)}
                              className="w-full text-center py-2 bg-slate-50 hover:bg-slate-100 text-brand-600 rounded-xl font-bold border border-slate-200 transition-all text-[10px]"
                            >
                              {btn}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing State */}
                  {isTyping && (
                    <div className="bg-white text-gray-500 rounded-2xl rounded-tl-none p-3 text-[10px] shadow-sm self-start flex items-center gap-1 border border-gray-100">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  )}
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!inputMessage.trim()) return;
                    handleSendText(inputMessage);
                    setInputMessage("");
                  }}
                  className="bg-white px-3 py-2 border-t border-gray-150 flex items-center gap-2 relative z-10"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-100 hover:bg-gray-150/50 border border-gray-250 rounded-full px-3.5 py-1.5 text-[11px] text-gray-800 placeholder-gray-450 outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all font-medium"
                    disabled={isTyping}
                  />
                  <button
                    type="submit"
                    disabled={isTyping || !inputMessage.trim()}
                    className="w-7 h-7 rounded-full bg-[#075e54] disabled:opacity-40 hover:bg-[#064e46] text-white flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
                  >
                    <Send size={11} fill="white" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GATEWAY CONNECTION SIMULATOR SECTION ── */}
      <section id="gateway-setup" className="py-8 md:py-10 bg-slate-100/60 border-b border-gray-200 transition-colors">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="space-y-2 max-w-xl mx-auto">
            <span className="text-xs bg-brand-100 text-brand-700 border border-brand-200 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Gateway Configuration
            </span>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Connect Your Own Gateway
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Integrate your official Meta WhatsApp Business ID or Twilio Sandbox directly. Test your authentication flow below.
            </p>
          </div>

          <div className="relative group scroll-anim hover-tilt max-w-2xl mx-auto w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-brand-500 to-emerald-500 rounded-3xl opacity-0 group-hover:opacity-15 blur-xl transition-all duration-500" />
            <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-brand-500 to-emerald-500 rounded-3xl opacity-0 group-hover:opacity-100 group-hover:-inset-[2px] transition-all duration-500" />
            <div className="relative bg-white border border-gray-200 group-hover:border-transparent rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 text-left space-y-6">
            {/* Provider Tabs */}
            <div className="flex gap-2 p-1 bg-slate-50 border border-gray-200 rounded-2xl w-fit">
              <button
                type="button"
                onClick={() => { setGatewayProvider("meta"); setValSuccess(false); setValLogs([]); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  gatewayProvider === "meta"
                    ? "bg-white text-blue-600 shadow-sm border border-gray-100"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Meta WhatsApp Cloud API
              </button>
              <button
                type="button"
                onClick={() => { setGatewayProvider("twilio"); setValSuccess(false); setValLogs([]); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  gatewayProvider === "twilio"
                    ? "bg-white text-red-500 shadow-sm border border-gray-100"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Twilio Sandbox Gateway
              </button>
            </div>

            {/* Config Forms */}
            <form onSubmit={handleValidateGateway} className="space-y-4">
              {gatewayProvider === "meta" ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        Phone Number ID
                      </label>
                      <input
                        type="text"
                        value={metaForm.phoneNumId}
                        onChange={(e) => setMetaForm({ ...metaForm, phoneNumId: e.target.value })}
                        placeholder="e.g. 109283748293847"
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        WhatsApp Business Account (WABA) ID
                      </label>
                      <input
                        type="text"
                        value={metaForm.wabaId}
                        onChange={(e) => setMetaForm({ ...metaForm, wabaId: e.target.value })}
                        placeholder="e.g. 293847293847293"
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      System Access Token
                    </label>
                    <input
                      type="password"
                      value={metaForm.token}
                      onChange={(e) => setMetaForm({ ...metaForm, token: e.target.value })}
                      placeholder="e.g. EAAK..."
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        Twilio Account SID
                      </label>
                      <input
                        type="text"
                        value={twilioForm.accountSid}
                        onChange={(e) => setTwilioForm({ ...twilioForm, accountSid: e.target.value })}
                        placeholder="e.g. AC87f6..."
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-gray-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        Twilio WhatsApp Sender Number
                      </label>
                      <input
                        type="text"
                        value={twilioForm.phone}
                        onChange={(e) => setTwilioForm({ ...twilioForm, phone: e.target.value })}
                        placeholder="e.g. +14155238886"
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-gray-400 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Auth Token
                    </label>
                    <input
                      type="password"
                      value={twilioForm.authToken}
                      onChange={(e) => setTwilioForm({ ...twilioForm, authToken: e.target.value })}
                      placeholder="••••••••••••••••"
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-gray-400 font-mono"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={valLoading}
                className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
                  gatewayProvider === "meta"
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/10"
                    : "bg-red-500 hover:bg-red-650 shadow-red-500/10"
                } disabled:opacity-50`}
              >
                {valLoading ? "Connecting & Verifying..." : "Validate Gateway Setup"}
              </button>
            </form>

            {/* Validation Output Logs Console */}
            {(valLogs.length > 0 || valLoading) && (
              <div className="bg-slate-900 rounded-2xl p-4 font-mono text-[10px] space-y-2 border border-slate-800 shadow-inner overflow-hidden animate-scale-in">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-2 text-slate-500">
                  <span>console_output.log</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping" /> Connection
                  </span>
                </div>
                <div className="space-y-1.5">
                  {valLogs.map((log, idx) => (
                    <p key={idx} className={log.startsWith("✅") ? "text-brand-400 font-semibold" : "text-slate-350"}>
                      {log}
                    </p>
                  ))}
                  {valLoading && (
                    <p className="text-blue-400 animate-pulse">
                      ⏳ Processing request...
                    </p>
                  )}
                </div>

                {valSuccess && token && (
                  <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-emerald-450 animate-fade-in">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-white">Connection Success!</p>
                      <p className="text-[9px] text-emerald-400 mt-0.5">Your credentials are saved to your active workspace database. Webhooks are active.</p>
                    </div>
                  </div>
                )}

                {valSuccess && !token && (
                  <div className="mt-4 p-4 bg-emerald-950/50 border border-emerald-500/30 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-emerald-400 animate-fade-in font-sans">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
                        ✓
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">Gateway Validated & Cached Locally!</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Register/Sign in now to link this gateway to your workspace and start using it in the application.</p>
                      </div>
                    </div>
                    <Link
                      to="/register"
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-[10px] font-bold text-center shadow-md hover:shadow-lg transition-all"
                    >
                      Create Free Account
                    </Link>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="py-16 md:py-20 max-w-7xl mx-auto px-6 text-center space-y-12 scroll-anim">
        <div className="space-y-4 max-w-2xl mx-auto">
          <span className="text-xs bg-brand-100 text-brand-700 border border-brand-200 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Operational Reliability
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">
            Built For High-Velocity Channels
          </h2>
          <p className="text-sm text-gray-550 max-w-lg mx-auto leading-relaxed">
            All variables, configurations, and webhook notifications optimized for massive transaction logs and concurrency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1: Cron Scheduler (Brand-to-emerald) */}
          <div className="relative group scroll-anim hover-tilt">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-emerald-500 rounded-3xl opacity-0 group-hover:opacity-15 blur-xl transition-all duration-500" />
            <div className="absolute -inset-[1px] bg-gradient-to-r from-brand-400 to-emerald-500 rounded-3xl opacity-0 group-hover:opacity-100 group-hover:-inset-[2px] transition-all duration-500" />
            <div className="relative bg-white border border-gray-200 group-hover:border-transparent rounded-3xl p-6 text-left space-y-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock size={18} />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Cron Scheduler</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Queue campaigns to execute at specific timestamps. Automatic delivery throttles prevent spam tags.
              </p>
            </div>
          </div>

          {/* Card 2: Smart Inbox Manager (Blue-to-cyan) */}
          <div className="relative group scroll-anim hover-tilt">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl opacity-0 group-hover:opacity-15 blur-xl transition-all duration-500" />
            <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-400 to-cyan-500 rounded-3xl opacity-0 group-hover:opacity-100 group-hover:-inset-[2px] transition-all duration-500" />
            <div className="relative bg-white border border-gray-200 group-hover:border-transparent rounded-3xl p-6 text-left space-y-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare size={18} />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Smart Inbox Manager</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Filter customer threads, create tag hierarchies, assign sessions to agents, and check history logs on a unified UI.
              </p>
            </div>
          </div>

          {/* Card 3: Official Meta Cloud API (Indigo-to-purple) */}
          <div className="relative group scroll-anim hover-tilt">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-15 blur-xl transition-all duration-500" />
            <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-400 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-100 group-hover:-inset-[2px] transition-all duration-500" />
            <div className="relative bg-white border border-gray-200 group-hover:border-transparent rounded-3xl p-6 text-left space-y-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck size={18} />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Official Meta Cloud API</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Official SDK compliance protects number integrity. Bypass third-party servers to send messages securely.
              </p>
            </div>
          </div>

          {/* Card 4: Analytics Engine (Amber-to-orange) */}
          <div className="relative group scroll-anim hover-tilt">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl opacity-0 group-hover:opacity-15 blur-xl transition-all duration-500" />
            <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl opacity-0 group-hover:opacity-100 group-hover:-inset-[2px] transition-all duration-500" />
            <div className="relative bg-white border border-gray-200 group-hover:border-transparent rounded-3xl p-6 text-left space-y-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass size={18} />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Analytics Engine</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Track delivery rates, open metrics, and interactive button conversions in a clean dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION ── */}
      <section id="pricing" className="pt-16 pb-8 md:pt-20 md:pb-12 bg-[#f8fafc] border-t border-gray-200 transition-colors">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="text-xs bg-brand-100 text-brand-700 border border-brand-200 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Flexible Pricing
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">
              Simple Plans For Every Scale
            </h2>
            <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
              No contracts. Register for free to test our visual editor, then upgrade as your volume grows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Starter */}
            <div className="relative group scroll-anim hover-tilt flex flex-col h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-300 to-slate-400 rounded-3xl opacity-0 group-hover:opacity-15 blur-xl transition-all duration-500" />
              <div className="absolute -inset-[1px] bg-gradient-to-r from-slate-200 to-slate-400 rounded-3xl opacity-0 group-hover:opacity-100 group-hover:-inset-[2px] transition-all duration-500" />
              <div className="relative bg-white border border-gray-200 group-hover:border-transparent rounded-3xl p-8 flex flex-col justify-between text-left space-y-8 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex-1">
                <div>
                  <p className="font-bold text-lg text-gray-900">Starter Model</p>
                  <p className="text-[11px] text-gray-555 mt-1">Excellent for staging & early setup</p>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-4xl font-black text-gray-900">Free</span>
                    <span className="text-xs text-gray-500 ml-1.5">/ forever</span>
                  </div>
                  <hr className="border-gray-150 my-6" />
                  <ul className="space-y-3.5 text-xs text-gray-650">
                    <li className="flex items-center gap-2">✓ 1 Active Workspace</li>
                    <li className="flex items-center gap-2">✓ 1,000 Messages / month</li>
                    <li className="flex items-center gap-2">✓ Visual Flow Engine</li>
                    <li className="flex items-center gap-2">✓ Direct Webhook Sync</li>
                  </ul>
                </div>
                <Link
                  to="/register"
                  className="w-full text-center py-3 rounded-xl border border-brand-500 text-brand-600 hover:bg-brand-50 text-xs font-bold transition-all mt-6"
                >
                  Sign Up Free
                </Link>
              </div>
            </div>

            {/* Pro */}
            <div className="relative group scroll-anim hover-tilt flex flex-col h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-emerald-500 rounded-3xl opacity-0 group-hover:opacity-25 blur-xl transition-all duration-500" />
              <div className="absolute -inset-[2px] bg-gradient-to-r from-brand-500 to-emerald-500 rounded-3xl opacity-100 group-hover:-inset-[3px] transition-all duration-500" />
              <div className="relative bg-white rounded-3xl p-8 flex flex-col justify-between text-left space-y-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex-1">
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-brand-500 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest z-10">
                  Recommended
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900">Pro Workspace</p>
                  <p className="text-[11px] text-gray-550 mt-1">For active companies & marketing</p>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-4xl font-black text-gray-900">₹1,999</span>
                    <span className="text-xs text-gray-550 ml-1.5">/ month</span>
                  </div>
                  <hr className="border-gray-150 my-6" />
                  <ul className="space-y-3.5 text-xs text-gray-650">
                    <li className="flex items-center gap-2 text-brand-600 font-semibold">✓ Unlimited Workspaces</li>
                    <li className="flex items-center gap-2">✓ Unlimited Messages</li>
                    <li className="flex items-center gap-2">✓ Premium Broadcast Queue</li>
                    <li className="flex items-center gap-2">✓ Full Pabbly & API access</li>
                    <li className="flex items-center gap-2">✓ Priority SLA Support</li>
                  </ul>
                </div>
                <Link
                  to="/register"
                  className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/10 mt-6"
                >
                  Start Pro Account
                </Link>
              </div>
            </div>

            {/* Enterprise */}
            <div className="relative group scroll-anim hover-tilt flex flex-col h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl opacity-0 group-hover:opacity-15 blur-xl transition-all duration-500" />
              <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-400 to-yellow-500 rounded-3xl opacity-0 group-hover:opacity-100 group-hover:-inset-[2px] transition-all duration-500" />
              <div className="relative bg-white border border-gray-200 group-hover:border-transparent rounded-3xl p-8 flex flex-col justify-between text-left space-y-8 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex-1">
                <div>
                  <p className="font-bold text-lg text-gray-900">Enterprise</p>
                  <p className="text-[11px] text-gray-550 mt-1">For custom dedicated pipelines</p>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-4xl font-black text-gray-900">Custom</span>
                    <span className="text-xs text-gray-500 ml-1.5">/ custom volume</span>
                  </div>
                  <hr className="border-gray-150 my-6" />
                  <ul className="space-y-3.5 text-xs text-gray-650">
                    <li className="flex items-center gap-2">✓ Dedicated Host Node</li>
                    <li className="flex items-center gap-2">✓ Customized API Gateways</li>
                    <li className="flex items-center gap-2">✓ Under 30-min SLA Support</li>
                    <li className="flex items-center gap-2">✓ Dedicated Success Manager</li>
                  </ul>
                </div>
                <a
                  href="mailto:support@flowwa.app"
                  className="w-full text-center py-3 rounded-xl border border-gray-250 hover:bg-slate-50 text-gray-600 text-xs font-bold transition-all mt-6"
                >
                  Contact Operations
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Unique Light-Themed Footer */}
      <footer className="bg-[#f8fafc] text-gray-650 py-16 border-t border-slate-200/80 relative overflow-hidden transition-colors duration-300">
        
        {/* Soft Decorative Ambient Glow Orbs */}
        <div className="absolute bottom-[-10%] right-[-5%] w-[35vw] h-[35vw] bg-brand-200/10 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute top-[10%] left-[-5%] w-[30vw] h-[30vw] bg-blue-100/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-slate-200/60">
            
            {/* Branding Column (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center shadow-md shadow-brand-500/15">
                  <Zap size={16} className="text-white fill-white" />
                </div>
                <div>
                  <span className="font-bold text-lg text-slate-900 tracking-tight">FlowWA</span>
                  <span className="ml-1.5 text-[8px] bg-brand-500/10 text-brand-650 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                    Cloud API
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                Next-generation WhatsApp Business API workflow designer. Design automation sequences, broadcast safe updates, and scale lead outreach securely.
              </p>
              
              {/* Pulse status indicator */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-[10px] font-semibold text-slate-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                All systems operational
              </div>
            </div>

            {/* Links Columns (5 cols) */}
            <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8 text-left">
              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Platform</h4>
                <ul className="space-y-2.5 text-xs text-gray-500">
                  <li>
                    <a href="#services" className="hover:text-brand-650 transition-colors duration-250 relative group">
                      Services
                      <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-brand-500 transition-all duration-300 group-hover:w-full" />
                    </a>
                  </li>
                  <li>
                    <a href="#simulator" className="hover:text-brand-650 transition-colors duration-250 relative group">
                      Simulator Demo
                      <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-brand-500 transition-all duration-300 group-hover:w-full" />
                    </a>
                  </li>
                  <li>
                    <a href="#features" className="hover:text-brand-650 transition-colors duration-250 relative group">
                      Key Features
                      <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-brand-500 transition-all duration-300 group-hover:w-full" />
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" className="hover:text-brand-650 transition-colors duration-250 relative group">
                      Pricing
                      <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-brand-500 transition-all duration-300 group-hover:w-full" />
                    </a>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Integrations</h4>
                <ul className="space-y-2.5 text-xs text-gray-500">
                  <li className="text-gray-400 select-none">Pabbly Connect</li>
                  <li className="text-gray-400 select-none">Webhooks Engine</li>
                  <li className="text-gray-400 select-none">Meta Developer API</li>
                  <li className="text-gray-400 select-none">Twilio Sandbox</li>
                </ul>
              </div>

              <div className="space-y-4 col-span-2 sm:col-span-1">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Company</h4>
                <ul className="space-y-2.5 text-xs text-gray-500">
                  <li><a href="mailto:support@flowwa.app" className="hover:text-brand-600 transition-colors relative group">Support Link<span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-brand-500 transition-all duration-300 group-hover:w-full" /></a></li>
                  <li><span className="text-gray-400 cursor-default">Privacy Policy</span></li>
                  <li><span className="text-gray-400 cursor-default">Terms of Service</span></li>
                </ul>
              </div>
            </div>

            {/* Newsletter widget Column (3 cols) */}
            <div className="lg:col-span-3 space-y-4 text-left">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden backdrop-blur-sm bg-white/70">
                <p className="text-xs font-bold text-slate-900">Subscribe for Updates</p>
                <p className="text-[10px] text-gray-500 leading-normal">Get release updates, system guides, and automation patterns monthly.</p>
                
                {subscribeSuccess ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-[10px] text-emerald-800 font-bold animate-fade-in">
                    🎉 Thank you! Check your inbox soon.
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex gap-1.5">
                    <input
                      type="email"
                      required
                      placeholder="operator@domain.com"
                      value={subscribedEmail}
                      onChange={(e) => setSubscribedEmail(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10.5px] text-slate-800 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={subscribing}
                      className="px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 flex items-center justify-center min-w-[70px]"
                    >
                      {subscribing ? "..." : "Join"}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>

          {/* Bottom Copyright bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
            <div className="flex items-center gap-2">
              <p>© {new Date().getFullYear()} FlowWA. All rights reserved.</p>
            </div>
            
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck size={12} className="text-brand-500" />
              <span>AES-256 SSL Secure Connection</span>
            </div>

            <p className="font-medium text-slate-400">Built by Kaira technologies</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
