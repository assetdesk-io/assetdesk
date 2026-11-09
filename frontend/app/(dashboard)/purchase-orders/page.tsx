"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus, ShoppingCart, X, PackageCheck, Send, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  usePurchaseOrders,
  useCreatePurchaseOrder,
  useReceivePurchaseOrder,
  useSubmitPurchaseOrder,
  useApprovePurchaseOrder,
  useCancelPurchaseOrder,
} from "@/lib/query/hooks/usePurchaseOrders";
import { useVendors } from "@/lib/query/hooks/useVendors";
import { POStatus, PurchaseOrder } from "@/lib/api/purchase-orders";

const STATUS_STYLES: Record<POStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-indigo-100 text-indigo-700",
  RECEIVED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-500",
};

type ActionTarget = {
  po: PurchaseOrder;
  action: "submit" | "approve" | "receive" | "cancel";
};

function errorMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message || fallback
  );
}

export default function PurchaseOrdersPage() {
  const { data: orders = [], isLoading } = usePurchaseOrders();
  const { data: vendors = [] } = useVendors();

  const submitPO = useSubmitPurchaseOrder();
  const approvePO = useApprovePurchaseOrder();
  const receivePO = useReceivePurchaseOrder();
  const cancelPO = useCancelPurchaseOrder();

  const [showCreate, setShowCreate] = useState(false);
  const [actionTarget, setActionTarget] = useState<ActionTarget | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const vendorMap = new Map(vendors.map((v) => [v.id, v.name]));

  const filteredOrders = searchQuery.trim()
    ? orders.filter((po) => {
        const q = searchQuery.toLowerCase();
        const vendorName = po.vendorId ? (vendorMap.get(po.vendorId) ?? "").toLowerCase() : "";
        return po.poNumber.toLowerCase().includes(q) || vendorName.includes(q);
      })
    : orders;

  const ACTION_LABELS: Record<ActionTarget["action"], string> = {
    submit: "Submit",
    approve: "Approve",
    receive: "Receive",
    cancel: "Cancel",
  };

  const ACTION_TITLES: Record<ActionTarget["action"], string> = {
    submit: "Submit purchase order?",
    approve: "Approve purchase order?",
    receive: "Mark as received?",
    cancel: "Cancel purchase order?",
  };

  const isPendingMap: Record<ActionTarget["action"], boolean> = {
    submit: submitPO.isPending,
    approve: approvePO.isPending,
    receive: receivePO.isPending,
    cancel: cancelPO.isPending,
  };

  const handleConfirm = () => {
    if (!actionTarget) return;
    const { po, action } = actionTarget;
    if (action === "submit") submitPO.mutate(po.id);
    else if (action === "approve") approvePO.mutate(po.id);
    else if (action === "receive") receivePO.mutate(po.id);
    else if (action === "cancel") cancelPO.mutate(po.id);
    setActionTarget(null);
  };

  const confirmMessage = actionTarget
    ? {
        submit: `PO "${actionTarget.po.poNumber}" will be submitted for approval.`,
        approve: `PO "${actionTarget.po.poNumber}" will be marked as approved.`,
        receive: `PO "${actionTarget.po.poNumber}" will be marked as received.`,
        cancel: `PO "${actionTarget.po.poNumber}" will be cancelled.`,
      }[actionTarget.action]
    : "";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track orders and receiving from your vendors
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={15} className="mr-1" />
          New PO
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by PO number or vendor…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 w-72"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">PO Number</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Vendor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-gray-400 text-sm">Loading purchase orders…</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <ShoppingCart size={32} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
                    <p className="text-sm text-gray-500">
                      {searchQuery ? "No purchase orders match your search." : "No purchase orders yet. Click \"New PO\" to create one."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((po) => (
                  <tr
                    key={po.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">
                      {po.poNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {po.vendorId ? (vendorMap.get(po.vendorId) ?? po.vendorId) : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {po.currency} {po.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[po.status]}`}
                      >
                        {po.status.charAt(0) + po.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {format(new Date(po.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {po.status === POStatus.DRAFT && (
                          <>
                            <button
                              onClick={() => setActionTarget({ po, action: "submit" })}
                              className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <Send size={11} /> Submit
                            </button>
                            <button
                              onClick={() => setActionTarget({ po, action: "cancel" })}
                              className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <XCircle size={11} /> Cancel
                            </button>
                          </>
                        )}
                        {po.status === POStatus.SUBMITTED && (
                          <>
                            <button
                              onClick={() => setActionTarget({ po, action: "approve" })}
                              className="flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-colors"
                            >
                              <CheckCircle size={11} /> Approve
                            </button>
                            <button
                              onClick={() => setActionTarget({ po, action: "cancel" })}
                              className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <XCircle size={11} /> Cancel
                            </button>
                          </>
                        )}
                        {po.status === POStatus.APPROVED && (
                          <button
                            onClick={() => setActionTarget({ po, action: "receive" })}
                            className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <PackageCheck size={11} /> Receive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && <CreatePOModal onClose={() => setShowCreate(false)} />}

      {actionTarget && (
        <ConfirmDialog
          title={ACTION_TITLES[actionTarget.action]}
          message={confirmMessage}
          confirmLabel={ACTION_LABELS[actionTarget.action]}
          onConfirm={handleConfirm}
          onCancel={() => setActionTarget(null)}
          loading={isPendingMap[actionTarget.action]}
        />
      )}
    </div>
  );
}

// ── Create PO Modal ─────────────────────────────────────────

function CreatePOModal({ onClose }: { onClose: () => void }) {
  const { data: vendors = [] } = useVendors();
  const createPO = useCreatePurchaseOrder();

  const [vendorId, setVendorId] = useState("");
  const [totalAmount, setTotalAmount] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await createPO.mutateAsync({
        vendorId: vendorId || undefined,
        totalAmount: Number(totalAmount) || 0,
        currency,
      });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Failed to create purchase order."));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">New Purchase Order</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Vendor</label>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">No vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="po-amount"
              label="Total Amount"
              type="number"
              min="0"
              step="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
            />
            <Input
              id="po-currency"
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
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
            <Button type="submit" className="flex-1" loading={createPO.isPending}>
              Create PO
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
