'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Package,
  PlusCircle,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { CatalogItemData, ItemType } from '@/lib/types';
import { formatIDR } from '@/lib/crypto';

export default function AdminCatalogPage() {
  const { state, saveCatalogItem, removeCatalogItem } = useAppState();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [skuCode, setSkuCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('International Consulting');
  const [type, setType] = useState<ItemType>('SERVICE');
  const [price, setPrice] = useState(5000000);
  const [stock, setStock] = useState(25);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEdit = (item: CatalogItemData) => {
    setEditingId(item.id);
    setSkuCode(item.skuCode);
    setName(item.name);
    setCategory(item.category);
    setType(item.type);
    setPrice(item.price);
    setStock(item.stock ?? 25);
    setDescription(item.description);
  };

  const resetForm = () => {
    setEditingId(null);
    setSkuCode('');
    setName('');
    setCategory('International Consulting');
    setType('SERVICE');
    setPrice(5000000);
    setStock(25);
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !skuCode.trim()) return;
    setSaving(true);
    try {
      await saveCatalogItem({
        id: editingId || undefined,
        skuCode: skuCode.trim().toUpperCase(),
        name: name.trim(),
        category: category.trim(),
        type,
        price: Number(price),
        stock: type === 'PRODUCT' ? Number(stock) : null,
        description: description.trim(),
        isActive: true,
      });
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#192730]">
            Manajemen Katalog Hibrida (Jasa Konsultan & Produk Fisik)
          </h1>
          <p className="text-xs text-slate-500">
            Setiap perubahan di halaman ini langsung tersinkronisasi dengan Storefront Company Profile (/) dan Form Buat Invoice (/admin/invoices/create)
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-800">
          <Sparkles className="h-3.5 w-3.5" />
          Live Sync Storefront & ERP
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Add / Edit Catalog */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-4 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold text-[#192730]">
              {editingId ? 'Edit Item Katalog' : '+ Tambah Jasa / Produk Baru'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Batal Edit
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tipe Katalog
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('SERVICE')}
                className={`rounded-xl py-2.5 px-3 text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  type === 'SERVICE'
                    ? 'bg-[#0089e4] text-white border-[#0089e4]'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                Jasa (SERVICE)
              </button>
              <button
                type="button"
                onClick={() => setType('PRODUCT')}
                className={`rounded-xl py-2.5 px-3 text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  type === 'PRODUCT'
                    ? 'bg-[#0089e4] text-white border-[#0089e4]'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Package className="h-3.5 w-3.5" />
                Barang (PRODUCT)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kode SKU *
              </label>
              <input
                type="text"
                required
                value={skuCode}
                onChange={(e) => setSkuCode(e.target.value)}
                placeholder="SOC-PMA-02 / FWP 2"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Consulting / Merchandise"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Layanan / Produk *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Paket Pendampingan Izin Usaha"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Harga Satuan (Rp) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={price}
                onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
              />
            </div>

            {type === 'PRODUCT' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Stok Barang Fisik
                </label>
                <input
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Deskripsi Singkat
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rincian manfaat layanan atau spesifikasi barang..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0089e4] hover:bg-[#0073c2] px-4 py-3 text-xs font-extrabold text-white shadow-md transition"
          >
            <PlusCircle className="h-4 w-4" />
            {saving
              ? 'Menyimpan...'
              : editingId
              ? 'Simpan Perubahan Katalog'
              : 'Tambahkan ke Katalog & Website'}
          </button>
        </form>

        {/* Catalog List Table */}
        <div className="lg:col-span-8 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#192730]">
              Daftar Item Katalog Aktif ({state.catalog.length} Item)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">SKU & Tipe</th>
                  <th className="py-3 px-4">Nama Layanan / Produk</th>
                  <th className="py-3 px-4 text-right">Harga</th>
                  <th className="py-3 px-4 text-center">Stok</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {state.catalog.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#192730] block">
                        {item.skuCode}
                      </span>
                      <span
                        className={`inline-block mt-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                          item.type === 'SERVICE'
                            ? 'bg-sky-50 text-[#0089e4]'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {item.description}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-[#192730] whitespace-nowrap">
                      {formatIDR(item.price)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.type === 'SERVICE' ? (
                        <span className="text-[11px] text-slate-400">Unlimited (Jasa)</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />
                          {item.stock ?? 0} pcs
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="rounded-lg border border-slate-300 bg-white hover:bg-slate-100 p-1.5 text-slate-700"
                          title="Edit Item"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCatalogItem(item.id)}
                          className="rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 p-1.5 text-red-600"
                          title="Hapus Item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
