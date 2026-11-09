"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ArrowRight, Plus, X, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useTransfers,
  useCreateTransfer,
  useApproveTransfer,
  useRejectTransfer,
} from "@/lib/query/hooks/useTransfers";
import { useDepartmentsList } from "@/lib/query/hooks/useAssets";
import { useAssets } from "@/lib/query/hooks/useAssets";
import { TransferStatus, AssetTransfer } from "@/lib/api/transfers";

const STATUS_STYLES: Record<TransferStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const ALL_STATUSES = Object.values(TransferStatus);

function errorMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message || fallback
  );
}

export default function TransfersPage() {
  const [statusFilter, setStatusFilter] = useState<TransferStatus | "ALL">("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<AssetTransfer | null>(null);
  const [approveTarget, setApproveTarget] = useState<AssetTransfer | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: transfers = [], isLoading } = useTransfers();
  const { data: departments = [] } = useDepartmentsList();
  const { data: assetsPage } = useAssets({ limit: 500 });
  const approveTransfer = useApproveTransfer();
  const rejectTransfer = useRejectTransfer();

  const deptMap = useMemo(() => {
    const m = new Map<string, string>();
    departments.forEach((d) => m.set(d.id, d.name));
    return m;
  }, [departments]);

  const assetMap = useMemo(() => {
    const m = new Map<string, string>();
    (assetsPage?.data ?? []).forEach((a) => m.set(a.id, a.name));
    return m;
  }, [assetsPage]);

  const filtered = useMemo(() => {
    const byStatus = statusFilter === "ALL" ? transfers : transfers.filter((t) => t.status === statusFilter);
    if (!searchQuery.trim()) return byStatus;
    const q = searchQuery.toLowerCase();
    return byStatus.filter(
      (t) =>
        (assetMap.get(t.assetId) ?? t.assetId).toLowerCase().includes(q) ||
        (deptMap.get(t.fromDepartmentId) ?? "").toLowerCase().includes(q) ||
        (deptMap.get(t.toDepartmentId) ?? "").toLowerCase().includes(q),
    );
  }, [transfers, statusFilter, searchQuery, assetMap, deptMap]);

  const handleApprove = async () => {
    if (!approveTarget) return;
    try {
      await approveTransfer.mutateAsync(approveTarget.id);
    } finally {
      setApproveTarget(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      await rejectTransfer.mutateAsync({
        id: rejectTarget.id,
        reason: rejectReason,
      });
    } finally {
      setRejectTarget(null);
      setRejectReason("");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Asset Transfers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Request and approve asset moves between departments
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={15} className="mr-1" />
          New Transfer
        </Button>
      </div>

      {/* Status filter tabs + search */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setStatusFilter("ALL")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${statusFilter === "ALL" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>All</button>
          {ALL_STATUSES.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${statusFilter === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by asset or department…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 w-64"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Asset
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Route
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Date
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
                    Loading transfers…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-14 text-gray-400 text-sm"
                  >
                    No transfers found.
                  </td>
                </tr>
              ) : (
                filtered.map((tr) => (
                  <tr
                    key={tr.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 text-sm">
                      {assetMap.get(tr.assetId) ?? (
                        <span className="font-mono text-xs text-gray-400">
                          {tr.assetId.slice(0, 8)}…
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <span className="truncate max-w-[100px]">
                          {deptMap.get(tr.fromDepartmentId) ??
                            tr.fromDepartmentId.slice(0, 6)}
                        </span>
                        <ArrowRight
                          size={13}
                          className="text-gray-400 flex-shrink-0"
                        />
                        <span className="truncate max-w-[100px]">
                          {deptMap.get(tr.toDepartmentId) ??
                            tr.toDepartmentId.slice(0, 6)}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[tr.status]}`}
                      >
                        {tr.status.charAt(0) + tr.status.slice(1).toLowerCase()}
                      </span>
                      {tr.rejectionReason && (
                        <p className="text-xs text-red-400 mt-0.5 truncate max-w-[180px]">
                          {tr.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {format(new Date(tr.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      {tr.status === TransferStatus.PENDING && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setApproveTarget(tr)}
                            disabled={approveTransfer.isPending}
                            title="Approve"
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={13} />
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectTarget(tr)}
                            disabled={rejectTransfer.isPending}
                            title="Reject"
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={13} />
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create transfer modal */}
      {showCreate && (
        <CreateTransferModal onClose={() => setShowCreate(false)} />
      )}

      {/* Approve confirm */}
      {approveTarget && (
        <ConfirmDialog
          title="Approve transfer?"
          message={`Approve moving "${assetMap.get(approveTarget.assetId) ?? approveTarget.assetId}" from "${deptMap.get(approveTarget.fromDepartmentId) ?? approveTarget.fromDepartmentId}" to "${deptMap.get(approveTarget.toDepartmentId) ?? approveTarget.toDepartmentId}"?`}
          onConfirm={handleApprove}
          onCancel={() => setApproveTarget(null)}
          loading={approveTransfer.isPending}
        />
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setRejectTarget(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                Reject Transfer
              </h2>
              <button
                onClick={() => setRejectTarget(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-1 mb-4">
              <label
                htmlFor="reject-reason"
                className="text-sm font-medium text-gray-700"
              >
                Reason (optional)
              </label>
              <textarea
                id="reject-reason"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this transfer is rejected…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setRejectTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                loading={rejectTransfer.isPending}
                onClick={handleReject}
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Create Transfer Modal ────────────────────────────────────────

function CreateTransferModal({ onClose }: { onClose: () => void }) {
  const { data: assetsPage } = useAssets({ limit: 500 });
  const { data: departments = [] } = useDepartmentsList();
  const createTransfer = useCreateTransfer();

  const [assetId, setAssetId] = useState("");
  const [fromDepartmentId, setFromDepartmentId] = useState("");
  const [toDepartmentId, setToDepartmentId] = useState("");
  const [error, setError] = useState("");

  const assets = assetsPage?.data ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !fromDepartmentId || !toDepartmentId) {
      setError("All fields are required.");
      return;
    }
    if (fromDepartmentId === toDepartmentId) {
      setError("Source and destination departments must differ.");
      return;
    }
    setError("");
    try {
      await createTransfer.mutateAsync({ assetId, fromDepartmentId, toDepartmentId });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Failed to create transfer request."));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            New Transfer Request
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
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Asset *</label>
            <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">Select asset</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                From Department *
              </label>
              <select
                value={fromDepartmentId}
                onChange={(e) => setFromDepartmentId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">Select</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                To Department *
              </label>
              <select
                value={toDepartmentId}
                onChange={(e) => setToDepartmentId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">Select</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={createTransfer.isPending}
            >
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
