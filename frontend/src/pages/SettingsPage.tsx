import {
  DollarSign,
  Edit2,
  Gamepad2,
  Image,
  Plus,
  Save,
  Settings,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  createGame,
  deleteGame,
  getGames,
  updateGame,
  type CreateGameInput,
  type Game,
} from "../api/games";
import {
  createPricingTier,
  deletePricingTier,
  getPricingTiers,
  updatePricingTier,
  type CreatePricingInput,
  type PricingTier,
} from "../api/pricing";
import {
  getAllSettings,
  updateSettings,
  type AllSettings,
} from "../api/settings";
import {
  createSliderImage,
  deleteSliderImage,
  getSliderImages,
  updateSliderImage,
  type CreateSliderInput,
  type SliderImage,
} from "../api/slider";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";

type Tab = "settings" | "pricing" | "games" | "slider";

const fieldLabelClass =
  "mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400";
const textareaClass =
  "w-full rounded-lg border border-gz-border bg-gz-surface px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30";
const selectClass =
  "w-full rounded-lg border border-gz-border bg-gz-surface px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30";
const tableShellClass =
  "overflow-hidden rounded-xl border border-gz-border bg-gz-surface/30";
const tableHeaderCellClass =
  "px-4 py-3 text-left text-sm font-medium text-slate-400";
const tableRowClass = "bg-gz-card/50";
const iconButtonClass =
  "rounded-md p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white";
const dangerIconButtonClass =
  "rounded-md p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("settings");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">
          Site Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your public website content
        </p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-2 border-b border-gz-border pb-2">
          {[
            { id: "settings" as Tab, label: "General", icon: Settings },
            { id: "pricing" as Tab, label: "Pricing", icon: DollarSign },
            { id: "games" as Tab, label: "Games", icon: Gamepad2 },
            { id: "slider" as Tab, label: "Slider", icon: Image },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-900/30"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "settings" && <GeneralSettingsTab />}
      {activeTab === "pricing" && <PricingTab />}
      {activeTab === "games" && <GamesTab />}
      {activeTab === "slider" && <SliderTab />}
    </div>
  );
}

