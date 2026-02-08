// src/components/vetTables/Veterinary/VetOwnerAndPets/VetOwnerAndPetsTable.tsx
import { MdEdit } from "react-icons/md";
import { useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHeader, TableRow,
} from "../../../ui/table"; // adjust path
import Badge from "../../../ui/badge/Badge";
import Checkbox from "../../../form/input/Checkbox";
import Pagination from "../../../../components/tables/tableComponents/Pagination";
import useSort from "../../../../hooks/useSort";
import SortableTableHeader from "../../../../components/tables/tableComponents/SortableTableHeader";
import { TableToolbar } from "../../../../components/tables/tableComponents/TableToolbar";
import ImageHoverPreview from "../../../../components/tables/tableComponents/ImageHoverPreview";
import Switch from "../../../form/switch/Switch";
import VetOwnerAndPetsForm, {VetOwnerMinimalEditable} from "../../../../pages/VetPageForms/Users/VetOwnerAndPetsForm/VetOwnerAndPetsForm";

export type OwnerStatus = "Active" | "Blocked";

export interface VetOwnerPet {
  id: number;
  name: string;
  species: "Dog" | "Cat" | "Bird" | "Other";
  breed?: string;
  photo?: string;
}

export interface VetOwnerRow {
  id: number;
  vetId: number;
  owner: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  pets: VetOwnerPet[];
  lastVisit?: string;        // ISO date of last appointment
  status: OwnerStatus;       // Active / Blocked
  preferredContact?: "Email" | "SMS" | "Phone";
  notes?: string;            // vet-side notes
  highRiskFlag?: boolean;    // e.g., bite history, severe allergy, etc.
}

// ---- mock data (replace with API) ----
const mockRows: VetOwnerRow[] = [
  {
    id: 1,
    vetId: 1,
    owner: { name: "John Doe", email: "john@example.com", phone: "+1 555-1000", avatar: "/images/clients/client-1.jpg" },
    pets: [
      { id: 101, name: "Bella", species: "Dog", breed: "Labrador", photo: "/images/pets/dog.jpg" },
      { id: 102, name: "Max",   species: "Dog", breed: "Beagle",   photo: "/images/pets/dog2.jpg" },
    ],
    lastVisit: "2025-08-08",
    status: "Active",
    preferredContact: "Email",
    notes: "Responds best to morning calls.",
    highRiskFlag: false,
  },
  {
    id: 2,
    vetId: 1,
    owner: { name: "Alice Johnson", email: "alice@example.com", phone: "+1 555-2000", avatar: "/images/clients/client-2.jpg" },
    pets: [
      { id: 103, name: "Coco", species: "Cat", breed: "Siamese", photo: "/images/pets/cat.jpg" },
    ],
    lastVisit: "2025-07-29",
    status: "Active",
    preferredContact: "SMS",
    notes: "",
    highRiskFlag: false,
  },
  {
    id: 3,
    vetId: 2,
    owner: { name: "Mark Ray", email: "mark@example.com", phone: "+1 555-3000", avatar: "/images/clients/client-3.jpg" },
    pets: [{ id: 104, name: "Rocky", species: "Dog", breed: "GSD", photo: "/images/pets/dog2.jpg" }],
    lastVisit: "2025-08-02",
    status: "Blocked",
    preferredContact: "Phone",
    notes: "Multiple no-shows.",
    highRiskFlag: true,
  },
];

type Props = {
  /** Show owners for this vet; if omitted, shows all (for admin/testing) */
  vetId?: number;
};

