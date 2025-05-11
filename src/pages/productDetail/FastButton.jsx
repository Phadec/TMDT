import { ShoppingBagIcon, HeartIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { cva } from 'class-variance-authority';

const buttonStyles = cva(
    'p-3 rounded-full text-white shadow-lg focus:outline-none', // Base styles
    {
        variants: {
            color: {
                blue: 'bg-blue-500 hover:bg-blue-600',
                red: 'bg-red-500 hover:bg-red-600',
                green: 'bg-green-500 hover:bg-green-600',
            },
        },
        defaultVariants: {
            color: 'blue',
        },
    }
);
function FastButton() {
  return (
    <div className="fixed z-50 bottom-1/2 right-4 md:right-8 md:bottom-8 flex flex-col gap-2 md:flex-row md:gap-4 items-center md:items-start">
        <button className={buttonStyles({color: 'blue'})}>
            <ShoppingBagIcon className="h-6 w-6"/>
        </button>
        <button className={buttonStyles({color: 'red'})}>
            <HeartIcon className="h-6 w-6"/>
        </button>
        <button className={buttonStyles({color: 'green'})}>
            <CheckCircleIcon className="h-6 w-6"/>
        </button>
    </div>
  );
}

export default FastButton;