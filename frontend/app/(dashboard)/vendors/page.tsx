"use client";

import { useState } from "react";
import { Plus, Building2, Globe, Mail, Phone, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useVendors,
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
} from "@/lib/query/hooks/useVendors";
import { Vendor, CreateVendorInput } from "@/lib/api/vendors";

function errorMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message || fallback
  );
}

export default function VendorsPage() {
  const { data: vendors = [], isLoading } = useVendors();
  const deleteVendor = useDeleteVendor();

  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [formTarget, setFormTarget] = useState<{
    mode: "create" | "edit";
    vendor?: Vendor;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteVendor.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const filtered = vendors.filter((v) => {
    if (statusFilter === "ACTIVE") return v.isActive;
    if (statusFilter === "INACTIVE") return !v.isActive;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your suppliers and service providers
          </p>
        </div>
        <Button size="sm" onClick={() => setFormTarget({ mode: "create" })}>
          <Plus size={15} className="mr-1" />
          Add Vendor
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4 w-fit">
        {(["ALL", "ACTIVE", "INACTIVE"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              statusFilter === f
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            {f !== "ALL" && (
              <span className="ml-1.5 text-gray-400">
                ({f === "ACTIVE" ? vendors.filter((v) => v.isActive).length : vendors.filter((v) => !v.isActive).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Code
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Contact
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-14 text-gray-400 text-sm"
                  >
                    Loading vendors…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Building2
                      size={32}
                      className="text-gray-200 mx-auto mb-3"
                      aria-hidden="true"
                    />
                    <p className="text-sm text-gray-500">
                      {statusFilter !== "ALL"
                        ? `No ${statusFilter.toLowerCase()} vendors.`
                        : "No vendors yet. Click \"Add Vendor\" to get started."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{v.name}</p>
                      {v.website && (
                        <a
                          href={
                            v.website.startsWith("http")
                              ? v.website
                              : `https://${v.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 mt-0.5"
                        >
                          <Globe size={11} />
                          {v.website}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {v.code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {v.contactName && (
                          <p className="text-gray-700 text-xs">{v.contactName}</p>
                        )}
                        {v.email && (
                          <a
                            href={`mailto:${v.email}`}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700"
                          >
                            <Mail size={11} />
                            {v.email}
                          </a>
                        )}
                        {v.phone && (
                          <p className="flex items-center gap-1 text-xs text-gray-400">
                            <Phone size={11} />
                            {v.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          v.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {v.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setFormTarget({ mode: "edit", vendor: v })
                          }
                          className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(v)}
                          className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded border border-red-100 hover:border-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {formTarget && (
        <VendorFormModal
          mode={formTarget.mode}
          vendor={formTarget.vendor}
          onClose={() => setFormTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete vendor?"
          message={`"${deleteTarget.name}" will be permanently deleted.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteVendor.isPending}
        />
      )}
    </div>
  );
}

// ── Vendor Form Modal ─────────────────────────────────────────

function VendorFormModal({
  mode,
  vendor,
  onClose,
}: {
  mode: "create" | "edit";
  vendor?: Vendor;
  onClose: () => void;
}) {
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const isPending = createVendor.isPending || updateVendor.isPending;

  const [name, setName] = useState(vendor?.name ?? "");
  const [code, setCode] = useState(vendor?.code ?? "");
  const [contactName, setContactName] = useState(vendor?.contactName ?? "");
  const [email, setEmail] = useState(vendor?.email ?? "");
  const [phone, setPhone] = useState(vendor?.phone ?? "");
  const [address, setAddress] = useState(vendor?.address ?? "");
  const [website, setWebsite] = useState(vendor?.website ?? "");
  const [taxId, setTaxId] = useState(vendor?.taxId ?? "");
  const [notes, setNotes] = useState(vendor?.notes ?? "");
  const [isActive, setIsActive] = useState(vendor?.isActive ?? true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("Name and code are required.");
      return;
    }
    setError("");

    const payload: CreateVendorInput = {
      name: name.trim(),
      code: code.trim(),
      contactName: contactName.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      website: website.trim() || undefined,
      taxId: taxId.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      if (mode === "create") {
        await createVendor.mutateAsync(payload);
      } else if (vendor) {
        await updateVendor.mutateAsync({
          id: vendor.id,
          data: { ...payload, isActive },
        });
      }
      setSaved(true);
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      setError(errorMessage(err, "Failed to save vendor."));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-base font-semibold text-gray-900">
            {mode === "create" ? "Add Vendor" : "Edit Vendor"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="v-name"
              label="Name *"
              placeholder="e.g. Dell Technologies"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              id="v-code"
              label="Code *"
              placeholder="e.g. DELL-001"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="v-contact"
              label="Contact Name"
              placeholder="e.g. Jane Smith"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
            <Input
              id="v-email"
              label="Email"
              type="email"
              placeholder="vendor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="v-phone"
              label="Phone"
              placeholder="+1 555 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              id="v-website"
              label="Website"
              placeholder="dell.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="v-address"
              label="Address"
              placeholder="123 Main St, City"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Input
              id="v-taxid"
              label="Tax ID"
              placeholder="XX-XXXXXXX"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="v-notes"
              className="text-sm font-medium text-gray-700"
            >
              Notes
            </label>
            <textarea
              id="v-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
          </div>

          {mode === "edit" && (
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              Active vendor
            </label>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={isPending}>
              {mode === "create" ? "Add Vendor" : "Save Changes"}
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle size={13} />
                Saved
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
