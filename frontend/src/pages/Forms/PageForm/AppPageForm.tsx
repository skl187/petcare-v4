import React, { useState } from "react";
import { useForm } from "react-hook-form";
import FormCard from "../../../components/form/FormCard";
import Badge from "../../../components/ui/badge/Badge";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export interface AppPageFormData {
  title: string;
  content: string;
  status: "Active" | "Inactive";
}

export interface AppPage {
  id: number;
  title: string;
  content: string;
  status: "Active" | "Inactive";
}

interface AppPageFormProps {
  page?: AppPage | null;
  onSubmit: (data: AppPageFormData) => void;
  onCancel: () => void;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet',
  'link', 'image'
];

const AppPageForm: React.FC<AppPageFormProps> = ({
  page,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<AppPageFormData>({
    defaultValues: page
      ? {
          title: page.title,
          content: page.content,
          status: page.status,
        }
      : {
          title: "",
          content: "",
          status: "Active",
        },
  });

  const [content, setContent] = useState(page?.content || "");

  // Watch form values
  const status = watch("status");

  // Status badge color
  const getStatusColor = (status: string) => 
    status === "Active" ? "success" : "error";

  const handleContentChange = (value: string) => {
    setContent(value);
    setValue("content", value);
  };

  const onFormSubmit = (data: AppPageFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <div className="p-4 mx-auto max-w-6xl md:p-6">
      <FormCard
        title={page ? "Edit Page" : "Create Page"}
        onClose={onCancel}
      >
        <form 
          id="page-form" 
          onSubmit={handleSubmit(onFormSubmit)} 
          className="space-y-8"
        >
          {/* Basic Information Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Page Details
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="title">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("title", { 
                    required: "Title is required",
                    minLength: {
                      value: 2,
                      message: "Title must be at least 2 characters"
                    }
                  })}
                />
                {errors.title && (
                  <span className="text-sm text-red-600">{errors.title.message}</span>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="content">
                  Content *
                </label>
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={handleContentChange}
                  modules={modules}
                  formats={formats}
                  className="h-64 mb-16"
                />
                {errors.content && (
                  <span className="text-sm text-red-600">{errors.content.message}</span>
                )}
              </div>
            </div>
          </section>

          {/* Status Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="flex items-center gap-3">
                  <Badge 
                    size="sm" 
                    color={getStatusColor(status)}
                  >
                    {status}
                  </Badge>
                  <select
                    className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    value={status}
                    onChange={(e) => 
                      setValue("status", e.target.value as "Active" | "Inactive")
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200 disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {page ? "Updating..." : "Creating..."}
                </span>
              ) : (
                page ? "Update Page" : "Create Page"
              )}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default AppPageForm;