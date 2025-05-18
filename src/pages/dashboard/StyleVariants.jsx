import { cva } from "class-variance-authority";

// Style variants for sidebar tabs
export const tabVariants = cva(
  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium",
  {
    variants: {
      active: {
        true: "bg-indigo-100 text-indigo-700",
        false: "text-gray-600 hover:bg-gray-100",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

// Style variants for cards
export const cardVariants = cva("rounded-xl p-6 transition-all duration-300 h-full", {
  variants: {
    type: {
      primary:
        "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200",
      secondary: "bg-white border border-gray-200 shadow-sm hover:shadow-md",
      success:
        "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200",
      warning:
        "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200",
    },
  },
  defaultVariants: {
    type: "secondary",
  },
});