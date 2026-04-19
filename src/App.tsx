import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeProvider';
import Layout from './components/Layout';
import DataLoadPage from './pages/DataLoadPage';
import FullSummaryPage from './pages/FullSummaryPage';
import B2CSummaryPage from './pages/B2CSummaryPage';
import DeliverySummaryPage from './pages/DeliverySummaryPage';
import OrderTimelinePage from './pages/OrderTimelinePage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<FullSummaryPage />} />
            <Route path="dashboard/b2c" element={<B2CSummaryPage />} />
            <Route path="dashboard/delivery" element={<DeliverySummaryPage />} />
            <Route path="orders" element={<OrderTimelinePage />} />
            <Route path="upload" element={<DataLoadPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
