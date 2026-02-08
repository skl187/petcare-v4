import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import Checkbox from "../../form/input/Checkbox";

interface Order {
  id: number;
  user: {
    image: string;
    name: string;
    role: string;
  };
  projectName: string;
  team: {
    images: string[];
  };
  status: string;
  budget: string;
}

const tableData: Order[] = [
  {
    id: 1,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Lindsey Curtis",
      role: "Web Designer",
    },
    projectName: "Agency Website",
    team: {
      images: [
        "/images/user/user-22.jpg",
        "/images/user/user-23.jpg",
        "/images/user/user-24.jpg",
      ],
    },
    budget: "3.9K",
    status: "Active",
  },
  {
    id: 2,
    user: {
      image: "/images/user/user-18.jpg",
      name: "Kaiya George",
      role: "Project Manager",
    },
    projectName: "Technology",
    team: {
      images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
    },
    budget: "24.9K",
    status: "Pending",
  },
  {
    id: 3,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Zain Geidt",
      role: "Content Writing",
    },
    projectName: "Blog Writing",
    team: {
      images: ["/images/user/user-27.jpg"],
    },
    budget: "12.7K",
    status: "Accepted",
  },
  {
    id: 4,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Abram Schleifer",
      role: "Digital Marketer",
    },
    projectName: "Social Media",
    team: {
      images: [
        "/images/user/user-28.jpg",
        "/images/user/user-29.jpg",
        "/images/user/user-30.jpg",
      ],
    },
    budget: "2.8K",
    status: "Completed",
  },
  {
    id: 5,
    user: {
      image: "/images/user/user-21.jpg",
      name: "Carla George",
      role: "Front-end Developer",
    },
    projectName: "Website",
    team: {
      images: [
        "/images/user/user-31.jpg",
        "/images/user/user-32.jpg",
        "/images/user/user-33.jpg",
      ],
    },
    budget: "4.5K",
    status: "Pending",
  },
];

export default function EnhancedTable() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionDropdown, setActionDropdown] = useState<string>("No actions");
  const [statusUpdate, setStatusUpdate] = useState<string>("");

  const toggleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === tableData.length ? [] : tableData.map((row) => row.id)
    );
  };

  const filteredData = tableData.filter(
    (order) =>
      order.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(order => 
    statusFilter ? order.status === statusFilter : true
  );

  const handleApplyAction = () => {
    if (actionDropdown === "Delete") {
      // Handle delete logic
      console.log("Deleting selected rows");
    } else if (actionDropdown === "Status" && statusUpdate) {
      // Handle status update logic
      console.log("Updating status to:", statusUpdate);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      {/* Filters & Bulk Actions */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {selectedRows.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-gray-700 font-medium">{selectedRows.length} Selected</span>
              
              <select
                className="px-3 py-2 border rounded-md"
                value={actionDropdown}
                onChange={(e) => setActionDropdown(e.target.value)}
              >
                <option value="No actions">No actions</option>
                <option value="Delete">Delete</option>
                <option value="Status">Status</option>
              </select>

              {actionDropdown === "Status" && (
                <select
                  className="px-3 py-2 border rounded-md"
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Completed">Completed</option>
                </select>
              )}

              <button
                className="px-3 py-1 text-white bg-blue-500 rounded-md"
                onClick={handleApplyAction}
              >
                Apply
              </button>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Search..."
            className="px-3 py-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="px-3 py-2 border rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b">
            <TableRow>
              <TableCell className="px-5 py-3">
                <Checkbox
                  checked={selectedRows.length === tableData.length}
                  onChange={toggleSelectAll}
                />
              </TableCell>
              <TableCell className="px-5 py-3">User</TableCell>
              <TableCell className="px-5 py-3">Project Name</TableCell>
              <TableCell className="px-5 py-3">Team</TableCell>
              <TableCell className="px-5 py-3">Status</TableCell>
              <TableCell className="px-5 py-3">Budget</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="px-5 py-4">
                  <Checkbox
                    checked={selectedRows.includes(order.id)}
                    onChange={() => toggleSelectRow(order.id)}
                  />
                </TableCell>
                <TableCell className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      className="w-10 h-10 rounded-full"
                      src={order.user.image}
                      alt={order.user.name}
                    />
                    <div>
                      <span className="font-medium">{order.user.name}</span>
                      <span className="block text-gray-500 text-sm">{order.user.role}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4">{order.projectName}</TableCell>
                <TableCell className="px-5 py-4">
                  <div className="flex -space-x-2">
                    {order.team.images.map((image, index) => (
                      <img
                        key={index}
                        className="w-6 h-6 border-2 border-white rounded-full"
                        src={image}
                        alt={`Team member ${index + 1}`}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Badge
                    size="sm"
                    color={
                      order.status === "Active"
                        ? "success"
                        : order.status === "Pending"
                        ? "warning"
                        : "error"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-4">{order.budget}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
