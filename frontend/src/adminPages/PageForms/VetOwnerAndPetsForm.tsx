// src/components/vetTables/Veterinary/VetOwnerAndPets/VetOwnerAndPetsForm.tsx
import { useForm } from "react-hook-form";
import FormCard from "../../components/form/FormCard";
import Badge from "../../components/ui/badge/Badge";

export type OwnerStatus = "Active" | "Blocked";

export interface VetOwnerMinimalEditable {
  id: number;
  status: OwnerStatus;
  preferredContact: "Email" | "SMS" | "Phone";
  notes?: string;
  highRiskFlag?: boolean;
}

type Props = {
  owner: VetOwnerMinimalEditable;
  onSubmit: (data: VetOwnerMinimalEditable) => void;
  onCancel: () => void;
};

const VetOwnerAndPetsForm: React.FC<Props> = ({ owner, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<VetOwnerMinimalEditable>({
    defaultValues: owner,
  });

  const status = watch("status");
  const getStatusColor = (s: OwnerStatus) => (s === "Active" ? "success" : "error");

  const onFormSubmit = (data: VetOwnerMinimalEditable) => {
    onSubmit({ ...data, id: owner.id });
  };

  return (
    <div className="p-4 mx-auto max-w-xl md:p-6">
      <FormCard title="Edit Owner (limited)" onClose={onCancel}>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
          {/* Status */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Owner Status</h3>
            <div className="flex items-center gap-3">
              <Badge size="sm" color={getStatusColor(status)}>{status}</Badge>
              <select className="px-3 py-2 border rounded-md" {...register("status")}>
                <option value="Active">Active</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
            <p className="text-xs text-muted-foreground">
              Blocked owners cannot make new bookings with this clinic.
            </p>
          </section>

          {/* Contact preference */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Contact Preference</h3>
            <select className="px-3 py-2 border rounded-md" {...register("preferredContact")}>
              <option value="Email">Email</option>
              <option value="SMS">SMS</option>
              <option value="Phone">Phone</option>
            </select>
            <p className="text-xs text-muted-foreground">Used for reminders and follow-ups.</p>
          </section>

          {/* Notes */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Vet Notes (private)</h3>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Behavioral notes, special handling, allergy highlights…"
              {...register("notes")}
            />
          </section>

          {/* Risk Flag */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Risk</h3>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4" {...register("highRiskFlag")} />
              Mark as high risk (e.g., severe allergy, bite history)
            </label>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default VetOwnerAndPetsForm;
