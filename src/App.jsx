import { Routes, Route } from "react-router-dom";

import { publicRoutes, privateRoutes, adminRoute } from "~/routes";
import { DefaultLayout, EmptyLayout } from "~/components/layouts";
import { NotFound } from "~/pages/NotFound";

import ProtectedRoute, { PublicOnlyRoute } from "~/middlewares/ProtectedRoute";

// Hàm render các route công khai
function renderPublicRoutes(routes) {
  return routes.map((route, index) => {
    const Layout = route.layout || DefaultLayout;
    const Page = route.element;

    // Nếu route yêu cầu chỉ cho người chưa đăng nhập (như login, register)
    if (route.publicOnly) {
      return (
        <Route
          key={index}
          path={route.path}
          element={
            <PublicOnlyRoute>
              <Layout>
                <Page />
              </Layout>
            </PublicOnlyRoute>
          }
        />
      );
    }

    // Route công khai thông thường
    return (
      <Route
        key={index}
        path={route.path}
        element={
          <Layout>
            <Page />
          </Layout>
        }
      />
    );
  });
}

// Hàm render các route cần đăng nhập
function renderProtectedRoutes(routes) {
  return routes.map((route, index) => {
    const Layout = route.layout || DefaultLayout;
    const Page = route.element;

    return (
      <Route
        key={index}
        path={route.path}
        element={
          <ProtectedRoute requiredRole={route.requiredRole}>
            <Layout>
              <Page />
            </Layout>
          </ProtectedRoute>
        }
      />
    );
  });
}

function App() {
  return (
    <Routes>
      {/* Nhóm route công khai - không cần đăng nhập */}
      {renderPublicRoutes(publicRoutes)}

      {/* Nhóm route yêu cầu đăng nhập */}
      {renderProtectedRoutes(privateRoutes)}

      {/* Nhóm route dành cho admin */}
      {renderProtectedRoutes(adminRoute)}

      {/* Catch-all route cho trang không tồn tại */}
      <Route
        path="*"
        element={
          <EmptyLayout>
            <NotFound />
          </EmptyLayout>
        }
      />
    </Routes>
  );
}

export default App;
