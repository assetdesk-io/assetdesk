"use client";

import { useState, useMemo } from "react";
import { Plus, AlertTriangle, X, ArrowDown, ArrowUp, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useInventoryItems,
  useCreateInventoryItem,
  useRecordMovement,
} from "@/lib/query/hooks/useInventory";
import { inventoryApiClient } from "@/lib/api/inventory";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { InventoryItem, MovementType, CreateInventoryItemInput } from "@/lib/api/inventory";

function errorMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message || fallback
  );
}

const MOVEMENT_LABELS: Record<MovementType, { label: string; icon: React.ElementType; color: string }> = {
  IN: { label: "Stock In", icon: ArrowDown, color: "text-green-600" },
  OUT: { label: "Stock Out", icon: ArrowUp, color: "text-red-600" },
  ADJUSTMENT: { label: "Adjustment", icon: SlidersHorizontal, color: "text-blue-600" },
};

export default function InventoryPage() {
  const { data: items = [], isLoading } = useInventoryItems();
  const [showCreate, setShowCreate] = useState(false);
  const [movementTarget, setMovementTarget] = useState<InventoryItem | null>(null);
  const [editTarget, setEditTarget] = useState<InventoryItem | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q),
    );
  }, [items, search]);

  const lowStock = items.filter((i) => i.quantityOnHand <= i.reorderLevel);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track consumable stock levels and movements
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={15} className="mr-1" />
          Add Item
        </Button>
      </div>

      {/* Low-stock alert */}
      {lowStock.length > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-amber-700">
          <AlertTriangle size={15} className="flex-shrink-0" aria-hidden="true" />
          <span>
            <strong>{lowStock.length}</strong> item
            {lowStock.length !== 1 ? "s are" : " is"} at or below reorder level.
          </span>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">SKU</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">On Hand</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Reorder At</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Unit Cost</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-gray-400 text-sm">
                    Loading inventory…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-gray-400 text-sm">
                    {search ? "No items match your search." : "No inventory items yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isLow = item.quantityOnHand <= item.reorderLevel;
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {item.sku}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold ${
                            isLow ? "text-amber-600" : "text-gray-900"
                          }`}
                        >
                          {item.quantityOnHand}
                        </span>
                        {" "}
                        <span className="text-gray-400 text-xs">{item.unit}</span>
                        {isLow && (
                          <AlertTriangle
                            size={12}
                            className="inline ml-1.5 text-amber-500"
                            aria-label="Low stock"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {item.reorderLevel} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        ${item.unitCost.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditTarget(item)}
                            className="text-xs text-gray-500 hover:text-gray-900 px-2.5 py-1 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setMovementTarget(item)}
                            className="text-xs text-gray-500 hover:text-gray-900 px-2.5 py-1 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                          >
                            Movement
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <CreateItemModal onClose={() => setShowCreate(false)} />
      )}

      {editTarget && (
        <EditItemModal
          item={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}

      {movementTarget && (
        <MovementModal
          item={movementTarget}
          onClose={() => setMovementTarget(null)}
        />
      )}
    </div>
  );
}

// ── Create Item Modal ─────────────────────────────────────────

function CreateItemModal({ onClose }: { onClose: () => void }) {
  const createItem = useCreateInventoryItem();

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("unit");
  const [quantityOnHand, setQuantityOnHand] = useState("0");
  const [reorderLevel, setReorderLevel] = useState("5");
  const [unitCost, setUnitCost] = useState("0");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) {
      setError("SKU and name are required.");
      return;
    }
    setError("");
    const payload: CreateInventoryItemInput = {
      sku: sku.trim(),
      name: name.trim(),
      unit: unit.trim() || "unit",
      quantityOnHand: Number(quantityOnHand) || 0,
      reorderLevel: Number(reorderLevel) || 5,
      unitCost: Number(unitCost) || 0,
    };
    try {
      await createItem.mutateAsync(payload);
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Failed to create item."));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Add Inventory Item</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="inv-sku"
              label="SKU *"
              placeholder="e.g. CABLE-USB-C"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
            <Input
              id="inv-name"
              label="Name *"
              placeholder="e.g. USB-C Cable"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              id="inv-qty"
              label="Qty on Hand"
              type="number"
              min="0"
              value={quantityOnHand}
              onChange={(e) => setQuantityOnHand(e.target.value)}
            />
            <Input
              id="inv-reorder"
              label="Reorder Level"
              type="number"
              min="0"
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
            />
            <Input
              id="inv-unit"
              label="Unit"
              placeholder="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>

          <Input
            id="inv-cost"
            label="Unit Cost ($)"
            type="number"
            min="0"
            step="0.01"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
          />

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={createItem.isPending}>
              Add Item
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Record Movement Modal ─────────────────────────────────────

function MovementModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const recordMovement = useRecordMovement();

  const [type, setType] = useState<MovementType>("IN");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }
    setError("");
    try {
      await recordMovement.mutateAsync({
        id: item.id,
        type,
        quantity: qty,
        reason: reason.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Failed to record movement."));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Record Movement</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="bg-gray-50 rounded-lg px-3 py-2.5 text-sm">
            <p className="font-medium text-gray-900">{item.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Current stock: <strong>{item.quantityOnHand} {item.unit}</strong>
            </p>
          </div>

          {/* Movement type toggle */}
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(MOVEMENT_LABELS) as [MovementType, typeof MOVEMENT_LABELS[MovementType]][]).map(
              ([t, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg border text-xs font-medium transition-colors ${
                      type === t
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <Icon size={14} />
                    {cfg.label}
                  </button>
                );
              },
            )}
          </div>

          <Input
            id="mov-qty"
            label="Quantity *"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="mov-reason" className="text-sm font-medium text-gray-700">
              Reason
            </label>
            <input
              id="mov-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Monthly restock"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={recordMovement.isPending}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Item Modal ───────────────────────────────────────────

function EditItemModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const queryClient = useQueryClient();

  const [name, setName] = useState(item.name);
  const [reorderLevel, setReorderLevel] = useState(String(item.reorderLevel));
  const [unitCost, setUnitCost] = useState(String(item.unitCost));
  const [unit, setUnit] = useState(item.unit);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setError("");
    setIsPending(true);
    try {
      // Use the raw API client for a PATCH — inventory hook doesn't expose update yet
      await inventoryApiClient.updateItem(item.id, {
        name: name.trim(),
        reorderLevel: Number(reorderLevel) || 0,
        unitCost: Number(unitCost) || 0,
        unit: unit.trim() || "unit",
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Failed to update item."));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Edit Item</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500 font-mono">
            SKU: {item.sku}
          </div>

          <Input
            id="edit-inv-name"
            label="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              id="edit-inv-reorder"
              label="Reorder Level"
              type="number"
              min="0"
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
            />
            <Input
              id="edit-inv-cost"
              label="Unit Cost ($)"
              type="number"
              min="0"
              step="0.01"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
            />
            <Input
              id="edit-inv-unit"
              label="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
