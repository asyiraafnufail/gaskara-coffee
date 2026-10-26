'use client';

import { useState, useEffect } from 'react';
import { fetchMenus, toggleMenuAvailability, addMenu, updateMenu, deleteMenu, fetchCategories } from '@/lib/db-service';
import { Menu, Category } from '@/types/database';
import { LayoutDashboard, Search, RefreshCw, AlertCircle, Plus, Trash2, X, Image as ImageIcon, Sparkles, Pencil } from 'lucide-react';

export default function AdminMenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modal Tambah Menu
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    price: '',
    description: '',
    image_url: ''
  });

  // Modal Edit Menu
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    price: '',
    description: '',
    image_url: ''
  });

  const loadData = async () => {
    try {
      const [menuList, catList] = await Promise.all([fetchMenus(), fetchCategories()]);
      setMenus(menuList);
      setCategories(catList);
      if (catList.length > 0) {
        setFormData((prev) => ({
          ...prev,
          category_id: catList.some((c) => c.id === prev.category_id) ? prev.category_id : catList[0].id
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener('gaskara_menu_updated', handleUpdate);
    return () => {
      window.removeEventListener('gaskara_menu_updated', handleUpdate);
    };
  }, []);

  const handleToggle = async (menu: Menu) => {
    setUpdatingId(menu.id);
    const newStatus = !menu.is_available;
    try {
      await toggleMenuAvailability(menu.id, newStatus);
      setMenus((prev) =>
        prev.map((m) => (m.id === menu.id ? { ...m, is_available: newStatus } : m))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (menu: Menu) => {
    if (confirm(`Hapus menu "${menu.name}"?`)) {
      await deleteMenu(menu.id);
      setMenus((prev) => prev.filter((m) => m.id !== menu.id));
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      alert('Nama dan harga wajib diisi!');
      return;
    }

    setSubmitting(true);
    try {
      await addMenu({
        name: formData.name.trim(),
        price: Number(formData.price),
        category_id: formData.category_id,
        description: formData.description.trim() || undefined,
        image_url: formData.image_url.trim() || undefined,
        is_available: true
      });

      setFormData({
        name: '',
        category_id: categories[0]?.id || 'c1111111-1111-1111-1111-111111111111',
        price: '',
        description: '',
        image_url: ''
      });
      setIsAddModalOpen(false);
      await loadData();
    } catch {
      alert('Gagal menambahkan menu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setEditFormData({
      name: menu.name,
      category_id: menu.category_id,
      price: String(menu.price),
      description: menu.description || '',
      image_url: menu.image_url || ''
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenu) return;
    if (!editFormData.name.trim() || !editFormData.price) {
      alert('Nama dan harga wajib diisi!');
      return;
    }

    setSubmitting(true);
    try {
      await updateMenu(editingMenu.id, {
        name: editFormData.name.trim(),
        price: Number(editFormData.price),
        category_id: editFormData.category_id,
        description: editFormData.description.trim() || undefined,
        image_url: editFormData.image_url.trim() || undefined
      });

      setEditingMenu(null);
      await loadData();
    } catch {
      alert('Gagal memperbarui menu.');
    } finally {
      setSubmitting(false);
    }
  };

  const categoryGroups = [
    { key: 'coffee', title: 'Kategori Coffee' },
    { key: 'non_coffee', title: 'Kategori Non-Coffee' },
    { key: 'snack', title: 'Kategori Snack & Makanan' }
  ];

  const filteredMenus = menus.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">
            <LayoutDashboard className="w-3.5 h-3.5" /> Admin Panel
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Ketersediaan Menu
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tambah menu baru dan atur sakelar status produk (Tersedia / Habis) secara instan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 w-40 sm:w-52"
            />
          </div>

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Menu</span>
          </button>
        </div>
      </div>

      {/* Info Banner SOP */}
      <div className="bg-cyan-50 border border-slate-200 rounded-2xl p-3.5 mb-5 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <span className="font-semibold text-slate-900">SOP Menu Gaskara: </span>
          Semua perubahan ketersediaan menu langsung sinkron ke POS Kasir dan Web Pemesanan Customer tanpa jeda.
        </div>
      </div>

      {/* List per Kategori */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">Memuat menu...</div>
      ) : (
        <div className="space-y-4">
          {categoryGroups.map((cat) => {
            const catMenus = filteredMenus.filter((m) => {
              const catType =
                m.category?.type ||
                (m.category_id === 'c1111111-1111-1111-1111-111111111111'
                  ? 'coffee'
                  : m.category_id === 'c2222222-2222-2222-2222-222222222222'
                  ? 'non_coffee'
                  : 'snack');
              return catType === cat.key;
            });
            if (catMenus.length === 0) return null;

            return (
              <div
                key={cat.key}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
              >
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="font-semibold text-xs text-slate-800 uppercase tracking-wide">
                    {cat.title}
                  </h2>
                  <span className="text-xs text-slate-400">
                    {catMenus.length} item
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {catMenus.map((menu) => (
                    <div
                      key={menu.id}
                      className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {menu.image_url ? (
                          <img
                            src={menu.image_url}
                            alt={menu.name}
                            className="w-11 h-11 rounded-xl object-cover bg-slate-100 shrink-0 hidden sm:block border border-slate-200"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 hidden sm:flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900">{menu.name}</span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                menu.is_available
                                  ? 'bg-cyan-50 text-cyan-800'
                                  : 'bg-red-50 text-red-600'
                              }`}
                            >
                              {menu.is_available ? 'Tersedia' : 'Habis'}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-slate-700 block mt-0.5">
                            Rp {menu.price.toLocaleString('id-ID')}
                          </span>
                          {menu.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {menu.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Kontrol Menu: Edit, Hapus & Toggle */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleOpenEdit(menu)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-cyan-50 text-slate-500 hover:text-cyan-700 transition-colors"
                          title="Edit Menu"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(menu)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          title="Hapus Menu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                          <span className="text-xs text-slate-600">
                            {menu.is_available ? 'Siap Dijual' : 'Non-Aktif'}
                          </span>
                          <button
                            type="button"
                            disabled={updatingId === menu.id}
                            onClick={() => handleToggle(menu)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-slate-300 transition-colors duration-150 ease-in-out focus:outline-none ${
                              menu.is_available ? 'bg-cyan-500 border-cyan-500' : 'bg-slate-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-150 ease-in-out ${
                                menu.is_available ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog Tambah Menu Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-red-600" /> Tambah Menu Baru
                </h2>
                <span className="text-[11px] text-slate-500">
                  Daftarkan produk baru ke POS dan Web Customer
                </span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Menu <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Caramel Macchiato"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga (Rp) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    placeholder="25000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Menu
                </label>
                <textarea
                  rows={2}
                  placeholder="Rasa kopi, perpaduan susu atau komposisi..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL Gambar (Hanya tampil di Web Customer)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />

                {/* Preset Cepat Foto */}
                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-slate-400">Preset contoh:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        image_url:
                          'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600&auto=format&fit=crop'
                      })
                    }
                    className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px]"
                  >
                    Kopi Hangat
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        image_url:
                          'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=600&auto=format&fit=crop'
                      })
                    }
                    className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px]"
                  >
                    Es Kopi Dingin
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        image_url:
                          'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop'
                      })
                    }
                    className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px]"
                  >
                    Pastry / Roti
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-200 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Menyimpan...' : 'Simpan Menu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog Edit Menu */}
      {editingMenu && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Pencil className="w-4 h-4 text-cyan-600" /> Edit Menu
                </h2>
                <span className="text-[11px] text-slate-500">
                  Ubah data produk, harga, atau foto
                </span>
              </div>
              <button
                onClick={() => setEditingMenu(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Menu <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Caramel Macchiato"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={editFormData.category_id}
                    onChange={(e) => setEditFormData({ ...editFormData, category_id: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga (Rp) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    placeholder="25000"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Menu
                </label>
                <textarea
                  rows={2}
                  placeholder="Rasa kopi, perpaduan susu atau komposisi..."
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL Gambar (Hanya tampil di Web Customer)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={editFormData.image_url}
                  onChange={(e) => setEditFormData({ ...editFormData, image_url: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />

                {/* Preview Thumbnail */}
                {editFormData.image_url && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={editFormData.image_url}
                      alt="Preview"
                      className="w-10 h-10 aspect-square rounded-lg object-cover border border-slate-200"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-[10px] text-slate-400">Preview gambar produk</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMenu(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-200 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Memperbarui...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
