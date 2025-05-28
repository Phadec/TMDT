import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthComponent, { Form, AnimatedInput } from "./AuthComponent";
import { authService } from "../../api";

function Login() {
  return <AuthComponent children={<FormLogin />} />;
}

function FormLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call login API
      await authService.login(formData.email, formData.password);
      
      // Redirect to home page after successful login
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || 
        "Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập và thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      title={error ? error : "Bạn đang ở đăng nhập á"}
      onSubmit={handleSubmit}
      formInput={
        <>
          <AnimatedInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
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
                className="w-5 h-5"
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
          {loading && (
            <div className="text-center text-primary">
              Đang đăng nhập...
            </div>
          )}
        </>
      }
    />
  );
}

export default Login;
