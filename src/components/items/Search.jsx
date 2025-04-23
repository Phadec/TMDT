function Search() {
  return (
    <div className="w-90 mb-10">
      <div className="relative">
        <input
          type="text"
          placeholder="Search with AI"
          className="w-full p-4 pl-12 pr-4 rounded-xl text-black text-lg bg-transparent border-2 border-white focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-xl shadow-blue-500/50 transition-transform transform hover:scale-105 ease-in-out"
        />
      </div>
    </div>
  );
}

export default Search;
