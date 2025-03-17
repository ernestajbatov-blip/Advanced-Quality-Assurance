import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./pages/AppLayout/AppLayout";
import ABCLayout from "./pages/ABC/ABCLayout";
import Diagram from "./components/Diagram/Diagram";
import OilLayout from "./pages/OilLayout/OilLayout";
import { WellsContext, WellsContextProvider } from "./states/WellsContext";
import { WellsABCContextProvider } from "./states/WellsABCContext";
import { useContext } from "react";

function App() {
  const { wells } = useContext(WellsContext);
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            index
            element={
              <WellsContextProvider>
                <AppLayout />
              </WellsContextProvider>
            }
          />
          <Route
            path="abc"
            element={
              <WellsABCContextProvider>
                <ABCLayout />
              </WellsABCContextProvider>
            }
          />
          <Route path="scheme" element={<Diagram />} />
          {/* <Route path="scheme" element={<AGZU wells={wells} />} /> */}

          <Route path="oil" element={<OilLayout />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
