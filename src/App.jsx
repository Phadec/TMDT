import { Routes, Route } from "react-router-dom";

import { publicRoutes, privateRoutes, adminRoute } from "~/routes";
import { DefaultLayout } from "~/components/layouts";

function renderRoutes(routes) {
  return routes.map((route, index) => {
    const Layout = route.layout || DefaultLayout;
    const Page = route.element;

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

function App() {
  return (
    <Routes>
      {/* Nhóm không cần đăng nhập */}
      {renderRoutes(publicRoutes)}

      {/* Khi người dùng đã đăng nhập */}
      {renderRoutes(privateRoutes)}

      {/* Về route của admin */}
      {renderRoutes(adminRoute)}
    </Routes>
  );
}

export default App;