// General Settings Tab
function GeneralSettingsTab() {
  const [settings, setSettings] = useState<AllSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getAllSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateSettings(settings);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!settings) {
    return <p className="text-slate-500">Failed to load settings</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4 p-2 sm:p-3">
          <h2 className="text-lg font-semibold text-white">Site Information</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input
              label="Site Name"
              value={settings.siteName}
              onChange={(e) =>
                setSettings({ ...settings, siteName: e.target.value })
              }
            />
            <Input
              label="Tagline"
              value={settings.tagline}
              onChange={(e) =>
                setSettings({ ...settings, tagline: e.target.value })
              }
            />
          </div>
          <div className="mt-4">
            <label className={fieldLabelClass}>Description</label>
            <textarea
              className={textareaClass}
              rows={3}
              value={settings.description}
              onChange={(e) =>
                setSettings({ ...settings, description: e.target.value })
              }
            />
          </div>
          <div className="mt-4">
            <label className={fieldLabelClass}>Footer Description</label>
            <textarea
              className={textareaClass}
              rows={2}
              value={settings.footerDescription}
              onChange={(e) =>
                setSettings({ ...settings, footerDescription: e.target.value })
              }
            />
          </div>
          <div className="mt-4">
            <Input
              label="Copyright Text"
              value={settings.copyright}
              onChange={(e) =>
                setSettings({ ...settings, copyright: e.target.value })
              }
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-4 p-2 sm:p-3">
          <h2 className="text-lg font-semibold text-white">
            Contact Information
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input
              label="Owner Name"
              value={settings.ownerName}
              onChange={(e) =>
                setSettings({ ...settings, ownerName: e.target.value })
              }
            />
            <Input
              label="Phone"
              value={settings.phone}
              onChange={(e) =>
                setSettings({ ...settings, phone: e.target.value })
              }
            />
            <Input
              label="WhatsApp"
              value={settings.whatsapp}
              onChange={(e) =>
                setSettings({ ...settings, whatsapp: e.target.value })
              }
            />
            <Input
              label="Email"
              type="email"
              value={settings.email}
              onChange={(e) =>
                setSettings({ ...settings, email: e.target.value })
              }
            />
          </div>
          <div className="mt-4">
            <Input
              label="Address"
              value={settings.address}
              onChange={(e) =>
                setSettings({ ...settings, address: e.target.value })
              }
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-4 p-2 sm:p-3">
          <h2 className="text-lg font-semibold text-white">Social & Maps</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input
              label="Facebook URL"
              value={settings.facebookUrl}
              onChange={(e) =>
                setSettings({ ...settings, facebookUrl: e.target.value })
              }
            />
            <Input
              label="Messenger URL"
              value={settings.messengerUrl}
              onChange={(e) =>
                setSettings({ ...settings, messengerUrl: e.target.value })
              }
            />
            <Input
              label="Google Maps URL"
              value={settings.googleMapsUrl}
              onChange={(e) =>
                setSettings({ ...settings, googleMapsUrl: e.target.value })
              }
            />
            <Input
              label="Google Maps Embed URL"
              value={settings.googleMapsEmbedUrl}
              onChange={(e) =>
                setSettings({ ...settings, googleMapsEmbedUrl: e.target.value })
              }
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save size={16} />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

// Pricing Tab
function PricingTab() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [formData, setFormData] = useState<CreatePricingInput>({
    name: "",
    price: 0,
    perUnit: "per hour",
    description: [],
    isPopular: false,
  });
  const [descriptionText, setDescriptionText] = useState("");

  useEffect(() => {
    fetchTiers();
  }, []);

  async function fetchTiers() {
    try {
      const data = await getPricingTiers(true);
      setTiers(data);
    } catch (error) {
      console.error("Failed to fetch pricing:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        description: descriptionText.split("\n").filter((l) => l.trim()),
      };
      if (editingTier) {
        await updatePricingTier(editingTier.id, data);
      } else {
        await createPricingTier(data);
      }
      setShowModal(false);
      setEditingTier(null);
      setFormData({
        name: "",
        price: 0,
        perUnit: "per hour",
        description: [],
        isPopular: false,
      });
      setDescriptionText("");
      fetchTiers();
    } catch (error) {
      console.error("Failed to save pricing tier:", error);
      alert("Failed to save pricing tier");
    }
  };

  const handleEdit = (tier: PricingTier) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name,
      price: Number(tier.price),
      perUnit: tier.perUnit,
      description: tier.description,
      isPopular: tier.isPopular,
    });
    setDescriptionText(tier.description.join("\n"));
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pricing tier?")) return;
    try {
      await deletePricingTier(id);
      fetchTiers();
    } catch (error) {
      console.error("Failed to delete pricing tier:", error);
      alert("Failed to delete pricing tier");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingTier(null);
            setFormData({
              name: "",
              price: 0,
              perUnit: "per hour",
              description: [],
              isPopular: false,
            });
            setDescriptionText("");
            setShowModal(true);
          }}
        >
          <Plus size={16} />
          Add Pricing Tier
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.id}>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{tier.name}</h3>
                  <p className="text-2xl font-bold text-violet-300">
                    ৳{Number(tier.price).toFixed(0)}
                    <span className="text-sm text-slate-500">
                      /{tier.perUnit}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(tier)}
                    className={iconButtonClass}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(tier.id)}
                    className={dangerIconButtonClass}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {tier.isPopular && (
                <span className="mt-2 inline-block rounded bg-violet-500/15 px-2 py-1 text-xs font-semibold text-violet-300">
                  Popular
                </span>
              )}
              <ul className="mt-3 space-y-1 text-sm text-slate-400">
                {tier.description.map((point, i) => (
                  <li key={i}>• {point}</li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingTier ? "Edit Pricing Tier" : "Add Pricing Tier"}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Price (৳)"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
          />
          <Input
            label="Per Unit"
            value={formData.perUnit}
            onChange={(e) =>
              setFormData({ ...formData, perUnit: e.target.value })
            }
            placeholder="per hour, each, etc."
          />
          <div>
            <label className={fieldLabelClass}>Features (one per line)</label>
            <textarea
              className={textareaClass}
              rows={4}
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={formData.isPopular}
              onChange={(e) =>
                setFormData({ ...formData, isPopular: e.target.checked })
              }
              className="rounded border-gz-border bg-gz-surface text-violet-500 focus:ring-violet-500/30"
            />
            Mark as Popular
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingTier ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Games Tab
function GamesTab() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState<CreateGameInput>({
    title: "",
    platform: "PC",
    genre: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    try {
      const data = await getGames({ all: true });
      setGames(data);
    } catch (error) {
      console.error("Failed to fetch games:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async () => {
    try {
      if (editingGame) {
        await updateGame(editingGame.id, formData);
      } else {
        await createGame(formData);
      }
      setShowModal(false);
      setEditingGame(null);
      setFormData({ title: "", platform: "PC", genre: "", imageUrl: "" });
      fetchGames();
    } catch (error) {
      console.error("Failed to save game:", error);
      alert("Failed to save game");
    }
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setFormData({
      title: game.title,
      platform: game.platform,
      genre: game.genre,
      imageUrl: game.imageUrl || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this game?")) return;
    try {
      await deleteGame(id);
      fetchGames();
    } catch (error) {
      console.error("Failed to delete game:", error);
      alert("Failed to delete game");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-slate-400">{games.length} games</p>
        <Button
          onClick={() => {
            setEditingGame(null);
            setFormData({ title: "", platform: "PC", genre: "", imageUrl: "" });
            setShowModal(true);
          }}
        >
          <Plus size={16} />
          Add Game
        </Button>
      </div>

      <div className={tableShellClass}>
        <table className="w-full">
          <thead className="bg-gz-surface">
            <tr>
              <th className={tableHeaderCellClass}>Title</th>
              <th className={tableHeaderCellClass}>Platform</th>
              <th className={tableHeaderCellClass}>Genre</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gz-border">
            {games.map((game) => (
              <tr key={game.id} className={tableRowClass}>
                <td className="px-4 py-3 text-sm text-white">{game.title}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-violet-500/10 px-2 py-1 text-xs text-violet-200">
                    {game.platform}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">
                  {game.genre}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleEdit(game)}
                    className={`mr-2 ${iconButtonClass}`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(game.id)}
                    className={dangerIconButtonClass}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingGame ? "Edit Game" : "Add Game"}
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <div>
            <label className={fieldLabelClass}>Platform</label>
            <select
              className={selectClass}
              value={formData.platform}
              onChange={(e) =>
                setFormData({ ...formData, platform: e.target.value })
              }
            >
              <option value="PC">PC</option>
              <option value="PS4">PS4</option>
              <option value="PS5">PS5</option>
              <option value="Racing Sim">Racing Sim</option>
              <option value="Arcade">Arcade</option>
            </select>
          </div>
          <Input
            label="Genre"
            value={formData.genre}
            onChange={(e) =>
              setFormData({ ...formData, genre: e.target.value })
            }
            placeholder="FPS, RPG, Sports, etc."
          />
          <Input
            label="Image URL (optional)"
            value={formData.imageUrl || ""}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
            placeholder="https://..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingGame ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Slider Tab
function SliderTab() {
  const [images, setImages] = useState<SliderImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState<SliderImage | null>(null);
  const [formData, setFormData] = useState<CreateSliderInput>({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
  });

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      const data = await getSliderImages(true);
      setImages(data);
    } catch (error) {
      console.error("Failed to fetch slider images:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async () => {
    try {
      if (editingImage) {
        await updateSliderImage(editingImage.id, formData);
      } else {
        await createSliderImage(formData);
      }
      setShowModal(false);
      setEditingImage(null);
      setFormData({ title: "", subtitle: "", imageUrl: "", linkUrl: "" });
      fetchImages();
    } catch (error) {
      console.error("Failed to save slider image:", error);
      alert("Failed to save slider image");
    }
  };

  const handleEdit = (image: SliderImage) => {
    setEditingImage(image);
    setFormData({
      title: image.title || "",
      subtitle: image.subtitle || "",
      imageUrl: image.imageUrl,
      linkUrl: image.linkUrl || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slider image?")) return;
    try {
      await deleteSliderImage(id);
      fetchImages();
    } catch (error) {
      console.error("Failed to delete slider image:", error);
      alert("Failed to delete slider image");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingImage(null);
            setFormData({ title: "", subtitle: "", imageUrl: "", linkUrl: "" });
            setShowModal(true);
          }}
        >
          <Plus size={16} />
          Add Slider Image
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <Card key={image.id}>
            <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gz-surface">
              <img
                src={image.imageUrl}
                alt={image.title || "Slider image"}
                className="h-full w-full object-cover"
              />
              <div className="absolute right-2 top-2 flex gap-1">
                <button
                  onClick={() => handleEdit(image)}
                  className="rounded bg-gz-bg/80 p-1.5 text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(image.id)}
                  className="rounded bg-gz-bg/80 p-1.5 text-slate-200 transition hover:bg-red-500/80 hover:text-white"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white">
                {image.title || "No title"}
              </h3>
              {image.subtitle && (
                <p className="text-sm text-slate-400">{image.subtitle}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {images.length === 0 && (
        <div className="py-20 text-center">
          <Image size={48} className="mx-auto text-slate-600" />
          <p className="mt-4 text-slate-500">No slider images yet</p>
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingImage ? "Edit Slider Image" : "Add Slider Image"}
      >
        <div className="space-y-4">
          <Input
            label="Image URL"
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
            placeholder="https://..."
          />
          <Input
            label="Title (optional)"
            value={formData.title || ""}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Input
            label="Subtitle (optional)"
            value={formData.subtitle || ""}
            onChange={(e) =>
              setFormData({ ...formData, subtitle: e.target.value })
            }
          />
          <Input
            label="Link URL (optional)"
            value={formData.linkUrl || ""}
            onChange={(e) =>
              setFormData({ ...formData, linkUrl: e.target.value })
            }
            placeholder="https://..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingImage ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
