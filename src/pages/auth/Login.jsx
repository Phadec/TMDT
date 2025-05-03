import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { OrbitControls, Float } from "@react-three/drei";
import * as THREE from "three";

// Vietnam Flag 3D component
function VietnamFlag() {
  const flagGroupRef = useRef();

  useFrame((state) => {
    if (flagGroupRef.current) {
      // Rotate the entire flag group (including the star)
      flagGroupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={flagGroupRef}>
      <RedFlag />
      <YellowStar />
    </group>
  );
}

// Red flag component
function RedFlag() {
  return (
    <mesh>
      <boxGeometry args={[3, 2, 0.1]} />
      <meshStandardMaterial
        color="#da251d" // Vietnamese flag red
        emissive="#da251d"
        emissiveIntensity={0.3}
        metalness={0.5}
        roughness={0.3}
      />
    </mesh>
  );
}

// Yellow star component that rotates with the flag
function YellowStar() {
  // Create a star shape
  const createStarShape = () => {
    const shape = new THREE.Shape();
    const outerRadius = 0.6;
    const innerRadius = 0.23;
    const numPoints = 5;
    const angleStep = Math.PI / numPoints;

    // Start at the top point
    shape.moveTo(0, outerRadius);

    // Draw the star points
    for (let i = 1; i <= numPoints * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = angleStep * i;
      shape.lineTo(Math.sin(angle) * radius, Math.cos(angle) * radius);
    }

    shape.closePath();
    return shape;
  };

  // Create two identical stars, one for each side of the flag
  return (
    <group>
      {/* Front star */}
      <mesh position={[0, 0, 0.06]}>
        <shapeGeometry args={[createStarShape()]} />
        <meshStandardMaterial
          color="#ffff00" // Vietnamese flag yellow
          emissive="#ffff00"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Back star (flipped) */}
      <mesh position={[0, 0, -0.06]} rotation={[0, Math.PI, 0]}>
        <shapeGeometry args={[createStarShape()]} />
        <meshStandardMaterial
          color="#ffff00" // Vietnamese flag yellow
          emissive="#ffff00"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

// Background cube animation
function AnimatedCubes() {
  const cubes = useRef([]);
  const count = 10;

  useEffect(() => {
    cubes.current = Array(count)
      .fill()
      .map(() => ({
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 5 - 5,
        ],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ],
        scale: Math.random() * 0.3 + 0.1,
        speed: Math.random() * 0.01 + 0.005,
      }));
  }, []);

  useFrame((state) => {
    cubes.current.forEach((cube) => {
      cube.rotation[0] += cube.speed;
      cube.rotation[1] += cube.speed * 0.5;
    });
  });

  return (
    <>
      {cubes.current.map((cube, i) => (
        <mesh
          key={i}
          position={cube.position}
          rotation={cube.rotation}
          scale={cube.scale}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#757de8"
            metalness={0.5}
            roughness={0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </>
  );
}

// 3D Scene
function Scene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight position={[0, 0, 5]} angle={0.6} intensity={0.8} />
      {/* Removed Float wrapper to ensure star doesn't move or rotate */}
      <VietnamFlag />
      <AnimatedCubes />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        autoRotate={false}
        minPolarAngle={Math.PI / 2 - 0.5}
        maxPolarAngle={Math.PI / 2 + 0.5}
      />
    </>
  );
}

// Input component with animation
function AnimatedInput({ label, type, name, value, onChange, icon }) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      className="relative mb-6"
      animate={{
        scale: focused ? 1.02 : 1,
        borderColor: focused ? "rgb(255, 64, 129)" : "rgb(224, 224, 224)",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      <div className="flex items-center border-2 rounded-lg overflow-hidden bg-surface-white shadow-md">
        <span className="pl-4 text-content-secondary">{icon}</span>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={label}
          className="w-full px-4 py-3 outline-none bg-transparent text-content-primary"
        />
      </div>
    </motion.div>
  );
}

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt with:", formData);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* 3D Canvas Section */}
      <div
        className="w-full md:w-1/2 h-[300px] md:h-screen relative"
        style={{
          backgroundImage: 'url("/assets/auth/happy.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay to ensure 3D objects are visible against the background */}
        <div className="absolute inset-0 bg-black bg-opacity-30">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <Scene />
          </Canvas>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-surface-light">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Welcome Back
            </h1>
            <p className="text-content-secondary">
              Sign in to continue to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatedInput
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              }
            />

            <AnimatedInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
            />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary-light border-border rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-content-secondary"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-secondary hover:text-secondary-dark transition-duration-fast"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-white bg-secondary hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-duration-fast"
            >
              Sign in
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-content-secondary">
                Don't have an account?{" "}
                <a
                  href="#"
                  className="font-medium text-primary hover:text-primary-dark transition-duration-fast"
                >
                  Sign up
                </a>
              </p>
            </div>
          </form>

          <div>
            <div className="flex flex-row justify-center gap-6 mt-8">
              <button
                type="button"
                className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow transition"
                aria-label="Đăng nhập với Google"
              >
                {/* Google icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
              </button>
              <button
                type="button"
                className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-200 bg-[#1877f2] text-white hover:bg-[#145db2] shadow transition"
                aria-label="Đăng nhập với Facebook"
              >
                {/* Facebook icon */}
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" />
                </svg>
              </button>
              <button
                type="button"
                className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-200 bg-black text-white hover:bg-gray-800 shadow transition"
                aria-label="Đăng nhập với Apple ID"
              >
                {/* Apple icon */}
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M16.365 1.43c.09-.09.09-.237 0-.327a.23.23 0 0 0-.327 0l-2.44 2.44a.23.23 0 0 0 0 .327c.09.09.237.09.327 0l2.44-2.44zm-8.73 0a.23.23 0 0 0-.327 0c-.09.09-.09.237 0 .327l2.44 2.44c.09.09.237.09.327 0a.23.23 0 0 0 0-.327l-2.44-2.44zm8.73 21.14a.23.23 0 0 0 .327 0c.09-.09.09-.237 0-.327l-2.44-2.44a.23.23 0 0 0-.327 0 .23.23 0 0 0 0 .327l2.44 2.44zm-8.73 0 2.44-2.44a.23.23 0 0 0 0-.327.23.23 0 0 0-.327 0l-2.44 2.44a.23.23 0 0 0 0 .327c.09.09.237.09.327 0zM12 5.25A6.75 6.75 0 1 1 5.25 12 6.758 6.758 0 0 1 12 5.25zm0-1.5A8.25 8.25 0 1 0 20.25 12 8.26 8.26 0 0 0 12 3.75zm0 13.5a5.25 5.25 0 1 1 5.25-5.25A5.256 5.256 0 0 1 12 17.25z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
