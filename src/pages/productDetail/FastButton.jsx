import { ShoppingBagIcon, HeartIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

function FastButton() {
  return (
    <div className="fixed z-50 bottom-1/2 right-4 md:right-8 md:bottom-8 flex flex-col gap-2 md:flex-row md:gap-4 items-center md:items-start">
      <button className="p-3 bg-blue-500 rounded-full text-white shadow-lg hover:bg-blue-600 focus:outline-none">
        <ShoppingBagIcon className="h-6 w-6" />
      </button>
      <button className="p-3 bg-red-500 rounded-full text-white shadow-lg hover:bg-red-600 focus:outline-none">
        <HeartIcon className="h-6 w-6" />
      </button>
      <button className="p-3 bg-green-500 rounded-full text-white shadow-lg hover:bg-green-600 focus:outline-none">
        <CheckCircleIcon className="h-6 w-6" />
      </button>
    </div>
  );
}

export default FastButton;