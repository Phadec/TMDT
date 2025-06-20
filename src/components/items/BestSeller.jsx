function BestSeller() {
  // Dữ liệu mẫu cho 10 nhà bán uy tín
  const topSellers = [
    { id: 1, name: "Tech Galaxy", rating: 5, reviews: 1283, sales: 15420, avatar: "TG" },
    { id: 2, name: "Fashion Hub", rating: 5, reviews: 964, sales: 12750, avatar: "FH" },
    { id: 3, name: "Home Essentials", rating: 5, reviews: 842, sales: 10320, avatar: "HE" },
    { id: 4, name: "Beauty World", rating: 4.9, reviews: 756, sales: 9840, avatar: "BW" },
    { id: 5, name: "Sports Center", rating: 4.9, reviews: 689, sales: 8950, avatar: "SC" },
    { id: 6, name: "Gadget Pro", rating: 4.8, reviews: 621, sales: 7830, avatar: "GP" },
    { id: 7, name: "Kitchen Master", rating: 4.8, reviews: 578, sales: 7240, avatar: "KM" },
    { id: 8, name: "Toy Kingdom", rating: 4.7, reviews: 512, sales: 6580, avatar: "TK" },
    { id: 9, name: "Book Haven", rating: 4.7, reviews: 487, sales: 5920, avatar: "BH" },
    { id: 10, name: "Pet Paradise", rating: 4.6, reviews: 423, sales: 5340, avatar: "PP" }
  ];

  // Hàm tạo stars dựa trên rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    let stars = "★".repeat(fullStars);
    if (hasHalfStar) stars += "½";
    
    return stars;
  };

  return (
    <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-2">
      {topSellers.map((seller, index) => (
        <div key={seller.id} className="flex items-center p-2 rounded-md hover:bg-teal-50 transition-colors duration-200 cursor-pointer">
          <div className="relative">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-teal-600 font-bold">{seller.avatar}</span>
            </div>
            {index < 3 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-xs font-bold text-white">{index + 1}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-800">{seller.name}</p>
              <span className="text-xs text-teal-600 font-medium">{seller.sales.toLocaleString()} đã bán</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-yellow-500 mr-1">{renderStars(seller.rating)}</span>
              <span className="text-xs text-gray-500">({seller.reviews.toLocaleString()})</span>
            </div>
          </div>
        </div>
      ))}
      <div className="pt-2 border-t border-gray-100">
        <button className="w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium">
          Xem tất cả nhà bán
        </button>
      </div>
    </div>
  );
}

export default BestSeller;