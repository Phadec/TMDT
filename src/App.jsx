import { Routes, Route } from "react-router-dom";

import { publicRoutes, privateRoutes } from "~/routes";
import { DefaultLayout } from "~/components/layouts";

function App() {
  return (
    <Routes>
      {/* Nhóm không cần đăng nhập */}
      {publicRoutes.map((route, index) => {
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
      })}

      {/* Khi người dùng đã đăng nhập, kiểm tra thêm PRIVATE ROUTE  */}
      {privateRoutes.map((route, index) => {
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
      })}
    </Routes>
  );
}

export default App;
