// cartVariant.js
import { cva } from 'class-variance-authority';

// Buttons
export const buttonVariant = cva(
    ['px-4', 'py-1.5', 'text-sm', 'rounded-lg', 'transition-all', 'duration-DEFAULT'],
    {
        variants: {
            intent: {
                primary: ['bg-indigo-600', 'text-white', 'hover:bg-indigo-700'],
                secondary: ['border', 'border-gray-300', 'text-gray-700', 'hover:bg-gray-100'],
                filter: ['text-indigo-600', 'hover:text-indigo-800', 'flex', 'items-center', 'space-x-1'],
                tag: ['bg-indigo-50', 'text-indigo-700', 'px-2', 'py-0.5', 'rounded-full', 'text-xs', 'flex', 'items-center'],
                price: ['px-3', 'py-1', 'text-xs', 'rounded-full'],
            },
            active: {
                true: ['bg-indigo-100', 'text-indigo-700'],
                false: ['bg-gray-100', 'text-gray-700'],
            },
        },
        defaultVariants: { intent: 'secondary', active: false },
    }
);

// Input và Select
export const inputVariant = cva(
    ['border', 'border-gray-300', 'rounded-lg', 'px-3', 'py-1.5', 'text-sm', 'focus:outline-none', 'focus:ring-2', 'focus:ring-indigo-300'],
    {
        variants: {
            type: {
                text: ['w-64'],
                select: ['w-full'],
            },
        },
        defaultVariants: { type: 'text' },
    }
);

// Container
export const containerVariant = cva(
    ['bg-white', 'rounded-2xl', 'overflow-hidden'],
    {
        variants: {
            type: {
                filter: ['shadow-md'],
                status: ['p-3'],
            },
        },
        defaultVariants: { type: 'filter' },
    }
);

// Thẻ trạng thái lọc/ Filter Tags
export const tagVariant = cva(
    ['bg-indigo-50', 'text-indigo-700', 'px-2', 'py-0.5', 'rounded-full', 'text-xs', 'flex', 'items-center'],
    {
        variants: {
            removable: {
                true: ['pr-1'],
            },
        },
        defaultVariants: { removable: true },
    }
);