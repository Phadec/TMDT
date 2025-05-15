import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const messages = [
  "🔥 Giảm giá 10% cho đơn hàng trên 500K! Mua ngay!",
  "🚚 Miễn phí vận chuyển cho đơn hàng từ 300K!",
  "🎁 Tặng quà cho 100 khách đầu tiên hôm nay!",
  "💳 Giảm thêm 5% khi thanh toán qua ví điện tử!",
];

function NotiSale() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-10 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute bg-indigo-100 text-indigo-800 py-2 px-4 w-full text-center text-sm font-medium rounded-lg"
        >
          {messages[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default NotiSale;