export default function VetOwnerAndPetsTable({ vetId }: Props) {
  const initial = useMemo(
    () => (vetId ? mockRows.filter(r => r.vetId === vetId) : mockRows),
    [vetId]
  );

  const [rows, setRows] = useState<VetOwnerRow[]>(initial);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionDropdown, setActionDropdown] = useState<string>("No actions");
  const [statusUpdate, setStatusUpdate] = useState<OwnerStatus | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [editRow, setEditRow] = useState<VetOwnerRow | null>(null);

  const columns = [
    { key: "owner",     label: "Owner",      className: "min-w-[240px] font-semibold" },
    { key: "pets",      label: "Pets",       className: "min-w-[220px]" },
    { key: "lastVisit", label: "Last Visit", className: "min-w-[140px]" },
    { key: "status",    label: "Status",     className: "min-w-[140px]" },
    { key: "risk",      label: "Risk",       className: "min-w-[100px]" },
  ] as const;

  // Filter + search
  const filtered = useMemo(() => {
    return rows
      .filter(r => (statusFilter ? r.status === statusFilter : true))
      .filter(r => {
        if (!searchQuery) return true;
        const hay = [
          r.owner.name, r.owner.email, r.owner.phone,
          ...r.pets.map(p => p.name),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(searchQuery.toLowerCase());
      });
  }, [rows, statusFilter, searchQuery]);

  // Sort
  const { sortedData, requestSort, sortConfig } = useSort(filtered, {
    key: "owner",
    direction: "asc",
  } as any);

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const currentItems = (sortedData as VetOwnerRow[]).slice(indexOfLast - itemsPerPage, indexOfLast);

  // Selection
  const toggleSelectRow = (id: number) =>
    setSelectedRows(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  const toggleSelectAll = () =>
    setSelectedRows(selectedRows.length === rows.length ? [] : rows.map(r => r.id));

  // Bulk actions (no delete; only status)
  const handleApplyAction = () => {
    if (actionDropdown === "Status" && statusUpdate) {
      setRows(prev =>
        prev.map(r => (selectedRows.includes(r.id) ? { ...r, status: statusUpdate as OwnerStatus } : r))
      );
      setSelectedRows([]);
    }
  };

  // Single status toggle (block/unblock)
  const toggleStatus = (id: number) => {
    setRows(prev =>
      prev.map(r =>
        r.id === id ? { ...r, status: r.status === "Active" ? "Blocked" : "Active" } : r
      )
    );
  };

  const onEditSubmit = (data: VetOwnerMinimalEditable) => {
    setRows(prev =>
      prev.map(r =>
        r.id === editRow?.id
          ? {
              ...r,
              status: data.status,
              preferredContact: data.preferredContact,
              notes: data.notes || "",
              highRiskFlag: data.highRiskFlag ?? false,
            }
          : r
      )
    );
    setEditRow(null);
  };

  const badgeColor = (s: OwnerStatus) => (s === "Active" ? "success" : "error");

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      {/* Toolbar */}
      <TableToolbar
        onAddNew={undefined}                  // no create from vet side
        addButtonLabel=""
        selectedRowsCount={selectedRows.length}
        bulkActionsOptions={
          <>
            <option value="No actions">No actions</option>
            <option value="Status">Status</option>
          </>
        }
        statusUpdateOptions={
          <>
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
          </>
        }
        showStatusDropdown={actionDropdown === "Status"}
        onBulkActionChange={setActionDropdown}
        onStatusUpdateChange={(v) => setStatusUpdate(v as OwnerStatus)}
        onApplyAction={handleApplyAction}
        bulkActionValue={actionDropdown}
        statusUpdateValue={statusUpdate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by owner, email, phone, pet…"
        filterOptions={
          <>
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
          </>
        }
        onFilterChange={setStatusFilter}
        filterValue={statusFilter}
      />

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-600">
          No owners found for this vet.
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
          <div className="min-w-[1100px]">
            <Table className="w-full">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableCell className="w-10 p-2">
                    <Checkbox
                      checked={selectedRows.length === rows.length && rows.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </TableCell>
                  {columns.map(col => (
                    <SortableTableHeader<VetOwnerRow>
                      key={col.key as string}
                      columnKey={col.key as keyof VetOwnerRow}
                      label={col.label}
                      sortConfig={sortConfig}
                      requestSort={requestSort}
                      className={`p-2 text-left ${col.className}`}
                    />
                  ))}
                  <TableCell className="p-2 w-32">Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentItems.map(r => (
                  <TableRow key={r.id} className="hover:bg-gray-50">
                    <TableCell className="p-2">
                      <Checkbox
                        checked={selectedRows.includes(r.id)}
                        onChange={() => toggleSelectRow(r.id)}
                      />
                    </TableCell>

                    {/* Owner */}
                    <TableCell className="p-2">
                      <div className="flex items-center gap-3">
                        <ImageHoverPreview
                          src={r.owner.avatar || "/images/clients/placeholder.jpg"}
                          alt={r.owner.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div className="text-sm">
                          <div className="font-medium">{r.owner.name}</div>
                          <div className="text-xs text-muted-foreground">{r.owner.email}</div>
                          {r.owner.phone && <div className="text-xs text-muted-foreground">{r.owner.phone}</div>}
                        </div>
                      </div>
                    </TableCell>

                    {/* Pets quick list */}
                    <TableCell className="p-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {r.pets.slice(0, 3).map(p => (
                          <div key={p.id} className="flex items-center gap-2 px-2 py-1 rounded-md border">
                            <ImageHoverPreview
                              src={p.photo || "/images/pets/placeholder.jpg"}
                              alt={p.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-sm">{p.name}</span>
                          </div>
                        ))}
                        {r.pets.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{r.pets.length - 3} more</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Last visit */}
                    <TableCell className="p-2 text-sm">
                      {r.lastVisit ? new Date(r.lastVisit).toLocaleDateString() : "—"}
                    </TableCell>

                    {/* Status + Block toggle */}
                    <TableCell className="p-2">
                      <div className="flex items-center gap-2">
                        <Badge size="sm" color={badgeColor(r.status)}>{r.status}</Badge>
                        <Switch
                          label=""
                          checked={r.status === "Active"}
                          onChange={() => toggleStatus(r.id)}
                        />
                      </div>
                    </TableCell>

                    {/* Risk flag */}
                    <TableCell className="p-2 text-sm">
                      {r.highRiskFlag ? (
                        <Badge size="sm" color="warning">High</Badge>
                      ) : (
                        <span className="text-muted-foreground">Normal</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="p-2">
                      <button
                        onClick={() => setEditRow(r)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        title="Edit owner notes/contact/status"
                      >
                        <MdEdit className="w-5 h-5" />
                      </button>
                      {/* No delete */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Pagination
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
      />

      {(!!editRow) && (
        <VetOwnerAndPetsForm
          owner={{
            id: editRow.id,
            status: editRow.status,
            preferredContact: editRow.preferredContact ?? "Email",
            notes: editRow.notes ?? "",
            highRiskFlag: !!editRow.highRiskFlag,
          }}
          onSubmit={onEditSubmit}
          onCancel={() => setEditRow(null)}
        />
      )}
    </div>
  );
}
