import { imageUtils } from "~/utils";

function Avatar({ path = "user.png", name, username }) {
  return (
    <div
      className="flex flex-col items-center bg-white rounded-2xl shadow-2xl p-6 transition-transform duration-300 hover:scale-105 hover:shadow-3xl hover:skew-y-3"
      style={{
        perspective: "600px",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        border: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      <img
        src={imageUtils.getImageFromAssets(path, "user")}
        alt="User Avatar"
        className="rounded-full w-24 h-24 mb-4 shadow-lg border-4 border-white"
        style={{
          boxShadow: "0 4px 16px rgba(0,0,0,0.15), 0 1.5px 8px rgba(0,0,0,0.10)",
          transform: "rotateY(-10deg) rotateX(6deg)",
        }}
      />
      <h2
        className="text-xl font-semibold"
        style={{
          textShadow: "1px 2px 8px rgba(0,0,0,0.10)",
        }}
      >
        {name}
      </h2>
      <p
        className="text-gray-500"
        style={{
          textShadow: "1px 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        @{username}
      </p>
    </div>
  );
}

export default Avatar;
