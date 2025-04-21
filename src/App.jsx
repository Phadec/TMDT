import { Routes, Route } from "react-router-dom";

import { publicRoutes } from "~/routes";
import { Header, Footer } from "~/components/layout";

function App() {
  return (
    <div>
      <div>
        <Header />
        <main>
          <Routes>
            {publicRoutes.map((route, index) => {
              const Page = route.element;
              return <Route key={index} path={route.path} element={<Page />} />;
            })}
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
